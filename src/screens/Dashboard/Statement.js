import { View, Text, TouchableOpacity } from "react-native";
import React, { useState } from "react";
import HeaderTitle from "../../components/HeaderTitle";
import { SVGDate, SVGLeftArrow, SVGOr } from "../../constants/images";
import Fonts from "../../constants/Fonts";
import TextInputField from "../../components/TextInputField";
import { SvgXml } from "react-native-svg";
import DatePicker from "react-native-date-picker";
import moment from "moment";
import GenericButton from "../../components/GenericButton";
import { useNavigation } from "@react-navigation/native";
import { getStatementsTX } from "../../services/Services";
import useSelectorAction from "../../hooks/useSelectorAction";
import { ScreenContainer } from "HOC";

export default function Statement() {
  const { tokens } = useSelectorAction();
  const navigation = useNavigation();

  const [selectedTime, setselectedTime] = useState("week");
  const [date, setdate] = useState("");
  const [open, setOpen] = useState(false);
  const [date2, setdate2] = useState("");
  const [open2, setOpen2] = useState(false);
  const [selectedType, setselectedType] = useState("all");
  const [numberOfTransaction, setNumberOfTransaction] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleTX = async () => {
    try {
      setIsLoading(true);

      const filters = [];

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

      const data = await getStatementsTX(filterQuery, tokens?.access);

      navigation.navigate("StatementDetails", {
        data: data?.data?.transactions,
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

  const periodOptions = [
    { key: "week", label: "Last Week" },
    { key: "month", label: "Last Month" },
    { key: "custom", label: "Custom Range" },
  ];

  const handleCustomRangeSelect = () => {
    const threeMonthsAgo = moment().subtract(3, "months").format("YYYY-MM-DD");
    const today = moment().format("YYYY-MM-DD");
    setdate(threeMonthsAgo);
    setdate2(today);
    setselectedTime("custom");
  };

  return (
    <ScreenContainer scrollable padding={0}>
      <HeaderTitle title={"Statement Details"} leftIcon={SVGLeftArrow} />

      {open && (
        <DatePicker
          modal
          mode="date"
          open={open}
          date={new Date()}
          onConfirm={(date) => {
            setOpen(false);
            setdate(moment(date).format("YYYY-MM-DD"));
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
          }}
          onCancel={() => setOpen2(false)}
        />
      )}

      <View
        style={{
          flex: 1,
          backgroundColor: "#fff",
          borderTopEndRadius: 32,
          borderTopStartRadius: 32,
          padding: 20,
          marginTop: 10,
        }}
      >
        <Text style={{ color: "black", fontFamily: Fonts.bold, fontSize: 22 }}>
          Transaction Duration
        </Text>

        <TextInputField
          keyboardType={"numeric"}
          value={numberOfTransaction}
          onChange={(text) => setNumberOfTransaction(text)}
          lStyle={{ fontSize: 12, fontFamily: Fonts.semibold }}
          label={"Select Number of Recent Transactions"}
          cStyle={{
            marginTop: 17,
            backgroundColor: "rgba(217, 217, 217, 0.07)",
          }}
        />

        <SvgXml
          xml={SVGOr}
          style={{ marginVertical: 30, alignSelf: "center" }}
        />

        <Text style={{ fontFamily: Fonts.bold, padding: 10 }}>
          Select Predefined Period
        </Text>

        <View
          style={{
            flexDirection: "row",
            flexWrap: "wrap",
            gap: 5,
            justifyContent: "space-between",
            width: "100%",
          }}
        >
          {periodOptions.map(({ key, label }) => (
            <TouchableOpacity
              key={key}
              onPress={() =>
                key === "custom"
                  ? handleCustomRangeSelect()
                  : setselectedTime(key)
              }
              style={{
                paddingHorizontal: 10,
                borderRadius: 30,
                marginBottom: 10,
                backgroundColor:
                  selectedTime === key ? "#000" : "rgba(43, 43, 43, 0.4)",
                paddingTop: 10,
                paddingBottom: 13,
              }}
            >
              <Text
                style={{
                  color: "white",
                  fontFamily: Fonts.semibold,
                  fontSize: 12,
                }}
              >
                {label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {selectedTime === "custom" && (
          <>
            <Text
              style={{ fontFamily: Fonts.bold, padding: 10, marginTop: 20 }}
            >
              Select Custom Date Range
            </Text>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
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
                    {date === ""
                      ? " MM/DD/YY"
                      : moment(date).format("MM/DD/YY")}
                  </Text>
                  <SvgXml
                    xml={SVGDate}
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
                  <SvgXml
                    xml={SVGDate}
                    style={{ position: "absolute", right: 15, top: 15 }}
                  />
                </View>
              </TouchableOpacity>
            </View>
          </>
        )}

        <Text style={{ fontFamily: Fonts.bold, padding: 10, marginTop: 20 }}>
          Select Transaction Type
        </Text>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "flex-start",
            alignItems: "center",
            marginVertical: 5,
          }}
        >
          {["all", "debit", "credit"].map((type) => (
            <TouchableOpacity
              key={type}
              onPress={() => setselectedType(type)}
              style={{
                paddingHorizontal: 15,
                marginLeft: 10,
                borderRadius: 30,
                backgroundColor:
                  selectedType === type ? "#000" : "rgba(43, 43, 43, 0.4)",
                paddingTop: 10,
                paddingBottom: 13,
              }}
            >
              <Text
                style={{
                  color: "white",
                  fontFamily: Fonts.semibold,
                  fontSize: 14,
                  textTransform: "capitalize",
                }}
              >
                {type}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <GenericButton
          title={"View Statement"}
          cStyle={{ marginTop: 30 }}
          onPress={handleTX}
          showLoader={true}
          isLoading={isLoading}
          disabled={!isButtonEnabled}
        />
      </View>
    </ScreenContainer>
  );
}
