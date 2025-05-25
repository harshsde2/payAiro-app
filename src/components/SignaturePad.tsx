import React, { useRef } from "react";
import {
  View,
  StyleSheet,
  Alert,
  Modal,
  Text,
  TouchableWithoutFeedback,
  GestureResponderEvent,
} from "react-native";
import Signature from "react-native-signature-canvas";
import Fonts from "../constants/Fonts";

interface SignaturePadProps {
  onClose: () => void;
  onSelected: (signature: string) => void;
  isVisible: boolean;
}

const SignaturePad: React.FC<SignaturePadProps> = ({
  onClose,
  onSelected,
  isVisible,
}) => {
  const signatureRef = useRef<any>(null);

  const handleSignature = (signature: string) => {
    console.log("Signature captured: ", signature);
    onSelected(signature);
    onClose();
  };

  const handleClear = () => {
    console.log("Signature pad cleared");
  };

  const handleEmpty = () => {
    Alert.alert("Signature Empty", "Please provide a signature.");
  };

  const handleOutsidePress = (event: GestureResponderEvent) => {
    // Close the modal if press happens outside modalContent
    onClose();
  };

  const webStyle = `
    .m-signature-pad--footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .button.clear {
      margin: 10px;
      background-color: black;
    }
    .button.save {
      right: 0;
      background-color: black;
    }
  `;

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={handleOutsidePress}>
        <View style={styles.modalContainer}>
          <TouchableWithoutFeedback>
            <View style={styles.modalContent}>
              <Text style={styles.headerText}>Draw your Signature</Text>
              <View style={styles.container}>
                <Signature
                  ref={signatureRef}
                  style={{
                    borderRadius: 20,
                    borderWidth: 2,
                    borderStyle: "dashed",
                  }}
                  descriptionText=""
                  onOK={handleSignature}
                  onClear={handleClear}
                  onEmpty={handleEmpty}
                  clearText="Clear Signature"
                  confirmText="Save Signature"
                  webStyle={webStyle}
                />
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 370,
    margin: 20,
    backgroundColor: "#fff",
  },
  headerText: {
    fontSize: 20,
    fontFamily: Fonts.bold,
    color: "#4F378B",
    textAlign: "center",
    marginBottom: 20,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
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
    marginTop: 300,
    flex: 1,
  },
});

export default SignaturePad;
