import { useNavigation } from "@react-navigation/native";
import React from "react";
import {
  Modal,
  StyleSheet,
  Text,
  View,
  GestureResponderEvent,
  SafeAreaView,
  Pressable,
} from "react-native";
import { SvgXml } from "react-native-svg";
import Fonts from "../../constants/Fonts";
import { SVGCross, SVGDollerReward, SVGReward } from "../../constants/images";
import GenericButton from "components/GenericButton";

interface CommonModalProps {
  children?: React.ReactNode;
  isVisible: boolean;
  onClose: (event?: GestureResponderEvent) => void;
}

const CommonModal: React.FC<CommonModalProps> = ({
  isVisible,
  onClose,
  children,
}) => {
  return (
    <Modal
      visible={isVisible}
      transparent
      //   animationType="slide"
      onRequestClose={onClose}
    >
      {/* <SafeAreaView style={{ flex: 1, backgroundColor: "rgba(0, 0, 0, 0.5)" }}> */}
      <Pressable
        onPress={onClose}
        style={{
          flex: 1,
          justifyContent: "flex-end",
          backgroundColor: "rgba(0, 0, 0, 0.5)",
        }}
      >
        {children}
      </Pressable>
      {/* </SafeAreaView> */}
    </Modal>
  );
};

export default CommonModal;

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    // backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "transparent",
    width: "90%",
    borderTopEndRadius: 20,
    borderTopStartRadius: 20,
    padding: 20,
    elevation: 8,
    borderRadius: 30,
  },
  headerText: {
    fontSize: 24,
    fontFamily: Fonts.bold,
    color: "rgba(29, 29, 29, 1)",
    textAlign: "center",
  },
  sectionHeader: {
    fontSize: 14,
    fontFamily: Fonts.regular,
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
    fontFamily: Fonts.regular,
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
    fontFamily: Fonts.regular,
    fontSize: 14,
  },
});
