import React, { FC, useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Linking,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useTheme } from "styles";
import { CustomText } from "tsx-components";
import { SvgIcons } from "constants/svgs";
import Fonts from "constants/Fonts";
import KYCBadge from "tsx-components/KYCBadge";
import moment from "moment";
import {
  captureImageFromCamera,
  pickImageFromGallery,
  PickedImageFile,
} from "utils/ImagePicker";
import { fileToBase64 } from "utils/fileToBase64";
import type { IProfileHeaderProps, ImagePickerSource } from "./types";
import { useAppLock } from "hooks/useAppLock";

const IMAGE_BASE_URL = "https://app.payairo.com";

// Error codes from react-native-image-crop-picker
const PICKER_ERROR_CODES = {
  CANCELLED: "E_PICKER_CANCELLED",
  NO_CAMERA_PERMISSION: "E_NO_CAMERA_PERMISSION",
  NO_LIBRARY_PERMISSION: "E_NO_LIBRARY_PERMISSION",
  PERMISSION_DENIED: "E_PERMISSION_MISSING",
  PERMISSION_MISSING_CAMERA: "E_PERMISSION_MISSING_CAMERA",
} as const;

/**
 * Opens device settings for the app
 */
const openAppSettings = (): void => {
  if (Platform.OS === "ios") {
    Linking.openURL("app-settings:");
  } else {
    Linking.openSettings();
  }
};

/**
 * Shows permission denied alert with option to open settings
 */
const showPermissionDeniedAlert = (
  permissionType: "camera" | "photo_library"
): void => {
  const permissionName = permissionType === "camera" ? "Camera" : "Photo Library";
  Alert.alert(
    `${permissionName} Access Required`,
    `Please enable ${permissionName.toLowerCase()} access in your device settings to ${
      permissionType === "camera" ? "take photos" : "select photos"
    }.`,
    [
      { text: "Cancel", style: "cancel" },
      { text: "Open Settings", onPress: openAppSettings },
    ]
  );
};

/**
 * Handles image picker errors and returns appropriate error message
 */
const handlePickerError = (error: any): string | null => {
  const errorCode = error?.code || "";
  const errorMessage = error?.message || "";

  // User cancelled - not an error to report
  if (errorCode === PICKER_ERROR_CODES.CANCELLED) {
    return null;
  }

  // Camera permission denied
  if (
    errorCode === PICKER_ERROR_CODES.NO_CAMERA_PERMISSION ||
    errorCode === PICKER_ERROR_CODES.PERMISSION_MISSING_CAMERA ||
    errorMessage.toLowerCase().includes("camera permission")
  ) {
    showPermissionDeniedAlert("camera");
    return "Camera permission denied";
  }

  // Photo library permission denied
  if (
    errorCode === PICKER_ERROR_CODES.NO_LIBRARY_PERMISSION ||
    errorCode === PICKER_ERROR_CODES.PERMISSION_DENIED ||
    errorMessage.toLowerCase().includes("photo") ||
    errorMessage.toLowerCase().includes("library")
  ) {
    showPermissionDeniedAlert("photo_library");
    return "Photo library permission denied";
  }

  // Generic error
  console.error("Image picker error:", error);
  return errorMessage || "Failed to select image. Please try again.";
};

