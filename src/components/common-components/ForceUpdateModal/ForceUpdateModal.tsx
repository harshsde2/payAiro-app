import React, { useEffect } from "react";
import { View, Modal, Pressable, StyleSheet, TouchableOpacity, Platform } from "react-native";
import { useTheme } from "@new-ui/styles/ThemeContext";
import CustomText from "../../../tsx-components/CustomText";
import { SvgIcons } from "../../../constants/svgs";
import { IForceUpdateModalProps } from "./types";

const ForceUpdateModal: React.FC<IForceUpdateModalProps> = ({
  isVisible,
  message,
  storeVersion,
  onUpdate,
  onClose,
  forceUpdate = true,
  isUpdating = false,
  updateError = null,
}) => {
  const { theme } = useTheme();

  // IMMEDIATE log on every render - not in useEffect
  if (__DEV__) {
    // console.log('[ForceUpdateModal] Component rendering - isVisible:', isVisible, 'Platform:', Platform.OS);
  }

  const defaultMessage = storeVersion
    ? `A new version (${storeVersion}) is available. Please update to continue using PayAiro.`
    : 'A new version of PayAiro is available. Please update to continue using the app.';

  // Debug log - shows what props are received
  useEffect(() => {
    if (__DEV__ && isVisible) {
      // console.log('[ForceUpdateModal] ====== MODAL VISIBLE ======');
      // console.log('[ForceUpdateModal] forceUpdate:', forceUpdate);
      // console.log('[ForceUpdateModal] storeVersion:', storeVersion);
      // console.log('[ForceUpdateModal] Platform:', Platform.OS);
      // console.log('[ForceUpdateModal] Title will be:', forceUpdate ? "Update Required" : "Update Available");
    }
  }, [isVisible, forceUpdate, storeVersion]);

  const handleClose = () => {
    if (!forceUpdate && onClose) {
      console.log('[ForceUpdateModal] Close button pressed');
      onClose();
    }
  };

  // Don't render anything if not visible - prevents Modal conflicts on iOS
  if (!isVisible) {
    return null;
  }

  return (
    <Modal
      visible={true}
      transparent
      animationType="fade"
      onRequestClose={forceUpdate ? undefined : handleClose}
    >
      <Pressable
        style={styles(theme).modalOverlay}
        onPress={forceUpdate ? undefined : handleClose}
      >
        <Pressable
          style={styles(theme).modalContainer}
          onPress={(e) => e.stopPropagation()}
        >
          {/* Close button for optional updates */}
          {!forceUpdate && onClose && (
            <TouchableOpacity
              style={styles(theme).closeButton}
              onPress={handleClose}
              activeOpacity={0.7}
            >
              <CustomText
                variant="body1"
                fontWeight="bold"
                color={theme.colors.textSecondary}
              >
                ✕
              </CustomText>
            </TouchableOpacity>
          )}

          <View style={styles(theme).contentContainer}>
            <View style={styles(theme).iconContainer}>
              <SvgIcons.AlertIcon width={48} height={48} />
            </View>

            <CustomText
              variant="h3"
              fontWeight="bold"
              color={theme.colors.text}
              style={styles(theme).title}
            >
              {forceUpdate ? "Update Required" : "Update Available"}
            </CustomText>

            <CustomText
              variant="body1"
              color={theme.colors.textSecondary}
              style={styles(theme).message}
            >
              {message || defaultMessage}
            </CustomText>

            {/* Error Message */}
            {updateError && (
              <View style={styles(theme).errorContainer}>
                <CustomText
                  variant="body2"
                  color={theme.colors.error}
                  style={styles(theme).errorText}
                >
                  {updateError}
                </CustomText>
              </View>
            )}

            <TouchableOpacity
              style={[
                styles(theme).updateButton,
                (isUpdating || updateError) && styles(theme).updateButtonDisabled
              ]}
              onPress={() => {
                if (!isUpdating && !updateError) {
                  console.log('[ForceUpdateModal] Update Now button pressed');
                  onUpdate();
                }
              }}
              activeOpacity={isUpdating || updateError ? 1 : 0.8}
              disabled={isUpdating || !!updateError}
            >
              {isUpdating ? (
                <CustomText
                  variant="button"
                  fontWeight="bold"
                  color={theme.colors.onPrimary}
                >
                  Updating...
                </CustomText>
              ) : (
                <CustomText
                  variant="button"
                  fontWeight="bold"
                  color={theme.colors.onPrimary}
                >
                  {updateError ? 'Try Again' : 'Update Now'}
                </CustomText>
              )}
            </TouchableOpacity>

            {/* Update Later button for optional updates */}
            {!forceUpdate && onClose && (
              <TouchableOpacity
                style={styles(theme).laterButton}
                onPress={handleClose}
                activeOpacity={0.8}
              >
                <CustomText
                  variant="button"
                  fontWeight="medium"
                  color={theme.colors.textSecondary}
                >
                  Update Later
                </CustomText>
              </TouchableOpacity>
            )}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = (theme: any) =>
  StyleSheet.create({
    modalOverlay: {
      flex: 1,
      backgroundColor: "rgba(0, 0, 0, 0.7)",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 99999,
      elevation: 99999,
    },
    modalContainer: {
      width: "85%",
      maxWidth: 400,
      backgroundColor: theme.colors.surfaceElevated,
      borderRadius: 24,
      padding: theme.spacing.xl,
      alignItems: "center",
      zIndex: 99999,
      elevation: 99999,
      position: 'relative',
    },
    closeButton: {
      position: 'absolute',
      top: theme.spacing.base,
      right: theme.spacing.base,
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: theme.colors.surface,
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 10,
    },
    contentContainer: {
      width: "100%",
      alignItems: "center",
      paddingTop: theme.spacing.sm,
    },
    iconContainer: {
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor: theme.colors.surface,
      justifyContent: "center",
      alignItems: "center",
      marginBottom: theme.spacing.base,
    },
    title: {
      marginBottom: theme.spacing.md,
      textAlign: "center",
    },
    message: {
      marginBottom: theme.spacing.xl,
      textAlign: "center",
      lineHeight: 22,
    },
    updateButton: {
      width: "100%",
      backgroundColor: theme.colors.primary,
      borderRadius: 12,
      paddingVertical: theme.spacing.base,
      paddingHorizontal: theme.spacing.lg,
      alignItems: "center",
      justifyContent: "center",
    },
    updateButtonDisabled: {
      opacity: 0.6,
    },
    errorContainer: {
      width: "100%",
      backgroundColor: theme.colors.errorSurface,
      borderRadius: 8,
      paddingVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.base,
      marginBottom: theme.spacing.base,
      alignItems: "center",
    },
    errorText: {
      textAlign: "center",
      fontSize: 14,
    },
    laterButton: {
      width: "100%",
      backgroundColor: 'transparent',
      borderRadius: 12,
      paddingVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.lg,
      alignItems: "center",
      justifyContent: "center",
      marginTop: theme.spacing.md,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
  });

export default ForceUpdateModal;
