import { queryClient } from "query/queryClient";
import { resetState } from "redux/slices/newBackendAuthSlice";
import { store } from "redux/store";
import { clearAll } from "storage/mmkv";
import { clearBiometric } from "services/Auth";
import FCMService from "services/FCMService";

export const resetAppState = () => {
  // Clear all MMKV data
  clearAll();

  // Clear biometric preference so next user does not inherit previous user's setting
  clearBiometric().catch(() => {});

  // Dispatch Redux reset
  store.dispatch(resetState());

  // Clear all query cache
  queryClient.clear(); // Clears query cache

  // Clear FCM service cache (for token tracking)
  FCMService.getInstance().clearCache();
};

export const defaultImage = require("../../assets/images/Default_Image.webp");
export const defaultCrypto = require("../../assets/images/default_crypto.png");

export const NotificationIcons = {
  "New Payairo coin Request": `<svg width="52" height="52" viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg">
<rect width="52" height="52" rx="26" fill="#D6D6D6"/>
<path d="M23.5 27.7502C23.5 28.7202 24.25 29.5002 25.17 29.5002H27.05C27.85 29.5002 28.5 28.8202 28.5 27.9702C28.5 27.0602 28.1 26.7302 27.51 26.5202L24.5 25.4702C23.91 25.2602 23.51 24.9402 23.51 24.0202C23.51 23.1802 24.16 22.4902 24.96 22.4902H26.84C27.76 22.4902 28.51 23.2702 28.51 24.2402" stroke="#1D1D1D" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M26 21.5V30.5" stroke="#1D1D1D" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M36 26C36 31.52 31.52 36 26 36C20.48 36 16 31.52 16 26C16 20.48 20.48 16 26 16" stroke="#1D1D1D" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M31 17V21H35" stroke="#1D1D1D" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M36 16L31 21" stroke="#1D1D1D" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
`,
  "Payment sent successfully": `
  <svg width="52" height="52" viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg">
<rect width="52" height="52" rx="26" fill="#E2F1E3"/>
<path d="M36 25.0799V25.9999C35.9988 28.1563 35.3005 30.2545 34.0093 31.9817C32.7182 33.7088 30.9033 34.9723 28.8354 35.5838C26.7674 36.1952 24.5573 36.1218 22.5345 35.3744C20.5117 34.6271 18.7847 33.246 17.611 31.4369C16.4373 29.6279 15.8798 27.4879 16.0217 25.3362C16.1636 23.1844 16.9972 21.1362 18.3983 19.4969C19.7994 17.8577 21.6928 16.7152 23.7962 16.24C25.8996 15.7648 28.1003 15.9822 30.07 16.8599" stroke="#2BA31C" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M36 18L26 28.01L23 25.01" stroke="#2BA31C" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
`,
  "Payairo Coin Cancelled Transaction": `<svg width="52" height="52" viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg">
<rect width="52" height="52" rx="26" fill="#FFE0E0"/>
<path d="M26 36C31.5228 36 36 31.5228 36 26C36 20.4772 31.5228 16 26 16C20.4772 16 16 20.4772 16 26C16 31.5228 20.4772 36 26 36Z" stroke="#A31C1C" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M18.9004 18.9004L33.1004 33.1004" stroke="#A31C1C" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
`,
  "New Payment Request": `
<svg width="52" height="52" viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg">
<rect width="52" height="52" rx="26" fill="#D6D6D6"/>
<path d="M23.5 27.7502C23.5 28.7202 24.25 29.5002 25.17 29.5002H27.05C27.85 29.5002 28.5 28.8202 28.5 27.9702C28.5 27.0602 28.1 26.7302 27.51 26.5202L24.5 25.4702C23.91 25.2602 23.51 24.9402 23.51 24.0202C23.51 23.1802 24.16 22.4902 24.96 22.4902H26.84C27.76 22.4902 28.51 23.2702 28.51 24.2402" stroke="#1D1D1D" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M26 21.5V30.5" stroke="#1D1D1D" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M36 26C36 31.52 31.52 36 26 36C20.48 36 16 31.52 16 26C16 20.48 20.48 16 26 16" stroke="#1D1D1D" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M31 17V21H35" stroke="#1D1D1D" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M36 16L31 21" stroke="#1D1D1D" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
`,
};
