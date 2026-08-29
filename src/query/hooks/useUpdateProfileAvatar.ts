import { useMutation } from "@tanstack/react-query";
import { userApiClient } from "api/userApiClient";
import { USER_AUTH } from "api/endpoints";
import { queryClient } from "query/queryClient";
import { usersMeKeys } from "query/hooks/useUsersMe";

export type ProfileAvatarFile = {
  uri: string;
  name?: string;
  type?: string;
};

export interface ProfileAvatarResponse {
  ok?: boolean;
  status?: boolean;
  message?: string;
  data?: unknown;
}

/** Extensions the backend accepts (it validates the uploaded filename's extension). */
const ALLOWED_EXTENSIONS = ["jpg", "jpeg", "png", "webp", "gif"] as const;

/**
 * iOS returns the ORIGINAL asset filename (often `IMG_1234.HEIC`) even when the cropped
 * output is JPEG, which the backend rejects with "Only jpg, jpeg, png, webp, gif allowed."
 * Derive a safe name/mime from the real output path + mime instead of trusting `name`.
 */
const normalizeImageUpload = (file: ProfileAvatarFile) => {
  const pathExt = (file.uri.split("?")[0].split(".").pop() || "").toLowerCase();
  const mime = (file.type || "").toLowerCase();

  let ext: string = ALLOWED_EXTENSIONS.includes(pathExt as never) ? pathExt : "";
  if (!ext) {
    if (mime.includes("png")) ext = "png";
    else if (mime.includes("webp")) ext = "webp";
    else if (mime.includes("gif")) ext = "gif";
    else ext = "jpg"; // HEIC/HEIF and unknowns — the picker is told to output JPEG.
  }

  const base = (file.name || "avatar").replace(/\.[^./\\]+$/, "") || "avatar";
  return {
    uri: file.uri,
    name: `${base}.${ext}`,
    type: ext === "jpg" || ext === "jpeg" ? "image/jpeg" : `image/${ext}`,
  };
};

/**
 * Upload/replace the signed-in user's profile avatar via multipart
 * `POST /api/v1/users/profile/avatar/` (field `image`). Bearer auth is injected by
 * `userApiClient`. On success it invalidates the `/users/me` query so the new avatar
 * re-hydrates into Redux (`useHydrateUsersMe`) and the profile/dashboard update.
 */
export const useUpdateProfileAvatar = () =>
  useMutation<ProfileAvatarResponse, Error, ProfileAvatarFile>({
    mutationFn: async (file) => {
      const safeFile = normalizeImageUpload(file);
      const form = new FormData();
      form.append("image", {
        uri: safeFile.uri,
        name: safeFile.name,
        type: safeFile.type,
        // RN FormData file shape.
      } as unknown as Blob);
      return userApiClient.post<ProfileAvatarResponse>(
        USER_AUTH.PROFILE_AVATAR,
        form,
        true
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: usersMeKeys.me });
    },
  });

export default useUpdateProfileAvatar;
