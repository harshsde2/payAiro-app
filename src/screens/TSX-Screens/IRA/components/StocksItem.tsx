import React from "react";
import { Image, TouchableOpacity, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useTheme } from "styles";
import { CustomText } from "tsx-components";
import { NAVIGATION_SCREENS } from "navigations/navigationConstants";
import { defaultImage } from "utils/configs";
import { IRenderStocksComponentProps } from "../types";
import { customStyles } from "screens/TSX-Screens/IRA/styles";

// Test images - should be moved to constants or removed if not needed
const testImages = [
  "https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8cmVhbCUyMGVzdGF0ZXxlbnwwfHwwfHx8MA%3D%3D&w=1000&q=80",
  "https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8cmVhbCUyMGVzdGF0ZXxlbnwwfHwwfHx8MA%3D%3D&w=1000&q=80",
];

export const StocksItem: React.FC<IRenderStocksComponentProps> = React.memo(({ item }) => {
  const { theme } = useTheme();
  const navigation = useNavigation<any>();
  const styles = customStyles(theme);

  if (!item) return null;

  const filteredImages = item.images?.filter((image: any) => image != null) || [];
  const isImageUri = filteredImages.length > 0;

  const handlePress = () => {
    navigation.navigate(NAVIGATION_SCREENS.STOCK_PROFILE, {
      data: item,
      images: testImages,
    });
  };

  return (
    <TouchableOpacity
      style={styles.contactItem}
      activeOpacity={0.8}
      onPress={handlePress}
    >
      <View style={styles.contactLeftSection}>
        <View style={styles.avatarContainer}>
          {isImageUri ? (
            <Image
              resizeMode="cover"
              style={{
                width: "100%",
                height: "100%",
                borderRadius: theme.spacing.spacing[2],
              }}
              source={{ uri: filteredImages[0] }}
            />
          ) : (
            <Image
              resizeMode="cover"
              style={{
                width: "100%",
                height: "100%",
                borderRadius: theme.spacing.spacing[2],
              }}
              source={defaultImage}
            />
          )}
        </View>
        <View style={styles.contactInfo}>
          <CustomText variant="subtitle1" color={theme.colors.text.primary}>
            {item.name}
          </CustomText>
          <CustomText
            variant="caption"
            size={14}
            color={theme.colors.text.secondary}
          >
            {item.usernames}
          </CustomText>
        </View>
        <View style={styles.shareContainer}>
          <CustomText variant="subtitle1" size={14}>
            ${item.price_per_token}
          </CustomText>
          <CustomText variant="caption" style={{ marginLeft: 3 }} size={12}>
            per share
          </CustomText>
        </View>
      </View>
    </TouchableOpacity>
  );
});

StocksItem.displayName = "StocksItem";
