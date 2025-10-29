import React, { useState } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Pressable,
} from "react-native";
import { Theme, useTheme } from "styles";
import { CustomText } from "tsx-components";
import { SvgIcons } from "constants/svgs";
import { useNavigation, useRoute } from "@react-navigation/native";

interface BankItem {
  label: string;
  value: string;
  bank_name: string;
  account_number: string;
  account_type: string;
}

interface RouteParams {
  bankList: BankItem[];
  selectedBank?: BankItem | null;
  onSelectBank: (bank: BankItem) => void;
}

const BankSelectionScreen: React.FC = () => {
  const { theme } = useTheme();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const styles = bankModalStyles(theme);

  const { bankList, selectedBank, onSelectBank } = route.params as RouteParams;

  const handleBankSelection = (bank: BankItem) => {
    onSelectBank(bank);
    navigation.goBack();
  };

  const renderBankItem = ({ item }: { item: BankItem }) => (
    <TouchableOpacity
      onPress={() => handleBankSelection(item)}
      style={[
        styles.bankItem,
        selectedBank?.value === item.value && styles.selectedBankItem,
      ]}
    >
      <SvgIcons.Bank />
      <View style={styles.bankInfo}>
        <CustomText variant="subtitle2">{item.bank_name}</CustomText>
        <CustomText variant="caption">
          {item.label.split("(")[1]?.split(")")[0]} • {item.account_type.toUpperCase()}
        </CustomText>
      </View>
      {selectedBank?.value === item.value && (
        <SvgIcons.CheckSquareIcon color={theme.colors.palette.green700} />
      )}
    </TouchableOpacity>
  );

  return (
    <Pressable onPress={() => navigation.goBack()} style={styles.mainContainer}>
      <Pressable
        onPress={(e) => e.stopPropagation()}
        style={styles.container}
      >
        {/* Header */}
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => navigation.goBack()}
          style={styles.header}
        >
          <View style={styles.dragHandle} />
        </TouchableOpacity>

        {/* Title */}
        <View style={styles.titleContainer}>
          <CustomText variant="h4">Select Source Account</CustomText>
        </View>

        {/* Bank List */}
        <View style={styles.listContainer}>
          <FlatList
            data={bankList}
            showsVerticalScrollIndicator={false}
            renderItem={renderBankItem}
            keyExtractor={(item, index) => `${item.value}-${index}`}
          />
        </View>
      </Pressable>
    </Pressable>
  );
};

export default BankSelectionScreen;

const bankModalStyles = (theme: Theme) =>
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
    dragHandle: {
      height: 5,
      backgroundColor: "black",
      width: 80,
      borderRadius: theme.spacing.spacing[1],
    },
    titleContainer: {
      paddingVertical: theme.spacing.spacing.md,
      alignItems: "center",
    },
    listContainer: {
      flex: 1,
    },
    bankItem: {
      width: "100%",
      borderRadius: theme.spacing.spacing[3],
      backgroundColor: theme.colors.palette.grey150,
      padding: 15,
      flexDirection: "row",
      marginVertical: 5,
      borderColor: theme.colors.palette.grey300,
      borderWidth: 1,
      alignItems: "center",
    },
    selectedBankItem: {
      backgroundColor: theme.colors.palette.green50,
      borderColor: theme.colors.palette.green300,
    },
    bankInfo: {
      flex: 1,
      paddingHorizontal: 15,
      justifyContent: "center",
    },
  });
