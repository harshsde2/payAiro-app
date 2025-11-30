import React, { useState } from "react";
import { View, TouchableOpacity } from "react-native";
import DocumentPicker, {
  DocumentPickerResponse,
} from "react-native-document-picker";
import { SvgXml } from "react-native-svg";
import { CustomText } from "tsx-components";
import {
  captureImageFromCamera,
  pickImageFromGallery,
} from "utils/ImagePicker";
import Fonts from "../constants/Fonts";
import {
  askCameraPremission,
  checkCameraPremission,
} from "../helper/Permission";
import { showError, showSuccess } from "../utils/toast";
import GalleryModal from "./GalaryModal";
import { FileObject, UploadFileProps } from "./types";
import { useTheme } from "styles";
import { SvgIcons } from "constants/svgs";

export default function UploadFile({
  selectedFile,
  value,
  placeholder,
  label,
  type,
  style,
  boxStyle,
  children,
}: UploadFileProps) {
  const maxFileSize = 2 * 1024 * 1024; // 2 MB in bytes
  const [selfie, setSelfie] = useState<FileObject | null>(null);
  const [isVisible, setIsVisible] = useState<boolean>(false);

  const { theme } = useTheme();

  const chooseImages = async () => {
    const file = await pickImageFromGallery();
    if (file) {
      setSelfie(file);
      selectedFile([file]);
    }
    setIsVisible(false);
  };

  const handleUpload = async () => {
    try {
      const result: DocumentPickerResponse[] = (await DocumentPicker.pick({
        type: [
          DocumentPicker.types.pdf,
          DocumentPicker.types.doc,
          DocumentPicker.types.docx,
        ],
      })) as any;
      if ((result[0] as any).size > maxFileSize) {
        showError("File Size should be less than 2MB");
      } else {
        selectedFile(result);
        showSuccess("File Uploaded Successfully");
      }
    } catch (error) {
      if (!DocumentPicker.isCancel(error)) {
        showError("Error picking document");
      }
    }
  };

  const openCameras = async () => {
    const file = await captureImageFromCamera();
    if (file) {
      setSelfie(file);
      selectedFile([file]);
    }
    setIsVisible(false);
  };

  const checkCam = () => {
    checkCameraPremission()
      .then((res) => {
        if (res) {
          openCameras();
        } else {
          askCameraPremission()
            .then((res) => {
              if (res) {
                openCameras();
              }
            })
            .catch(() => {});
        }
      })
      .catch(() => {});
  };

  return (
    <View style={style}>
      <GalleryModal
        isVisible={isVisible}
        onConfirm={(e: string) => {
          if (e === "gallery") {
            chooseImages();
          } else {
            checkCam();
          }
        }}
        onClose={() => setIsVisible(false)}
      />

      <CustomText
        variant={"body2"}
        style={{ fontFamily: Fonts.semibold, padding: 10 }}
      >
        {label}
      </CustomText>

      <TouchableOpacity
        activeOpacity={children ? 0.7 : 1}
        onPress={() => {
          if (children) {
            type === "image" ? setIsVisible(true) : handleUpload();
          }
        }}
        style={[
          {
            borderRadius: 30,
            borderWidth: 1,
            borderColor: "#6A6A6A33",
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            paddingVertical: 5,
          },
          boxStyle,
        ]}
      >
        {children ? (
          children
        ) : (
          <>
            <CustomText
              numberOfLines={1}
              variant={"body2"}
              style={{
                paddingRight: 10,
                paddingLeft: 15,
                flex: 1,
                // width: "10%",
              }}
            >
              {value
                ? value
                : type === "image"
                ? "Tap to upload (.png,.jpg)"
                : "Tap to upload (.pdf)"}
            </CustomText>
            <View
              style={{
                padding: 10,
                backgroundColor: theme.colors.palette.grey200,
                borderRadius: 50,
              }}
            >
              <SvgIcons.UploadIcon width={20} height={20} />
            </View>
          </>
        )}
      </TouchableOpacity>
    </View>
  );
}
