import {
  View,
  Text,
  Pressable,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
} from "react-native";
import React, { FC, useState } from "react";
import { Theme, useTheme } from "styles";
import { useGlobalStyles } from "styles/GlobalStyles";
import CustomText from "tsx-components/CustomText";
import DashboardSection from "tsx-components/DashboardSection";
import { SvgIcons } from "constants/svgs";
import GenericButton from "components/GenericButton";
import Fonts from "constants/Fonts";
import moment from "moment";
import { SvgXml } from "react-native-svg";
import DatePicker from "components/common-components/DatePicker";
import {
  FilteredTransactions,
  TRANSACTION_FILTERS_KEYS,
} from "screens/Authentications/Transaction";

interface TransactionFilterProps {
  onApplyFilter: () => void;
  onCancel: () => void;
  filteredTransactions?: FilteredTransactions;
  setFilteredTransactions: (value: FilteredTransactions) => void;
  onFilterClick: (type: string, item: any, index: number) => void;
  isPending?: boolean;
  isLoading?: boolean;
  isError?: boolean;
  isFetched?: boolean;
  isFetching?: boolean; // Added for fetching state
  setIsCustomRangeSelected?: (value: boolean) => void;
  isCustomRangeSelected?: boolean; // Added for custom range state
  date?: string; // Added for start date
  setdate?: (value: string) => void; // Added for setting start date
  date2?: string; // Added for end date
  setdate2?: (value: string) => void; // Added for setting end date
}

