import { useNavigation } from "@react-navigation/native";
import React, { useState } from "react";
import { Modal, StyleSheet, Text, View } from "react-native";
import ReactNativeBiometrics from "react-native-biometrics";
import QRCode from "react-native-qrcode-svg";
import Fonts from "../constants/Fonts";
import useSelectorAction from "../hooks/useSelectorAction";
import { SvgIcons } from "constants/svgs";
const DepositModal = ({ isVisible, onClose, onCancel }) => {
  const { biometricAvailable } = useSelectorAction();
  const rnBiometrics = new ReactNativeBiometrics({
    allowDeviceCredentials: true,
  });

  const [isEnabled, setIsEnabled] = useState(false);
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
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <View style={{ width: "25%" }} />
            <Text style={styles.headerText}>Deposit BTC</Text>
            <SvgIcons.CrossIcon onPress={onClose} />
          </View>
          <View
            style={{
              alignSelf: "center",
              marginTop: 40,
              backgroundColor: "rgba(245, 245, 245, 1)",
              padding: 20,
              borderRadius: 20,
            }}
          >
            <QRCode value={"0xdhwhdgwehgedgvgevdgvegvdgevgvfe"} size={150} />
          </View>
          <View style={styles.itemContainer}>
            <Text style={styles.label}>{"Network"}:</Text>
            <Text style={styles.value}>{"BNB Smart Chain (BEP20)"}</Text>
          </View>
          <View style={styles.itemContainer}>
            <Text style={styles.label}>{"Deposit Address"}:</Text>
            <Text style={styles.value}>
              {"Oxb63ad12c0636722779596558ld7b92cadce1aeIc"}
            </Text>
          </View>

          <View style={{ marginVertical: 10 }}></View>
        </View>
      </View>
    </Modal>
  );
};

export default DepositModal;

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "#fff",
    width: "90%",
    borderTopEndRadius: 20,
    borderTopStartRadius: 20,
    padding: 20,
    elevation: 8,
    // height: '40%',
    // marginTop: 500,
    // flex: 1,
    position: "absolute",
    borderRadius: 30,
  },

  headerText: {
    fontSize: 18,
    fontFamily: Fonts.semibold,
    color: "rgba(44, 106, 63, 1)",
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
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#F5F5F5",
  },
  itemContainer: {
    flexDirection: "row",
    justifyContent: "space-between",

    paddingVertical: 10,
  },
  label: {
    fontSize: 12,
    fontFamily: Fonts.regular,
    color: "rgba(106, 106, 106, 1)",
  },
  value: {
    fontSize: 14,
    color: "#666",
    fontFamily: Fonts.semibold,
    width: "70%",
  },
});
