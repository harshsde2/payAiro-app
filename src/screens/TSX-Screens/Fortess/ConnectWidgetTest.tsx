import React, { useEffect, useRef, useState } from "react";
import { View, StyleSheet, ActivityIndicator } from "react-native";
import { ConnectWidget } from "@mxenabled/react-native-widget-sdk";
import {
  NavigationProp,
  useNavigation,
  useRoute,
} from "@react-navigation/native";
import {
  useMxAccountDetailsExternal,
  useMxCreateMember,
  useMxLinkExternalAccount,
  useMxRegisterExternalAccount,
} from "query/hooks/useMxIntegration";
import HeaderTitle from "components/HeaderTitle";
import { ScreenContainer } from "HOC";
import { Card, CustomText } from "tsx-components";
import { SVGLeftArrow } from "constants/images";
import { useDispatch } from "react-redux";
import useDispatchAction from "hooks/useDispatchAction";
import { setShowLoader } from "redux/slices/authenticationSlice";
import { queryClient } from "query/queryClient";
import { bankKeys, userKeys } from "query/hooks";
import { NAVIGATION_SCREENS } from "navigations/navigationConstants";
import { themes } from "styles";

const ConnectWidgetTest = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { URL } = route.params as any;

  const [pleaseWait, setPleaseWait] = useState(false);

  const hasStartedFlow = useRef(false);

  const { mutateAsync: createMember } = useMxCreateMember();
  const { mutateAsync: getAccountDetails } = useMxAccountDetailsExternal();
  const { mutateAsync: linkExternalAccount } = useMxLinkExternalAccount();
  const { mutateAsync: registerExternalAccount } =
    useMxRegisterExternalAccount();

  useEffect(() => {
    useDispatchAction(setShowLoader(false));
    return () => {
      useDispatchAction(setShowLoader(false));
    };
  }, []);

  const handleFullOnboardingFlow = async (memberGUID: string) => {
    useDispatchAction(setShowLoader(true));
    setPleaseWait(true);
    try {
      console.log("🚀 Starting onboarding flow with memberGUID:", memberGUID);

      const created = await createMember({ memberGuid: memberGUID });

      useDispatchAction(setShowLoader(false));
      const accountResponse = await getAccountDetails();
      const account = accountResponse?.data?.data?.[0];

      if (!account) {
        throw new Error("No account found for this member.");
      }

      console.log("✅ Account fetched:", account);

      const inkExternalAccount = await linkExternalAccount({
        financialAccountId: account.accountGuid,
      });

      const mapped = mapKeys(account) as any;
      await registerExternalAccount(mapped);

      await queryClient.invalidateQueries({
        queryKey: userKeys.fiatDashboard(),
      });
      await queryClient.refetchQueries({ queryKey: userKeys.fiatDashboard() });

      setPleaseWait(false);
      // setTimeout(() => {
      navigation.reset({
        index: 0,
        routes: [{ name: NAVIGATION_SCREENS.NEW_DASHBOARD }], // or your screen name
      });
      // }, 1000); // Wait for the account to be registered
    } catch (error) {
      if (error instanceof Error) {
        console.error("❌ Onboarding flow error:", error.message);
      } else {
        console.error("❌ Onboarding flow error:", error);
      }
    } finally {
      useDispatchAction(setShowLoader(false));
      setPleaseWait(false);
    }
  };

  const mapKeys = (account: any) => ({
    account_type: account.accountType?.toLowerCase(),
    account_number: `${account.accountNumberLast4}`,
    account_id: account.accountGuid,
    bank_name: account.financialInstitutionName,
    small_logo_url: account.smallLogoUrl,
    medium_logo_url: account.mediumLogoUrl,
    financialInstitutionName: account.financialInstitutionName,
  });

  const handleMemberConnected = (metadata: any) => {
    const memberGUID = metadata?.member_guid;
    if (memberGUID && !hasStartedFlow.current) {
      hasStartedFlow.current = true;
      handleFullOnboardingFlow(memberGUID);
    }
  };

  return (
    <ScreenContainer padding={0}>
      <HeaderTitle
        isBack={true}
        title="Link External Account"
        leftIcon={SVGLeftArrow}
        onPressLeft={() => navigation.goBack()}
      />
      {pleaseWait && (
        <View
          style={{
            width: "100%",
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "row",
            marginVertical: 10,
          }}
        >
          <ActivityIndicator
            style={{ marginHorizontal: 10 }}
            size={"small"}
            color={"black"}
          />
          <CustomText>Please wait... Do not press any key. </CustomText>
        </View>
      )}
      <Card style={styles.widgetContainer}>
        <ConnectWidget
          url={URL}
          onLoaded={() => {
            useDispatchAction(setShowLoader(false));
          }}
          onMemberConnected={handleMemberConnected}
          onCreateMemberError={(meta) =>
            console.error("❌ Create Member Error:", meta)
          }
          onOAuthError={(meta) => console.error("❌ OAuth Error:", meta)}
          onOAuthRequested={(meta) => console.log("🌐 OAuth Requested:", meta)}
          onEnterCredentials={(meta) =>
            console.log("🔐 Entering Credentials:", meta)
          }
          onSubmitMFA={(meta) => console.log("🔐 Submit MFA:", meta)}
          onAccountCreated={(meta) =>
            console.log("✅ Account Created event:", meta)
          }
          style={{ minHeight: "100%" }}
        />
      </Card>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
    paddingHorizontal: 10,
    backgroundColor: "#fff",
  },
  widgetContainer: {
    flex: 1,
  },
});

export default ConnectWidgetTest;