const TransactionFilter: FC<TransactionFilterProps> = ({
  onApplyFilter,
  onCancel,
  filteredTransactions,
  setFilteredTransactions,
  onFilterClick,
  isFetching = false, // Added for fetching state
  setIsCustomRangeSelected = () => {},
  isCustomRangeSelected = false, // Added for custom range state
  date = "", // Added for start date
  setdate = () => {}, // Added for setting start date
  date2 = "", // Added for end date
  setdate2 = () => {}, // Added for setting end date
}) => {
  const { theme } = useTheme();
  const globalStyles = useGlobalStyles();
  const styles = { ...globalStyles, ...customStyles(theme) };

  const [open, setOpen] = useState(false);
  const [open2, setOpen2] = useState(false);

  return (
    <Pressable
      style={[styles.CommonModalContainer, { paddingHorizontal: 10 }]}
      onPress={(e) => e.stopPropagation()}
    >
      {!isCustomRangeSelected ? (
        <View style={[styles.mainContainer]}>
          <CustomText variant={"h3"} style={styles.headerText}>Filter</CustomText>
          <ScrollView 
            style={styles.scrollView}
            contentContainerStyle={styles.scrollViewContent}
            showsVerticalScrollIndicator={true}
          >
            <DashboardSection
              contentContainerStyle={[styles.dashboardSectionContainerStyle]}
              style={[styles.dashboardSectionStyle]}
              title="Time Range"
            >
              {filteredTransactions?.timeRange.map((item, index) => {
                const { isSelected, title, id } = item;
                return (
                  <TouchableOpacity
                    onPress={() => {
                      onFilterClick(
                        TRANSACTION_FILTERS_KEYS.time_range,
                        item,
                        index
                      );
                    }}
                    activeOpacity={1}
                    style={[
                      styles.timeRangeStyle,
                      {
                        backgroundColor: isSelected
                          ? theme?.colors?.palette?.green200
                          : theme.colors.palette.grey100,
                      },
                    ]}
                    key={index}
                  >
                    <CustomText
                      color={
                        isSelected
                          ? theme?.colors?.palette?.green700
                          : theme.colors.palette.black
                      }
                      variant="button"
                    >
                      {title}
                    </CustomText>
                  </TouchableOpacity>
                );
              })}

              <TouchableOpacity
                onPress={() => {
                  setIsCustomRangeSelected(true);
                }}
                activeOpacity={1}
                style={[
                  styles.timeRangeStyle,
                  {
                    backgroundColor: isCustomRangeSelected
                      ? theme?.colors?.palette?.green200
                      : theme.colors.palette.grey100,
                  },
                ]}
                key="custom_range"
              >
                <CustomText
                  color={
                    isCustomRangeSelected
                      ? theme?.colors?.palette?.green700
                      : theme.colors.palette.black
                  }
                  variant="button"
                >
                  {"Custom Range"}
                </CustomText>
              </TouchableOpacity>
            </DashboardSection>
            <DashboardSection
              contentContainerStyle={[styles.dashboardSectionContainerStyle]}
              style={[styles.dashboardSectionStyle]}
              title="Categories"
              // actionText="Select All"
              // onActionPress={() => {

              // }}
            >
              {filteredTransactions?.categories.map((item, index) => {
                const { isSelected, title, id } = item;
                return (
                  <TouchableOpacity
                    onPress={() =>
                      onFilterClick(
                        TRANSACTION_FILTERS_KEYS.categories,
                        item,
                        index
                      )
                    }
                    activeOpacity={1}
                    style={[
                      styles.categoriesStyle,
                      {
                        backgroundColor: isSelected
                          ? theme?.colors?.palette?.green200
                          : theme.colors.palette.grey100,
                      },
                    ]}
                    key={index}
                  >
                    <CustomText
                      color={
                        isSelected
                          ? theme?.colors?.palette?.green700
                          : theme.colors.palette.black
                      }
                      variant="button"
                    >
                      {title}
                    </CustomText>
                    {isSelected ? (
                      <SvgIcons.Checkedbox />
                    ) : (
                      <SvgIcons.UnCheckbox />
                    )}
                  </TouchableOpacity>
                );
              })}
              {filteredTransactions?.filter_type.map((item, index) => {
                const { isSelected, title, id } = item;
                return (
                  <TouchableOpacity
                    onPress={() =>
                      onFilterClick(
                        TRANSACTION_FILTERS_KEYS.filter_type,
                        item,
                        index
                      )
                    }
                    activeOpacity={1}
                    style={[
                      styles.categoriesStyle,
                      {
                        backgroundColor: isSelected
                          ? theme?.colors?.palette?.green200
                          : theme.colors.palette.grey100,
                      },
                    ]}
                    key={index}
                  >
                    <CustomText
                      color={
                        isSelected
                          ? theme?.colors?.palette?.green700
                          : theme.colors.palette.black
                      }
                      variant="button"
                    >
                      {title}
                    </CustomText>
                    {isSelected ? (
                      <SvgIcons.Checkedbox />
                    ) : (
                      <SvgIcons.UnCheckbox />
                    )}
                  </TouchableOpacity>
                );
              })}
            </DashboardSection>
          </ScrollView>
          <View style={styles.buttonsContainer}>
            <GenericButton
              onPress={() => {
                // Then trigger Apply logic in parent
                onApplyFilter();
              }}
              title="Apply"
              cStyle={{ marginBottom: 10 }}
              // disabled={}
              showLoader={true}
              isLoading={isFetching}
            />

            <GenericButton
              onPress={() => {
                onCancel();
              }}
              title="Reset"
              cStyle={{ marginBottom: 10, backgroundColor: "black" }}
            />
          </View>
        </View>
      ) : (
        <View style={[styles.mainContainer, styles.customRangeContainer]}>
          {open && (
            <DatePicker
              modal
              mode="date"
              open={open}
              date={new Date()}
              onConfirm={(date) => {
                const selectedStart = moment(date).format("YYYY-MM-DD");

                if (date2 && moment(selectedStart).isAfter(moment(date2))) {
                  Alert.alert(
                    "Invalid Date",
                    "Start date cannot be after end date."
                  );
                  setOpen(false);
                  return;
                }

                setOpen(false);
                setdate(selectedStart);
                onFilterClick(
                  TRANSACTION_FILTERS_KEYS.start_date,
                  {
                    id: 0,
                    title: "Start Date",
                    isSelected: true,
                    key: "start_date",
                    value: selectedStart,
                  },
                  0
                );
              }}
              onCancel={() => setOpen(false)}
            />
          )}
          {open2 && (
            <DatePicker
              modal
              mode="date"
              open={open2}
              date={new Date()}
              onConfirm={(dateValue) => {
                const selectedEnd = moment(dateValue).format("YYYY-MM-DD");

                if (date && moment(selectedEnd).isBefore(moment(date))) {
                  Alert.alert(
                    "Invalid Date",
                    "End date cannot be before start date."
                  );
                  setOpen2(false);
                  return;
                }

                setOpen2(false);
                setdate2(selectedEnd);
                onFilterClick(
                  TRANSACTION_FILTERS_KEYS.end_date,
                  {
                    id: 1,
                    title: "End Date",
                    isSelected: true,
                    key: "end_date",
                    value: selectedEnd,
                  },
                  1
                );
              }}
              onCancel={() => setOpen2(false)}
            />
          )}
          <CustomText variant={"h3"} style={styles.headerText}>Filter</CustomText>
          <ScrollView 
            style={styles.scrollView}
            contentContainerStyle={styles.scrollViewContent}
            showsVerticalScrollIndicator={true}
          >
            <View style={styles.datePickerRow}>
              <TouchableOpacity
                onPress={() => setOpen(true)}
                style={styles.datePickerItem}
              >
                <Text style={styles.datePickerLabel}>
                  Start Date
                </Text>
                <View style={styles.datePickerInput}>
                  <Text style={styles.datePickerText}>
                    {date === "" ? " MM/DD/YY" : moment(date).format("MM/DD/YY")}
                  </Text>
                  <SvgIcons.CalendarIcon
                    style={{ position: "absolute", right: 15, top: 15 }}
                  />
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setOpen2(true)}
                style={styles.datePickerItem}
              >
                <Text style={styles.datePickerLabel}>
                  End Date
                </Text>
                <View style={styles.datePickerInput}>
                  <Text style={styles.datePickerText}>
                    {date2 === ""
                      ? " MM/DD/YY"
                      : moment(date2).format("MM/DD/YY")}
                  </Text>
                  <SvgIcons.CalendarIcon
                    style={{ position: "absolute", right: 15, top: 15 }}
                  />
                </View>
              </TouchableOpacity>
            </View>
          </ScrollView>
          <View style={styles.buttonsContainer}>
            <GenericButton
              onPress={() => {
                // Then trigger Apply logic in parent
                onApplyFilter();
              }}
              title="Apply"
              cStyle={{ marginBottom: 10 }}
              disabled={!date || !date2}
              showLoader={true}
              isLoading={isFetching}
            />
            <GenericButton
              onPress={() => {
                setIsCustomRangeSelected(false);
                onFilterClick(
                  TRANSACTION_FILTERS_KEYS.start_date,
                  {
                    id: 0,
                    title: "Start Date",
                    isSelected: false,
                    key: "start_date",
                    value: "",
                  },
                  0
                );
                onFilterClick(
                  TRANSACTION_FILTERS_KEYS.end_date,
                  {
                    id: 0,
                    title: "End Date",
                    isSelected: false,
                    key: "end_date",
                    value: "",
                  },
                  0
                );
                setdate("");
                setdate2("");
              }}
              title="Back"
              cStyle={{ marginBottom: 10, backgroundColor: "black" }}
            />
          </View>
        </View>
      )}
    </Pressable>
  );
};

