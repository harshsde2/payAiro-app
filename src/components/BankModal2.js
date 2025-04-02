import React, {useCallback, useEffect, useState} from 'react';
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
} from 'react-native';
import Fonts from '../constants/Fonts';
import GenericButton from './GenericButton';
import {SCREENS} from '../constants/SCREENS';
import {useNavigation} from '@react-navigation/native';
import ReactNativeBiometrics from 'react-native-biometrics';
import useSelectorAction from '../hooks/useSelectorAction';
import {setBiometricAvailable} from '../redux/slices/authenticationSlice';
import useDispatchAction from '../hooks/useDispatchAction';
import {setBiometric} from '../services/Auth';
import {BANK_TYPE, CARD_TYPE} from '../constants/constant';
import {SvgXml} from 'react-native-svg';
import {
  LinkIOSPresentationStyle,
  LinkLogLevel,
  create,
  dismissLink,
  open,
} from 'react-native-plaid-link-sdk';
import {BASE_URL} from '../constants/mockData';

const BankModal2 = ({isVisible, onClose, onCancel}) => {
  const {tokens} = useSelectorAction();
  const [linkToken, setLinkToken] = useState(null);
  useEffect(() => {
    fetch(`${BASE_URL}kyc/plaid-kyc-linktoken`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${tokens?.access}`,
        'Content-Type': 'application/json',
      },
    })
      .then(res => res.json())
      .then(data => {
        setLinkToken(data?.data?.link_token);
      })
      .catch(err => console.error('Error fetching link token:', err));
  }, []);

  const {biometricAvailable} = useSelectorAction();
  const rnBiometrics = new ReactNativeBiometrics({
    allowDeviceCredentials: true,
  });
  const [isEnabled, setIsEnabled] = useState(false);
  const [enableBiometric, setenableBiometric] = useState(biometricAvailable);
  const navigation = useNavigation();
  const onSuccess = useCallback(publicToken => {
    console.log('Public Token:', publicToken);

    // Parse the metadataJson string
    const metadata = publicToken?.metadata;
    const metadataJson = metadata?.metadataJson
      ? JSON.parse(metadata.metadataJson)
      : null;

    if (!metadataJson) {
      console.error('Invalid metadataJson structure');
      return;
    }

    const accountId = metadataJson?.account_id;
    console.log('Extracted Account ID:', accountId);
    console.log('Public Token ID:', publicToken.publicToken);

    fetch(`${BASE_URL}kyc/acesstoken`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokens?.access}`,
      },
      body: JSON.stringify({
        public_token: publicToken.publicToken,
        plaid_accountid: accountId,
      }),
    })
      .then(res => res.json())
      .then(data => {
        console.log(data, 'accessTokenReceived');

        onClose();
      })
      .catch(err => console.error('Error exchanging token:', err));
  }, []);

  const handleOpenLink = () => {
    if (linkToken) {
      const config = {
        token: linkToken,
        onSuccess,
        onExit: linkExit => {
          console.log('Exit: ', linkExit);
          dismissLink();
        },
        iOSPresentationStyle: LinkIOSPresentationStyle.MODAL,
        logLevel: LinkLogLevel.ERROR,
      };

      create(config);
      open(config);
    }
  };
  return (
    <Modal
      visible={isVisible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}>
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.headerText}>Select any option</Text>
          <Text
            style={{
              fontSize: 14,
              fontFamily: Fonts.regular,
              color: 'grey',
              textAlign: 'center',
            }}>
            Subtract draft object prototype stroke.
          </Text>
          <View style={{marginVertical: 10}}>
            {BANK_TYPE.map((i, k) => (
              <TouchableOpacity
                onPress={() => {
                  handleOpenLink();
                }}
                style={{
                  borderRadius: 40,
                  borderWidth: 1,
                  backgroundColor: 'rgba(217, 217, 217, 0.07)',
                  borderColor: 'rgba(106, 106, 106, 0.08)',
                  padding: -20,
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginVertical: 5,
                  marginBottom: i.name === 'Logout' ? 100 : 5,
                }}>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'flex-start',
                    alignItems: 'center',
                    margin: 5,
                  }}>
                  <SvgXml xml={i.icon} />
                  <Text
                    style={{
                      color: 'rgba(29, 29, 29, 1)',
                      marginLeft: 10,
                      fontSize: 16,
                      fontFamily: Fonts.regular,
                    }}>
                    {!linkToken?.trim() ? 'Fetching Token' : i?.name}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default BankModal2;

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    width: '90%',
    borderTopEndRadius: 20,
    borderTopStartRadius: 20,
    padding: 20,
    elevation: 8,
    // height: '40%',
    // marginTop: 500,
    // flex: 1,
    position: 'absolute',
    borderRadius: 30,
  },

  headerText: {
    fontSize: 24,
    fontFamily: Fonts.bold,
    color: 'rgba(29, 29, 29, 1)',
    textAlign: 'center',
    marginBottom: 10,
    marginTop: 15,
  },
  sectionHeader: {
    fontSize: 14,
    fontFamily: Fonts.medium,
    color: '#333',
    marginVertical: 10,
  },
  optionContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginVertical: 5,
  },
  radioButton: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginVertical: 5,
  },
  checkbox: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginVertical: 5,
  },
  selectedOption: {
    backgroundColor: '#4F378B',
    borderColor: '#4F378B',
  },
  optionText: {
    fontSize: 14,
    fontFamily: Fonts.medium,
    color: '#333',
  },
  selectedText: {
    color: '#fff',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  clearButton: {
    backgroundColor: 'transparent',
    padding: 10,
    borderRadius: 10,
    flex: 0.4,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'black',
  },
  applyButton: {
    backgroundColor: '#4F378B',
    padding: 10,
    borderRadius: 10,
    flex: 0.4,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontFamily: Fonts.medium,
    fontSize: 14,
  },
});
