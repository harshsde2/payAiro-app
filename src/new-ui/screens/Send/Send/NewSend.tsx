import React, { useCallback, useMemo, useState } from 'react';
import { View, Platform, KeyboardAvoidingView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import ScreenWrapper from '@new-ui/components/common-components/ScreenWrapper';
import { TextInput, Button } from '@new-ui/components/common-components/layout';
import CustomText from '@new-ui/components/common-components/CustomText';
import { AppIcon } from '@new-ui/assets/svgs';
import { useTheme } from '@new-ui/styles/ThemeContext';
import { newSendStyles } from '@new-ui/styles/screens/send/newSendStyles';
import { NAVIGATION_SCREENS } from 'navigations/navigationConstants';
import { useVerifyUserByIdentifier } from 'query/hooks/useUser';
import { detectBlockchainNameService } from 'utils/blockchainNameService';
import { showError } from 'utils/toast';
import { IBankBalance, IBankItem } from 'screens/Dashboard/types';
import { useSelector } from 'react-redux';
import { useAllBankAccounts } from 'query/hooks';
import { SendContactsList, ISendContactItem } from '@new-ui/components/common-components/SendContactsList';
import { INewSendProps } from './types';

const NewSend: React.FC<INewSendProps> = ({ route }) => {
  const params = route?.params ?? {};
  const { requested, type, sender: senderFromParams } = params;

  // console.log("params =>", JSON.stringify(params, null, 2));

  const navigation = useNavigation<any>();
  const { theme } = useTheme();
  const styles = newSendStyles(theme);

  const bankListsFromRedux = useSelector(
    (state: { authenticationSlice?: { bankLists?: IBankItem[] } }) =>
      state.authenticationSlice?.bankLists
  );
  const bankBalance = useSelector(
    (state: { authenticationSlice?: { bankBalance?: IBankBalance | null } }) =>
      state.authenticationSlice?.bankBalance ?? null
  );
  const { data: apiBankAccounts = [] } = useAllBankAccounts();

  const bankLists = useMemo(() => {
    if (Array.isArray(bankListsFromRedux) && bankListsFromRedux.length > 0) {
      return bankListsFromRedux;
    }
    return apiBankAccounts as IBankItem[];
  }, [apiBankAccounts, bankListsFromRedux]);

  const mainBanks = useMemo(() => {
    const mains =
      bankLists?.filter(
        (bank) => String(bank.account_type ?? '').toLowerCase() === 'main'
      ) ?? [];
    if (mains.length > 0) return mains;
    return bankLists?.length ? [bankLists[0]] : [];
  }, [bankLists]);
  const selectedBank = mainBanks?.[0] ?? null;

  const {
    mutateAsync: verifyUserByIdentifier,
    isPending: userLoading,
  } = useVerifyUserByIdentifier();

  const [sender, setSender] = useState<string>(senderFromParams ?? '');
  const [note, setNote] = useState<string>('');
  const [pendingVerification, setPendingVerification] =
    useState<boolean>(false);
  const [selectedContactUuid, setSelectedContactUuid] =
    useState<string | null>(null);
  const [selectedContact, setSelectedContact] = useState<ISendContactItem | null>(null);

  const isEditable =
    senderFromParams === '' || senderFromParams === undefined;
  const isLoading = userLoading || pendingVerification;

  const showValidationError = (message: string): void => {
    showError(message);
  };

  const handleSenderChange = useCallback((text: string) => {
    setSender(text);
    // If user manually edits, clear selected contact highlight
    setSelectedContactUuid(null);
  }, []);

  const getBalanceDisplay = (): string => {
    return String((bankBalance as any)?.platform_available ?? '0.00');
  };

  const handleUserVerification = async (): Promise<void> => {
    const trimmedSender = sender.trim();

    if (!trimmedSender) {
      showValidationError(
        'Please enter a PayAiroTag, Phone, or Email'
      );
      return;
    }

    setPendingVerification(true);
    try {
      const data = await verifyUserByIdentifier({
        identifier: trimmedSender,
      });

      if (data && data.status) {
        const verifiedUser = (data as { data?: { username?: string } })?.data;
        const recipientUserId =
          verifiedUser?.username?.trim() || trimmedSender;
        navigation.navigate(
          NAVIGATION_SCREENS.ENTER_AMOUNT as never,
          {
            type: 'send',
            recipient_identifier: trimmedSender,
            recipientUserId,
            selectedContact: selectedContact,
          }
        );
      } else {
        showValidationError(
          data?.message || 'Recipient not found'
        );
      }
    } catch (e: any) {
      showValidationError(
        e?.response?.data?.data?.message ||
        'Something went wrong. Please try again.'
      );
    } finally {
      setPendingVerification(false);
    }
  };

  const handleNextPress = async (): Promise<void> => {
    const trimmedSender = sender.trim();

    if (!trimmedSender) {
      showValidationError(
        'Please enter a PayAiroTag, Phone, or Email'
      );
      return;
    }

    const { isBlockchainNameService, type: serviceType } =
      detectBlockchainNameService(trimmedSender);

    if (isBlockchainNameService && serviceType) {
      navigation.setParams({
        blockchainTermsAgreed: undefined,
      } as any);

      navigation.navigate(
        NAVIGATION_SCREENS.BLOCKCHAIN_NAME_SERVICE_TERMS as never,
        {
          serviceType,
          onAgreeCallback: () => {
            setTimeout(() => {
              navigation.navigate(
                'SelectPaymentMethod' as never,
                {
                  type: (requested || type === 'requested')
                    ? 'requested'
                    : 'receive',
                  sender: trimmedSender,
                  bank: selectedBank,
                } as never
              );
            }, 1000);
          },
        } as never
      );
      return;
    }

    await handleUserVerification();
  };

  const handleContactSelect = useCallback(
    (contact: ISendContactItem) => {
      const identifier =
        contact.username?.trim() ||
        contact.email?.trim() ||
        contact.nickname?.trim() ||
        '';
      const uuid = contact.uuid;

      // console.log("contact =>", JSON.stringify(contact, null, 2));

      if (!identifier) {
        return;
      }

      setSender(identifier);
      setSelectedContactUuid(uuid);
      setSelectedContact(contact);

      const trimmedSender = identifier.trim();

      // Route `type` on NewSend is often undefined (plain Send tab) or `request` when opened
      // from Receive — it must not be forwarded blindly or EnterAmount never sees `send`.
      const typeStr = String(type ?? '');
      const isRequestFlow =
        !!requested ||
        typeStr === 'requested' ||
        typeStr === 'request';
      const enterAmountType = isRequestFlow ? 'request' : 'send';

      navigation.navigate(
        NAVIGATION_SCREENS.ENTER_AMOUNT as never,
        {
          type: enterAmountType,
          recipient_identifier: trimmedSender,
          recipientUserId:
            contact.username?.trim() || trimmedSender,
          selectedContact: contact,
        } as never
      );
    },
    [navigation, requested, type, selectedBank]
  );

  const handleContactProfilePress = useCallback(
    (contact: ISendContactItem) => {
      const numericId = Number(contact.uuid);
      navigation.navigate(NAVIGATION_SCREENS.USER_PROFILE as never, {
        userDetails: {
          id: Number.isFinite(numericId) ? numericId : undefined,
          username: contact.username?.trim() || '',
          identifier: contact.username?.trim() || '',
          profile_photo: contact.profile_photo,
        },
      } as never);
    },
    [navigation]
  );

  return (
    <ScreenWrapper
      safeArea
      safeAreaEdges={['bottom']}
      padding={16}
      scrollable
      contentStyle={styles.content}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? ('padding' as const) : undefined}
      >
        <View style={styles.section}>
          <View style={styles.inputContainer}>
            <TextInput
              label={type === 'requested' ? 'From' : 'To'}
              placeholder="Enter PayAiro Tag/Wallet Address"
              value={sender}
              editable={isEditable}
              onChangeText={handleSenderChange}
              rightIcon={<AppIcon.QrCode width={20} height={20} color={theme.colors.greyDark} />}
              onRightIconPress={() => {
                navigation.navigate('MainTabs' as never, {
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  screen: NAVIGATION_SCREENS.SCANS as any,
                } as never);
              }}
            />
            <CustomText variant="body" size={12} color={theme.colors.greyDark} style={styles.inputHint}>Valid USDC Polygon network addresses only</CustomText>
          </View>
          {/* inline suggestions removed for new UI; contacts now shown in list below */}
        </View>

        <View style={styles.section}>
          <View style={styles.noteInputContainer}>
            <TextInput
              label="Note (if any)"
              placeholder="Add a note"
              value={note}
              onChangeText={setNote}
              multiline
              // height={88}
              borderRadius={10}
              borderWidth={1}
              borderColor={theme.colors.grey}
              inputStyle={{
                paddingTop: 10,
              }}
              // @ts-ignore - RN specific prop for multiline alignment
              textAlignVertical="top"
            />
          </View>
        </View>

        <View style={styles.contactsSection}>
          <View style={styles.contactsHeader}>
            <CustomText
              variant="label"
              fontWeight="semiBold"
              size={16}
            >
              Contacts
            </CustomText>
          </View>
          <SendContactsList
            searchQuery={sender}
            selectedId={selectedContactUuid}
            limit={4}
            onSelect={handleContactSelect}
            onProfilePress={handleContactProfilePress}
          />
        </View>

        {/* <View style={styles.proceedButtonContainer}>
          <Button
            onPress={handleNextPress}
            loading={isLoading}
            disabled={isLoading || !sender.trim()}
          >
            Proceed
          </Button>
        </View> */}
      </KeyboardAvoidingView>
    </ScreenWrapper>
  );
};

export default NewSend;