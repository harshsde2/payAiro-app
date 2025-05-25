import React, { useEffect, useState } from "react";
import {
  Alert,
  Image,
  Linking,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Fonts from "../constants/Fonts";
import GenericButton from "./GenericButton";
import { SCREENS } from "../constants/SCREENS";
import { useNavigation } from "@react-navigation/native";
import ReactNativeBiometrics from "react-native-biometrics";
import useSelectorAction from "../hooks/useSelectorAction";
import { setBiometricAvailable } from "../redux/slices/authenticationSlice";
import useDispatchAction from "../hooks/useDispatchAction";
import { setBiometric } from "../services/Auth";
import { CARD_TYPE } from "../constants/constant";
import { SvgXml } from "react-native-svg";
import {
  SVGCross,
  SVGBit,
  SVGUSD,
  SVGDowArrow2,
  SVGUpArrow,
  SVGBack,
  SVGLeftArrow,
} from "../constants/images";
import { getKYC } from "../services/Services";

const FullScreenModal = ({
  isVisible,
  onClose,
  onCancel,
  sendAmount,
  data,
  onSelected,
}) => {
  const { bankLists, bankBalance } = useSelectorAction();
  const { biometricAvailable } = useSelectorAction();
  const [selectedBank, setselectedBank] = useState(data ?? bankLists[0]);
  const rnBiometrics = new ReactNativeBiometrics({
    allowDeviceCredentials: true,
  });

  const [isDropdown, setisDropdown] = useState(false);
  const [enableBiometric, setenableBiometric] = useState(biometricAvailable);
  const navigation = useNavigation();
  return (
    <Modal
      visible={isVisible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <SvgXml xml={SVGLeftArrow} style={{ margin: 20 }} onPress={onClose} />
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
            <View
              style={{
                backgroundColor: "rgba(217, 217, 217, 0.2)",
                borderRadius: 20,
                borderWidth: 1,
                borderColor: "rgba(106, 106, 106, 0.12)",
                marginBottom: 10,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: 20,
                }}
              >
                <View>
                  <Text style={{ color: "black", fontFamily: Fonts.semibold }}>
                    {selectedBank?.bank_name ?? selectedBank?.name}
                  </Text>
                  {/* rgba(106, 106, 106, 0.7) */}
                  <Text
                    style={{
                      color: "rgba(106, 106, 106, 0.7)",
                      fontFamily: Fonts.semibold,
                      fontSize: 10,
                    }}
                  >
                    $
                    {selectedBank?.balances?.available ??
                    selectedBank?.balances?.available
                      ? selectedBank?.balances?.available
                      : selectedBank?.account_type === "rothIra"
                      ? bankBalance?.roth_ira_account?.usd
                      : selectedBank?.account_type === "traditionalIra"
                      ? bankBalance?.traditional_ira_account?.usd
                      : bankBalance?.bank_account?.usd}
                  </Text>
                </View>
                <SvgXml xml={SVGUSD} />
              </View>
              <View
                style={{
                  borderBottomWidth: 1,
                  borderBottomColor: "rgba(228, 228, 228, 1)",
                  marginBottom: 20,
                }}
              />
              <Text
                style={{
                  textAlign: "center",
                  fontSize: 28,
                  fontFamily: Fonts.bold,
                  marginBottom: 30,
                }}
              >
                ${sendAmount}
              </Text>
            </View>

            <View
              style={{
                backgroundColor: "rgba(226, 241, 227, 0.8)",
                padding: 20,
                borderWidth: 1,
                borderColor: "rgba(44, 106, 63, 0.1)",
                borderRadius: 15,
                marginVertical: 30,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  //   padding: 20,
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "flex-start",
                    alignItems: "center",
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
                      {selectedBank?.bank_name ?? selectedBank?.name}
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
                        : selectedBank?.account_type === "traditionalIra"
                        ? bankBalance?.traditional_ira_account?.usd
                        : bankBalance?.bank_account?.usd}
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={{ width: "40%", alignItems: "flex-end" }}
                  onPress={() => setisDropdown((state) => !state)}
                >
                  <SvgXml xml={isDropdown ? SVGUpArrow : SVGDowArrow2} />
                </TouchableOpacity>
              </View>
              {isDropdown &&
                bankLists &&
                bankLists?.length > 0 &&
                bankLists.map((item, k) => (
                  <TouchableOpacity
                    onPress={() => {
                      onSelected(item);
                      console.log(item, "itemssss");
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
                        {item?.bank_name ?? item?.name} ({" "}
                        <Text
                          style={{
                            color: "rgba(44, 106, 63, 1)",
                            fontSize: 12,
                            fontFamily: Fonts.semibold,
                            textTransform: "uppercase",
                          }}
                        >
                          {item?.account_type ?? "External"}
                        </Text>
                        )
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
            </View>
          </View>
          <GenericButton
            title={"Next"}
            cStyle={{ width: "80%", alignSelf: "center", marginBottom: 30 }}
            onPress={() => onCancel()}
          />
        </View>
      </View>
    </Modal>
  );
};

export default FullScreenModal;

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "rgba(243, 251, 244, 1)",
    width: "100%",
    // borderTopEndRadius: 20,
    // borderTopStartRadius: 20,
    // padding: 20,
    elevation: 8,
    height: "100%",
    // marginTop: 500,
    // flex: 1,
    position: "absolute",
    // borderRadius: 30,
  },

  headerText: {
    fontSize: 24,
    fontFamily: Fonts.bold,
    color: "rgba(29, 29, 29, 1)",
    textAlign: "center",
    // marginBottom: 10,
    // marginTop: 15,
  },
  sectionHeader: {
    fontSize: 14,
    fontFamily: Fonts.medium,
    color: "#333",
    marginVertical: 10,
  },
  optionContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginVertical: 5,
  },
  radioButton: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginVertical: 5,
  },
  checkbox: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginVertical: 5,
  },
  selectedOption: {
    backgroundColor: "#4F378B",
    borderColor: "#4F378B",
  },
  optionText: {
    fontSize: 14,
    fontFamily: Fonts.medium,
    color: "#333",
  },
  selectedText: {
    color: "#fff",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  clearButton: {
    backgroundColor: "transparent",
    padding: 10,
    borderRadius: 10,
    flex: 0.4,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "black",
  },
  applyButton: {
    backgroundColor: "#4F378B",
    padding: 10,
    borderRadius: 10,
    flex: 0.4,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontFamily: Fonts.medium,
    fontSize: 14,
  },
});
