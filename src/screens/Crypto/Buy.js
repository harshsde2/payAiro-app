import { View, Text, TextInput, TouchableOpacity } from "react-native";
import React, { useState } from "react";
import CommonHeaderv2 from "../../HOC/CommonHeaderv2";
import HeaderTitle from "../../components/HeaderTitle";
import { SVGEth, SVGLeftArrow, SVGTextImage } from "../../constants/images";
import { SvgXml } from "react-native-svg";
import Fonts from "../../constants/Fonts";
import TextInputField from "../../components/TextInputField";
import GenericButton from "../../components/GenericButton";
import { buy, calculateQuantity } from "../../services/Services";
import useSelectorAction from "../../hooks/useSelectorAction";
import useDispatchAction from "../../hooks/useDispatchAction";
import { setShowLoader } from "../../redux/slices/authenticationSlice";
import { showError, showSuccess } from "../../utils/toast";
import { useNavigation } from "@react-navigation/native";
import FullScreenModal from "../../components/FullScreenModal";

export default function Buy(props) {
  const navigation = useNavigation();
  const { item } = props.route.params;
  const { tokens } = useSelectorAction();
  const [amount, setamount] = useState(0);
  const [quantity, setquantity] = useState("");
  const [isVisibleBank, setisVisibleBank] = useState(false); // State to store the input value
  const [bankSelected, setbankSelected] = useState(null); // State to store the input value

  const [selectedFilter, setselectedFilter] = useState("12hour");

  const handleQuantity = async (e) => {
    const data = await calculateQuantity({
      network: item?.network,
      currency: item?.currency,
      amount: Number(e),
    });
    setquantity(data?.data?.quantity?.toString());

    console.log(data?.data?.quantity, "quantity");
  };
  const handleQuantityChange = async (value, type) => {
    if (type === "amount") {
      setamount(value);
      if (value) {
        const data = await calculateQuantity({
          network: item?.network,
          currency: item?.currency,
          amount: Number(value),
        });
        setquantity(data?.data?.quantity?.toString());
      } else {
        setquantity("");
      }
    } else if (type === "quantity") {
      setquantity(value);
      if (value) {
        const data = await calculateQuantity({
          network: item?.network,
          currency: item?.currency,
          quantity: Number(value),
        });
        setamount(data?.data?.usd_amount?.toString());
      } else {
        setamount("");
      }
    }
  };

  const handleSubmit = async () => {
    useDispatchAction(setShowLoader(true));
    try {
      const data = await buy(
        {
          from_asset: "usd",
          from_amount: Number(amount),
          to_asset: item?.currency,
          network: item?.network,
          fund_source:
            bankSelected?.account_type === "rothIra"
              ? "roth_ira"
              : bankSelected?.account_type === "traditionalIra"
              ? "traditional_ira"
              : "bank",
        },
        tokens?.access
      );
      console.log(
        JSON.stringify(
          [
            {
              from_asset: "usd",
              from_amount: Number(amount),
              to_asset: item?.currency,
              network: item?.network,
              fund_source:
                bankSelected?.account_type === "rothIra"
                  ? "roth_ira"
                  : bankSelected?.account_type === "traditionalIra"
                  ? "traditional_ira"
                  : "bank",
            },
          ],
          null,
          2
        ),
        "payloads"
      );
      console.log(JSON.stringify(data, null, 2), "datatata");
      if (data && data?.data.message === "Trade successful") {
        showSuccess("Trade successful");
        navigation.goBack();
      } else {
        showError("Trade failed, Some thing went wrong");
      }
    } catch (error) {
      // console.log(error?.data?.details?.errors, "errororor");
      console.log(JSON.stringify(error, null, 2), "errororor");
      showError("Trade failed, Some thing went wrong");
    } finally {
      useDispatchAction(setShowLoader(false));
    }
  };

  const handleChange = async (e) => {
    setamount(e);
    setTimeout(() => {
      handleQuantity(e);
    }, 2000);
  };
  return (
    <CommonHeaderv2>
      <HeaderTitle leftIcon={SVGLeftArrow} />
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          padding: 10,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            justifyContent: "flex-start",
            alignItems: "center",
          }}
        >
          <SvgXml xml={SVGTextImage} />
          <View style={{ marginLeft: 8 }}>
            <Text
              style={{ color: "black", fontFamily: Fonts.bold, fontSize: 18 }}
            >
              {item?.network?.toUpperCase()}, {item?.currency?.toUpperCase()}
            </Text>
            <Text
              style={{
                color: "rgba(106, 106, 106, 1)",
                fontFamily: Fonts.semibold,
                fontSize: 12,
              }}
            >
              Multinational Technology
            </Text>
          </View>
        </View>
        <Text
          style={{
            color: "rgba(44, 106, 63, 1)",
            fontFamily: Fonts.regular,
            fontSize: 14,
          }}
        >
          Depth
        </Text>
      </View>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          padding: 20,
        }}
      >
        <View style={{ width: "48%" }}>
          <Text
            style={{
              color: "rgba(106, 106, 106, 1)",
              fontFamily: Fonts.semibold,
              fontSize: 12,
              marginBottom: 8,
            }}
          >
            Amount
          </Text>
          <TextInput
            placeholder="Enter Amount"
            value={amount}
            onChangeText={(text) => handleQuantityChange(text, "amount")}
            placeholderTextColor={"rgba(106, 106, 106, 1)"}
            style={{
              backgroundColor: "rgba(226, 241, 227, 1)",
              borderRadius: 12,
              height: 50,
              color: "black",
              paddingLeft: 10,
              fontFamily: Fonts.semibold,
            }}
          />
        </View>
        <FullScreenModal
          isVisible={isVisibleBank}
          sendAmount={amount}
          onClose={() => setisVisibleBank(false)}
          onSelected={(e) => setbankSelected(e)}
          onCancel={(e) => {
            console.log(e, "eeeeeeee");
            setisVisibleBank(false);
            handleSubmit();
          }}
        />

        <View style={{ width: "48%" }}>
          <Text
            style={{
              color: "rgba(106, 106, 106, 1)",
              fontFamily: Fonts.semibold,
              fontSize: 12,
              marginBottom: 8,
            }}
          >
            Quantity
          </Text>
          <TextInput
            value={quantity}
            onChangeText={(text) => handleQuantityChange(text, "quantity")}
            placeholder="0"
            placeholderTextColor={"rgba(106, 106, 106, 1)"}
            style={{
              backgroundColor: "rgba(226, 241, 227, 1)",
              borderRadius: 12,
              height: 50,
              color: "black",
              paddingLeft: 10,

              fontFamily: Fonts.semibold,
            }}
          />
        </View>
      </View>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "flex-start",
          alignItems: "center",
          padding: 7,

          marginVertical: 12,
        }}
      >
        <TouchableOpacity
          onPress={() => setselectedFilter("12hour")}
          style={{
            backgroundColor:
              selectedFilter === "12hour" ? "#000" : "rgba(226, 241, 227, 0.5)",
            paddingVertical: 10,
            paddingHorizontal: 20,
            borderRadius: 20,
            width: "22%",
            marginLeft: 10,
          }}
        >
          <Text
            style={{
              color:
                selectedFilter === "12hour" ? "#fff" : "rgba(44, 106, 63, 1)",
              fontFamily: Fonts.semibold,
              textAlign: "center",
              fontSize: 10,
            }}
          >
            Market
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setselectedFilter("oneDay")}
          style={{
            backgroundColor:
              selectedFilter === "oneDay" ? "#000" : "rgba(226, 241, 227, 1)",
            paddingVertical: 10,
            paddingHorizontal: 20,
            borderRadius: 20,
            width: "22%",
            marginLeft: 10,
          }}
        >
          <Text
            style={{
              color:
                selectedFilter === "oneDay" ? "#fff" : "rgba(44, 106, 63, 1)",
              fontFamily: Fonts.semibold,
              textAlign: "center",
              fontSize: 10,
            }}
          >
            Limit
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setselectedFilter("oneWeek")}
          style={{
            backgroundColor:
              selectedFilter === "oneWeek" ? "#000" : "rgba(226, 241, 227, 1)",
            paddingVertical: 10,
            paddingHorizontal: 20,
            borderRadius: 20,
            width: "22%",
            marginLeft: 10,
          }}
        >
          <Text
            style={{
              color:
                selectedFilter === "oneWeek" ? "#fff" : "rgba(44, 106, 63, 1)",
              fontFamily: Fonts.semibold,
              textAlign: "center",
              fontSize: 10,
            }}
          >
            SL Lmt
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setselectedFilter("oneMonth")}
          style={{
            backgroundColor:
              selectedFilter === "oneMonth" ? "#000" : "rgba(226, 241, 227, 1)",
            paddingVertical: 10,
            paddingHorizontal: 20,
            borderRadius: 20,
            width: "22%",
            marginLeft: 10,
          }}
        >
          <Text
            style={{
              color:
                selectedFilter === "oneMonth" ? "#fff" : "rgba(44, 106, 63, 1)",
              fontFamily: Fonts.semibold,
              textAlign: "center",
              fontSize: 10,
            }}
          >
            Mkt Lmt
          </Text>
        </TouchableOpacity>
      </View>

      <Text
        style={{
          color: "rgba(106, 106, 106, 1)",
          textAlign: "center",
          fontFamily: Fonts.semibold,
          fontSize: 12,
        }}
      >
        Order will be executed at best price in market
      </Text>
      <GenericButton
        onPress={() => setisVisibleBank(true)}
        title="Buy"
        cStyle={{
          backgroundColor: "rgba(44, 106, 63, 1)",
          width: "90%",
          alignSelf: "center",
          marginTop: 40,
        }}
      />
    </CommonHeaderv2>
  );
}
