import {
  View,
  Text,
  StyleSheet,
  ViewProps,
  ViewStyle,
  Image,
  TouchableOpacity,
} from "react-native";
import React, { FC } from "react";
import { Theme, useTheme } from "styles";
import CustomText from "./CustomText";
import { SvgXml } from "react-native-svg";
import { SVGProfile } from "constants/images";
import { useNavigation } from "@react-navigation/native";
import { NAVIGATION_SCREENS } from "navigations/navigationConstants";
import { AssetData } from "screens/TSX-Screens/RWA/RWA";
import { defaultImage } from "utils/configs";

export interface RealStateComponentItemProps {
  title: string;
  author: string;
  price_per_share: string;
  growth: string;
  image_url: string;
}

interface RealStateComponentProps extends ViewProps {
  containerStyles?: ViewStyle;
  textContainerStyles?: ViewStyle;
  item?: AssetData;
  type?: string;
}

const RealStateComponent: FC<RealStateComponentProps> = ({
  containerStyles,
  textContainerStyles,
  item,
  type,
}) => {
  const { theme } = useTheme();
  const styles = customStyles(theme);
  const navigation = useNavigation<any>();

  // console.log("item =>", item);

  const formatAmount = (num: number): any => {
    if (num >= 1_000_000_000) return (num / 1_000_000_000).toFixed(1) + "B";
    if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + "M";
    if (num >= 1_000) return (num / 1_000).toFixed(1) + "K";
    return num.toString();
  };

  const filteredImages = item?.images.filter((image: any) => image != null);
  const isImageUri = filteredImages.length > 0;

  return (
    <TouchableOpacity
      onPress={() => {
        navigation.navigate(NAVIGATION_SCREENS.REAL_STATE_PROFILE, {
          data: item,
          type: type,
          dataType: item?.asset_type,
        });
      }}
      style={[styles.container, containerStyles]}
    >
      <View style={[styles.imageContainer]}>
        {isImageUri ? (
          <Image
            resizeMode={"cover"}
            style={{
              width: "100%",
              height: "100%",
              borderRadius: theme.spacing.spacing[2],
            }}
            source={{ uri: filteredImages[0] }}
          />
        ) : (
          <Image
            resizeMode={"cover"}
            style={{
              width: "100%",
              height: "100%",
              borderRadius: theme.spacing.spacing[2],
            }}
            source={defaultImage}
          />
        )}
      </View>
      <View style={[styles.contentContainer]}>
        <View style={[styles.textContainer, textContainerStyles]}>
          <CustomText
            variant={"subtitle2"}
            style={{ marginVertical: 5 }}
            size={14}
            ellipsizeMode={"tail"}
            numberOfLines={1}
          >
            {item?.name}
          </CustomText>

          <View style={[styles.authorContainer]}>
            <SvgXml xml={SVGProfile} width={16} height={16} />
            <CustomText
              variant={"caption"}
              style={{ marginLeft: 10 }}
              size={12}
            >
              {item?.usernames}
            </CustomText>
          </View>
        </View>
        <View style={[styles.shareContainer]}>
          <CustomText variant={"subtitle1"} style={{}} size={14}>
            ${formatAmount(item?.price_per_token)}
          </CustomText>
          <CustomText variant={"caption"} style={{ marginLeft: 3 }} size={12}>
            per share
          </CustomText>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default RealStateComponent;

const customStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      height: 230,
      width: 150,
      padding: 10,
      borderRadius: theme.spacing.spacing[3],
      alignItems: "center",
      borderWidth: 1 / 2,
      borderColor: theme.colors.palette.grey300,
      marginRight: 10,
      marginBottom: 10,
    },
    contentContainer: {
      width: "100%",
      //   backgroundColor: "green",
    },
    textContainer: {
      width: "100%",
      marginBottom: 10,
      //   backgroundColor: "yellow",
    },
    imageContainer: {
      width: "100%",
      flex: 1.5,
      // minHeight: 100,
      //   height: "100%",
    },
    authorContainer: {
      width: "100%",
      flexDirection: "row",
      alignItems: "center",
    },
    shareContainer: {
      width: "100%",
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
  });
