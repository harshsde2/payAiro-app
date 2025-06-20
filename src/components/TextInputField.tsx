import { View, Text, TextInput, TouchableOpacity, Image } from "react-native";
import React, { FC, useState } from "react";
import Fonts from "../constants/Fonts";
import CountryCodeModal from "./CountryCodeModal";
import { CC } from "../constants/countryCode";
import { SvgXml } from "react-native-svg";
import { SVGInfo, SVGProfile3 } from "../constants/images";
import { InputProps } from "./types";
import { CustomText } from "tsx-components";
import { useTheme } from "styles";

const TextInputField: FC<InputProps> = (props) => {
  const {
    countryCode,
    value,
    onChange,
    placeholder,
    onSelected,
    label,
    cStyle,
    isCountry,
    isIcon,
    isMultiLine,
    icon,
    iStyle,
    editable,
    lStyle,
    keyboardType,
    maxLength,
    required = false,
    info = false,
    onInfoPress,
  } = props;

  const [isVisible, setisVisible] = useState(false);
  const { theme } = useTheme();
  return (
    <>
      {isVisible && (
        <CountryCodeModal
          isVisible={isVisible}
          onClose={() => setisVisible(false)}
          data={CC}
          onSelected={(e: any) => {
            onSelected(e);
            setisVisible(false);
          }}
        />
      )}
      <View style={[cStyle]}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <CustomText
            variant={"body2"}
            style={[{ fontFamily: Fonts.semibold, padding: 10 }, lStyle]}
          >
            {label}{" "}
          </CustomText>
          {required && (
            <CustomText color={theme.colors.palette.red500} variant={"body2"}>
              *
            </CustomText>
          )}
          {info && (
            <View style={{}}>
              <SvgXml onPress={onInfoPress} xml={SVGInfo} />
            </View>
          )}
        </View>
        <View
          style={[
            {
              borderRadius: 30,
              borderWidth: 1,
              borderColor: "#6A6A6A33",
              flexDirection: "row",
              justifyContent: isCountry ? "space-between" : "flex-start",
              alignItems: "center",
              paddingVertical: !countryCode ? 5 : 0,
            },
            iStyle,
          ]}
        >
          {countryCode && (
            <TouchableOpacity
              disabled={editable}
              onPress={() => setisVisible(true)}
              style={{
                borderRightColor: "#6A6A6A33",
                borderRightWidth: isCountry ? 0 : 1,
                width: isCountry ? "100%" : "20%",
                paddingHorizontal: 10,
                paddingVertical: 15,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {countryCode?.code && (
                <Text
                  style={{
                    fontFamily: Fonts.semibold,
                    fontSize: isCountry ? 12 : 12,
                    marginRight: 5,
                  }}
                >
                  {isCountry ? countryCode?.code : countryCode?.country}
                </Text>
              )}
              {/* <Text
                style={{
                  fontFamily: Fonts.semibold,
                  fontSize: isCountry ? 12 : 12,
                  marginRight: 5,
                }}
              >
                {isCountry ? countryCode?.country : countryCode?.code}
              </Text> */}
              <Image
                source={{
                  uri: countryCode?.flag_image_url,
                }}
                style={{ width: 30, height: 18, alignSelf: "flex-end" }}
              />
            </TouchableOpacity>
          )}
          {isIcon && (
            <SvgXml
              xml={icon ?? SVGProfile3}
              style={{ position: "absolute", right: 10 }}
            />
          )}

          {!isCountry && !isMultiLine && (
            <TextInput
              maxLength={maxLength}
              editable={editable}
              style={{
                color: "#000",
                paddingRight: 10,
                paddingLeft: 15,
                fontFamily: Fonts.semibold,
                width: "90%",
                minHeight: 40,
              }}
              placeholder={placeholder}
              placeholderTextColor={"#6A6A6A"}
              onChangeText={onChange}
              value={value}
              keyboardType={keyboardType ?? "default"}
              autoCapitalize="none"
              autoCorrect={false}
            />
          )}

          {isMultiLine && (
            <TextInput
              style={{
                color: "#000",
                paddingRight: 10,
                paddingLeft: 15,
                fontFamily: Fonts.semibold,
                height: 100,
                backgroundColor: "rgba(217, 217, 217, 0.07)",
              }}
              placeholder={placeholder}
              placeholderTextColor={"#6A6A6A"}
              onChangeText={onChange}
              value={value}
              multiline={true}
            />
          )}
        </View>
      </View>
    </>
  );
};
export default TextInputField;
