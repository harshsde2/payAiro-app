import React, { useRef } from "react";
import { Button, View } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { ScreenContainer } from "HOC";
import HeaderTitle from "components/HeaderTitle";
import WebView from "react-native-webview";
import { Card, CustomText } from "tsx-components";
import { useGlobalStyles } from "styles/GlobalStyles";
import GenericButton from "components/GenericButton";
import { useCreatePin, useKYCCompleted, useWalletDetails } from "query/hooks";
import { useDispatch } from "react-redux";
import {
  setErrorMsg,
  setLogin,
  setShowLoader,
  setSuccessMsg,
  setWalletData,
} from "redux/slices/authenticationSlice";
import { setWalletDataAuth } from "services/Auth";
import { setItem, setPin, STORAGE_KEYS } from "storage/mmkv";
import PinScreen from "tsx-components/modals/PinScreen";
import { PinScreenRef } from "tsx-components/modals/modal.types";
import useDispatchAction from "hooks/useDispatchAction";

const CybridWebView = () => {
  const route = useRoute();
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const pinScreenRef = useRef<PinScreenRef | any>();
  const { URL } = route.params as any;
  const globalStyles = useGlobalStyles();
  const webviewRef = useRef(null);
  const [isKycCompleted, setIsKycCompleted] = React.useState(false);
  const [isKYCInProgress, setIsKYCInProgress] = React.useState(true);

  const { mutate: checkKYCStatus, isPending, isSuccess } = useKYCCompleted();
  const {
    mutate: handlPinCreation,
    isPending: isPendingCreatePin,
    isSuccess: isSuccessCreatePin,
  } = useCreatePin();

  const {
    data: data,
    isLoading: isPendingWalletDetails,
    isSuccess: isSuccessWalletDetails,
    isError: isErrorWalletDetails,
    refetch: refetchWalletDetails,
  } = useWalletDetails();

  const yourCustomFunction = () => {
    console.log("✅ KYC completed! Calling your custom function...");
    setIsKycCompleted(true);
    handleCreatePin();
    // Add your logic here, like:
    // navigation.navigate("NextScreen");
    // or update state, call an API, etc.
  };

  const getWalletDetails = async () => {
    dispatch(setShowLoader(true));
    await refetchWalletDetails();
    if (isSuccessWalletDetails) {
      dispatch(setShowLoader(false));
      console.log(data);
      dispatch(setWalletData(data?.data));
      setWalletDataAuth(data?.data);
      setItem(STORAGE_KEYS.WALLET_DATA, JSON.stringify(data?.data));
      dispatch(setLogin(true));
      dispatch(setSuccessMsg("Create Account Successfully"));
    }
  };

  const handleKYCCheck = async () => {
    checkKYCStatus({} as any, {
      onSuccess: (data) => {
        console.log("KYC Status:", JSON.stringify(data, null, 2));
        if (data?.data.status === true) {
          setIsKYCInProgress(false);
        } else if (data?.data.status === false) {
          //   setIsKycCompleted(false);
          dispatch(setErrorMsg(data?.data?.message || "KYC not completed"));
        }
      },
      onError: (error) => {
        dispatch(
          setErrorMsg(
            error?.response?.data?.data?.message || "KYC not completed"
          )
        );
      },
    });
  };

  const handleCreatePin = () => {
    if (pinScreenRef.current) {
      pinScreenRef.current.setUserPin();
    }
  };

  const handleSetUserPin = (pin: any) => {
    console.log("Pin entered:", pin);
    if (pin.length < 4) {
      dispatch(setErrorMsg("Pin should be 4 digit"));
      return;
    }
    const formData = new FormData();
    formData.append("tpin", pin);

    useDispatchAction(setShowLoader(true));

    handlPinCreation(formData as any, {
      onSuccess: (data) => {
        if (data && data?.status) {
          console.log("handlPinCreation => ✅");
          setPin(pin);
          dispatch(setSuccessMsg("Transaction Pin created successfully"));
          //   handleKYCCheck();
          // getWalletDetails();
          // navigation.navigate("SuccesScreen");
        } else {
          dispatch(setErrorMsg("Something Went Wrong"));
        }
      },
      onError: (error: any) => {
        console.log("Error creating pin:", error);
        dispatch(
          setErrorMsg(Object.values(error?.data?.data?.details?.errors)[0]) ??
            "Something went wrong"
        );
      },
      onSettled: () => {
        dispatch(setShowLoader(false));
      },
    });
  };
  const injectedJS = `
    const observer = new MutationObserver(() => {
      const content = document.body.innerText;
      if (content.includes("Congratulations, you’re done!")) {
        window.ReactNativeWebView.postMessage("KYC_SUCCESS");
        observer.disconnect(); // Stop observing after success
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
    true;
  `;

  return (
    <ScreenContainer padding={0}>
      <HeaderTitle
        // isBack={true}
        title="Complete your KYC"
        // leftIcon={"true"}
        onPressLeft={() => navigation.goBack()}
      />
      <PinScreen
        ref={pinScreenRef}
        onAction={(pin) => {
          handleSetUserPin(pin);
        }}
      />
      <Card
        style={[globalStyles.whiteSheetContainer, { flex: 1, marginTop: 10 }]}
      >
        {!isKycCompleted ? (
          <WebView
            ref={webviewRef}
            source={{ uri: URL }}
            injectedJavaScript={injectedJS}
            onMessage={(event) => {
              if (event.nativeEvent.data === "KYC_SUCCESS") {
                yourCustomFunction();
              }
            }}
            javaScriptEnabled={true}
            style={{ flex: 1 }}
          />
        ) : (
          <View
            style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
          >
            {isKYCInProgress ? (
              <CustomText
                variant="subtitle1"
                color={"red"}
                style={{ textAlign: "center", flex: 1, marginBottom: 20 }}
              >
                Please do not close this page. Untill KYC is completed. To make
                sure KYC is completed, you can click on the refresh button.
              </CustomText>
            ) : (
              <CustomText
                variant="subtitle1"
                color={isKYCInProgress ? "red" : "green"}
                style={{ textAlign: "center", flex: 1, marginBottom: 20 }}
              >
                KYC has been completed successfully.
              </CustomText>
            )}
            <CustomText variant="h2">
              KYC is in {isKYCInProgress ? "progress..." : "completed"}
            </CustomText>
            <CustomText variant="caption" style={{ marginTop: 10 }}>
              Please wait while we complete your KYC process.(This may take a
              few minutes)
            </CustomText>

            <GenericButton
              cStyle={{ marginTop: 20 }}
              title={isKYCInProgress ? "Refresh" : "Done"}
              onPress={() => {
                if (isKYCInProgress) {
                  handleKYCCheck();
                } else {
                  getWalletDetails();
                }
              }}
              showLoader={true}
              isLoading={isPending}
            />
          </View>
        )}
      </Card>
    </ScreenContainer>
  );
};

export default CybridWebView;
