import {
  View,
  Text,
  KeyboardAvoidingView,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import React, { useState } from 'react';
import Container from '../../HOC/Container';
import Fonts from '../../constants/Fonts';
import TextInputField from '../../components/TextInputField';
import { SvgXml } from 'react-native-svg';
import {
  SVGBank,
  SVGDowArrow2,
  SVGDownArrow,
  SVGProfile,
  SVGProfile3,
  SVGUSD,
  SVGUpArrow,
} from '../../constants/images';
import GenericButton from '../../components/GenericButton';
import { SCREENS } from '../../constants/SCREENS';
import { useNavigation } from '@react-navigation/native';
import useSelectorAction from '../../hooks/useSelectorAction';
import { checkUser } from '../../services/Services';
import useDispatchAction from '../../hooks/useDispatchAction';
import { setErrorMsg } from '../../redux/slices/authenticationSlice';
import { CustomText } from 'tsx-components';
import { useTheme } from 'styles';

export default function Send(props) {
  const { requested, type, sender: senderDetails } = props.route.params;
  const { theme } = useTheme();


  // console.log('requested =>', requested)
  // console.log('type =>', type)
  // console.log('senderDetails =>', senderDetails)

  const { walletData, tokens } = useSelectorAction();
  const navigation = useNavigation();
  const [sender, setsender] = useState(props.route.params?.sender ?? '');
  const [isVisible, setisVisible] = useState();
  const [text, settext] = useState(' Vay via Bank');
  const { bankLists, bankBalance } = useSelectorAction();
  const { biometricAvailable } = useSelectorAction();
  const [selectedBank, setselectedBank] = useState(bankLists[0]);
  const [isDropdown, setisDropdown] = useState(false);

  console.log("send screen is rendering")
  return (
    <Container>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ flexGrow: 1 }}>
          <Text
            style={{
              fontFamily: Fonts.semibold,
              color: '#000',
              fontSize: 18,
              textAlign: 'left',
              padding: 15,
              marginTop: 20,
            }}>
            {`${type === 'requested' ? 'Receive' : 'Send Assets'} `}
          </Text>
          <View
            style={{
              flex: 1,
              backgroundColor: '#fff',
              borderTopEndRadius: 32,
              borderTopStartRadius: 32,
              padding: 20,
              marginTop: 20,
            }}>
            <View>
              <TextInputField
                editable={
                  props.route.params?.sender === '' ||
                  props.route.params?.sender === undefined
                }
                label={type === 'requested' ? 'From' : 'To'}
                placeholder={'Name,$Airtag,Phone,Email'}
                isIcon={true}
                value={sender}
                onChange={setsender}
                
              />
              {/* 
              <TextInputField
                label={'Note (optional)'}
                placeholder={'Mention for which reason your sending this'}
                isMultiLine={true}
                cStyle={{marginTop: 20}}
              /> */}
            </View>
            <Text
              style={{
                fontFamily: Fonts.semibold,
                color: '#000',
                fontSize: 14,
                textAlign: 'left',
                padding: 15,
                marginTop: 30,
              }}>
              {`${type === 'requested' ? '' : 'Send From'} `}
            </Text>

            {type !== 'requested' && (
              <View style={{}}>
                <View
                  style={{
                    backgroundColor: 'rgba(226, 241, 227, 0.8)',
                    padding: 20,
                    borderWidth: 1,
                    borderColor: 'rgba(44, 106, 63, 0.1)',
                    borderRadius: 15,
                    marginVBottom: 30,
                  }}>
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => setisDropdown(state => !state)}
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flex: 1,
                      marginBottom: isDropdown ? 10 : 0,
                      //   padding: 20,
                    }}>
                    <View
                      style={{
                        flex: 1,
                        flexDirection: 'row',
                        justifyContent: 'flex-start',
                        alignItems: 'center',
                        //   padding: 20,
                      }}>
                      <SvgXml xml={SVGUSD} width={40} height={40} />
                      <View style={{ marginHorizontal: 10,flex:1 }}>
                        <Text
                          style={{
                            color: 'black',
                            fontSize: 16,
                            fontFamily: Fonts.bold,
                          }}>
                          {selectedBank?.bank_name ?? selectedBank?.name} <CustomText variant={'body2'}  color={theme?.colors.palette.green700} style={{textTransform:'capitalize'}}  >{` (${selectedBank?.account_type})`}</CustomText>
                        </Text>
                        <Text
                          style={{
                            color: 'rgba(106, 106, 106, 0.7)',
                            fontFamily: Fonts.semibold,
                            fontSize: 10,
                          }}>
                          $
                          {selectedBank?.balances?.available
                            ? selectedBank?.balances?.available
                            : selectedBank?.account_type === 'rothIra'
                              ? bankBalance?.roth_ira_account?.usd
                              : selectedBank?.account_type === 'traditionalIra'
                                ? bankBalance?.traditional_ira_account?.usd
                                : bankBalance?.bank_account?.usd}
                        </Text>
                      </View>
                    </View>
                    <TouchableOpacity
                      style={{ width: 20, alignItems: 'center',marginLeft:5}}
                      disabled
                      
                    >
                      <SvgXml xml={isDropdown ? SVGUpArrow : SVGDowArrow2} />
                    </TouchableOpacity>
                  </TouchableOpacity>
                  {isDropdown &&
                    bankLists &&
                    bankLists?.length > 0 &&
                    bankLists.map((item, k) => (
                      <TouchableOpacity
                        onPress={() => {
                          console.log(item, 'item');
                          setselectedBank(item );
                          setisDropdown(false);
                        }}
                        key={k}
                        style={{
                          flexDirection: 'row',
                          justifyContent: 'flex-start',
                          alignItems: 'center',
                          marginVertical:10,
                          //   padding: 20,
                        }}>
                        <SvgXml xml={SVGUSD} width={40} height={40} />
                        <View style={{ marginHorizontal: 10 }}>
                          <Text
                            style={{
                              color: 'black',
                              fontSize: 16,
                              fontFamily: Fonts.bold,
                            }}>
                            {item?.bank_name ?? item?.name} 
                            <CustomText variant={'body2'}  color={theme?.colors.palette.green700} style={{textTransform:'capitalize'}}  >{` (${item?.account_type})`}</CustomText>
                            
                          </Text>
                          <Text
                            style={{
                              color: 'rgba(106, 106, 106, 0.7)',
                              fontFamily: Fonts.semibold,
                              fontSize: 10,
                            }}>
                            $
                            {item?.balances?.available
                              ? item?.balances?.available
                              : item?.account_type === 'rothIra'
                                ? bankBalance?.roth_ira_account?.usd
                                : item?.account_type === 'traditionalIra'
                                  ? bankBalance?.traditional_ira_account?.usd
                                  : bankBalance?.bank_account?.usd}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    ))}
                </View>
              </View>
            )}
            <GenericButton
              title={'Next'}
              cStyle={{ marginTop: type === 'requested' ? 400 : 300 }}
              onPress={async () => {
                const formData = new FormData();
                formData.append('identifier', sender.trim());
                const data = await checkUser(formData, tokens?.access);
                console.log(data, 'datatatas');
                if (data && data?.status) {
                  navigation.navigate(SCREENS.ScanPay, {
                    type:
                      requested || type === 'requested'
                        ? 'requested'
                        : 'receive',
                    sender:sender.trim(),
                    bank: selectedBank,
                  });
                } else {
                  useDispatchAction(setErrorMsg('Recipient not found'));
                }
              }}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Container>
  );
}
