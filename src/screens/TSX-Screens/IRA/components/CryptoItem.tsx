import React from "react";
import { Image, TouchableOpacity, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useTheme } from "styles";
import { CustomText } from "tsx-components";
import IconTextComponent from "tsx-components/IconTextComponent";
import { NAVIGATION_SCREENS } from "navigations/navigationConstants";
import { defaultCrypto } from "utils/configs";
import { IRenderCryptoComponentProps } from "../types";
import { customStyles } from "screens/TSX-Screens/IRA/styles";

export const CryptoItem: React.FC<IRenderCryptoComponentProps> = React.memo(({ item }) => {
  const { theme } = useTheme();
  const navigation = useNavigation<any>();
  const styles = customStyles(theme);

  if (!item) return null;

  const handlePress = () => {
    navigation.navigate(NAVIGATION_SCREENS.HOLDINGS_SCREEN, {
      item,
    });
  };

  // Display balance if available
  const balance = (item as any)?.balance || 0;
  const accountType = (item as any)?.accountType || '';

  return (
    <TouchableOpacity
      onPress={handlePress}
      style={[styles.sectionListRenderContainer, { marginHorizontal: 5 }]}
    >
      <View style={{ alignItems: 'center' }}>
        <IconTextComponent
          label={item.currency}
          iconContainerStyle={{
            width: 80,
            height: 80,
            borderRadius: 40,
          }}
        >
          <Image
            resizeMode="cover"
            style={{
              width: 80,
              height: 80,
              borderRadius: theme.spacing.spacing[20],
            }}
            source={defaultCrypto}
          />
        </IconTextComponent>
        {balance > 0 && (
          <CustomText
            variant="caption"
            size={10}
            style={{
              marginTop: 4,
              textAlign: 'center',
              color: theme.colors.text.secondary,
            }}
          >
            {balance.toFixed(6)} {item.currency}
          </CustomText>
        )}
      </View>
    </TouchableOpacity>
  );
});

CryptoItem.displayName = "CryptoItem";