export default TransactionFilter;

const customStyles = (theme: Theme) =>
  StyleSheet.create({
    mainContainer: { 
      width: "100%", 
      alignItems: "center",
    },
    customRangeContainer: {
      justifyContent: 'flex-start',
    },
    headerText: {
      marginBottom: theme.spacing.spacing[3],
    },
    scrollView: {
      flexGrow: 1,
      width: '100%',
      maxHeight: 500,
    },
    scrollViewContent: {
      alignItems: "center",
      paddingBottom: theme.spacing.spacing[2],
    },
    buttonsContainer: {
      width: '100%',
      paddingTop: theme.spacing.spacing[2],
    },
    dashboardSectionContainerStyle: {
      width: "100%",
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "flex-start",
    },
    dashboardSectionStyle: {
      width: "100%",
      marginBottom: 15,
    },
    timeRangeStyle: {
      backgroundColor: theme.colors.palette.green200,
      paddingVertical: theme.spacing.spacing[2],
      paddingHorizontal: theme.spacing.spacing[2],
      minWidth: '45%',
      maxWidth: '48%',
      borderRadius: theme.spacing.spacing[6],
      margin: theme.spacing.spacing[1],
      justifyContent: "center",
      alignItems: "center",
    },
    categoriesStyle: {
      backgroundColor: theme.colors.palette.grey100,
      paddingVertical: theme.spacing.spacing[2],
      width: "95%",
      borderRadius: theme.spacing.spacing[2],
      margin: theme.spacing.spacing[1],
      borderColor: theme.colors.palette.grey300,
      borderWidth: 0.5,
      justifyContent: "space-between",
      paddingHorizontal: 10,
      flexDirection: "row",
      alignItems: "center",
    },
    datePickerRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      width: '100%',
      marginVertical: 20,
    },
    datePickerItem: {
      width: "48%",
    },
    datePickerLabel: {
      fontFamily: Fonts.semibold,
      padding: 10,
      color: theme.colors.palette.black,
    },
    datePickerInput: {
      borderWidth: 1,
      borderColor: theme.colors.palette.grey300,
      paddingHorizontal: 15,
      paddingBottom: 15,
      paddingTop: 12,
      backgroundColor: theme.colors.palette.grey100,
      borderRadius: 30,
    },
    datePickerText: {
      fontFamily: Fonts.semibold,
      color: theme.colors.palette.black,
    },
  });
