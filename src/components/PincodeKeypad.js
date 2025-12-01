import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Fonts from "../constants/Fonts";

import { SvgIcons } from "constants/svgs";

const PincodeKeypad = ({
  handleBackspace,
  type,
  showPin,
  handleKeyPress,
  pincode,
  error,
  marginFmTop,
  isTransparent,
  isNotDecimals,
}) => {
  return (
    <View style={type ? styles.container2 : styles.container}>
      <View style={styles.keypadContainer}>
        <View style={styles.keypadRow}>
          {[1, 2, 3].map((key) => (
            <TouchableOpacity
              key={key}
              onPress={() => handleKeyPress(key.toString())}
              style={{
                ...styles.keypadButton,
              }}
            >
              <Text
                style={{
                  ...styles.keypadButtonText,
                  color: "#000",
                }}
              >
                {key}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.keypadRow}>
          {[4, 5, 6].map((key) => (
            <TouchableOpacity
              key={key}
              onPress={() => handleKeyPress(key.toString())}
              style={styles.keypadButton}
            >
              <Text
                style={{
                  ...styles.keypadButtonText,
                  color: "#000",
                }}
              >
                {key}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.keypadRow}>
          {[7, 8, 9].map((key) => (
            <TouchableOpacity
              key={key}
              onPress={() => handleKeyPress(key.toString())}
              style={styles.keypadButton}
            >
              <Text
                style={{
                  ...styles.keypadButtonText,
                  color: "#000",
                }}
              >
                {key}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={{ ...styles.keypadRow, justifyContent: "flex-end" }}>
          {!isNotDecimals && (
            <TouchableOpacity
              onPress={() => handleKeyPress(".")}
              style={styles.keypadButton}
            >
              <Text
                style={{
                  ...styles.keypadButtonText,
                  color: "#000",
                }}
              >
                .
              </Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            onPress={() => handleKeyPress("0")}
            style={styles.keypadButton}
          >
            <Text
              style={{
                ...styles.keypadButtonText,
                color: "#000",
              }}
            >
              0
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleBackspace}
            style={styles.keypadButton}
          >
            <SvgIcons.KeyboardBack width={20} height={20} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    // flex: 1,
    marginVertical: 30,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
  },
  container2: {
    flex: 1,
    alignItems: "center",
    marginTop: 30,
  },
  pincodeContainer: {
    flexDirection: "row",
    marginBottom: 10,
  },
  pincodeCircle: {
    marginBottom: 40,
    width: 12,
    height: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "black",
    backgroundColor: "transparent",
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 5,
  },
  pincodeDigit: {
    fontSize: 20,
    color: "black",
  },
  keypadContainer: {
    flexDirection: "column",
    // width: '100%',
  },
  keypadRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  keypadButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "transparent",
    marginHorizontal: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  keypadButtonText: {
    fontSize: 20,
    color: "black",
    fontFamily: Fonts.semibold,
  },
});

export default PincodeKeypad;
