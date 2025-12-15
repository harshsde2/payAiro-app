import {
  View,
  Text,
  KeyboardAvoidingView,
  ScrollView,
  TouchableOpacity,
  Platform,
} from "react-native";
import React, { useCallback, useState } from "react";
import Container from "../../HOC/Container";
import Fonts from "../../constants/Fonts";
import TextInputField from "../../components/TextInputField";
import { SvgXml } from "react-native-svg";
import {
  SVGBank,
  SVGDowArrow2,
  SVGDownArrow,
  SVGLeftArrow,
  SVGProfile,
  SVGProfile3,
  SVGUSD,
  SVGUpArrow,
  SVGScan,
  SVGAddIcon,
  SVGPlus,
  SVGBank1,
  SVGBank2,
  SVGBamkAdd,
} from "../../constants/images";
import GenericButton from "../../components/GenericButton";
import { SCREENS } from "../../constants/SCREENS";
import { useNavigation } from "@react-navigation/native";
import useSelectorAction from "../../hooks/useSelectorAction";
import { checkUser } from "../../services/Services";
import useDispatchAction from "../../hooks/useDispatchAction";
import {
  setActiveTab,
  setShowLoader,
} from "../../redux/slices/authenticationSlice";
import { showError } from "../../utils/toast";
import { CustomText } from "tsx-components";
import { useTheme } from "styles";
import { ScreenContainer } from "HOC";
import HeaderTitle from "components/HeaderTitle";
import { NAVIGATION_SCREENS } from "navigations/navigationConstants";
import { SvgIcons } from "constants/svgs";
import { useDispatch } from "react-redux";
import { BASE_URL } from "api/endpoints";
import axios from "axios";
import { useVerifyUserByIdentifier } from "query/hooks/useUser";
import { detectBlockchainNameService } from "../../utils/blockchainNameService";
import BlockchainNameServiceTermsModal from "../../components/common-components/BlockchainNameServiceTermsModal";

