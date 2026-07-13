import React, { useState, useCallback, useEffect, useRef } from 'react';
import { ActivityIndicator, ScrollView, View, Pressable, StyleSheet } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import ScreenWrapper from '@new-ui/components/common-components/ScreenWrapper';
import CustomText from '@new-ui/components/common-components/CustomText';
import Button from '@new-ui/components/common-components/layout/Button';
import FilterChip from '@new-ui/components/common-components/FilterChip/FilterChip';
import { useTheme } from '@new-ui/styles/ThemeContext';
import { NAVIGATION_SCREENS } from 'navigations/navigationConstants';
import type { StateCode } from '@new-ui/constants/compliance';
import type { CTDisclosureContent, MNDisclosureContent, MNLanguage } from '@new-ui/types/compliance';
import {
  useOneTimeDisclosure,
  useAcknowledgeOneTimeDisclosure,
} from 'query/hooks/useComplianceDisclosure';
import TermAndConditionModal from 'tsx-components/modals/TermAndConditionModal';
import type { TermAndConditionModalRef } from 'tsx-components/modals/modal.types';
import { showError } from 'utils/toast';

// Same documents the account-creation flow links to (CreateAccountScreen) — the CT
// disclosure's checkbox 2 references Coinme's updated ToS & Privacy Policy.
const COINME_TERMS_URL = 'https://help.coinme.com/en/articles/9039676-terms-of-service';
const COINME_PRIVACY_URL = 'https://help.coinme.com/en/articles/9039704-privacy-policy';

// CT checkbox labels are part of the screen spec (verbatim from the requirements PDF).
// All disclosure body copy — and MN's checkbox label / supplemental note — is served by
// the backend and must be rendered verbatim; regulatory copy may not be paraphrased.
const CT_CHECKBOX_1_LABEL =
  'I acknowledge that I have read, understood, and agree to the disclosure above.';

// Per Minnesota regulation the disclosure must be available in these six languages.
const MN_LANGUAGES: { code: MNLanguage; label: string }[] = [
  { code: 'en', label: 'English' },
  { code: 'es', label: 'Español' },
  { code: 'so', label: 'Soomaali' },
  { code: 'hmn', label: 'Hmoob' },
  { code: 'vi', label: 'Tiếng Việt' },
  { code: 'zh', label: '中文' },
];

type RouteParams = {
  StateComplianceAcknowledgment: {
    stateCode: StateCode;
    blocking?: boolean;
    /** Test-only (sent by the gate's TEST_FORCE_STATE path): don't auto-dismiss when already acknowledged. */
    testForceShow?: boolean;
    onComplete?: () => void;
  };
};

