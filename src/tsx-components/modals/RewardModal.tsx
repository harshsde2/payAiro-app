import GenericButton from "components/GenericButton";
import { SvgIcons } from "constants/svgs";
import React from "react";
import {
  GestureResponderEvent,
  Modal,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SvgXml } from "react-native-svg";
import Fonts from "../../constants/Fonts";
import { SVGDollerReward } from "../../constants/images";

interface RewardModalProps {
  isVisible: boolean;
  onClose: (event?: GestureResponderEvent) => void;
}

const RewardModal: React.FC<RewardModalProps> = ({ isVisible, onClose }) => {
  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <SafeAreaView style={{ flex: 1, backgroundColor: "rgba(0, 0, 0, 0.5)" }}>
        <View style={styles.modalContainer}>
          <SvgIcons.CrossIcon
            style={{ alignSelf: "flex-end", position: "absolute", top: 20 }}
            onPress={onClose}
          />
          <View style={styles.modalContent}>
            <SvgXml xml={SVGDollerReward} style={{ alignSelf: "center" }} />

            <Text
              style={{
                fontSize: 14,
                fontFamily: Fonts.regular,
                color: "rgba(255, 255, 255, 1)",
                textAlign: "center",
                marginTop: 30,
              }}
            >
              A rewarding welcome to the world of effortless finance with
              PayAiro.
            </Text>
            <GenericButton
              onPress={onClose}
              title={"Start Exploring"}
              cStyle={{
                borderWidth: 1,
                borderColor: "#fff",
                width: "60%",
                alignSelf: "center",
                marginVertical: 20,
              }}
            />
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

export default RewardModal;

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
