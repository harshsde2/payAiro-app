import { useMutation } from "@tanstack/react-query";
import { userApiClient } from "api/userApiClient";
import { USER_AUTH } from "api/endpoints";

export type GuestQueryAttachment = {
  uri: string;
  name?: string;
  type?: string;
};

export interface GuestQueryPayload {
  firstName: string;
  lastName: string;
  email: string;
  /** Maps to `reason` (Account Recovery → category; Email Support → subject). */
  reason: string;
  description: string;
  attachment?: GuestQueryAttachment | null;
}

export interface GuestQueryResponse {
  ok?: boolean;
  status?: boolean;
  message?: string;
  data?: unknown;
}

/**
 * Submit the unauthenticated support / account-recovery form to
 * `POST /api/v1/users/guest-query/` (multipart). Same endpoint for both screen modes;
 * only the labels/content differ. Works without a session (guest).
 */
export const useSubmitGuestQuery = () =>
  useMutation<GuestQueryResponse, Error, GuestQueryPayload>({
    mutationFn: async (payload) => {
      const form = new FormData();
      form.append("first_name", payload.firstName.trim());
      form.append("last_name", payload.lastName.trim());
      form.append("email", payload.email.trim());
      form.append("reason", payload.reason.trim());
      form.append("description", payload.description.trim());
      if (payload.attachment?.uri) {
        form.append("attachment", {
          uri: payload.attachment.uri,
          name: payload.attachment.name || "attachment.jpg",
          type: payload.attachment.type || "image/jpeg",
          // RN FormData file shape.
        } as unknown as Blob);
      }
      return userApiClient.post<GuestQueryResponse>(
        USER_AUTH.GUEST_QUERY,
        form,
        true
      );
    },
  });

export default useSubmitGuestQuery;
