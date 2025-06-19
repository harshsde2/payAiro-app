import React, { useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import { DropdownProps } from "react-native-element-dropdown/lib/typescript/components/Dropdown/model";
import { Theme, useTheme } from "styles";
import CustomText from "./CustomText";
import Fonts from "constants/Fonts";
interface DropdownItem {
  label: string;
  value: string;
}

interface MyDropdownProps
  extends Omit<DropdownProps<DropdownItem>, "onChange"> {
  placeholder?: string;
  data: DropdownItem[];
  value: string | null;
  onChange: (value: string) => void;
  labelField: keyof DropdownItem;
  valueField: keyof DropdownItem;
  disable: boolean;
  label?: string;
  required?: boolean;
}
const MyDropdown: React.FC<MyDropdownProps> = ({
  label = "Select",
  placeholder = "Select item",
  data,
  value,
  onChange,
  labelField = "label",
  valueField = "value",
  disable = false,
  required = false,
  ...props
}) => {
  const [isFocus, setIsFocus] = useState(false);
  const { theme } = useTheme();
  const styles = useMemo(() => customStyles(theme), [theme]);

  return (
    <View style={styles.container}>
      {label && (
        <CustomText
          variant={"body2"}
          style={{ fontFamily: Fonts.semibold, padding: 10 }}
        >
          {label}{" "}
          {required && (
            <CustomText color={theme.colors.palette.red500} variant={"body2"}>
              *
            </CustomText>
          )}
        </CustomText>
      )}
      <Dropdown
        disable={disable}
        style={[
          styles.dropdown,
          isFocus && { borderColor: theme.colors.palette.primary },
        ]}
        placeholderStyle={styles.placeholderStyle}
        selectedTextStyle={styles.selectedTextStyle}
        inputSearchStyle={styles.inputSearchStyle}
        iconStyle={styles.iconStyle}
        data={data}
        itemTextStyle={[
          { fontFamily: theme.typography.fontFamily.montserrat },
          props.itemTextStyle,
        ]}
        search
        maxHeight={300}
        labelField={labelField}
        valueField={valueField}
        placeholder={!isFocus ? placeholder : "..."}
        searchPlaceholder="Search..."
        value={value}
        onFocus={() => setIsFocus(true)}
        onBlur={() => setIsFocus(false)}
        onChange={(item) => {
          onChange(item[valueField]);
          setIsFocus(false);
        }}
        {...props}
      />
    </View>
  );
};

export default MyDropdown;

const customStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      //   backgroundColor: "red",
      //   padding: theme.spacing.spacing[0],
      width: "100%",
    },
    dropdown: {
      height: 50,
      borderColor: theme?.colors.palette.grey300,
      borderWidth: 0.5,
      borderRadius: theme.spacing.spacing[8],
      paddingHorizontal: theme.spacing.spacing[4],
      fontFamily: theme?.typography.fontFamily.montserrat,
    },
    placeholderStyle: {
      fontSize: 16,
      fontFamily: theme?.typography.fontFamily.montserrat,
    },
    selectedTextStyle: {
      fontSize: 16,
      fontFamily: theme?.typography.fontFamily.montserrat,
    },
    iconStyle: {
      width: 20,
      height: 20,
    },
    inputSearchStyle: {
      height: 40,
      fontSize: 16,
    },
  });