const ProfileHeader: FC<IProfileHeaderProps> = ({
  walletData,
  kycStep,
  kycBadgeStatus,
  kycMode,
  onStartKyc,
  isKycPending,
  onProfilePress,
  onQrPress,
  containerStyle,
  imageBaseUrl = IMAGE_BASE_URL,
  showKycButton: showKycButtonProp,
  showQrButton: showQrButtonProp = true,
  onProfileImageSelected,
  onImagePickerError,
  isUploadingImage = false,
  showCameraButton: showCameraButtonProp = true,
}) => {
  const { theme } = useTheme();
  const styles = getStyles();
  const [isPickerActive, setIsPickerActive] = useState(false);
  const [localPreviewUri, setLocalPreviewUri] = useState<string | null>(null);
  const [isImageViewerVisible, setIsImageViewerVisible] = useState(false);

  const { setNativeModalVisible} = useAppLock()


  const showKycButton =
    showKycButtonProp !== false && kycMode === "not_started";

  // Priority: local preview > profile_photo from API > KYC selfie image
  // Check if profile_photo exists and is a non-empty string
  // Also convert HTTP to HTTPS for iOS ATS compliance
  const rawProfilePhoto = walletData?.profile_photo;
  const profilePhotoUri = 
    rawProfilePhoto && typeof rawProfilePhoto === "string" && rawProfilePhoto.trim() !== ""
      ? rawProfilePhoto.replace(/^http:\/\//i, "https://")
      : null;
  
  const kycImageUri = kycStep?.selfimage
    ? kycStep.selfimage.includes(imageBaseUrl)
      ? kycStep.selfimage
      : `${imageBaseUrl}${kycStep.selfimage}`
    : null;

  const profileImageUri = localPreviewUri || profilePhotoUri || kycImageUri;

  const displayName =
    `${walletData?.name || ""} ${walletData?.last_name || ""}`.trim() || "User";
  const memberSince = walletData?.created_at
    ? moment(walletData.created_at).format("MMM YYYY")
    : moment().format("MMM YYYY");

  /**
   * Processes the picked image and prepares it for API upload
   */
  const processPickedImage = useCallback(
    async (
      pickerFn: () => Promise<PickedImageFile | null>,
      source: ImagePickerSource
    ): Promise<void> => {
      try {
        setIsPickerActive(true);
        const pickedImage = await pickerFn();

        if (!pickedImage) {
          // User cancelled or no image selected
          return;
        }

        // Validate image
        if (!pickedImage.uri || !pickedImage.type) {
          const errorMsg = "Invalid image selected. Please try again.";
          onImagePickerError?.(errorMsg);
          return;
        }

        // Set local preview immediately for instant feedback
        setLocalPreviewUri(pickedImage.uri);

        // Convert to base64 for API upload (iOS & Android compatible)
        const base64 = await fileToBase64(pickedImage);
        console.log("base64 =>", JSON.stringify(base64, null, 2));

        onProfileImageSelected?.({
          file: pickedImage,
          base64,
          source,
        });
      } catch (error: any) {
        const errorMsg = handlePickerError(error);
        if (errorMsg) {
          onImagePickerError?.(errorMsg);
        }
      } finally {
        setIsPickerActive(false);
      }
    },
    [onProfileImageSelected, onImagePickerError]
  );

  /**
   * Handles camera selection
   */
  const handleCameraSelect = useCallback(async (): Promise<void> => {
    // Flag is already set by onCameraPress before Alert was shown
    await processPickedImage(captureImageFromCamera, "camera");
    // Use setTimeout to reset flag after picker is fully dismissed
    // This accounts for app state transitions (active -> inactive -> active)
    setTimeout(() => {
      setNativeModalVisible(false);
    }, 500);
  }, [processPickedImage, setNativeModalVisible]);

  /**
   * Handles gallery selection
   */
  const handleGallerySelect = useCallback(async (): Promise<void> => {
    // Flag is already set by onCameraPress before Alert was shown
    await processPickedImage(pickImageFromGallery, "gallery");
    // Use setTimeout to reset flag after picker is fully dismissed
    // This accounts for app state transitions (active -> inactive -> active)
    setTimeout(() => {
      setNativeModalVisible(false);
    }, 500);
  }, [processPickedImage, setNativeModalVisible]);

  /**
   * Shows action sheet to choose between camera and gallery
   */
  const onCameraPress = useCallback((): void => {
    // Prevent multiple presses while picker is active
    if (isPickerActive || isUploadingImage) {
      return;
    }

    // Set flag before showing Alert (Alert causes app state to go inactive on iOS)
    setNativeModalVisible(true);

    Alert.alert(
      "Update Profile Photo",
      "Choose an option",
      [
        {
          text: "Take Photo",
          onPress: handleCameraSelect,
        },
        {
          text: "Choose from Library",
          onPress: handleGallerySelect,
        },
        {
          text: "Cancel",
          style: "cancel",
          onPress: () => {
            // Reset flag when user cancels without selecting any option
            // Use setTimeout to ensure we don't reset it too early during app state transitions
            setTimeout(() => {
              setNativeModalVisible(false);
            }, 500);
          },
        },
      ],
      { 
        cancelable: true,
        onDismiss: () => {
          // Android: Handle dismissal by tapping outside the alert
          setTimeout(() => {
            setNativeModalVisible(false);
          }, 500);
        },
      }
    );
  }, [isPickerActive, isUploadingImage, handleCameraSelect, handleGallerySelect, setNativeModalVisible]);

  /**
   * Opens image in full screen viewer
   */
  const handleImagePress = useCallback((): void => {
    if (profileImageUri) {
      setIsImageViewerVisible(true);
    }
  }, [profileImageUri]);

  /**
   * Closes full screen image viewer
   */
  const handleCloseImageViewer = useCallback((): void => {
    setIsImageViewerVisible(false);
  }, []);

  const showCameraButton = showCameraButtonProp && !isPickerActive;

  return (
    <>
      {/* Full Screen Image Viewer Modal */}
      <Modal
        visible={isImageViewerVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={handleCloseImageViewer}
      >
        <View style={styles.imageViewerContainer}>
          <TouchableOpacity
            style={styles.imageViewerCloseButton}
            onPress={handleCloseImageViewer}
            activeOpacity={0.8}
          >
            <Text style={styles.imageViewerCloseText}>✕</Text>
          </TouchableOpacity>
          {profileImageUri && (
            <Image
              source={{ uri: profileImageUri }}
              style={styles.fullScreenImage}
              resizeMode="contain"
            />
          )}
        </View>
      </Modal>

      <View
        style={[
          styles.profileHeaderContainer,
          { backgroundColor: theme.colors.palette.green50 },
          containerStyle,
        ]}
      >
        <View style={styles.profileContentRow}>
          {/* Profile Picture Section */}
          <View style={styles.profilePictureContainer}>
            <TouchableOpacity
              onPress={handleImagePress}
              disabled={!profileImageUri}
              style={[
                styles.squircleContainer,
                { backgroundColor: theme.colors.palette.green200 },
              ]}
              activeOpacity={0.7}
            >
              {profileImageUri ? (
                <Image
                  source={{ uri: profileImageUri }}
                  style={styles.profileImage}
                />
              ) : (
                <Text style={styles.profileInitials}>
                  {walletData?.name?.charAt(0)?.toUpperCase() || "?"}
                </Text>
              )}
            </TouchableOpacity>
          {showCameraButton && (
            <TouchableOpacity
              onPress={onCameraPress}
              style={styles.cameraButton}
              disabled={isUploadingImage}
              activeOpacity={0.7}
            >
              {isUploadingImage ? (
                <View style={styles.cameraLoadingContainer}>
                  <ActivityIndicator
                    size="small"
                    color={theme.colors.palette.green600}
                  />
                </View>
              ) : (
                <SvgIcons.AddCamera width={30} height={30} />
              )}
            </TouchableOpacity>
          )}
          <View style={styles.kycBadgeContainer}>
            <KYCBadge status={kycBadgeStatus} />
          </View>
        </View>

        {/* User Information Section */}
        <View style={styles.userInfoContainer}>
          <CustomText variant="h2" fontWeight="semiBold">
            {displayName}
          </CustomText>
          <CustomText variant="caption" fontWeight="medium">
            {walletData?.username || "N/A"}
          </CustomText>
          <CustomText variant="caption" fontWeight="medium">
            Member since . {memberSince}
          </CustomText>
        </View>

        {/* QR Code Icon */}
        {showQrButtonProp && (
        <TouchableOpacity onPress={onQrPress} style={styles.qrCodeContainer}>
            <SvgIcons.NewQRCode width={39} height={39} />
          </TouchableOpacity>
        )}
      </View>

      {/* KYC Button */}
      {showKycButton && (
        <View style={[styles.kycButtonContainer, { marginTop: 16 }]}>
          <TouchableOpacity
            style={[
              styles.kycButton,
              { backgroundColor: theme.colors.palette.green600 },
              isKycPending && { opacity: 0.6 },
            ]}
            onPress={onStartKyc}
            disabled={isKycPending}
          >
            <CustomText
              variant="body1"
              fontWeight="semiBold"
              style={styles.kycButtonText}
            >
              {isKycPending ? "Starting KYC..." : "Complete your KYC"}
            </CustomText>
          </TouchableOpacity>
        </View>
      )}
    </View>
    </>
  );
};

export default ProfileHeader;

const getStyles = () =>
  StyleSheet.create({
    profileHeaderContainer: {
      marginHorizontal: 15,
      marginBottom: 10,
      marginTop: 10,
      paddingVertical: 20,
      paddingHorizontal: 15,
      borderRadius: 16,
    },
    cameraButton: {
      position: "absolute",
      bottom: 25,
      right: -10,
    },
    cameraLoadingContainer: {
      width: 30,
      height: 30,
      borderRadius: 15,
      backgroundColor: "#FFFFFF",
      justifyContent: "center",
      alignItems: "center",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.2,
      shadowRadius: 2,
      elevation: 3,
    },
    profileContentRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      justifyContent: "space-between",
    },
    profilePictureContainer: {
      alignItems: "flex-start",
    },
    squircleContainer: {
      width: 90,
      height: 90,
      borderRadius: 24,
      justifyContent: "center",
      alignItems: "center",
      overflow: "hidden",
      backgroundColor: "#C8EAD2",
    },
    profileImage: {
      width: "100%",
      height: "100%",
      resizeMode: "cover",
    },
    profileInitials: {
      color: "#000",
      fontSize: 36,
      fontFamily: Fonts.semibold,
    },
    kycBadgeContainer: {
      marginTop: 10,
      alignItems: "flex-start",
    },
    userInfoContainer: {
      flex: 1,
      marginLeft: 12,
      justifyContent: "flex-start",
      paddingTop: 4,
      gap: 4,
    },
    qrCodeContainer: {
      justifyContent: "flex-start",
      alignItems: "center",
      marginLeft: 12,
      paddingTop: 4,
    },
    kycButtonContainer: {
      width: "100%",
      marginTop: 16,
    },
    kycButton: {
      borderRadius: 8,
      paddingVertical: 12,
      paddingHorizontal: 16,
      alignItems: "center",
      justifyContent: "center",
    },
    kycButtonText: {
      color: "#FFFFFF",
    },
    imageViewerContainer: {
      flex: 1,
      backgroundColor: "rgba(0, 0, 0, 0.95)",
      justifyContent: "center",
      alignItems: "center",
    },
    imageViewerCloseButton: {
      position: "absolute",
      top: 50,
      right: 20,
      zIndex: 1,
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: "rgba(255, 255, 255, 0.3)",
      justifyContent: "center",
      alignItems: "center",
    },
    imageViewerCloseText: {
      color: "#FFFFFF",
      fontSize: 24,
      fontWeight: "bold",
    },
    fullScreenImage: {
      width: "100%",
      height: "100%",
    },
  });