const StateComplianceAcknowledgmentScreen: React.FC = () => {
  const { theme } = useTheme();
  const navigation = useNavigation<any>();
  const route = useRoute<RouteProp<RouteParams, typeof NAVIGATION_SCREENS.STATE_COMPLIANCE_ACKNOWLEDGMENT>>();
  const { stateCode, blocking, testForceShow, onComplete } = route.params;
  const isMN = stateCode === 'MN';

  const [ack1, setAck1] = useState(false);
  const [ack2, setAck2] = useState(false);
  const [language, setLanguage] = useState<MNLanguage>('en');
  const acknowledgedRef = useRef(false);
  const webDocRef = useRef<TermAndConditionModalRef>(null);

  const {
    data: disclosureData,
    isLoading,
    isError,
    refetch,
    isRefetching,
  } = useOneTimeDisclosure(stateCode, isMN ? language : undefined);
  const { mutateAsync: acknowledge, isPending: isSubmitting } =
    useAcknowledgeOneTimeDisclosure(stateCode);

  const ctContent = !isMN ? (disclosureData?.disclosure as CTDisclosureContent | undefined) : undefined;
  const mnContent = isMN ? (disclosureData?.disclosure as MNDisclosureContent | undefined) : undefined;
  const hasContent = isMN ? !!mnContent?.categories?.length : !!ctContent?.header;

  const canContinue = isMN ? ack1 : ack1 && ack2;

  // Launch-gate mode: regulatory requirement — the app is gated until acknowledgment,
  // so block every dismissal path (Android back, programmatic pops) until acked.
  useEffect(() => {
    if (!blocking) return;
    const unsubscribe = navigation.addListener('beforeRemove', (e: any) => {
      if (!acknowledgedRef.current) e.preventDefault();
    });
    return unsubscribe;
  }, [blocking, navigation]);

  // Race with the gate (e.g. acked on another device): backend already has the ack —
  // nothing to collect, let the user through.
  useEffect(() => {
    if (testForceShow) return;
    if (disclosureData?.alreadyAcknowledged && !acknowledgedRef.current) {
      acknowledgedRef.current = true;
      onComplete?.();
      navigation.goBack();
    }
  }, [disclosureData?.alreadyAcknowledged, navigation, onComplete, testForceShow]);

  const handleContinue = useCallback(async () => {
    if (!canContinue) return;
    try {
      // MN records the language the user actually read; CT records both checkboxes.
      await acknowledge(
        isMN
          ? { checkbox_1_checked: ack1, language }
          : { checkbox_1_checked: ack1, checkbox_2_checked: ack2 }
      );
      acknowledgedRef.current = true;
      onComplete?.();
      navigation.goBack();
    } catch {
      showError('Something went wrong', 'Please try again.');
    }
  }, [ack1, ack2, acknowledge, canContinue, isMN, language, navigation, onComplete]);

  const openTerms = useCallback(() => {
    webDocRef.current?.showWebDocument?.('Terms of Service', COINME_TERMS_URL);
  }, []);

  const openPrivacy = useCallback(() => {
    webDocRef.current?.showWebDocument?.('Privacy Policy', COINME_PRIVACY_URL);
  }, []);

  const styles = makeStyles(theme);

  // The disclosure text is regulatory — without it there is nothing valid to show or
  // acknowledge, so failures keep the (blocking) screen up behind a retry.
  if (isLoading || isError || !hasContent) {
    return (
      <ScreenWrapper
        safeAreaEdges={['bottom', 'left', 'right']}
        backgroundColor={theme.colors.white}
        statusBarStyle="dark-content"
        contentStyle={{ flex: 1 }}
      >
        <View style={styles.dragHandle} />
        <View style={styles.centerFill}>
          {isError && !isRefetching ? (
            <>
              <CustomText style={styles.errorText}>
                We couldn't load the required disclosure. Please check your connection and try
                again.
              </CustomText>
              <Button onPress={() => refetch()}>Retry</Button>
            </>
          ) : (
            <ActivityIndicator size="large" color={theme.colors.primary} />
          )}
        </View>
      </ScreenWrapper>
    );
  }

  // Minnesota regulation: titles centered/bold/capitalized/underlined in 18pt; body
  // 14pt with double spacing between sections. Sizes come from the API's formatting
  // block with the regulatory values as a floor.
  const mnTitleSize = Math.max(mnContent?.formatting?.title_font_size_pt ?? 18, 18);
  const mnBodySize = Math.max(mnContent?.formatting?.body_font_size_pt ?? 14, 14);

  return (
    <ScreenWrapper
      safeAreaEdges={['bottom', 'left', 'right']}
      backgroundColor={theme.colors.white}
      statusBarStyle="dark-content"
      loading={isSubmitting}
      contentStyle={{ flex: 1 }}
    >
      {/* Drag handle */}
      <View style={styles.dragHandle} />

      {/* MN: language availability requirement — six languages via selector */}
      {isMN && (
        <View style={styles.languageRow}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {MN_LANGUAGES.map(({ code, label }) => (
              <View key={code} style={styles.languageChip}>
                <FilterChip
                  label={label}
                  selected={language === code}
                  onPress={() => setLanguage(code)}
                />
              </View>
            ))}
          </ScrollView>
          {isRefetching && (
            <ActivityIndicator
              size="small"
              color={theme.colors.primary}
              style={styles.languageSpinner}
            />
          )}
        </View>
      )}

      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {isMN && mnContent ? (
          /* ── MN disclosure ── */
          <View style={styles.warningCard}>
            <CustomText style={[styles.mnTitle, { fontSize: mnTitleSize }]}>
              {mnContent.title}
            </CustomText>
            <CustomText style={styles.mnSubtitle}>{mnContent.subtitle}</CustomText>
            <CustomText style={styles.mnSubtitle}>{mnContent.effective_date}</CustomText>

            <View style={styles.divider} />

            {mnContent.categories?.map((category, index) => (
              <View key={index} style={styles.mnSection}>
                <CustomText style={[styles.mnSectionTitle, { fontSize: mnTitleSize }]}>
                  {category.title}
                </CustomText>
                <CustomText
                  style={[
                    styles.mnSectionBody,
                    { fontSize: mnBodySize, lineHeight: mnBodySize * 1.6 },
                  ]}
                >
                  {category.body}
                </CustomText>
              </View>
            ))}
          </View>
        ) : (
          /* ── CT disclosure ── */
          <View style={styles.warningCard}>
            <CustomText style={styles.warningHeader}>{ctContent?.header}</CustomText>

            <CustomText style={styles.warningBody}>{ctContent?.body}</CustomText>

            <View style={styles.divider} />

            {ctContent?.bullet_points?.map((bullet, index) => (
              <View key={index} style={styles.bulletRow}>
                <CustomText style={styles.bulletDot}>{'•'}</CustomText>
                <CustomText style={styles.bulletText}>{bullet}</CustomText>
              </View>
            ))}
          </View>
        )}

        {/* ── Acknowledgment section ── */}
        <View style={styles.ackSection}>
          <CustomText style={styles.ackHeader}>ACKNOWLEDGMENT</CustomText>

          <View style={styles.ackCard}>
            {isMN && mnContent ? (
              <>
                <CheckboxRow checked={ack1} onToggle={() => setAck1(v => !v)} theme={theme}>
                  <CustomText style={styles.checkboxLabel}>
                    {mnContent.acknowledgment?.checkbox_label}
                  </CustomText>
                </CheckboxRow>
                {!!mnContent.acknowledgment?.supplemental_note && (
                  <CustomText style={styles.supplementalNote}>
                    {mnContent.acknowledgment.supplemental_note}
                  </CustomText>
                )}
              </>
            ) : (
              <>
                <CheckboxRow checked={ack1} onToggle={() => setAck1(v => !v)} theme={theme}>
                  <CustomText style={styles.checkboxLabel}>{CT_CHECKBOX_1_LABEL}</CustomText>
                </CheckboxRow>
                <View style={styles.ackDivider} />
                <CheckboxRow checked={ack2} onToggle={() => setAck2(v => !v)} theme={theme}>
                  <CustomText style={styles.checkboxLabel}>
                    {'I acknowledge that I have read, understood, and agree to the updated '}
                    <CustomText style={styles.link} onPress={openTerms}>
                      Terms of Service
                    </CustomText>
                    {' & '}
                    <CustomText style={styles.link} onPress={openPrivacy}>
                      Privacy Policy
                    </CustomText>
                    {'.'}
                  </CustomText>
                </CheckboxRow>
              </>
            )}
          </View>
        </View>
      </ScrollView>

      {/* ── Sticky footer ── */}
      <View style={styles.footer}>
        <Button disabled={!canContinue} onPress={handleContinue}>
          Continue
        </Button>
      </View>

      <TermAndConditionModal ref={webDocRef} />
    </ScreenWrapper>
  );
};

