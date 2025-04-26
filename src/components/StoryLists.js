import React from 'react';
import {
  View,
  Text,
  Image,
  FlatList,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import Fonts from '../constants/Fonts';
import { useNavigation } from '@react-navigation/native';
import { NAVIGATION_SCREENS } from 'navigations/navigationConstants';
import { themes, useTheme } from 'styles';

const CircleItem = ({ item, navigation, isVisble3 }) => {
  const { theme } = useTheme();
  
  return(
  
<TouchableOpacity
  style={styles.circleContainer}
  onPress={() =>
    navigation.navigate(NAVIGATION_SCREENS.CONTACT_TX, {
      item: item ?? null,
      isVisble3,
    })
  }>
  {/* {console.log(item?.pending_requests, 'oendingrerer')} */}
  <View style={[styles.circle, { backgroundColor: theme.colors.palette.green200 }]}>
    {item?.pending_requests && item?.pending_requests?.length > 0 && (
      <View
        style={{
          width: 20,
          height: 20,
          borderRadius: 35,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'blue',
          position: 'absolute',
          top: 10,
          right: -5,
          zIndex: 999999,
        }}>
        <Text
          style={{
            color: theme.colors.palette.green700,
            fontFamily: Fonts.semibold,
            textAlign: 'center',
            fontSize: 12,
            // paddingBottom: 5,
          }}>
          {item?.pending_requests?.length ?? 0}
        </Text>
      </View>
    )}

    {item?.image ? (
      <Image source={{ uri: item?.image }} style={styles.image} />
    ) : (
      <Text style={styles.initials}>
        {item?.nickname?.charAt(0)?.toUpperCase() +
          item?.nickname?.charAt(1)?.toUpperCase()}
      </Text>
    )}
  </View>
  <Text style={styles.name}>{item?.nickname ?? item?.username}</Text>
</TouchableOpacity>
)};

export default function StoryLists({ data, isVisble3 }) {
  const navigation = useNavigation();
  return (
    <View style={styles.container}>
      <FlatList
        data={data}
        horizontal
        keyExtractor={(item, index) => `contact-${item?._id || item?.username || item?.email || index}`}
        renderItem={({ item }) => (
          <CircleItem
            item={item}
            navigation={navigation}
            isVisble3={isVisble3}
          />
        )}
        contentContainerStyle={styles.list}
        showsHorizontalScrollIndicator={false}
        removeClippedSubviews={false}
      />
    </View>
  );
}

export const styles = StyleSheet.create({
  container: {
    // padding: -20,
    backgroundColor: '#fff',
    // flex: 1,
  },
  title: {
    fontSize: 18,
    fontFamily: Fonts.semibold,
    marginBottom: 10,
  },
  list: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  circleContainer: {
    alignItems: 'center',
    marginRight: 10,
  },
  circle: {
    width: 60,
    height: 60,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    // overflow: 'hidden',
  },
  initials: {
    color: themes.light.colors.palette.green700,
    fontSize: 18,
    fontFamily: Fonts.semibold,
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  name: {
    marginTop: 5,
    fontSize: 14,
    fontFamily: Fonts.semibold,
  },
});
