import { queryClient } from "query/queryClient";
import { resetState } from "redux/slices/authenticationSlice";
import { store } from "redux/store";
import { clearAll } from "storage/mmkv";

export const resetAppState = () => {
  // Clear all MMKV data
  clearAll();

  // Dispatch Redux reset
  store.dispatch(resetState());

  // Clear all query cache
  queryClient.clear(); // Clears query cache
};

export const defaultImage = require("../../assets/images/Default_Image.webp");
export const defaultCrypto = require("../../assets/images/default_crypto.png");
