import React from "react";
import {
  Image,
  Modal,
  Pressable,
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

const LogoutModal = ({ isVisible, onClose, onCancel }) => {
  const navigation = useNavigation();

  return (
    <Modal visible={isVisible} transparent={true} animationType="slide">
      <Pressable onPress={onCancel} style={styles.modalContainer}>
        <Pressable
          onPress={(e) => e.stopPropagation()}
          style={styles.modalContent}
        >
          <Text style={styles.headerText}>Logout</Text>
          <Text
            style={{
              fontSize: 18,
              fontFamily: Fonts.regular,
              color: "grey",
              textAlign: "center",
            }}
          >
            Sure you want to log out?
          </Text>
          <GenericButton
            title="Yes , Logout"
            cStyle={{ marginTop: 25 }}
            onPress={() => {
              onClose();
              // navigation.navigate(SCREENS.LOGIN);
            }}
          />
          <GenericButton
            title={"Cancel"}
            cStyle={{ backgroundColor: "#000", marginVertical: 10 }}
            tStyle={{ color: "white" }}
            onPress={onCancel}
          />
        </Pressable>
      </Pressable>
    </Modal>
  );
};

export default LogoutModal;

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "#fff",
    width: "100%",
    borderTopEndRadius: 20,
    borderTopStartRadius: 20,
    padding: 20,
    elevation: 8,
    // height: "50%",
    // marginTop: 500,
    // flex: 1,
  },
  headerText: {
    fontSize: 26,
    fontFamily: Fonts.bold,
    color: "rgba(29, 29, 29, 1)",
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
