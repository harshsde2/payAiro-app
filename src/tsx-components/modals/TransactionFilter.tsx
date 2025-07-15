import {
  View,
  Text,
  Pressable,
  StyleSheet,
  TouchableOpacity,
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
import DatePicker from "react-native-date-picker";
import { FilteredTransactions } from "screens/Authentications/Transaction";

const TIME_RANGES = [
  { id: 0, title: "Today", isSelected: false },
  { id: 1, title: "This Week", isSelected: false },
  { id: 2, title: "This Month", isSelected: false },
  { id: 3, title: "Custom Range", isSelected: false },
];
const CATEGORIES = [
  {
    id: 0,
    isChecked: false,
    title: "Merchants",
    key: "Merchants",
  },
  {
    id: 1,
    isChecked: false,
    title: "Family Friends",
    key: "family_friends",
  },
  {
    id: 2,
    isChecked: false,
    title: "Received",
    key: "received",
  },
  {
    id: 3,
    isChecked: false,
    title: "Debit",
    key: "debit",
  },
];

interface TransactionFilterProps {
  onApplyFilter: () => void;
  onCancel: () => void;
  filteredTransactions?: FilteredTransactions;
  setFilteredTransactions: (value: FilteredTransactions) => void;
  onFilterClick: (type: string, item: any, index: number) => void;
}

const TransactionFilter: FC<TransactionFilterProps> = ({
  onApplyFilter,
  onCancel,
  filteredTransactions,
  setFilteredTransactions,
  onFilterClick,
}) => {
  const { theme } = useTheme();
  const globalStyles = useGlobalStyles();
  const styles = { ...globalStyles, ...customStyles(theme) };
  const [categories, setCategories] = useState(CATEGORIES);
  const [timeRanges, setTimeRanges] = useState(TIME_RANGES);
  const [date, setdate] = useState("");
  const [open, setOpen] = useState(false);
  const [date2, setdate2] = useState("");
  const [open2, setOpen2] = useState(false);
  //   const [isSelectedAll, setIsSelectedAll] = useState(false);

  return (
    <Pressable
      style={[styles.CommonModalContainer, { paddingHorizontal: 10 }]}
      onPress={(e) => e.stopPropagation()}
    >
      {!filteredTransactions?.timeRange[5].isSelected ? (
        <View style={[styles.mainContainer]}>
          <CustomText variant={"h3"}>Filter</CustomText>
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
                    onFilterClick("time_range", item, index);
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
          </DashboardSection>
          <DashboardSection
            contentContainerStyle={[styles.dashboardSectionContainerStyle]}
            style={[styles.dashboardSectionStyle]}
            title="Categories"
            actionText="Select All"
            onActionPress={() => {}}
          >
            {filteredTransactions?.categories.map((item, index) => {
              const { isSelected, title, id } = item;
              return (
                <TouchableOpacity
                  onPress={() => onFilterClick("categories", item, index)}
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
            {filteredTransactions?.filterType.map((item, index) => {
              const { isSelected, title, id } = item;
              return (
                <TouchableOpacity
                  onPress={() => onFilterClick("filter_type", item, index)}
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

          <GenericButton
            onPress={() => {
              // const selectedCats = categories
              //   .filter((cat) => cat.isChecked)
              //   .map((cat) => cat.title.toLowerCase().replace(" ", "_"));
              // const selectedFilterType = selectedCats.includes("received")
              //   ? "receive"
              //   : selectedCats.includes("debit")
              //   ? "send"
              //   : null;
              // onFilterSelect("categories", selectedCats);
              // onFilterSelect("filter_type", selectedFilterType);
              // if (timeRanges[3].isSelected && date && date2) {
              //   onFilterSelect("date_range", {
              //     start_date: date,
              //     end_date: date2,
              //   });
              // }
              // // Then trigger Apply logic in parent
              // onApplyFilter();
            }}
            title="Apply"
            cStyle={{ marginBottom: 10 }}
          />

          <GenericButton
            onPress={() => {
              onCancel();
            }}
            title="Cancel"
            cStyle={{ marginBottom: 10, backgroundColor: "black" }}
          />
        </View>
      ) : (
        <View style={[styles.mainContainer]}>
          {open && (
            <DatePicker
              modal
              mode="date"
              open={open}
              date={new Date()}
              onConfirm={(date) => {
                setOpen(false);
                setdate(moment(date).format("YYYY-MM-DD"));
                onFilterClick(
                  "custom_range",
                  {
                    id: 0,
                    title: "Start Date",
                    isSelected: false,
                    key: "start_date",
                    value: moment(date).format("YYYY-MM-DD"),
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
              onConfirm={(date) => {
                setOpen2(false);
                setdate2(moment(date).format("YYYY-MM-DD"));
                onFilterClick(
                  "custom_range",
                  {
                    id: 1,
                    title: "End Date",
                    isSelected: false,
                    key: "end_date",
                    value: moment(date).format("YYYY-MM-DD"),
                  },
                  1
                );
              }}
              onCancel={() => setOpen2(false)}
            />
          )}
          <CustomText variant={"h3"}>Filter</CustomText>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginVertical: 20,
            }}
          >
            <TouchableOpacity
              onPress={() => setOpen(true)}
              style={{ width: "48%" }}
            >
              <Text
                style={{
                  fontFamily: Fonts.semibold,
                  padding: 10,
                  color: "rgba(29, 29, 29, 1)",
                }}
              >
                Start Date
              </Text>
              <View
                style={{
                  borderWidth: 1,
                  borderColor: "rgba(106, 106, 106, 0.08)",
                  paddingHorizontal: 15,
                  paddingBottom: 15,
                  paddingTop: 12,
                  backgroundColor: "rgba(217, 217, 217, 0.07)",
                  borderRadius: 30,
                }}
              >
                <Text
                  style={{
                    fontFamily: Fonts.semibold,
                    color: "rgba(29, 29, 29, 1)",
                  }}
                >
                  {date === "" ? " MM/DD/YY" : moment(date).format("MM/DD/YY")}
                </Text>
                <SvgIcons.CalendarIcon
                  style={{ position: "absolute", right: 15, top: 15 }}
                />
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setOpen2(true)}
              style={{ width: "48%" }}
            >
              <Text
                style={{
                  fontFamily: Fonts.semibold,
                  padding: 10,
                  color: "rgba(29, 29, 29, 1)",
                }}
              >
                End Date
              </Text>
              <View
                style={{
                  borderWidth: 1,
                  borderColor: "rgba(106, 106, 106, 0.08)",
                  paddingHorizontal: 15,
                  paddingBottom: 15,
                  paddingTop: 12,
                  backgroundColor: "rgba(217, 217, 217, 0.07)",
                  borderRadius: 30,
                }}
              >
                <Text
                  style={{
                    fontFamily: Fonts.semibold,
                    color: "rgba(29, 29, 29, 1)",
                  }}
                >
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
          <GenericButton
            onPress={() => {
              // Then trigger Apply logic in parent
              onApplyFilter();
            }}
            title="Apply"
            cStyle={{ marginBottom: 10 }}
          />
          <GenericButton
            onPress={() => {
              onFilterClick("time_range", {}, 5);
              setdate("");
              setdate2("");
            }}
            title="Back"
            cStyle={{ marginBottom: 10, backgroundColor: "black" }}
          />
        </View>
      )}
    </Pressable>
  );
};

export default TransactionFilter;

const customStyles = (theme: Theme) =>
  StyleSheet.create({
    mainContainer: { width: "100%", alignItems: "center" },
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
      width: 170,
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
  });
