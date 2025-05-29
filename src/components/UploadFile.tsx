import React, { useState } from "react";
import { View } from "react-native";
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
import { SVGUpload } from "../constants/images";
import {
  askCameraPremission,
  checkCameraPremission,
} from "../helper/Permission";
import useDispatchAction from "../hooks/useDispatchAction";
import {
  setErrorMsg,
  setSuccessMsg,
} from "../redux/slices/authenticationSlice";
import GalleryModal from "./GalaryModal";
import { FileObject, UploadFileProps } from "./types";
import { useTheme } from "styles";

export default function UploadFile({
  selectedFile,
  value,
  placeholder,
  label,
  type,
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
        useDispatchAction(setErrorMsg("File Size should be less than 2MB"));
      } else {
        selectedFile(result);
        useDispatchAction(setSuccessMsg("File Uploaded Successfully"));
      }
    } catch (error) {
      if (!DocumentPicker.isCancel(error)) {
        useDispatchAction(setErrorMsg("Error picking document"));
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
    <View>
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

      <View
        style={{
          borderRadius: 30,
          borderWidth: 1,
          borderColor: "#6A6A6A33",
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          paddingVertical: 5,
        }}
      >
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

        <SvgXml
          xml={SVGUpload}
          style={{ marginRight: 9 }}
          onPress={() =>
            type === "image" ? setIsVisible(true) : handleUpload()
          }
        />
      </View>
    </View>
  );
}
