import React, { useEffect, useMemo, useState, useCallback } from "react";
import {
  View,
  TouchableOpacity,
  Modal,
  Pressable,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useSelector } from "react-redux";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useCoinmeAccountId } from "hooks/useCoinmeAccountId";
import { useTheme } from "@new-ui/styles/ThemeContext";
import { ITheme } from "@new-ui/styles/themes/themeTypes";
import CustomText from "@new-ui/components/common-components/CustomText";
import { TextInput, Button } from "@new-ui/components/common-components/layout";
import ScreenWrapper from "@new-ui/components/common-components/ScreenWrapper";
import CustomHeader from "@new-ui/components/common-components/CustomHeader";
import { AppIcon } from "@new-ui/assets/svgs";
import { SvgIcons } from "constants/svgs";
import { NAVIGATION_SCREENS } from "navigations/navigationConstants";
import { showError, showSuccess, getApiErrorMessage } from "utils/toast";
import { validateEmailOrPhone } from "utils/validation";
import { pickImageFromGallery } from "utils/ImagePicker";
import { useSubmitGuestQuery } from "query/hooks/useGuestQuery";

type SupportMode = "accountRecovery" | "emailSupport";

const SUPPORT_CATEGORIES = [
  "Account Issues",
  "Login & Security",
  "KYC Verification",
  "Deposits & Withdrawals",
  "Transactions",
  "Technical Issue",
  "General Inquiry",
  "Other",
];

// Per-mode copy + which fields show. Both modes hit the SAME guest-query API; only
// labels/content and the category field differ.
const MODE_CONFIG: Record<
  SupportMode,
  { headerTitle: string; description: string; showCategory: boolean; submitLabel: string }
> = {
  accountRecovery: {
    headerTitle: "Support Request",
    description:
      "Tell us how we can help. Please provide as much detail as possible, and our support team will get back to you within 24–48 hours.",
    showCategory: true,
    submitLabel: "Submit recovery request",
  },
  emailSupport: {
    headerTitle: "Email Support",
    description:
      "Send us a message and our support team will get back to you within 24–48 hours. Please include as much detail as possible.",
    showCategory: false,
    submitLabel: "Submit request",
  },
};

type Attachment = { uri: string; name?: string; type?: string };

// ── Category picker (modeled on the new-ui StatePicker field + modal) ───────────
const CategoryPicker: React.FC<{
  label: string;
  placeholder: string;
  value: string | null;
  options: string[];
  onSelect: (value: string) => void;
  styles: ReturnType<typeof supportStyles>;
  theme: ITheme;
}> = ({ label, placeholder, value, options, onSelect, styles, theme }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = useCallback(
    (item: string) => {
      onSelect(item);
      setIsOpen(false);
    },
    [onSelect]
  );

  return (
    <View>
      <CustomText variant="label" fontWeight="semiBold" size={16} style={styles.fieldLabel}>
        {label}
      </CustomText>
      <TouchableOpacity
        style={styles.pickerField}
        onPress={() => setIsOpen(true)}
        activeOpacity={0.7}
      >
        <CustomText
          variant="body"
          fontFamily="inter"
          color={value ? theme.colors.text : theme.colors.greyDark}
        >
          {value || placeholder}
        </CustomText>
        <AppIcon.ChevronDown />
      </TouchableOpacity>

      <Modal visible={isOpen} transparent animationType="slide" onRequestClose={() => setIsOpen(false)}>
        <Pressable style={styles.modalBackdrop} onPress={() => setIsOpen(false)}>
          <Pressable style={styles.modalSheet} onPress={() => {}}>
            <View style={styles.modalHeader}>
              <CustomText variant="h4" fontWeight="semiBold">
                Select a category
              </CustomText>
              <TouchableOpacity onPress={() => setIsOpen(false)} activeOpacity={0.7}>
                <CustomText variant="body" color={theme.colors.primary}>
                  Close
                </CustomText>
              </TouchableOpacity>
            </View>
            <FlatList
              data={options}
              keyExtractor={(item) => item}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => {
                const isSelected = item === value;
                return (
                  <TouchableOpacity
                    style={styles.optionItem}
                    onPress={() => handleSelect(item)}
                    activeOpacity={0.7}
                  >
                    <CustomText
                      variant="body"
                      fontFamily="inter"
                      fontWeight={isSelected ? "medium" : "regular"}
                      color={isSelected ? theme.colors.primary : theme.colors.text}
                    >
                      {item}
                    </CustomText>
                  </TouchableOpacity>
                );
              }}
            />
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
};

const SupportScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { theme } = useTheme();
  const styles = useMemo(() => supportStyles(theme), [theme]);

  const mode: SupportMode =
    route.params?.mode === "emailSupport" ? "emailSupport" : "accountRecovery";
  const config = MODE_CONFIG[mode];

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [category, setCategory] = useState<string | null>(null);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [attachment, setAttachment] = useState<Attachment | null>(null);

  // `/users/me` is hydrated into Redux on login (useHydrateUsersMe); prefill from it here
  // so the logged-in user doesn't retype their own name/email. Guarded so it never
  // overwrites text the user already typed, and re-checked once if userData hydrates late.
  const userData = useSelector((s: any) => s.authenticationSlice?.userData);
  useEffect(() => {
    if (!userData) return;
    setFirstName((prev) => prev || userData.first_name || "");
    setLastName((prev) => prev || userData.last_name || "");
    setEmail((prev) => prev || userData.email || "");
  }, [userData]);

  // Sent to the backend alongside the form fields; not surfaced as a form field itself.
  const caasId = useCoinmeAccountId();

  const { mutateAsync: submitGuestQuery, isPending } = useSubmitGuestQuery();

  const handlePickAttachment = async () => {
    const file = await pickImageFromGallery();
    if (file) {
      setAttachment({ uri: file.uri, name: file.name, type: file.type });
    }
  };

  const handleSubmit = async () => {
    const trimmedFirstName = firstName.trim();
    const trimmedLastName = lastName.trim();
    const trimmedEmail = email.trim();
    const trimmedSubject = subject.trim();
    const trimmedMessage = message.trim();

    if (!trimmedFirstName) {
      showError("First name is required", "Please enter your first name.");
      return;
    }
    if (!trimmedLastName) {
      showError("Last name is required", "Please enter your last name.");
      return;
    }
    if (!trimmedEmail) {
      showError("Registered email is required", "Please enter the email address linked to your account.");
      return;
    }
    const validation = validateEmailOrPhone(trimmedEmail);
    if (!validation.isValid || validation.inputType !== "email") {
      showError("Invalid email", "Please enter a valid email address.");
      return;
    }
    if (config.showCategory && !category) {
      showError("Category is required", "Please select a support category.");
      return;
    }
    if (!trimmedSubject) {
      showError("Subject is required", "Please briefly describe your issue.");
      return;
    }
    if (!trimmedMessage) {
      showError("Details are required", "Please provide details about your issue.");
      return;
    }

    // Field → API mapping (confirmed):
    //  - Account Recovery: reason = category; description = "Subject: <subject>\n\n<message>"
    //  - Email Support:    reason = subject;  description = message
    const reason = mode === "accountRecovery" ? String(category) : trimmedSubject;
    const description =
      mode === "accountRecovery"
        ? `Subject: ${trimmedSubject}\n\n${trimmedMessage}`
        : trimmedMessage;

    try {
      const res = await submitGuestQuery({
        firstName: trimmedFirstName,
        lastName: trimmedLastName,
        email: trimmedEmail,
        reason,
        description,
        attachment,
        caasId,
      });
      const ok = res?.ok ?? res?.status ?? true;
      if (ok) {
        showSuccess(
          "Request submitted",
          "Thanks — our support team will get back to you within 24–48 hours."
        );
        navigation.goBack();
      } else {
        showError("Couldn't submit", res?.message || "Please try again.");
      }
    } catch (error: any) {
      showError("Something went wrong", getApiErrorMessage(error, "Please try again."));
    }
  };

  return (
    <View style={styles.root}>
      <CustomHeader
        {...({} as any)}
        navigation={navigation}
        title={config.headerTitle}
        showBackButton
        rightButton={{
          icon: <SvgIcons.ChatWithAi width={26} height={26} />,
          onPress: () => navigation.navigate(NAVIGATION_SCREENS.FRESHCHAT_SCREEN),
        }}
      />
      <KeyboardAvoidingView
        style={styles.keyboardAvoiding}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
      <ScreenWrapper
        safeArea
        safeAreaEdges={["bottom", "left", "right"]}
        scrollable
        padding={16}
        contentStyle={styles.content}
      >
        <View style={styles.infoBanner}>
          <CustomText
            variant="bodySmall"
            fontFamily="inter"
            color={theme.colors.text}
            style={styles.infoText}
          >
            {config.description}
          </CustomText>
        </View>

        <View style={styles.inputContainer}>
          <TextInput
            label="First Name"
            placeholder="Enter your first name"
            value={firstName}
            onChangeText={setFirstName}
          />
        </View>

        <View style={styles.inputContainer}>
          <TextInput
            label="Last Name"
            placeholder="Enter your last name"
            value={lastName}
            onChangeText={setLastName}
          />
        </View>

        <View style={styles.inputContainer}>
          <TextInput
            label="Registered Email"
            placeholder="Enter your email address"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        {config.showCategory ? (
          <View style={styles.inputContainer}>
            <CategoryPicker
              label="Support Category"
              placeholder="Select a category"
              value={category}
              options={SUPPORT_CATEGORIES}
              onSelect={setCategory}
              styles={styles}
              theme={theme}
            />
          </View>
        ) : null}

        <View style={styles.inputContainer}>
          <TextInput
            label="Subject"
            placeholder="Briefly describe your issue"
            value={subject}
            onChangeText={setSubject}
          />
        </View>

        <View style={styles.inputContainer}>
          <CustomText variant="label" fontWeight="semiBold" size={16} style={styles.fieldLabel}>
            Describe Your Issue
          </CustomText>
          <TextInput
            placeholder="Please provide details about your issue, including any relevant information such as error messages, transaction IDs, device, app version, or screenshots (if applicable)."
            value={message}
            onChangeText={setMessage}
            multiline
            height={150}
            inputStyle={styles.multilineInput}
          />
        </View>

        <View style={styles.inputContainer}>
          <CustomText variant="label" fontWeight="semiBold" size={16} style={styles.fieldLabel}>
            Attachments (Optional)
          </CustomText>
          <TouchableOpacity
            style={styles.uploadBox}
            onPress={handlePickAttachment}
            activeOpacity={0.7}
          >
            <View style={styles.uploadIconWrap}>
              <SvgIcons.UploadIcon width={26} height={26} />
            </View>
            {attachment?.name ? (
              <>
                <CustomText variant="bodySmall" fontFamily="inter" style={styles.uploadTextCenter}>
                  {attachment.name}
                </CustomText>
                <TouchableOpacity onPress={() => setAttachment(null)} activeOpacity={0.7}>
                  <CustomText variant="bodySmall" fontFamily="inter" color={theme.colors.error}>
                    Remove
                  </CustomText>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <CustomText variant="bodySmall" fontFamily="inter" style={styles.uploadTextCenter}>
                  <CustomText variant="bodySmall" fontFamily="inter" color={theme.colors.primary}>
                    Tap to upload
                  </CustomText>{" "}
                  screenshots or supporting documents
                </CustomText>
                <CustomText variant="caption" fontFamily="inter" color={theme.colors.textSecondary}>
                  PNG or JPG files
                </CustomText>
              </>
            )}
          </TouchableOpacity>
        </View>

        <Button
          onPress={handleSubmit}
          loading={isPending}
          disabled={isPending}
          style={styles.submitButton}
        >
          {config.submitLabel}
        </Button>
      </ScreenWrapper>
      </KeyboardAvoidingView>
    </View>
  );
};