export default function Send(props) {
  const { requested, type, sender: senderDetails } = props.route.params;
  const { theme } = useTheme();


  const navigation = useNavigation();
  const [sender, setsender] = useState(props.route.params?.sender ?? "");

  const { bankLists, bankBalance } = useSelectorAction();
  const [selectedBank, setselectedBank] = useState(bankLists[0]);
  const [isDropdown, setisDropdown] = useState(false);
  const { mutateAsync: verifyUserByIdentifier, isLoading: userLoading, error: userError } = useVerifyUserByIdentifier();
  
  // Blockchain Name Service modal state
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [blockchainServiceType, setBlockchainServiceType] = useState(null);
  const [pendingVerification, setPendingVerification] = useState(false);

  // Handle user verification (used for both normal and blockchain name service addresses)
  const handleUserVerification = async () => {
    if (!sender.trim()) {
      showError("Please enter a valid identifier");
      return;
    }

    setPendingVerification(true);
    try {
      const data = await verifyUserByIdentifier({ identifier: sender.trim() });
      console.log(data, "verified user data");
      if (data && data.status) {
        navigation.navigate(SCREENS.ScanPay, {
          type: requested || type === "requested" ? "requested" : "receive",
          sender: sender.trim(),
          bank: selectedBank,
        });
      } else {
        showError(data?.message || "Recipient not found");
      }
    } catch (e) {
      console.log("User verification failed:", e);
      showError(e?.message || "Something went wrong. Please try again.");
    } finally {
      setPendingVerification(false);
    }
  };

  // Handle terms agreement for blockchain name service
  const handleTermsAgree = () => {
    setShowTermsModal(false);
    // Proceed with verification after user agrees
    handleUserVerification();
  };

  return (
    <ScreenContainer padding={0}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <HeaderTitle
          title={`${
            type === "requested"
              ? "Receive Assets"
              : "PayAiro to PayAiro Transfer"
          } `}
          titleStyle={{ fontSize: 16 }}
          leftIcon={SVGLeftArrow}
        />
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ flexGrow: 1 }}
        >
          <View
            style={{
              flex: 1,
              backgroundColor: "#fff",
              borderTopEndRadius: 32,
              borderTopStartRadius: 32,
              padding: 20,
              marginTop: 20,
            }}
          >
            <View>
              <TextInputField
                editable={
                  props.route.params?.sender === "" ||
                  props.route.params?.sender === undefined
                }
                label={type === "requested" ? "From" : "To"}
                placeholder={"PayAiroTag, Phone, Email"}
                // isIcon={true}
                // icon={SVGScan}
                rightIcon={SVGScan}
                onRightIconClick={() => {
                  navigation.navigate(NAVIGATION_SCREENS.SCANS);
                  useDispatchAction(setActiveTab("3"));
                }}
                value={sender}
                onChange={setsender}
              />
            </View>
            <View style={{ flex: 1, justifyContent: "space-between" }}>
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontFamily: Fonts.semibold,
                    color: "#000",
                    fontSize: 14,
                    textAlign: "left",
                    padding: 15,
                    marginTop: 30,
                  }}
                >
                  {`${type === "requested" ? "" : "Send From"} `}
                </Text>
                {type !== "requested" && (
                  <View style={{}}>
                    <View
                      style={{
                        backgroundColor: "rgba(226, 241, 227, 0.8)",
                        padding: 20,
                        borderWidth: 1,
                        borderColor: "rgba(44, 106, 63, 0.1)",
                        borderRadius: 15,
                      }}
                    >
                      <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={() => setisDropdown((state) => !state)}
                        style={{
                          flexDirection: "row",
                          justifyContent: "space-between",
                          alignItems: "center",
                          flex: 1,
                          marginBottom: isDropdown ? 10 : 0,
                          //   padding: 20,
                        }}
                      >
                        <View
                          style={{
                            flex: 1,
                            flexDirection: "row",
                            justifyContent: "flex-start",
                            alignItems: "center",
                            //   padding: 20,
                          }}
                        >
                          <SvgXml xml={SVGUSD} width={40} height={40} />
                          <View style={{ marginHorizontal: 10, flex: 1 }}>
                            <Text
                              style={{
                                color: "black",
                                fontSize: 16,
                                fontFamily: Fonts.bold,
                              }}
                            >
                              {selectedBank?.bank_name ?? selectedBank?.name}{" "}
                              <CustomText
                                variant={"body2"}
                                color={theme?.colors.palette.green700}
                                style={{ textTransform: "capitalize" }}
                              >{` (${selectedBank?.account_type})`}</CustomText>
                            </Text>
                            <Text
                              style={{
                                color: "rgba(106, 106, 106, 0.7)",
                                fontFamily: Fonts.semibold,
                                fontSize: 16,
                              }}
                            >
                              $
                              {selectedBank?.balances?.available
                                ? selectedBank?.balances?.available
                                : selectedBank?.account_type === "rothIra"
                                ? bankBalance?.roth_ira_account?.usd
                                : selectedBank?.account_type ===
                                  "traditionalIra"
                                ? bankBalance?.traditional_ira_account?.usd
                                : bankBalance?.bank_account?.usd}
                            </Text>
                          </View>
                        </View>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              </View>
              <GenericButton
                title={"Next"}
                cStyle={{ marginTop: 10 }}
                onPress={async () => {
                  if (!sender.trim()) {
                    showError("Please enter a valid identifier");
                    return;
                  }

                  // Check if the identifier is a blockchain name service address
                  const { isBlockchainNameService, type: serviceType } = detectBlockchainNameService(sender.trim());
                  
                  if (isBlockchainNameService && serviceType) {
                    // Show terms modal for blockchain name service addresses
                    setBlockchainServiceType(serviceType);
                    setShowTermsModal(true);
                    return;
                  }

                  // Proceed with normal verification for PayAiroTag, Phone, Email
                  await handleUserVerification();
                }}
                disabled={userLoading || pendingVerification}
              />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      
      {/* Blockchain Name Service Terms Modal */}
      {blockchainServiceType && (
        <BlockchainNameServiceTermsModal
          isVisible={showTermsModal}
          onClose={() => {
            setShowTermsModal(false);
            setBlockchainServiceType(null);
          }}
          onAgree={handleTermsAgree}
          serviceType={blockchainServiceType}
        />
      )}
    </ScreenContainer>
  );
}