// ─── Checkbox row ─────────────────────────────────────────────────────────────

interface CheckboxRowProps {
  checked: boolean;
  onToggle: () => void;
  theme: ReturnType<typeof useTheme>['theme'];
  children: React.ReactNode;
}

const CheckboxRow: React.FC<CheckboxRowProps> = ({ checked, onToggle, theme, children }) => {
  const styles = makeStyles(theme);
  return (
    <Pressable
      style={styles.checkboxRow}
      onPress={onToggle}
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
    >
      <View style={[styles.checkbox, checked && styles.checkboxChecked]}>
        {checked && <CustomText style={styles.checkmark}>✓</CustomText>}
      </View>
      <View style={styles.checkboxLabelWrap}>{children}</View>
    </Pressable>
  );
};

// ─── Styles ──────────────────────────────────────────────────────────────────

const makeStyles = (theme: ReturnType<typeof useTheme>['theme']) =>
  StyleSheet.create({
    dragHandle: {
      width: 40,
      height: 4,
      borderRadius: 2,
      backgroundColor: theme.colors.border,
      alignSelf: 'center',
      marginTop: theme.spacing.md,
      marginBottom: theme.spacing.sm,
    },
    scroll: {
      flex: 1,
    },
    scrollContent: {
      paddingHorizontal: theme.spacing.base,
      paddingBottom: theme.spacing.lg,
    },
    centerFill: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: theme.spacing.xl,
      gap: theme.spacing.lg,
    },
    errorText: {
      fontSize: 15,
      color: theme.colors.text,
      textAlign: 'center',
      lineHeight: 22,
    },

    // MN language selector
    languageRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.base,
      marginBottom: theme.spacing.sm,
    },
    languageChip: {
      marginRight: theme.spacing.sm,
    },
    languageSpinner: {
      marginLeft: theme.spacing.sm,
    },

    // Disclosure card (shared)
    warningCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.radius['2xl'],
      padding: theme.spacing.xl,
      marginBottom: theme.spacing.lg,
    },
    divider: {
      height: 1,
      backgroundColor: theme.colors.border,
      marginBottom: theme.spacing.base,
      marginTop: theme.spacing.base,
    },

    // CT
    warningHeader: {
      fontFamily: theme.typography.fontFamily.bold,
      fontSize: 22,
      color: theme.colors.text,
      marginBottom: theme.spacing.base,
    },
    warningBody: {
      fontFamily: theme.typography.fontFamily.semiBold,
      fontSize: 14,
      color: theme.colors.text,
      lineHeight: 22,
    },
    bulletRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      marginBottom: theme.spacing.sm,
      gap: theme.spacing.sm,
    },
    bulletDot: {
      fontSize: 14,
      color: theme.colors.text,
      lineHeight: 22,
      marginTop: 1,
    },
    bulletText: {
      flex: 1,
      fontSize: 14,
      color: theme.colors.text,
      lineHeight: 22,
    },

    // MN — regulatory formatting: titles centered/bold/capitalized/underlined (18pt),
    // body 14pt, double spacing between sections.
    mnTitle: {
      fontFamily: theme.typography.fontFamily.bold,
      color: theme.colors.text,
      textAlign: 'center',
      textDecorationLine: 'underline',
      textTransform: 'uppercase',
      marginBottom: theme.spacing.sm,
    },
    mnSubtitle: {
      fontSize: 14,
      color: theme.colors.text,
      textAlign: 'center',
      marginBottom: theme.spacing.xs,
    },
    mnSection: {
      marginBottom: theme.spacing.xl,
    },
    mnSectionTitle: {
      fontFamily: theme.typography.fontFamily.bold,
      color: theme.colors.text,
      textAlign: 'center',
      textDecorationLine: 'underline',
      textTransform: 'uppercase',
      marginBottom: theme.spacing.md,
    },
    mnSectionBody: {
      color: theme.colors.text,
    },
    supplementalNote: {
      fontSize: 12,
      color: theme.colors.textSecondary,
      lineHeight: 18,
      paddingHorizontal: theme.spacing.xs,
      paddingBottom: theme.spacing.sm,
    },

    // Acknowledgment section
    ackSection: {
      marginBottom: theme.spacing.sm,
    },
    ackHeader: {
      fontFamily: theme.typography.fontFamily.bold,
      fontSize: 13,
      color: theme.colors.primary,
      letterSpacing: 0.8,
      marginBottom: theme.spacing.sm,
      marginLeft: theme.spacing.xs,
    },
    ackCard: {
      backgroundColor: theme.colors.white,
      borderRadius: theme.radius['2xl'],
      borderWidth: 1,
      borderColor: theme.colors.border,
      paddingHorizontal: theme.spacing.base,
      paddingVertical: theme.spacing.sm,
    },
    ackDivider: {
      height: 1,
      backgroundColor: theme.colors.border,
      marginVertical: theme.spacing.xs,
    },
    checkboxRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: theme.spacing.sm,
      gap: theme.spacing.md,
    },
    checkbox: {
      width: 24,
      height: 24,
      borderRadius: theme.radius.sm,
      borderWidth: 2,
      borderColor: theme.colors.border,
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    },
    checkboxChecked: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary,
    },
    checkmark: {
      fontSize: 14,
      color: theme.colors.white,
      fontFamily: theme.typography.fontFamily.bold,
    },
    checkboxLabelWrap: {
      flex: 1,
    },
    checkboxLabel: {
      fontSize: 14,
      color: theme.colors.text,
      lineHeight: 20,
    },
    link: {
      fontSize: 14,
      lineHeight: 20,
      color: theme.colors.primary,
      textDecorationLine: 'underline',
    },

    // Footer
    footer: {
      paddingHorizontal: theme.spacing.base,
      paddingTop: theme.spacing.sm,
      paddingBottom: theme.spacing.lg,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
      backgroundColor: theme.colors.white,
    },
  });

export default StateComplianceAcknowledgmentScreen;
