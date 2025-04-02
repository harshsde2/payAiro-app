import React, {useRef} from 'react';
import {View, StyleSheet, Alert, Modal, Text} from 'react-native';
import Signature from 'react-native-signature-canvas';
import Fonts from '../constants/Fonts';

const SignaturePad = ({onClose, onSelected, isVisible}) => {
  const signatureRef = useRef(null);

  // Callback when the signature is saved
  const handleSignature = signature => {
    console.log('Signature captured: ', signature);
    onSelected(signature);
    onClose();
  };

  // Callback when the signature pad is cleared
  const handleClear = () => {
    console.log('Signature pad cleared');
  };

  // Callback when the user presses the "Cancel" button
  const handleEmpty = () => {
    Alert.alert('Signature Empty', 'Please provide a signature.');
  };

  return (
    <Modal
      visible={isVisible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}>
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.headerText}>Draw your Signature</Text>

          <View style={styles.container}>
            <Signature
              ref={signatureRef}
              style={{borderRadius: 20, borderWidth: 2, borderStyle: 'dashed'}}
              descriptionText=""
              onOK={handleSignature} // Called when "Save" is pressed
              onClear={handleClear} // Called when "Clear" is pressed
              onEmpty={handleEmpty} // Called when signature is empty
              clearText="Clear Signature" // Custom text for the "Clear" button
              confirmText="Save Signature" // Custom text for the "Save" button
              webStyle={styles.webStyle} // Custom styles for the web view
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    // flex: 1,
    height: 370,
    margin: 20,
    backgroundColor: '#fff',
  },
  headerText: {
    fontSize: 20,
    fontFamily: Fonts.bold,
    color: '#4F378B',
    textAlign: 'center',
    marginBottom: 20,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    width: '100%',
    borderTopEndRadius: 20,
    borderTopStartRadius: 20,
    padding: 20,
    elevation: 8,
    // height: '90%',
    marginTop: 300,
    flex: 1,
  },
  webStyle: `
    .m-signature-pad--footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      
    }
    .button.clear {
  margin:10px;
      background-color:black;
    }
  
  .m-signature-pad--footer
    .button.save {
      right: 0;
      background-color:black;
    }
  `,
});

export default SignaturePad;
