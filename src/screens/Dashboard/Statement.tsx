import { View, TouchableOpacity, StyleSheet } from "react-native";
import React, { useState } from "react";
import HeaderTitle from "../../components/HeaderTitle";
import TextInputField from "../../components/TextInputField";
import DatePicker from "react-native-date-picker";
import moment from "moment";
import GenericButton from "../../components/GenericButton";
import { useNavigation } from "@react-navigation/native";
import { getStatementsTX } from "../../services/Services";
import useSelectorAction from "../../hooks/useSelectorAction";
import { ScreenContainer } from "HOC";
import { Theme, useTheme } from "styles";
import { CustomText } from "tsx-components";
import { useGlobalStyles } from "styles/GlobalStyles";
import { IPeriodOption, PeriodOption, TransactionType } from "./types";
import { SvgIcons } from "constants/svgs";

export default function Statement() {
  const { tokens } = useSelectorAction();
  const navigation = useNavigation<any>();
  const { theme } = useTheme();
  const globalStyles = useGlobalStyles();
  const styles = customStyles(theme);

  const [selectedTime, setSelectedTime] = useState<PeriodOption>("week");
  const [date, setDate] = useState<string>("");
  const [open, setOpen] = useState<boolean>(false);
  const [date2, setDate2] = useState<string>("");
  const [open2, setOpen2] = useState<boolean>(false);
  const [selectedType, setSelectedType] = useState<TransactionType>("all");
  const [numberOfTransaction, setNumberOfTransaction] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleTX = async () => {
    try {
      setIsLoading(true);

      const filters: string[] = [];

      if (numberOfTransaction.trim() !== "") {
        filters.push(`limit=${numberOfTransaction}`);
      }

      if (selectedType !== "all") {
        filters.push(`type=${selectedType}`);
      }

      if (selectedTime !== "custom") {
        filters.push(`period=${selectedTime}`);
      } else if (date && date2) {
        filters.push(`start_date=${date}`);
        filters.push(`end_date=${date2}`);
      }

      const filterQuery = filters.join("&");

      console.log("Final Query →", filterQuery);

      const data = await getStatementsTX(filterQuery, (tokens as any)?.access);
      console.log("Statement Data =>", JSON.stringify(data, null, 2));
      navigation.navigate("StatementDetails", {
        data: data?.data?.transactions,
        statementData: data?.data,
      });
    } catch (error) {
      console.log(error, "handleTX error");
    } finally {
      setIsLoading(false);
    }
  };

  const isButtonEnabled =
    numberOfTransaction.trim() !== "" ||
    selectedTime !== "custom" ||
    (selectedTime === "custom" && date && date2);

  const periodOptions: IPeriodOption[] = [
    { key: "week", label: "Last Week" },
    { key: "month", label: "Last Month" },
    { key: "custom", label: "Custom Range" },
  ];

  const handleCustomRangeSelect = () => {
    const threeMonthsAgo = moment().subtract(3, "months").format("YYYY-MM-DD");
    const today = moment().format("YYYY-MM-DD");
    setDate(threeMonthsAgo);
    setDate2(today);
    setSelectedTime("custom");
  };

  return (
    <ScreenContainer scrollable padding={0}>
      <HeaderTitle title={"Statement Details"} leftIcon={'true'} onPressLeft={() => navigation.goBack()} />

      {open && (
        <DatePicker
          modal
          mode="date"
          open={open}
          date={date ? moment(date, "YYYY-MM-DD").toDate() : new Date()}
          onConfirm={(selectedDate) => {
            setOpen(false);
            setDate(moment(selectedDate).format("YYYY-MM-DD"));
          }}
          onCancel={() => setOpen(false)}
        />
      )}

      {open2 && (
        <DatePicker
          modal
          mode="date"
          open={open2}
          date={date2 ? moment(date2, "YYYY-MM-DD").toDate() : new Date()}
          onConfirm={(selectedDate) => {
            setOpen2(false);
            setDate2(moment(selectedDate).format("YYYY-MM-DD"));
          }}
          onCancel={() => setOpen2(false)}
        />
      )}

      <View style={[globalStyles.whiteSheetContainer]}>
        <CustomText
          variant="h3"
          fontWeight="bold"
          color={theme.colors.text.primary}
          style={styles.sectionTitle}
        >
          Transaction Duration
        </CustomText>

        <TextInputField
          keyboardType={"numeric"}
          value={numberOfTransaction}
          onChange={(text) => setNumberOfTransaction(text)}
          lStyle={styles.labelStyle}
          label={"Select Number of Recent Transactions"}
          cStyle={styles.inputContainer}
        />

        <View style={styles.orDivider}><CustomText variant="body2" fontWeight="semiBold" color={theme.colors.text.primary}>OR</CustomText></View>
        <CustomText
          variant="subtitle1"
          fontWeight="bold"
          style={styles.sectionLabel}
        >
          Select Predefined Period
        </CustomText>

        <View style={styles.periodOptionsContainer}>
          {periodOptions.map(({ key, label }) => (
            <TouchableOpacity
              key={key}
              onPress={() =>
                key === "custom"
                  ? handleCustomRangeSelect()
                  : setSelectedTime(key)
              }
              style={[
                styles.periodButton,
                selectedTime === key && styles.periodButtonActive,
              ]}
            >
              <CustomText
                variant="body2"
                fontWeight="semiBold"
                color={theme.colors.palette.white}
                style={styles.periodButtonText}
              >
                {label}
              </CustomText>
            </TouchableOpacity>
          ))}
        </View>

        {selectedTime === "custom" && (
          <>
            <CustomText
              variant="subtitle1"
              fontWeight="bold"
              style={styles.sectionLabel}
            >
              Select Custom Date Range
            </CustomText>
            <View style={styles.dateRangeContainer}>
              <TouchableOpacity
                onPress={() => setOpen(true)}
                style={styles.datePickerContainer}
              >
                <CustomText
                  variant="body2"
                  fontWeight="semiBold"
                  color={theme.colors.text.primary}
                  style={styles.dateLabel}
                >
                  Start Date
                </CustomText>
                <View style={styles.dateInput}>
                  <CustomText
                    variant="body2"
                    fontWeight="semiBold"
                    color={
                      date === ""
                        ? theme.colors.text.tertiary
                        : theme.colors.text.primary
                    }
                  >
                    {date === ""
                      ? " MM/DD/YY"
                      : moment(date).format("MM/DD/YY")}
                  </CustomText>
                  <SvgIcons.CalendarIcon style={styles.dateIcon} />
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setOpen2(true)}
                style={styles.datePickerContainer}
              >
                <CustomText
                  variant="body2"
                  fontWeight="semiBold"
                  color={theme.colors.text.primary}
                  style={styles.dateLabel}
                >
                  End Date
                </CustomText>
                <View style={styles.dateInput}>
                  <CustomText
                    variant="body2"
                    fontWeight="semiBold"
                    color={
                      date2 === ""
                        ? theme.colors.text.tertiary
                        : theme.colors.text.primary
                    }
                  >
                    {date2 === ""
                      ? " MM/DD/YY"
                      : moment(date2).format("MM/DD/YY")}
                  </CustomText>
                  <SvgIcons.CalendarIcon style={styles.dateIcon} />
                </View>
              </TouchableOpacity>
            </View>
          </>
        )}

        <CustomText
          variant="subtitle1"
          fontWeight="bold"
          style={styles.sectionLabel}
        >
          Select Transaction Type
        </CustomText>
        <View style={styles.transactionTypeContainer}>
          {(["all", "debit", "credit"] as TransactionType[]).map((type) => (
            <TouchableOpacity
              key={type}
              onPress={() => setSelectedType(type)}
              style={[
                styles.transactionTypeButton,
                selectedType === type && styles.transactionTypeButtonActive,
              ]}
            >
              <CustomText
                variant="body2"
                fontWeight="semiBold"
                color={theme.colors.palette.white}
                style={styles.transactionTypeButtonText}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </CustomText>
            </TouchableOpacity>
          ))}
        </View>

        <GenericButton
          title={"View Statement"}
          cStyle={styles.submitButton}
          tStyle={styles.submitButtonText}
          onPress={handleTX}
          showLoader={true}
          isLoading={isLoading}
          disabled={!isButtonEnabled}
        />
      </View>
    </ScreenContainer>
  );
}

