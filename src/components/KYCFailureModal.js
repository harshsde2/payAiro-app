import { useNavigation } from "@react-navigation/native";
import { SvgIcons } from "constants/svgs";
import React, { useState } from "react";
import { Modal, StyleSheet, Text, View } from "react-native";
import ReactNativeBiometrics from "react-native-biometrics";
import { SvgXml } from "react-native-svg";
import Fonts from "../constants/Fonts";
import { SVGKYC } from "../constants/images";
import useSelectorAction from "../hooks/useSelectorAction";

const KYCFailureModal = ({ isVisible, onClose, onCancel }) => {
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
          <SvgIcons.CrossIcon
            style={{ alignSelf: "flex-end" }}
            onPress={onClose}
          />

          <SvgXml style={{ alignSelf: "center" }} xml={SVGKYC} />
          <Text style={styles.headerText}>Oops!</Text>

          <Text
            style={{
              fontSize: 14,
              fontFamily: Fonts.regular,
              color: "grey",
              textAlign: "center",
              marginTop: 20,
            }}
          >
            It looks like your KYC verification isn’t complete yet.
          </Text>
          <Text
            style={{
              fontSize: 14,
              fontFamily: Fonts.regular,
              color: "grey",
              textAlign: "center",
            }}
          >
            Thank you for choosing PayAiro! ßßß{" "}
          </Text>
          <View style={{ marginVertical: 10 }}></View>
        </View>
      </View>
    </Modal>
  );
};

export default KYCFailureModal;

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
