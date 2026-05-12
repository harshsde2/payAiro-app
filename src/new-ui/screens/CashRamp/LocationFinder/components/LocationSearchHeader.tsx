import React from "react";
import { Pressable, TextInput, View } from "react-native";
import { AppIcon } from "@new-ui/assets/svgs";
import { useTheme } from "@new-ui/styles/ThemeContext";
import { locationFinderStyles } from "@new-ui/styles/screens/cashRamp/locationFinderStyles";

type Props = {
  search: string;
  onChangeSearch: (value: string) => void;
  onBack: () => void;
};

export const LocationSearchHeader: React.FC<Props> = ({
  search,
  onChangeSearch,
  onBack,
}) => {
  const { theme } = useTheme();
  const styles = locationFinderStyles(theme);

  return (
    <View style={styles.searchHeader}>
      <Pressable onPress={onBack} style={styles.backButton}>
        <AppIcon.ArrowLeft width={22} height={22} color={theme.colors.white} />
      </Pressable>
      <View style={styles.searchInputWrap}>
        <TextInput
          value={search}
          onChangeText={onChangeSearch}
          placeholder="Address or Place"
          placeholderTextColor={theme.colors.greyDark}
          style={styles.searchInput}
        />
      </View>
      <View style={styles.filterButton}>
        <AppIcon.FilterIcon width={18} height={18} color={theme.colors.white} />
      </View>
    </View>
  );
};