export default SupportScreen;

const supportStyles = (theme: ITheme) =>
  StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    keyboardAvoiding: {
      flex: 1,
    },
    content: {
      flexGrow: 1,
    },
    infoBanner: {
      backgroundColor: theme.colors.primaryLight,
      borderLeftWidth: 4,
      borderLeftColor: theme.colors.primary,
      borderRadius: 10,
      padding: theme.spacing.base,
      marginBottom: theme.spacing.lg,
    },
    infoText: {
      lineHeight: 20,
    },
    inputContainer: {
      marginBottom: theme.spacing.base,
    },
    fieldLabel: {
      marginBottom: theme.spacing.sm,
      color: theme.colors.text,
    },
    multilineInput: {
      height: "100%",
      textAlignVertical: "top",
      paddingTop: 12,
      paddingBottom: 12,
    },
    pickerField: {
      height: 46,
      borderWidth: 1,
      borderColor: theme.colors.grey,
      borderRadius: 8,
      paddingHorizontal: 16,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      backgroundColor: theme.colors.white,
    },
    modalBackdrop: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.4)",
      justifyContent: "flex-end",
    },
    modalSheet: {
      backgroundColor: theme.colors.background,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      paddingHorizontal: theme.spacing.base,
      paddingBottom: theme.spacing.xl,
      maxHeight: "70%",
    },
    modalHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingVertical: theme.spacing.base,
    },
    optionItem: {
      paddingVertical: theme.spacing.base,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: theme.colors.border,
    },
    uploadBox: {
      minHeight: 140,
      borderWidth: 1,
      borderStyle: "dashed",
      borderColor: theme.colors.grey,
      borderRadius: 10,
      backgroundColor: theme.colors.greyLight,
      justifyContent: "center",
      alignItems: "center",
      paddingVertical: theme.spacing.lg,
      paddingHorizontal: theme.spacing.base,
      gap: theme.spacing.sm,
    },
    uploadIconWrap: {
      padding: theme.spacing.md,
      backgroundColor: theme.colors.white,
      borderRadius: 50,
    },
    uploadTextCenter: {
      textAlign: "center",
      lineHeight: 18,
    },
    submitButton: {
      marginTop: theme.spacing.sm,
      marginBottom: theme.spacing.xl,
    },
  });
