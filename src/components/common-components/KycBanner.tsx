import { useNavigation } from "@react-navigation/native";
import { NAVIGATION_SCREENS } from "navigations/navigationConstants";
import React, { useMemo } from "react";
import { Text, View } from "react-native";
import { useSelector } from "react-redux";
import { useGlobalStyles } from "styles/GlobalStyles";
import { useTheme } from "styles/ThemeContext";
import { toKycMode } from "types/kyc";

const KycBanner: React.FC = () => {
  const { theme } = useTheme();
  const gs = useGlobalStyles();
  const navigation = useNavigation<any>();
  const kycStatus = useSelector((s: any) => s.authenticationSlice?.kycStatus);

  const mode = useMemo(() => toKycMode(kycStatus), [kycStatus]);

  // console.log("mode ->",mode)
  // console.log("kycStatus ->",kycStatus)
  if (mode !== "pending" && mode !== "not_started") return null;

  return (
    <View style={mode === "not_started" ? gs.kycBannerContainerNotStarted : gs.kycBannerContainer}> 
      <Text style={mode === "not_started" ? gs.kycBannerTextNotStarted : gs.kycBannerText}>
        {mode === "not_started"
          ? "Your KYC has not started. Please complete KYC to unlock full access."
          : "Your KYC is under review. You are in view-only mode."}
      </Text>
      {mode === "not_started" ? <Text onPress={() => navigation.navigate(NAVIGATION_SCREENS.PERSONAL as never)} style={{ color: theme.colors.palette.primary, fontSize: 10, fontWeight: "600", textAlign: "center" ,textDecorationLine: "underline"}}>go to complete your kyc</Text>:null}
    </View>
  );
};

export default KycBanner;


