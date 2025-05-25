import React, { useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import { Theme, useTheme } from "styles";

interface MyDropdownProps {
  placeholder?: string;
  data: { label: string; value: string }[];
  value: string | null;
  onChange: (value: string) => void;
  labelField?: string;
  valueField?: string;
  disable: boolean;
}

const MyDropdown: React.FC<MyDropdownProps> = ({
  placeholder = "Select item",
  data,
  value,
  onChange,
  labelField = "label",
  valueField = "value",
  disable = false,
}) => {
  const [isFocus, setIsFocus] = useState(false);
  const { theme } = useTheme();
  const styles = useMemo(() => customStyles(theme), [theme]);

  return (
    <View style={styles.container}>
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
    },
    placeholderStyle: {
      fontSize: 16,
      fontFamily: theme?.typography.fontFamily.montserrat,
    },
    selectedTextStyle: {
      fontSize: 16,
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
