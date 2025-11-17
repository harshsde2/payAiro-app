import {
  View,
  Text,
  KeyboardAvoidingView,
  ScrollView,
  TouchableOpacity,
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
  setErrorMsg,
  setShowLoader,
} from "../../redux/slices/authenticationSlice";
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

export default function Send(props) {
  const { requested, type, sender: senderDetails } = props.route.params;
  const { theme } = useTheme();

  const dispatch = useDispatch();

  // console.log('requested =>', requested)
  // console.log('type =>', type)
  // console.log('senderDetails =>', senderDetails)

  const { walletData, tokens } = useSelectorAction();
  const navigation = useNavigation();
  const [sender, setsender] = useState(props.route.params?.sender ?? "");
  const [isVisible, setisVisible] = useState();
  const [text, settext] = useState(" Vay via Bank");
  const { bankLists, bankBalance } = useSelectorAction();
  const { biometricAvailable } = useSelectorAction();
  const [selectedBank, setselectedBank] = useState(bankLists[0]);
  const [isDropdown, setisDropdown] = useState(false);
  const { mutateAsync: verifyUserByIdentifier, isLoading: userLoading, error: userError } = useVerifyUserByIdentifier();

  const hasKey = (bank, key) => bank.some((obj) => key in obj);

  const handleOpenLink = useCallback(async () => {
    // console.log(
    //   "!hasKey(bankLists, bank_type) =>",
    //   !hasKey(bankLists, "bank_type")
    // );
    if (!hasKey(bankLists, "bank_type")) {
      try {
        dispatch(setShowLoader(true));
        const resp = await axios.get(`${BASE_URL.testing}auth/url-external-account`, {
          headers: {
            Authorization: `Bearer ${tokens?.access}`, // ✅ this is the correct way to send auth header
          },
        });
        const { status, data } = resp?.data;
        if (status && data) {
          navigation.navigate(NAVIGATION_SCREENS.MX_CONNECT_WIDGET_SCREEN, {
            URL: data?.fortress_response.widgetUrl,
          });
        }
        // console.log("handleOpenLink =>", JSON.stringify(resp.data,null,2)); // Use .data to access response body
      } catch (e) {
        console.error("Error fetching external account URL:", e);
      } finally {
        dispatch(setShowLoader(false));
      }
    } else {
      // console.log("mxExternalAccountDetails =>", mxExternalAccountDetails)
      dispatch(setErrorMsg("External account aleardy found"));
    }
  }, [bankLists]);

  console.log("send screen is rendering",requested);
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
                  navigation.reset({
                    index: 0,
                    routes: [{ name: NAVIGATION_SCREENS.SCANS }], // or your screen name
                  });
                  useDispatchAction(setActiveTab("3"));
                }}
                value={sender}
                onChange={setsender}
              />
              {/* 
              <TextInputField
                label={'Note (optional)'}
                placeholder={'Mention for which reason your sending this'}
                isMultiLine={true}
                cStyle={{marginTop: 20}}
              /> */}
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
                                fontSize: 10,
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
                        <TouchableOpacity
                          style={{
                            width: 20,
                            alignItems: "center",
                            marginLeft: 5,
                          }}
                          disabled
                        >
                          <SvgXml
                            xml={isDropdown ? SVGUpArrow : SVGDowArrow2}
                          />
                        </TouchableOpacity>
                      </TouchableOpacity>
                      {isDropdown &&
                        bankLists &&
                        bankLists?.length > 0 &&
                        bankLists
                          .filter(
                            (bank) =>
                              !bank?.account_type?.toLowerCase()?.includes("ira")
                          )
                          .map((item, k) => (
                            <TouchableOpacity
                              onPress={() => {
                                console.log(item, "item");
                                setselectedBank(item);
                                setisDropdown(false);
                              }}
                              key={k}
                              style={{
                                flexDirection: "row",
                                justifyContent: "flex-start",
                                alignItems: "center",
                                marginVertical: 10,
                                //   padding: 20,
                              }}
                            >
                              <SvgXml xml={SVGUSD} width={40} height={40} />
                              <View style={{ marginHorizontal: 10 }}>
                                <Text
                                  style={{
                                    color: "black",
                                    fontSize: 16,
                                    fontFamily: Fonts.bold,
                                  }}
                                >
                                  {item?.bank_name ?? item?.name}
                                  <CustomText
                                    variant={"body2"}
                                    color={theme?.colors.palette.green700}
                                    style={{ textTransform: "capitalize" }}
                                  >{` (${item?.account_type})`}</CustomText>
                                </Text>
                                <Text
                                  style={{
                                    color: "rgba(106, 106, 106, 0.7)",
                                    fontFamily: Fonts.semibold,
                                    fontSize: 10,
                                  }}
                                >
                                  $
                                  {item?.balances?.available
                                    ? item?.balances?.available
                                    : item?.account_type === "rothIra"
                                    ? bankBalance?.roth_ira_account?.usd
                                    : item?.account_type === "traditionalIra"
                                    ? bankBalance?.traditional_ira_account?.usd
                                    : bankBalance?.bank_account?.usd}
                                </Text>
                              </View>
                            </TouchableOpacity>
                          ))}

                      {!hasKey(bankLists, "bank_type") && (
                        <TouchableOpacity
                          activeOpacity={0.7}
                          onPress={() => {
                            handleOpenLink();
                          }}
                          style={{
                            flexDirection: "row",
                            justifyContent: "space-between",
                            alignItems: "center",
                            flex: 1,
                            marginTop: 20,
                            //   padding: 20,
                          }}
                        >
                          <View
                            style={{
                              flex: 1,
                              flexDirection: "row",
                              justifyContent: "flex-start",
                              alignItems: "center",

                              // padding: 20,
                            }}
                          >
                            <SvgIcons.Bank width={40} height={40} />

                            <View style={{ marginHorizontal: 10, flex: 1 }}>
                              <Text
                                style={{
                                  color: "black",
                                  fontSize: 16,
                                  fontFamily: Fonts.bold,
                                }}
                              >
                                {"Link External Account"}
                              </Text>
                            </View>
                          </View>
                          <TouchableOpacity
                            style={{
                              width: 20,
                              alignItems: "center",
                              marginLeft: 5,
                            }}
                            disabled
                          >
                            <SvgIcons.PlusCircleIcon width={20} height={20} />
                          </TouchableOpacity>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                )}
              </View>
              <GenericButton
                title={"Next"}
                cStyle={{ marginTop: 10 }}
                onPress={async () => {
                  if (!sender.trim()) {
                    dispatch(setErrorMsg("Please enter a valid identifier"));
                    return;
                  }
                  try {
                    dispatch(setShowLoader(true));
                    const data = await verifyUserByIdentifier({ identifier: sender.trim() });
                    console.log(data, "verified user data");
                    if (data && data.status) {
                      navigation.navigate(SCREENS.ScanPay, {
                        type: requested || type === "requested" ? "requested" : "receive",
                        sender: sender.trim(),
                        bank: selectedBank,
                      });
                    } else {
                      dispatch(setErrorMsg(data?.message || "Recipient not found"));
                    }
                  } catch (e) {
                    console.log("User verification failed:", e);
                    dispatch(setErrorMsg(e?.message || "Something went wrong. Please try again."));
                  } finally {
                    dispatch(setShowLoader(false));
                  }
                }}
                disabled={userLoading}
              />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}
