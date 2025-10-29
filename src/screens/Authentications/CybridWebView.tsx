import React, { useRef } from "react";
import { Button, View } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { ScreenContainer } from "HOC";
import HeaderTitle from "components/HeaderTitle";
import WebView from "react-native-webview";
import { Card, CustomText } from "tsx-components";
import { useGlobalStyles } from "styles/GlobalStyles";
import GenericButton from "components/GenericButton";
import {
  useCreatePin,
  useKYCCompleted,
  useKYCStatus,
  useWalletDetails,
} from "query/hooks";
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
import LottieView from "lottie-react-native";
import useSelectorAction from "hooks/useSelectorAction";

const CybridWebView = () => {
  const route = useRoute();
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const pinScreenRef = useRef<PinScreenRef | any>();
  const { URL, isUserAlreadyCreated } = route.params as any;

  const globalStyles = useGlobalStyles();
  const webviewRef = useRef(null);
  const [isKycCompleted, setIsKycCompleted] = React.useState(
    isUserAlreadyCreated || false
  );
  const [isKYCInProgress, setIsKYCInProgress] = React.useState(true);
  const [KYCMessage, setKYCMessage] = React.useState("");

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

        if (data?.status === true) {
          setIsKYCInProgress(false);
        } else if (data?.status === false) {
          //   setIsKycCompleted(false);
          setKYCMessage(data?.message);
          dispatch(setErrorMsg(data?.toast_message || "KYC not completed"));
        }
      },
      onError: (error: any) => {
        console.log("error ->", JSON.stringify(error?.response, null, 2));
        dispatch(
          setErrorMsg(
            error?.response?.data?.toast_message || "KYC not completed"
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

  // console.log("kuc status ->", JSON.stringify(kycStatus,null,2));

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
            <View
              style={{
                width: "100%",
                minHeight: 150,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              {isKYCInProgress ? (
                <CustomText
                  variant="subtitle1"
                  color={"red"}
                  style={{ textAlign: "center", flex: 1, marginBottom: 20 }}
                >
                  {KYCMessage
                    ? KYCMessage
                    : `Your KYC is currently under review. Please wait 1 to 72 hours.If it is still not completed after that, please contact us atdev@payairo.com.`}
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
            </View>
            <View
              style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
                width: "100%",
              }}
            >
              {isKYCInProgress ? (
                <View style={{ width: "100%", height: 300, marginBottom: 20 }}>
                  <LottieView
                    style={{ width: "100%", height: "100%" }}
                    source={require("../../lottie/PendingWork.json")}
                    autoPlay
                    loop
                  />
                </View>
              ) : (
                <View style={{ width: "100%", height: 300, marginBottom: 50 }}>
                  <LottieView
                    style={{ width: "100%", height: "100%" }}
                    source={require("../../lottie/Completed.json")}
                  />
                </View>
              )}
            </View>
            <CustomText variant="h2">
              KYC is in {isKYCInProgress ? "progress..." : "completed"}
            </CustomText>
            <CustomText variant="caption" style={{ marginTop: 10 }}>
              Please wait while we complete your KYC process.(This may take a
              few minutes)
            </CustomText>

            <GenericButton
              cStyle={{ marginTop: 20 }}
              title={isKYCInProgress ? "Check KYC Satus" : "Done"}
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