const customStyles = (theme: Theme) =>
  StyleSheet.create({
    sectionTitle: {
      marginBottom: theme.spacing.spacing[4],
    },
    labelStyle: {
      fontSize: 12,
    },
    inputContainer: {
      marginTop: theme.spacing.spacing[4],
      backgroundColor: theme.colors.palette.grey50,
    },
    orDivider: {
      marginVertical: theme.spacing.spacing[3],
      alignSelf: "center",

    },
    sectionLabel: {
      padding: theme.spacing.spacing[2],
      marginTop: theme.spacing.spacing[5],
      color: theme.colors.text.primary,
    },
    periodOptionsContainer: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: theme.spacing.spacing[1],
      justifyContent: "space-between",
      width: "100%",
      marginTop: theme.spacing.spacing[2],
    },
    periodButton: {
      paddingHorizontal: theme.spacing.spacing[2],
      borderRadius: 30,
      marginBottom: theme.spacing.spacing[2],
      backgroundColor: "rgba(43, 43, 43, 0.4)",
      paddingVertical: theme.spacing.spacing[2],
      minWidth: "30%",
      alignItems: "center",
      justifyContent: "center",
    },
    periodButtonActive: {
      backgroundColor: theme.colors.palette.black,
    },
    periodButtonText: {
      fontSize: 12,
      textAlign: "center",
    },
    dateRangeContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginTop: theme.spacing.spacing[2],
    },
    datePickerContainer: {
      width: "48%",
    },
    dateLabel: {
      padding: theme.spacing.spacing[2],
      color: theme.colors.text.primary,
    },
    dateInput: {
      borderWidth: 1,
      borderColor: theme.colors.border.light,
      paddingHorizontal: theme.spacing.spacing[4],
      paddingBottom: theme.spacing.spacing[4],
      paddingTop: theme.spacing.spacing[3],
      backgroundColor: theme.colors.palette.grey50,
      borderRadius: 30,
      position: "relative",
    },
    dateIcon: {
      position: "absolute",
      right: theme.spacing.spacing[4],
      top: theme.spacing.spacing[4],
    },
    transactionTypeContainer: {
      flexDirection: "row",
      justifyContent: "flex-start",
      alignItems: "center",
      marginVertical: theme.spacing.spacing[1],
      marginTop: theme.spacing.spacing[2],
    },
    transactionTypeButton: {
      paddingHorizontal: theme.spacing.spacing[4],
      marginLeft: theme.spacing.spacing[2],
      borderRadius: 30,
      backgroundColor: "rgba(43, 43, 43, 0.4)",
      paddingVertical: theme.spacing.spacing[2],
      alignItems: "center",
      justifyContent: "center",
      minWidth: 80,
    },
    transactionTypeButtonActive: {
      backgroundColor: theme.colors.palette.black,
    },
    transactionTypeButtonText: {
      fontSize: 14,
      textAlign: "center",
    },
    submitButton: {
      marginTop: theme.spacing.spacing[8],
    },
    submitButtonText: {
      textAlign: "center",
    },
  });

