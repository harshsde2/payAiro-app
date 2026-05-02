import { useNavigation } from "@react-navigation/native";
import React, { useMemo, useRef, useState } from "react";
import { TouchableOpacity, Text, View } from "react-native";
import { SvgXml } from "react-native-svg";
import { useDispatch, useSelector } from "react-redux";

import LogoutModal from "components/LogoutModal";
import { ProfileHeader } from "components/common-components/ProfileHeader";
import Fonts from "constants/Fonts";
import { SETTINGS_LISTS } from "constants/constant";
import { SVGRightIcon } from "constants/images";
import useDispatchAction from "hooks/useDispatchAction";
import { NAVIGATION_SCREENS } from "navigations/navigationConstants";
import { useUploadProfilePhoto } from "query/hooks";
import { resetAnimationState } from "redux/slices/animationSlice";
import { setLogin } from "redux/slices/newBackendAuthSlice";
import { resetOnboardingState } from "redux/slices/newOnboardingSlice";
import {
  setKYCAcceopted,
  setPin,
  setWalletDataAuth,
} from "services/Auth";
import { onUserLoggedOut as onCoinmeUserLoggedOut } from "services/coinmeRiskLifecycle";
import { clearAll } from "storage/mmkv";
import TermAndConditionModal from "tsx-components/modals/TermAndConditionModal";
import { toKycMode } from "types/kyc";
import { resetAppState } from "utils/configs";
import { showError, showSuccess } from "utils/toast";
import ScreenWrapper from "@new-ui/components/common-components/ScreenWrapper";
import type { IProfileImagePayload } from "components/common-components/ProfileHeader/types";
import type { KycMode } from "types/kyc";
import { AppIcon } from "new-ui/assets/svgs";

type RootState = {
  authenticationSlice: {
    userData?: Record<string, any> | null;
    usersMe?: Record<string, any> | null;
    walletData?: Record<string, any> | null;
    kycStatus?: Record<string, any> | null;
  };
};

