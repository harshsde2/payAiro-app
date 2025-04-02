import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
} from 'react-native';
import React, {useEffect, useMemo, useRef, useState} from 'react';
import CommonHeaderv2 from '../../HOC/CommonHeaderv2';
import {SvgXml} from 'react-native-svg';
import {SVGLeftArrow, SVGSend2, SVGThreeDot} from '../../constants/images';
import useSelectorAction from '../../hooks/useSelectorAction';
import {styles} from '../../components/StoryLists';
import {useIsFocused, useNavigation} from '@react-navigation/native';
import Fonts from '../../constants/Fonts';
import TransactionList from '../../components/TransactionLists';
import GenericButton from '../../components/GenericButton';
import {SCREENS} from '../../constants/SCREENS';
import {
  getContactListsForAll,
  getContacts,
  sendMessage,
} from '../../services/Services';
import Container from '../../HOC/Container';

export default function ContactTx(props) {
  const {item = {}, isVisble3 = false} = props.route.params;
  const navigation = useNavigation();

  const [isMenuVisible, setMenuVisible] = useState(false);
  const [userTx, setUserTx] = useState([]);
  const [message, setmessage] = useState('');

  const {tokens} = useSelectorAction();
  const toggleMenu = () => {
    setMenuVisible(!isMenuVisible);
  };
  const isFocused = useIsFocused();
  const MemoizedTransactionList = React.memo(TransactionList);
  const [contactLists, setcontactLists] = useState([]);
  useEffect(() => {
    getContactLists();
  }, [isFocused]);
  setTimeout(() => {
    getContactLists();
  }, 5000);

  const getContactLists = async () => {
    const data = await getContactListsForAll(
      'username',
      item?.username,
      tokens?.access,
    );
    console.log(data?.data?.interactions, 'hi==>>');
    setUserTx(data?.data?.interactions);
  };

  const sendMess = async () => {
    const data = await sendMessage(
      {
        recipient_user: item?.username,
        content: message,
      },
      tokens?.access,
    );
    setmessage('');
    getContactLists();
  };
  return (
    <Container>
      {isMenuVisible && (
        <View style={styles2.menuContainer}>
          <TouchableOpacity
            style={styles2.menuItem}
            onPress={() => navigation.navigate('Statement')}>
            <Text style={styles2.menuText}>Statement</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles2.menuItem}
            onPress={() => alert('Help Selected')}>
            <Text style={styles2.menuText}>Help</Text>
          </TouchableOpacity>
        </View>
      )}
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'flex-start',
          alignItems: 'center',
          padding: 15,
          marginTop: 20,
        }}>
        <SvgXml
          onPress={() => navigation.navigate('Dashboard')}
          xml={SVGLeftArrow}
        />
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'flex-start',
            alignItems: 'center',
            width: '60%',
          }}>
          <TouchableOpacity
            style={{...styles.circleContainer, marginTop: 15}}
            onPress={() =>
              navigation.navigate('ContactTx', {
                item: userTx ?? [],
              })
            }>
            <View
              style={[
                styles.circle,

                {
                  backgroundColor: 'rgba(255, 37, 99, 1)',
                  width: 45,
                  height: 45,
                  marginBottom: 15,
                },
              ]}>
              {item?.image ? (
                <Image source={{uri: item?.image}} style={styles.image} />
              ) : (
                <Text style={{...styles.initials, fontSize: 14}}>
                  {item?.nickname?.charAt(0)?.toUpperCase() +
                    item?.nickname?.charAt(1)?.toUpperCase()}
                </Text>
              )}
            </View>
          </TouchableOpacity>
          <View>
            <Text style={{color: '#000', fontSize: 14, fontFamily: Fonts.bold}}>
              {item?.nickname}
            </Text>
            <Text
              style={{
                color: 'grey',
                fontSize: 10,
                fontFamily: Fonts.semibold,
              }}>
              {item?.email.trim() ||
                item?.username.trim() ||
                item?.wallet_address}
            </Text>
          </View>
        </View>
        <SvgXml xml={SVGThreeDot} onPress={toggleMenu} />
      </View>
      <KeyboardAvoidingView
        style={{flex: 1}}
        behavior={Platform.OS == 'ios' ? 'padding' : null}>
        <MemoizedTransactionList
          items={useMemo(() => userTx ?? [], [userTx])}
          isVisble3={isVisble3}
        />
        {/* {console.log(userTx, 'userTx')} */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: '#fff',
            padding: 5,
            width: '100%',
          }}>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'flex-start',
              alignItems: 'center',
              width: '45%',
            }}>
            {isVisble3 && (
              <GenericButton
                title="Request"
                cStyle={{width: '45%'}}
                tStyle={{color: 'white', fontSize: 10}}
                onPress={() => {
                  navigation.navigate(
                    isVisble3 ? SCREENS.Send : SCREENS.SendToken,
                    {
                      sender:
                        item?.email.trim() ||
                        item?.username.trim() ||
                        item?.wallet_address.trim(),
                      type: 'requested',
                    },
                  );
                }}
              />
            )}
            <GenericButton
              title={'Pay'}
              cStyle={{backgroundColor: '#000', marginLeft: 5, width: '45%'}}
              tStyle={{color: 'white', fontSize: 10}}
              onPress={() =>
                navigation.navigate(
                  isVisble3 ? SCREENS.Send : SCREENS.SendToken,
                  {
                    sender:
                      item?.email?.trim() ||
                      item?.username?.trim() ||
                      item?.wallet_address?.trim(),
                    type: 'receive',
                  },
                )
              }
            />
          </View>
          <View
            style={{
              borderWidth: 1,
              borderColor: 'rgba(237, 237, 237, 1)',
              flexDirection: 'row',
              justifyContent: 'space-between',
              borderRadius: 40,
              width: '55%',
              alignSelf: 'center',
              padding: 2,
              backgroundColor: '#fff',
            }}>
            <TextInput
              style={{
                width: '80%',
                paddingLeft: 10,
                color: 'rgba(106, 106, 106, 1)',
              }}
              value={message}
              onChangeText={setmessage}
              placeholderTextColor={'rgba(106, 106, 106, 1)'}
              placeholder="Message..."
            />
            <SvgXml xml={SVGSend2} onPress={() => sendMess()} />
          </View>
        </View>
      </KeyboardAvoidingView>
    </Container>
  );
}
const styles2 = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  iconButton: {
    backgroundColor: '#333',
    padding: 10,
    borderRadius: 20,
    position: 'absolute',
    top: 50,
    right: 20,
  },
  menuContainer: {
    position: 'absolute',
    top: 90,
    right: 20,
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
    paddingVertical: 10,
    paddingHorizontal: 5,
    zIndex: 99999,
  },
  menuItem: {
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  menuText: {
    fontSize: 16,
    color: '#000',
    fontFamily: Fonts.regular,
  },
});
