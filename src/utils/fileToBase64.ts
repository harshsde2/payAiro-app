import RNFS from "react-native-fs";
import type { PickedImageFile } from "./ImagePicker";

/**
 * Normalizes file URI to a path suitable for RNFS on iOS and Android.
 * Strips "file://" prefix when present. Content URIs are not supported.
 */
const toFSPath = (uri: string): string => {
  const trimmed = uri.trim();
  if (trimmed.startsWith("file://")) {
    return trimmed.replace("file://", "");
  }
  return trimmed;
};

/**
 * Reads an image file and returns its base64 string.
 * Handles iOS and Android paths (file://, raw path).
 * Use for profile photo upload API that expects base64.
 *
 * @param file - Picked image from camera/gallery (ImagePicker)
 * @returns Base64 string (no data URI prefix)
 * @throws Error if file cannot be read
 */
export const fileToBase64 = async (file: PickedImageFile): Promise<string> => {
  const path = toFSPath(file.uri);
  const base64 = await RNFS.readFile(path, "base64");
  return base64;
};
