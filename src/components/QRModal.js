import React from "react";
import {
  Image,
  Modal,
  SafeAreaView,
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
import QRCode from "react-native-qrcode-svg";
import useSelectorAction from "../hooks/useSelectorAction";
import { SvgXml } from "react-native-svg";
import { SVGCross } from "../constants/images";

const QRModal = ({ isVisible, onClose, onSelected }) => {
  const navigation = useNavigation();
  const { walletData } = useSelectorAction();

  return (
    <Modal
      visible={isVisible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <SvgXml xml={SVGCross} onPress={onClose} />
          <View
            style={{
              alignSelf: "center",
              marginTop: 160,
              backgroundColor: "#fff",
              padding: 10,
              borderRadius: 20,
            }}
          >
            <QRCode value={walletData?.wallet_public_key} size={300} />
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

export default QRModal;

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    borderRadius: 0,
  },
  modalContent: {
    backgroundColor: "#000",
    width: "100%",
    // borderTopEndRadius: 20,
    // borderTopStartRadius: 20,
    padding: 20,
    elevation: 8,
    height: "100%",
    // marginTop: 50,
    flex: 1,
  },
  headerText: {
    fontSize: 26,
    fontFamily: Fonts.bold,
    color: "#fff",
    textAlign: "center",
    marginBottom: 10,
  },
  sectionHeader: {
    fontSize: 16,
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
