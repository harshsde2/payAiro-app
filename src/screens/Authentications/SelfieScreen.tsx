import { useNavigation } from "@react-navigation/native";
import { ScreenContainer } from "HOC";
import UploadFile from "components/UploadFile";
import { SVGChecked, SVGUnChecked } from "constants/images";
import { NAVIGATION_SCREENS } from "navigations/navigationConstants";
import {
  useAddBankAccount,
  useAddTraditionalIRABankAccount,
  useCreatePin,
  useSubmitKYC,
} from "query/hooks/useAPIAuth";
import React, { useEffect, useRef, useState } from "react";
import {
  Button,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SvgXml } from "react-native-svg";
import { Theme, useTheme } from "styles";
import { CustomText } from "tsx-components";
import AuthHeader from "tsx-components/AuthHeader";
import PinScreen from "tsx-components/modals/PinScreen";
import TermAndConditionModal from "tsx-components/modals/TermAndConditionModal";
import { PinScreenRef } from "tsx-components/modals/modal.types";
import GenericButton from "../../components/GenericButton";
import Fonts from "../../constants/Fonts";
import useSelectorAction from "../../hooks/useSelectorAction";
import {
  setErrorMsg,
  setLogin,
  setShowGuide,
  setShowLoader,
  setShowRedeemReward,
  setSuccessMsg,
  setWalletData,
} from "../../redux/slices/authenticationSlice";
import { addBank, addBank2, getWallet } from "services/Services";
import { useGetReward, useWalletDetails } from "query/hooks";
import { setWalletDataAuth } from "services/Auth";
import { useDispatch } from "react-redux";
import { setItem, setPin, STORAGE_KEYS } from "storage/mmkv";
import useDispatchAction from "hooks/useDispatchAction";

