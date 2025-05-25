import ImagePicker, {
  Image as PickerImage,
} from "react-native-image-crop-picker";

export interface PickedImageFile {
  fileCopyUri: string | null;
  name: string;
  size: number;
  height: number;
  originalPath: string;
  type: string;
  uri: string;
}

/**
 * Prepares a file object from ImagePicker response
 * @param image - Image object from react-native-image-crop-picker
 * @param source - 'gallery' or 'camera'
 * @returns A formatted file object
 */
const prepareFileObject = (
  image: PickerImage,
  source: "gallery" | "camera"
): PickedImageFile => {
  return {
    fileCopyUri: null,
    name: image.filename || `${source}_${Date.now()}.jpg`,
    size: image.size,
    height: image.height,
    originalPath: image.path,
    type: image.mime,
    uri: image.path,
  };
};

/**
 * Opens gallery and allows user to pick and crop an image.
 * @returns A file object or null if cancelled or error occurs
 */
export const pickImageFromGallery =
  async (): Promise<PickedImageFile | null> => {
    console.log("step 1");
    try {
      const image = await ImagePicker.openPicker({
        mediaType: "photo",
        // cropping: true,
        compressImageQuality: 0.8,
      });
      console.log("step 2");
      if (!image || !image.path) {
        console.warn("No image selected.");
        return null;
      }

      return prepareFileObject(image, "gallery");
    } catch (error: any) {
      if (error.code === "E_PICKER_CANCELLED") {
        console.log("User cancelled gallery picker");
      } else {
        console.error(
          "pickImageFromGallery error:",
          JSON.stringify(error, null, 2)
        );
      }
      return null;
    }
  };

/**
 * Opens camera and allows user to capture and crop an image.
 * @returns A file object or null if cancelled or error occurs
 */
export const captureImageFromCamera =
  async (): Promise<PickedImageFile | null> => {
    try {
      const image = await ImagePicker.openCamera({
        mediaType: "photo",
        // cropping: true,
        compressImageQuality: 0.8,
      });

      if (!image || !image.path) {
        console.warn("No image captured.");
        return null;
      }

      return prepareFileObject(image, "camera");
    } catch (error: any) {
      if (error.code === "E_PICKER_CANCELLED") {
        console.log("User cancelled camera");
      } else {
        console.error(
          "captureImageFromCamera error:",
          JSON.stringify(error, null, 2)
        );
      }
      return null;
    }
  };
