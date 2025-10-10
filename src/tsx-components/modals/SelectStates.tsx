import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Pressable,
  FlatList,
  TextInput,
} from "react-native";
import React, { useState, useMemo } from "react";
import { Theme, useTheme } from "styles";
import { useNavigation, useRoute } from "@react-navigation/native";
import { CustomText } from "tsx-components";
import Fonts from "constants/Fonts";
import { SvgIcons } from "constants/svgs";

const SelectStates = () => {
  const { theme } = useTheme();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const styles = selectStatesStyles(theme);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedState, setSelectedState] = useState(route.params?.selectedState || "");

  const filteredStates = useMemo(() => {
    if (!searchQuery.trim()) {
      return LOCATIONS;
    }
    return LOCATIONS.filter((state) =>
      state.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  const handleStateSelect = (state: string) => {
    setSelectedState(state);
    if (route.params?.onSelectState) {
      route.params.onSelectState(state);
    }
    navigation.goBack();
  };

  const renderStateItem = ({ item }: { item: string }) => {
    const isSelected = selectedState.toLowerCase() === item.toLowerCase();
    return (
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => handleStateSelect(item)}
        style={[
          styles.stateItem,
          isSelected && styles.selectedStateItem,
        ]}
      >
        <CustomText
          variant={"body1"}
          style={[
            styles.stateText,
            isSelected && styles.selectedStateText,
          ]}
        >
          {item.charAt(0).toUpperCase() + item.slice(1)}
        </CustomText>
        {isSelected && (
          <SvgIcons.Checkedbox width={20} height={20} />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <Pressable
      onPress={() => navigation.goBack()}
      style={[styles.mainContainer]}
    >
      <Pressable
        onPress={(e) => e.stopPropagation()}
        style={[styles.container]}
      >
        {/* Header */}
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => navigation.goBack()}
          style={styles.header}
        >
          <View
            style={[
              {
                height: 5,
                backgroundColor: theme.colors.palette.grey400,
                width: 80,
                borderRadius: theme.spacing.spacing[1],
              },
            ]}
          />
        </TouchableOpacity>

        {/* Title */}
        <View style={styles.titleContainer}>
          <CustomText
            variant={"h2"}
            style={[{ fontFamily: Fonts.bold }]}
          >
            Select Your Location
          </CustomText>
          <CustomText
            variant={"caption"}
            color={theme.colors.palette.grey500}
            style={[{ marginTop: theme.spacing.spacing[2] }]}
          >
            Choose your state from the list below
          </CustomText>
        </View>

        {/* Search Input */}
        <View style={styles.searchContainer}>
          <SvgIcons.SearchIcon
            width={20}
            height={20}
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search states..."
            placeholderTextColor={theme.colors.palette.grey500}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => setSearchQuery("")}
              style={styles.clearButton}
            >
              <SvgIcons.CrossIcon width={16} height={16} />
            </TouchableOpacity>
          )}
        </View>

        {/* States List */}
        <View style={styles.listContainer}>
          <FlatList
            data={filteredStates}
            renderItem={renderStateItem}
            keyExtractor={(item, index) => `${item}-${index}`}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <CustomText
                  variant={"body1"}
                  color={theme.colors.palette.grey500}
                  style={[{ textAlign: "center" }]}
                >
                  No states found
                </CustomText>
              </View>
            }
          />
        </View>
      </Pressable>
    </Pressable>
  );
};

export default SelectStates;

const selectStatesStyles = (theme: Theme) =>
  StyleSheet.create({
    mainContainer: {
      flex: 1,
      backgroundColor: theme.colors.palette.overlay,
      paddingTop: theme.spacing.spacing[32],
    },
    container: {
      flex: 1,
      backgroundColor: theme.colors.palette.white,
      borderTopLeftRadius: theme.spacing.spacing.lg,
      borderTopRightRadius: theme.spacing.spacing.lg,
      paddingHorizontal: theme.spacing.spacing.md,
    },
    header: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      paddingVertical: theme.spacing.spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.palette.grey200,
    },
    titleContainer: {
      paddingVertical: theme.spacing.spacing.md,
      paddingHorizontal: theme.spacing.spacing.sm,
    },
    searchContainer: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: theme.colors.palette.grey100,
      borderRadius: theme.spacing.spacing[8],
      paddingHorizontal: theme.spacing.spacing.md,
      marginHorizontal: theme.spacing.spacing.sm,
      marginBottom: theme.spacing.spacing.md,
      borderWidth: 1,
      borderColor: theme.colors.palette.grey200,
    },
    searchIcon: {
      marginRight: theme.spacing.spacing.sm,
    },
    searchInput: {
      flex: 1,
      paddingVertical: theme.spacing.spacing.md,
      fontFamily: Fonts.semibold,
      fontSize: 14,
      color: theme.colors.palette.grey900,
    },
    clearButton: {
      padding: theme.spacing.spacing.xs,
    },
    listContainer: {
      flex: 1,
    },
    listContent: {
      paddingHorizontal: theme.spacing.spacing.sm,
      paddingBottom: theme.spacing.spacing.lg,
    },
    stateItem: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: theme.spacing.spacing.md,
      paddingHorizontal: theme.spacing.spacing.md,
      borderRadius: theme.spacing.spacing[4],
      marginBottom: theme.spacing.spacing.xs,
      backgroundColor: theme.colors.palette.white,
      borderWidth: 1,
      borderColor: theme.colors.palette.grey200,
    },
    selectedStateItem: {
      backgroundColor: theme.colors.palette.green50,
      borderColor: theme.colors.palette.green500,
      borderWidth: 2,
    },
    stateText: {
      fontFamily: Fonts.semibold,
      color: theme.colors.palette.grey800,
    },
    selectedStateText: {
      color: theme.colors.palette.green500,
      fontFamily: Fonts.bold,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingVertical: theme.spacing.spacing[20],
    },
  });

const LOCATIONS = [
  "alabama",
  "alaska",
  "arizona",
  "arkansas",
  "california",
  "colorado",
  "connecticut",
  "delaware",
  "florida",
  "georgia",
  "hawaii",
  "idaho",
  "illinois",
  "indiana",
  "iowa",
  "kansas",
  "kentucky",
  "louisiana",
  "maine",
  "maryland",
  "massachusetts",
  "michigan",
  "minnesota",
  "mississippi",
  "missouri",
  "montana",
  "nebraska",
  "nevada",
  "new hampshire",
  "new jersey",
  "new mexico",
  "new york",
  "north carolina",
  "north dakota",
  "ohio",
  "oklahoma",
  "oregon",
  "pennsylvania",
  "rhode island",
  "south carolina",
  "south dakota",
  "tennessee",
  "texas",
  "utah",
  "vermont",
  "virginia",
  "washington",
  "west virginia",
  "wisconsin",
  "wyoming",
  "american samoa",
  "district of columbia",
  "guam",
  "northern mariana islands",
  "puerto rico",
  "u.s. virgin islands",
];