export default function SelfieScreen(props: any) {
  const { payload } = props.route.params || {};

  const { theme } = useTheme();
  const styles = customStyles(theme);
  const dispatch = useDispatch();
  const pinScreenRef = useRef<PinScreenRef | any>();

  const { tokens, userData } = useSelectorAction();
  const [checked, setchecked] = useState(false);

  const token = (tokens as any)?.access || "";

  // console.log("auth ->", JSON.stringify((tokens as any)?.access, null, 2));
  const termsAndConditionRef = useRef<any>(null);

  const [selfie, setselfie] = useState<any>(null);
  const navigation = useNavigation<any>();
  const [shouldFetchWalletDetails, setShouldFetchWalletDetails] =
    useState(false);

  const { mutate: handlKYC, isPending, isSuccess } = useSubmitKYC();
  const {
    mutate: handlPinCreation,
    isPending: isPendingCreatePin,
    isSuccess: isSuccessCreatePin,
  } = useCreatePin();

  const {
    mutate: handleAddBankAccount,
    isPending: isPendingAddBankAccount,
    isSuccess: isSuccessAddBankAccount,
  } = useAddBankAccount();

  const {
    mutate: handleTraditionalIRABankAccountt,
    isPending: isPendingTraditionalIRABankAccount,
    isSuccess: isSuccessTraditionalIRABankAccount,
  } = useAddTraditionalIRABankAccount();

  const {
    data: data,
    isLoading: isPendingWalletDetails,
    isSuccess: isSuccessWalletDetails,
    isError: isErrorWalletDetails,
    refetch: refetchWalletDetails,
  } = useWalletDetails();

  const {
    data: getRewardData,
    isError,
    isSuccess: isSuccessGetReward,
    refetch: refetchGetReward,
  } = useGetReward();

  // useEffect(() => {
  //   dispatch(setShowLoader(false));
  // }, []);

  const handleGetRewardDetails = async () => {
    await refetchGetReward();
    if (isSuccessGetReward) {
      console.log("refetchGetReward => ✅");
      if (isSuccess && getRewardData?.data?.length > 0) {
        if (getRewardData && getRewardData?.data?.length > 0) {
          setItem(
            STORAGE_KEYS.REDEEM_REWARD,
            JSON.stringify(!getRewardData?.data[0]?.redeem)
          );
          // dispatch(setShowRedeemReward(true));
        }
      }
    }
  };

  const handleUserGuide = async () => {
    setItem(STORAGE_KEYS.GUIDE, JSON.stringify(true));
    dispatch(setShowGuide(true));
    console.log("setShowGuide => ✅");
  };

  const getWalletD = async () => {
    dispatch(setShowLoader(true));
    await refetchWalletDetails();
    if (isSuccessWalletDetails) {
      console.log("handleAddBankAccount => ✅");
      await handleGetRewardDetails();
      handleUserGuide();
      // const data1 = await addBank(token);
      // const data2 = await addBank2(token);
      // console.log("bankAdded===>>>", data1);
      // const data = await getWallet(token);
      dispatch(setShowLoader(false));
      console.log(data);
      dispatch(setWalletData(data?.data));
      setWalletDataAuth(data?.data);
      setItem(STORAGE_KEYS.WALLET_DATA, JSON.stringify(data?.data));
      dispatch(setLogin(true));
      dispatch(setSuccessMsg("Create Account Successfully"));
    }
  };

  const getWalletDetails = async () => {
    try {
      const data1 = await addBank(token);
      const data2 = await addBank2(token);
      console.log("bankAdded===>>>", JSON.stringify(data1, null, 2));
      console.log("bankAdded2===>>>", JSON.stringify(data2, null, 2));
      const data = await getWallet(token);
      console.log("getting wallet =>", JSON.stringify(data, null, 2));
      dispatch(setWalletData(data?.data));
      setWalletDataAuth(data?.data);
      setItem(STORAGE_KEYS.WALLET_DATA, JSON.stringify(data?.data));
      dispatch(setLogin(true));
      dispatch(setSuccessMsg("Logged In Successfully"));
    } catch (error) {
      console.error("Error fetching wallet details:", error);
      dispatch(setErrorMsg("Failed to fetch wallet details"));
    } finally {
      dispatch(setShowLoader(false));
    }
  };

  const handleAddBankAccounts = () => {
    useDispatchAction(setShowLoader(true));
    handleAddBankAccount({} as any, {
      onSuccess: (data) => {
        console.log("handleAddBankAccount => ✅");
        // console.log("data on add bank =>", data.data);
        dispatch(setSuccessMsg("Bank Account Added Successfully"));
        getWalletD();
        // console.log("Bank Account Added Successfully", data);
        // handleTraditionalIRABankAccountt({} as any, {
        //   onSuccess: (data) => {
        //     dispatch(
        //       setSuccessMsg("Traditional IRA Bank Account Added Successfully")
        //     );
        //     console.log("handleTraditional IRA BankAccountt => ✅");
        //     getWalletD();
        //   },
        //   onError: (error: any) => {
        //     console.log("Error adding Traditional IRA Bank Account:", error);
        //   },
        //   onSettled: () => {
        //     dispatch(setShowLoader(false));
        //   },
        // });
      },
      onError: (error: any) => {
        console.log("Error adding bank account:", error.response);
      },
      onSettled: () => {
        dispatch(setShowLoader(false));
      },
    });
  };

  const getErrors = (errors: any) => {
    return (
      errors.data?.data?.details.errors["Ssn"][0] ||
      errors.data?.data?.details.errors["state"][0] ||
      "Something went wrong"
    );
  };

  const handleImage = async () => {
    if (!selfie) {
      dispatch(setErrorMsg("Selfie is Required!"));
      return;
    }
    if (!checked) {
      dispatch(
        setErrorMsg(
          "Please agree with Consumer Disclosure and Fortress trust Account Agreement"
        )
      );
      return;
    }
    const formData = new FormData();
    // Append the selfie image
    formData.append("selfimage", {
      uri: selfie.uri,
      name: selfie.name || `selfie_${Date.now()}.jpg`,
      type: selfie.type || "image/jpeg",
    });

    formData.append("city", payload?.city);
    formData.append("state", payload?.state);
    formData.append("street_address", payload?.residentialAddress);
    formData.append("zip_code", payload?.postalCode);
    formData.append("country", "US");
    formData.append("poi_id", "32324234");
    formData.append("poi_doc", payload?.poi_doc);
    formData.append("step_count", 0);
    formData.append("address_pov", payload?.address_pov);
    formData.append("signature", payload?.signature);
    formData.append("ssn", payload?.ssm);
    formData.append("dob", payload?.dob);
    formData.append("consumer_disclosure_fortress_agreement", checked);

    console.log(JSON.stringify(payload, null, 2));
    dispatch(setShowLoader(true));
    handlKYC(formData as any, {
      onSuccess: (data) => {
        console.log("handlKYC => ✅");
        dispatch(setSuccessMsg("KYC Updated Successfully"));
        // handleAddBankAccounts();
        handleCreatePin();
      },
      onError: (error: any) => {
        dispatch(setShowLoader(false));

        const errors = getErrors(error.response);

        console.log("Error uploading selfie:", errors);
        dispatch(setErrorMsg(errors));
      },
      onSettled: () => {
        dispatch(setShowLoader(false));
      },
    });
  };

  const handleCreatePin = () => {
    if (pinScreenRef.current) {
      pinScreenRef.current.setUserPin();
    }
  };

  const handlePDFView = () => {
    navigation.navigate(NAVIGATION_SCREENS.PDF_VIEWER, {
      url: "https://vault.sandbox.fortressapi.com/nft-origin/4456f8df-5def-4c3b-97e3-75ca18476da6.pdf",
    });
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
          handleAddBankAccounts();

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
        // dispatch(setShowLoader(false));
      },
    });
  };

  return (
    <ScreenContainer avoidKeyboard scrollable padding={0}>
      <PinScreen
        ref={pinScreenRef}
        onAction={(pin) => {
          handleSetUserPin(pin);
        }}
      />
      <AuthHeader header={true} showAuthLogo={true} />
      <TermAndConditionModal
        onAgree={() => setchecked(true)}
        ref={termsAndConditionRef}
      />
      {/* <Button title="Add BankAccount" onPress={getWalletDetails} /> */}
      <View style={[styles.conntentContainer]}>
        <View style={[styles.headerContainer]}>
          <CustomText
            variant={"h1"}
            fontFamily={theme.typography.fontFamily.montserratBold}
            style={styles.signHeaderTextStyles}
          >
            Upload or Take Your Selfie
          </CustomText>
        </View>
        <View style={[styles.formContainer]}>
          <UploadFile
            label={"Upload your profile picture"}
            selectedFile={(result: any) => {
              setselfie(result[0]);
            }}
            value={selfie?.name}
            type="image"
          />

          {selfie && (
            <View style={[styles.signatureImageContainer]}>
              <CustomText variant={"body1"} style={[styles.signatureHeader]}>
                Your Profile:
              </CustomText>
              <Image
                source={{
                  uri: selfie?.uri,
                }}
                style={[styles.signatureImage]}
              />
            </View>
          )}

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => {
              setchecked((state) => !state);
            }}
            style={styles.termsAndConditionContainer}
          >
            <SvgXml
              xml={checked ? SVGChecked : SVGUnChecked}
              // style={{ marginTop: 2, marginRight: 5, }}
              width={15}
              height={15}
            />
            <CustomText
              // variant={'caption'}
              style={{
                flex: 1,
                flexWrap: "wrap",
              }}
            >
              <CustomText variant={"caption"}>
                By clicking the button you agree with the
              </CustomText>

              <Text
                onPress={() =>
                  termsAndConditionRef.current?.showConsumerDisclosure()
                }
                style={{ fontWeight: "700" }}
              >
                {" "}
                Consumer Disclosure{" "}
              </Text>
              <CustomText variant={"caption"}>and</CustomText>
              <Text
                onPress={() => handlePDFView()}
                style={{ fontWeight: "700" }}
              >
                {" "}
                Fortress trust Account Agreement{" "}
              </Text>
            </CustomText>
          </TouchableOpacity>
        </View>
        <GenericButton
          title={"Next"}
          cStyle={{
            marginTop: 15,
          }}
          onPress={handleImage}
          showLoader={true}
          isLoading={isPending}
          disabled={isPending}
        />
        {/* <GenericButton
          title={"Create PIN"}
          cStyle={{
            marginTop: 15,
          }}
          onPress={handleCreatePin}
        /> */}
      </View>
    </ScreenContainer>
  );
}
const customStyles = (theme: Theme) =>
  StyleSheet.create({
    termsAndConditionContainer: {
      // backgroundColor: 'red',
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "flex-start",
      marginTop: 15,
      paddingHorizontal: 10,
      width: "100%",
      // flex: 1,
      gap: 10,
    },
    conntentContainer: {
      flex: 1,
      backgroundColor: "#fff",
      borderTopEndRadius: 32,
      borderTopStartRadius: 32,
      padding: 20,
    },
    headerContainer: { width: "100%", alignSelf: "center" },
    signHeaderTextStyles: {
      width: "100%",
      textAlign: "center",
    },
    formContainer: {
      marginVertical: 40,
      // flexDirection: "row",
    },
    signHeaderCaptionTextStyles: {
      width: "100%",
      textAlign: "center",
      marginTop: 10,
    },
    textInputContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      width: "100%",
    },
    signatureImage: {
      width: 300,
      height: 150,
      resizeMode: "contain",
      borderWidth: 1,
      borderColor: "#ccc",
    },
    signatureImageText: { fontSize: 12, color: "#666", marginTop: 5 },
    signatureImageContainer: { marginTop: 20, alignItems: "center" },
    signatureHeader: { fontFamily: Fonts.semibold, marginBottom: 5 },
    orText: { width: "100%", textAlign: "center", marginTop: 20 },
  });