export default function SettingScreen() {
  const navigation = useNavigation<any>();
  const dispatch = useDispatch();
  const [isVisible, setIsVisible] = useState(false);
  const { userData, usersMe, walletData, kycStatus } = useSelector(
    (s: RootState) => s.authenticationSlice
  );

  const profileWalletData = useMemo(() => {
    const u = userData || {};
    const profile = (usersMe as any)?.profile || {};
    const w = walletData || {};
    const name = u.first_name ?? u.name ?? w.name ?? "";
    const lastName = u.last_name ?? w.last_name ?? "";
    return {
      name,
      last_name: lastName,
      username: u.username ?? w.username ?? "",
      account_email: u.email ?? w.account_email ?? "",
      account_number: w.account_number,
      created_at: u.date_joined ?? w.created_at,
      profile_photo:
        profile.avatar_url ?? u.profile_photo ?? w.profile_photo ?? null,
    };
  }, [userData, usersMe, walletData]);

  const kycForMode = useMemo(() => {
    const st = (usersMe as any)?.kyc?.status;
    if (st != null && String(st).length > 0) {
      return { kyc_status: String(st) };
    }
    return kycStatus;
  }, [usersMe, kycStatus]);

  const mode = useMemo(() => toKycMode(kycForMode), [kycForMode]);

  const kycSettingsRowVerified = useMemo(() => {
    const st = (usersMe as any)?.kyc?.status?.toLowerCase?.();
    return st === "approved" || st === "succeeded" || st === "completed";
  }, [usersMe]);

  const { mutate: uploadProfilePhoto, isPending: isUploadingImage } =
    useUploadProfilePhoto();

  const getKycBadgeStatus = (kycMode: KycMode) => {
    switch (kycMode) {
      case "approved":
        return "Verified" as const;
      case "pending":
      case "not_started":
      case "unknown":
        return "Pending" as const;
      case "expired":
        return "Rejected" as const;
      default:
        return "Pending" as const;
    }
  };

  const termsAndConditionRef = useRef<any>(null);

  const handleLogout = async () => {
    // Release Coinme Risk engine state before clearing storage so the SDK
    // doesn't keep pointing at the now-logged-out user.
    await onCoinmeUserLoggedOut();

    resetAppState();
    dispatch(resetOnboardingState());
    dispatch(resetAnimationState());
    setWalletDataAuth(null);
    setPin(null);
    setKYCAcceopted(null);
    clearAll();

    setTimeout(() => {
      useDispatchAction(setLogin(false));
    }, 100);
  };

  const handleProfileImageSelected = (payload: IProfileImagePayload) => {
    const formData = new FormData();
    formData.append("profile_photo", {
      uri: payload.file.uri,
      type: payload.file.type || "image/jpeg",
      name: payload.file.fileName || "profile_photo.jpg",
    } as any);

    uploadProfilePhoto(formData as any, {
      onSuccess: () => {
        showSuccess("Profile photo updated");
      },
      onError: () => {
        showError("Failed to upload profile photo");
      },
    });
  };

  const handleImagePickerError = (msg: string) => {
    showError(msg || "Failed to select image");
  };

  return (
    <ScreenWrapper
      safeArea
      safeAreaEdges={["bottom","top"]}
      scrollable
      contentStyle={{ flexGrow: 1 }}
      padding={0}
    >
      <LogoutModal
        isVisible={isVisible}
        onCancel={() => setIsVisible(false)}
        onClose={() => {
          setIsVisible(false);
          setTimeout(() => {
            handleLogout();
          }, 300);
        }}
      />
      <TermAndConditionModal isAgree={false} ref={termsAndConditionRef} />

      <ProfileHeader
        walletData={profileWalletData}
        kycStep={null}
        kycBadgeStatus={getKycBadgeStatus(mode)}
        kycMode={mode}
        showKycButton={false}
        onProfilePress={() =>
          navigation.navigate(NAVIGATION_SCREENS.NEW_PERSONAL)
        }
        onQrPress={() => navigation.navigate(NAVIGATION_SCREENS.NEW_PERSONAL)}
        onProfileImageSelected={handleProfileImageSelected}
        onImagePickerError={handleImagePickerError}
        isUploadingImage={isUploadingImage}
        showCameraButton={false}
      />

      <View
        style={{
          flex: 1,
          backgroundColor: "#fff",
          borderTopEndRadius: 32,
          borderTopStartRadius: 32,
          paddingVertical: 20,
          paddingHorizontal: 10,
        }}
      >
        {SETTINGS_LISTS.map((item: any, index: number) => {
          if (
            item.name === "Cybrid User Agreement" &&
            walletData?.fortress === true
          ) {
            return null;
          }
          return (
            <TouchableOpacity
              key={`setting-${index}`}
              disabled={item.isDisvled}
              onPress={() => {
                if (item.name === "Logout") {
                  setIsVisible(true);
                  return;
                } else if (item.webUrl) {
                  termsAndConditionRef.current?.showWebDocument?.(
                    item.name,
                    item.webUrl
                  );
                  return;
                }
                navigation.navigate(item.route);
              }}
              style={{
                borderRadius: 40,
                borderWidth: 1,
                backgroundColor: "rgba(217, 217, 217, 0.07)",
                borderColor: "rgba(106, 106, 106, 0.08)",
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginVertical: 5,
                marginBottom: item.name === "Logout" ? 100 : 5,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "flex-start",
                  alignItems: "center",
                  margin: 5,
                }}
              >
                {item.icon}
                <Text
                  style={{
                    color: "rgba(29, 29, 29, 1)",
                    marginLeft: 10,
                    fontSize: 16,
                    fontFamily: Fonts.regular,
                  }}
                >
                  {item.name}
                </Text>
              </View>
              <AppIcon.ChevronRight width={20} height={20} />
            </TouchableOpacity>
          );
        })}
      </View>
    </ScreenWrapper>
  );
}
