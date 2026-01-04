import React from "react";
import {
  View,
  Text,
  Image,
  FlatList,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import Fonts from "../constants/Fonts";
import { useNavigation } from "@react-navigation/native";
import { NAVIGATION_SCREENS } from "navigations/navigationConstants";
import { themes, useTheme } from "styles";
import { CustomText } from "tsx-components";

const CircleItem = ({ item, navigation, isVisble3 }) => {
  const { theme } = useTheme();
  // console.log("item =>",JSON.stringify(item,null,2))
  return (
    <View style={{}}>
      <TouchableOpacity
        style={styles.circleContainer}
        onPress={() =>{
          // console.log("item?.username?.trim() =>", JSON.stringify(item,null,2)),
          navigation.navigate(NAVIGATION_SCREENS.SEND, {
            requested: false,
            sender: item?.username?.trim() ?? null,
          })}
        }
      >
        <View
          style={[
            styles.circle,
            { backgroundColor: theme.colors.palette.green200 },
          ]}
        >
          {/* {item?.pending_requests && item?.pending_requests?.length > 0 && (
            <View
              style={{
                width: 20,
                height: 20,
                borderRadius: 35,
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: theme.colors.palette.red500,
                position: "absolute",
                top: 10,
                right: -5,
                zIndex: 999999,
              }}
            >
              <Text
                style={{
                  color: theme.colors.palette.white,
                  fontFamily: Fonts.semibold,
                  textAlign: "center",
                  fontSize: 12,
                  // paddingBottom: 5,
                }}
              >
                {item?.pending_requests?.length ?? 0}
              </Text>
            </View>
          )} */}

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
      {item?.unread_count > 0 && (
        <View style={styles.unreadBadge}>
          <CustomText variant="caption" color={theme.colors.text.inverse}>
            {item.unread_count}
          </CustomText>
        </View>
      )}
    </View>
  );
};

export default function StoryLists({ data, isVisble3 }) {
  const navigation = useNavigation();
  return (
    <View style={styles.container}>
      <FlatList
        data={data}
        horizontal
        keyExtractor={(item, index) =>
          `contact-${item?._id || item?.username || item?.email || index}`
        }
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
    backgroundColor: "#fff",
    // flex: 1,
  },
  title: {
    fontSize: 18,
    fontFamily: Fonts.semibold,
    marginBottom: 10,
  },
  list: {
    flexDirection: "row",
    alignItems: "center",
  },
  circleContainer: {
    alignItems: "center",
    marginRight: 10,
  },
  circle: {
    width: 60,
    height: 60,
    borderRadius: 35,
    justifyContent: "center",
    alignItems: "center",
    // overflow: 'hidden',
  },
  unreadBadge: {
    backgroundColor: themes.light.colors.palette.green700,
    width: 20,
    height: 20,
    position: "absolute",
    top: 5,
    right: 5,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  initials: {
    color: themes.light.colors.palette.green700,
    fontSize: 18,
    fontFamily: Fonts.semibold,
  },
  image: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  name: {
    marginTop: 5,
    fontSize: 14,
    fontFamily: Fonts.semibold,
  },
});
