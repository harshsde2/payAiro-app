import React, { useMemo } from "react";
import { Text, View } from "react-native";
import { useSelector } from "react-redux";
import { useGlobalStyles } from "styles/GlobalStyles";
import { useTheme } from "styles/ThemeContext";
import { toKycMode } from "types/kyc";

const KycBanner: React.FC = () => {
  const { theme } = useTheme();
  const gs = useGlobalStyles();
  const kycStatus = useSelector((s: any) => s.authenticationSlice?.kycStatus);

  const mode = useMemo(() => toKycMode(kycStatus), [kycStatus]);

  console.log("mode ->",mode)
  console.log("kycStatus ->",kycStatus)
  if (mode !== "pending") return null;

  return (
    <View style={[gs.kycBannerContainer]}> 
      <Text style={gs.kycBannerText}>
        Your KYC is under review. You are in view-only mode.
      </Text>
    </View>
  );
};

export default KycBanner;


