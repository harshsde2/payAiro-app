import { useNavigation } from "@react-navigation/native";
import { NAVIGATION_SCREENS } from "navigations/navigationConstants";
import React, { useEffect, useMemo, useState } from "react";
import {
  Image,
  StyleSheet,
  Text,
  View
} from "react-native";
import { useSelector } from "react-redux";
import CommonHeaderv2 from "../../HOC/CommonHeaderv2";
import GenericButton from "../../components/GenericButton";
import HeaderTitle from "../../components/HeaderTitle";
import Fonts from "../../constants/Fonts";
import {
  SVGLeftArrow
} from "../../constants/images";
import useDispatchAction from "../../hooks/useDispatchAction";
import useSelectorAction from "../../hooks/useSelectorAction";
import { usePatchUserDetails } from "../../query/hooks/useAPIAuth";
import { setKycStatus } from "../../redux/slices/authenticationSlice";
import { showError, showSuccess } from "../../utils/toast";
import { getKYC } from "../../services/Services";
import { toKycMode } from "../../types/kyc";

export default function Personal() {
  const { walletData, tokens } = useSelectorAction();
  const kycStatus = useSelector((s) => s?.authenticationSlice?.kycStatus);
  const mode = useMemo(() => toKycMode(kycStatus), [kycStatus]);
  const { mutate: patchUser,isPending } = usePatchUserDetails();
  const navigation = useNavigation();



  const [kycStep, setkycStep] = useState(null);
  useEffect(() => {
    getkycStep();
  }, []);
  const [phone, setphone] = useState("");

  const getkycStep = async () => {
    const kycData = await getKYC(tokens?.access);
    // console.log(kycData, 'KYCDatata');
    if (kycData?.data) {
      setphone(kycData?.data?.mobile_number);
      setkycStep(kycData?.data);
    }
  };



  const DETAILS_DATA = [
    { key: "PayAiro Tag", value: "#" + walletData?.username },
    { key: "Phone Number", value: kycStep?.mobile_number },
    {
      key: "Address",
      value: `${kycStep?.address2 ?? ""}  ${kycStep?.street_address ?? ""}`,
    },
    {
      key: "City",
      value: `${kycStep?.city ?? ""}`,
    },
    {
      key: "State",
      value: `${kycStep?.state ?? ""}`,
    },
    {
      key: "Zipcode",
      value: `${kycStep?.zip_code ?? ""}`,
    },
    { key: "Country", value: kycStep?.country ?? "" },
    { key: "Currency", value: "US Dollar" },
  ];
  

  const handleStartKyc = () => {
    try {
      patchUser({'start_kyc': true}, {
        onSuccess: (data) => {
          console.log(JSON.stringify(data,null,2), "datas");
          if(data?.status == true && data?.persona_verification_url) {
            // Notify and move KYC to pending to enable polling via KycWatchdog
            navigation.navigate(NAVIGATION_SCREENS.CYBRID_WEB_VIEW, {
              URL: data?.persona_verification_url,
            });
            showSuccess("KYC started successfully");
            useDispatchAction(setKycStatus({ status: false, state: "pending", toast_message: "KYC started" }));

          } else{
            showSuccess("Your ID fetch successfully please click again to start KYC");
          }
        },
        onError: (error) => {
          console.log(JSON.stringify(error.response, null, 2), "error");
            showError("Failed to start KYC");
        },
      });
    } catch (e) {
      showError("Failed to start KYC");
    }
  };

  return (
    <CommonHeaderv2>
      <HeaderTitle title="Personal" leftIcon={SVGLeftArrow} />
      <View style={styles.container}>
        <View
          style={{
            backgroundColor: "rgba(226, 241, 227, 1)",
            padding: 14,
            borderRadius: 20,
          }}
        >
          <View
            style={{
              padding: 10,
              borderRadius: 15,
              backgroundColor: "rgba(44, 106, 63, 1)",
              flexDirection: "row",
              justifyContent: "flex-start",
              alignItems: "center",
            }}
          >
            <View
              style={[
                styles.circle,
                { backgroundColor: "rgba(255, 172, 37, 1)" },
              ]}
            >
              {kycStep?.selfimage ? (
                <Image
                  source={{
                    uri: kycStep?.selfimage,
                  }}
                  style={styles.image}
                />
              ) : (
                <Text style={{ ...styles.initials, color: "#000" }}>
                  {walletData?.name?.charAt(0)?.toUpperCase()}
                </Text>
              )}
            </View>
            <View style={{ marginLeft: 15 }}>
              <Text
                style={{ fontFamily: Fonts.bold, color: "white", fontSize: 16 }}
              >
                {walletData?.name}
              </Text>
              <Text style={{ fontFamily: Fonts.regular, color: "white" }}>
                {walletData?.account_email}
              </Text>
            </View>
          </View>

          <View
            style={{
              flexDirection: "row",
              justifyContent: "flex-start",
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            {DETAILS_DATA.filter(item => item?.value && item?.value.trim() !== "").map((i, k) => (
              <View style={{ width: "40%", margin: 8 }} key={k}>
                <Text
                  style={{
                    color: "rgba(44, 106, 63, 1)",
                    fontFamily: Fonts.regular,
                    textAlign: k % 2 === 1 ? "right" : "left",
                  }}
                >
                  {i?.key}
                </Text>
                <Text
                  style={{
                    color: "black",
                    fontFamily: Fonts.semibold,
                    textAlign: k % 2 === 1 ? "right" : "left",
                  }}
                >
                  {i?.value}
                </Text>
              </View>
            ))}
          </View>
        </View>
        <Text
          style={{
            color: "black",
            fontSize: 18,
            fontFamily: Fonts.semibold,
            marginVertical: 10,
          }}
        >
        
        </Text>
        {mode === "not_started" && (
          <GenericButton
            title={"Complete your KYC"}
            onPress={handleStartKyc}
            isLoading={isPending}
            showLoader={isPending}
            style={styles.saveButton}
          />
        )}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "flex-start",
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
    
        </View>
      </View>
    </CommonHeaderv2>
  );
}

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    borderTopEndRadius: 32,
    borderTopStartRadius: 32,
    padding: 20,
    marginTop: 20,
  },
  circle: {
    width: 50,
    height: 50,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  initials: {
    color: "#000",
    fontSize: 18,
    fontFamily: Fonts.semibold,
  },
  image: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  inputContainer: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    color: "#333",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
  },
  saveButton: {
    marginTop: 60,
  },
});
