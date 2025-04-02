import {View, Text, TouchableOpacity, Image} from 'react-native';
import React, {useEffect, useState} from 'react';
import CommonHeaderv2 from '../../HOC/CommonHeaderv2';
import HeaderTitle from '../../components/HeaderTitle';
import {SVGLeftArrow, SVGProfile2, SVGProfile3} from '../../constants/images';
import {SvgXml} from 'react-native-svg';
import Fonts from '../../constants/Fonts';
import {useNavigation} from '@react-navigation/native';
import {getContacts} from '../../services/Services';
import useSelectorAction from '../../hooks/useSelectorAction';
import {styles} from '../../components/StoryLists';

export default function ContactScreen(props) {
  const {isVisble3} = props.route.params;
  const {tokens} = useSelectorAction();
  const [contactLists, setcontactLists] = useState([]);
  useEffect(() => {
    getContactLists();
  }, []);

  const getContactLists = async () => {
    const data = await getContacts(tokens?.access);
    console.log(data, 'data==>>>');
    setcontactLists(data?.data ?? []);
  };
  const navigation = useNavigation();
  return (
    <CommonHeaderv2>
      <HeaderTitle title={'Discover'} leftIcon={SVGLeftArrow} />
      <View
        style={{
          flex: 1,
          backgroundColor: '#fff',
          borderTopEndRadius: 32,
          borderTopStartRadius: 32,
          padding: 20,
          marginTop: 20,
        }}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 20,
            width: '99%',
          }}>
          <Text
            style={{
              color: 'black',
              fontFamily: Fonts.bold,
              fontSize: 16,
            }}>
            People
          </Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('AddContact')}
            style={{
              backgroundColor: 'rgba(44, 106, 63, 1)',
              paddingBottom: 10,
              paddingTop: 7,
              paddingHorizontal: 10,
              borderRadius: 30,
            }}>
            <Text
              style={{
                color: 'white',
                fontSize: 12,
                fontFamily: Fonts.semibold,
              }}>
              + Add People
            </Text>
          </TouchableOpacity>
        </View>

        {contactLists &&
          contactLists.length > 0 &&
          contactLists.map((item, k) => (
            <TouchableOpacity
              key={k}
              onPress={() =>
                navigation.navigate('ContactTx', {
                  item,
                  isVisble3,
                })
              }
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor: 'rgba(217, 217, 217, 0.07)',
                padding: 10,
                borderRadius: 14,
                borderWidth: 1,
                borderColor: 'rgba(106, 106, 106, 0.08)',
                marginVertical: 5,
              }}>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'flex-start',
                  alignItems: 'center',
                }}>
                <View
                  style={[
                    styles.circle,
                    {backgroundColor: 'rgba(44, 106, 63, 1)'},
                  ]}>
                  {item?.image ? (
                    <Image source={{uri: item?.image}} style={styles.image} />
                  ) : (
                    <Text style={styles.initials}>
                      {item?.nickname?.charAt(0)?.toUpperCase() +
                        item?.nickname?.charAt(1)?.toUpperCase()}
                    </Text>
                  )}
                </View>
                <View style={{marginLeft: 10}}>
                  <Text
                    style={{
                      color: 'black',
                      fontFamily: Fonts.semibold,
                      fontSize: 16,
                    }}>
                    {item?.name?.trim() ||
                      item?.nickname?.trim() ||
                      item?.email?.trim() ||
                      item?.username?.trim()}
                  </Text>
                  <Text
                    numberOfLines={1}
                    style={{
                      color: 'rgba(106, 106, 106, 1)',
                      fontSize: 13,
                      fontFamily: Fonts.regular,
                    }}>
                    {item?.messages?.content}
                  </Text>
                </View>
              </View>
              {item?.unread_count && item?.unread_count > 0 && (
                <View
                  style={{
                    backgroundColor: 'rgba(44, 106, 63, 1)',
                    width: 20,
                    height: 20,
                    borderRadius: 35,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}>
                  <Text
                    style={{
                      color: 'white',
                      fontSize: 12,
                      fontFamily: Fonts.semibold,
                    }}>
                    {item?.unread_count}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
      </View>
    </CommonHeaderv2>
  );
}
