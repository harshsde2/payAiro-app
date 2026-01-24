/**
 * Custom Toast component integrated with app theme
 * Uses toastify-react-native with custom styling
 */

import React from "react";
import { View, StyleSheet, TouchableOpacity, Platform, Pressable } from "react-native";
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
          accentColor: "#01aa77", // Standard Success Green
        };
      case "error":
        return {
          accentColor: "#dc3545", // Standard Error Red
        };
      case "info":
        return {
          accentColor: "#007bff", // Standard Info Blue
        };
      case "warning":
        return {
          accentColor: "#ffc107", // Standard Warning Yellow/Amber
        };
      default:
        return {
          accentColor: "#007bff",
        };
    }
  };

  const stylesConfig = getToastStyles();

  const renderIcon = () => {
    const iconSize = 24;
    switch (type) {
      case "success":
        return (
          <SvgIcons.ToastDone
            width={iconSize}
            height={iconSize}
            fill={stylesConfig.accentColor}
          />
        );
      case "error":
        return (
          <SvgIcons.ToastCross
            width={iconSize}
            height={iconSize}
            fill={stylesConfig.accentColor}
          />
        );
      case "info":
        return (
          <SvgIcons.ToastCircleAlert
            width={iconSize}
            height={iconSize}
            fill={stylesConfig.accentColor}
          />
        );
      case "warning":
        return (
          <SvgIcons.ToastTriangleAlert
            width={iconSize}
            height={iconSize}
            fill={stylesConfig.accentColor}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Pressable
      onPress={hide}
      style={({ pressed }) => [
        styles.toastContainer,
        {
          borderLeftColor: stylesConfig.accentColor,
          opacity: pressed ? 0.9 : 1,
        },
      ]}
    >
      <View style={styles.iconContainer}>
        {renderIcon()}
      </View>
      
      <View style={styles.textContainer}>
        {displayText1 && (
          <CustomText
            variant="body1"
            fontWeight="bold"
            size={13}
            style={[
              styles.title,
              {
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
            size={11}
            style={[
              styles.message,
              {
                fontFamily: theme.typography.fontFamily.montserrat,
              },
            ]}
            numberOfLines={1}
          >
            {displayText2}
          </CustomText>
        )}
      </View>

      <TouchableOpacity 
        onPress={hide} 
        style={styles.closeButton}
      >
        <SvgIcons.BlackCross
          width={16}
          height={16}
          fill="#999999" // Standard grey for close icon
        />
      </TouchableOpacity>
    </Pressable>
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
      <View style={styles.toastManagerWrapper} pointerEvents="box-none">
        <ToastManager
          useModal={false}
          config={toastConfig}
          position="top"
          positionValue={Platform.OS === "ios" ? 80 : 40}
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
    </View>
  );
};

const styles = StyleSheet.create({
  toastWrapper: {
    position: "absolute",
    top: 10,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 99999,
    elevation: 99999,
    pointerEvents: "box-none",
  },
  toastManagerWrapper: {
    flex: 1,
    pointerEvents: "box-none",

  },
  toastContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "90%",
    minHeight: 70,
    borderRadius: 8, // Standard card radius
    backgroundColor: "#FFFFFF", // White background
    borderLeftWidth: 6, // Colored left strip
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginVertical: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
    zIndex: 100000,
    // Ensure toast container captures its own touches
    pointerEvents: "auto",
  },
  iconContainer: {
    marginRight: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  textContainer: {
    flex: 1,
    justifyContent: "center",
    paddingRight: 12,
  },
  title: {
    // fontSize: 16,
    color: "#333333", // Standard dark grey for title
    marginBottom: 4,
  },
  message: {
    // fontSize: 14,
    color: "#666666", // Grey for message
    lineHeight: 20,
  },
  closeButton: {
    padding: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default Toast;
