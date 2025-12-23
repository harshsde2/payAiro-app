/**
 * Custom Toast component integrated with app theme
 * Uses toastify-react-native with custom styling
 */

import React from "react";
import { View, StyleSheet, TouchableOpacity, Platform } from "react-native";
import Animated, { FadeInDown, FadeInUp, FadeOutDown, FadeOutUp } from "react-native-reanimated";
import ToastManager from "toastify-react-native";
import { useTheme } from "styles";
import { CustomText } from "tsx-components";
import { SvgIcons } from "constants/svgs";

interface ICustomToastProps {
  text1?: string;
  text2?: string;
  message?: string; // Alternative to text1 for compatibility
  hide: () => void;
  type?: "success" | "error" | "info" | "warning";
  [key: string]: any; // Allow additional props from toastify-react-native
}

const CustomToast: React.FC<ICustomToastProps> = ({
  text1,
  text2,
  hide,
  type = "info",
  message,
  ...rest
}) => {
  const { theme } = useTheme();

  // Handle both text1 and message props (for compatibility)
  const displayText1 = text1 || message || "";
  const displayText2 = text2 || "";

  const getToastStyles = () => {
    switch (type) {
      case "success":
        return {
          backgroundColor: "#236C4D", // Slightly lighter Deep Green
          iconBg: "rgba(255, 255, 255, 0.3)",
          iconColor: "#FFFFFF",
          textColor: "#FFFFFF",
          secondaryTextColor: "rgba(255, 255, 255, 0.8)",
        };
      case "error":
        return {
          backgroundColor: "#C92A2A", // Slightly lighter Deep Red
          iconBg: "rgba(255, 255, 255, 0.35)",
          iconColor: "#FFFFFF",
          textColor: "#FFFFFF",
          secondaryTextColor: "rgba(255, 255, 255, 0.8)",
        };
      case "info":
        return {
          backgroundColor: "#1A4D7C", // Slightly lighter Deep Blue
          iconBg: "rgba(255, 255, 255, 0.15)",
          iconColor: "#FFFFFF",
          textColor: "#FFFFFF",
          secondaryTextColor: "rgba(255, 255, 255, 0.8)",
        };
      case "warning":
        return {
          backgroundColor: "#946300", // Slightly lighter Deep Amber
          iconBg: "rgba(255, 255, 255, 0.15)",
          iconColor: "#FFFFFF",
          textColor: "#FFFFFF",
          secondaryTextColor: "rgba(255, 255, 255, 0.8)",
        };
      default:
        return {
          backgroundColor: "#1A4D7C",
          iconBg: "rgba(255, 255, 255, 0.15)",
          iconColor: "#FFFFFF",
          textColor: "#FFFFFF",
          secondaryTextColor: "rgba(255, 255, 255, 0.8)",
        };
    }
  };

  const stylesConfig = getToastStyles();

  const renderIcon = () => {
    const iconSize = 20;
    switch (type) {
      case "success":
        return (
          <SvgIcons.ToastChecked
            width={iconSize}
            height={iconSize}
            fill={stylesConfig.iconColor}
          />
        );
      case "error":
        return (
          <SvgIcons.ToastCross
            width={iconSize}
            height={iconSize}
            fill={stylesConfig.iconColor}
          />
        );
      case "info":
        return (
        <SvgIcons.ToastCircleAlert
            width={iconSize}
            height={iconSize}
            fill={stylesConfig.iconColor}
          />
        );
      case "warning":
        return (
          <SvgIcons.ToastTriangleAlert
            width={iconSize}
            height={iconSize}
            fill={stylesConfig.iconColor}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Animated.View
      entering={FadeInUp.springify().damping(12)}
      exiting={FadeOutDown}
      style={[
        styles.toastContainer,
        {
          backgroundColor: stylesConfig.backgroundColor,
        },
      ]}
    >
      <View
        style={[
          styles.iconContainer,
          { backgroundColor: stylesConfig.iconBg },
        ]}
      >
        {renderIcon()}
      </View>
      
      <View style={styles.textContainer}>
        {displayText1 && (
          <CustomText
            variant="body1"
            style={[
              styles.title,
              {
                color: stylesConfig.textColor,
                fontFamily: theme.typography.fontFamily.montserratSemiBold,
              },
            ]}
            numberOfLines={1}
          >
            {displayText1}
          </CustomText>
        )}
        {displayText2 && (
          <CustomText
            variant="body2"
            style={[
              styles.message,
              {
                color: stylesConfig.secondaryTextColor,
                fontFamily: theme.typography.fontFamily.montserrat,
              },
            ]}
            numberOfLines={2}
          >
            {displayText2}
          </CustomText>
        )}
      </View>

      <TouchableOpacity 
        onPress={hide} 
        style={[styles.closeButton, { borderColor: 'rgba(255,255,255,0.2)' }]}
      >
        <SvgIcons.NewCross
          width={20}
          height={20}
          fill={stylesConfig.iconColor}
        />
      </TouchableOpacity>
    </Animated.View>
  );
};

const Toast = () => {
  const { theme } = useTheme();

  const toastConfig = {
    success: (props: any) => (
      <CustomToast {...props} type="success" />
    ),
    error: (props: any) => (
      <CustomToast {...props} type="error" />
    ),
    info: (props: any) => (
      <CustomToast {...props} type="info" />
    ),
    warning: (props: any) => (
      <CustomToast {...props} type="warning" />
    ),
    warn: (props: any) => (
      <CustomToast {...props} type="warning" />
    ),
  };

  return (
    <View style={styles.toastWrapper} pointerEvents="box-none">
      <ToastManager
        config={toastConfig}
        position="top"
        positionValue={Platform.OS === "ios" ? 60 : 40}
        style={{
          zIndex: 99999,
          elevation: 99999,
        }}
        textStyle={{
          fontFamily: theme.typography.fontFamily.montserrat,
          fontSize: theme.typography.fontSize.base,
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  toastWrapper: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 99999,
    elevation: 99999,
    ...(Platform.OS === "ios" && {
      // Ensure toast appears above all iOS elements
      pointerEvents: "box-none",
    }),
  },
  toastContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "90%",
    minHeight: 65,
    borderRadius: 50, // Pill shape
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginVertical: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
    ...(Platform.OS === "ios" && {
      zIndex: 9999,
    }),
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  textContainer: {
    flex: 1,
    justifyContent: "center",
    paddingRight: 12,
  },
  title: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 2,
  },
  message: {
    fontSize: 12,
    fontWeight: "400",
    lineHeight: 16,
  },
  closeButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default Toast;
