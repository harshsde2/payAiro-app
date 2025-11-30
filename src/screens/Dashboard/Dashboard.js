import { useIsFocused, useNavigation } from "@react-navigation/native";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Alert,
  Animated,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SvgXml } from "react-native-svg";
import Container from "../../HOC/Container";
import BalanceModal from "../../components/BalanceModal";
import BottomNavigation from "../../components/BottomNavigation";
import Header from "../../components/Header";
import QRModal from "../../components/QRModal";
import Rewards from "../../components/Rewards";
import StoryLists from "../../components/StoryLists";
import TransactionCard from "../../components/TransactionCard";
import Fonts from "../../constants/Fonts";
import { SCREENS } from "../../constants/SCREENS";
import * as Progress from "react-native-progress";
import {
  SVGAdd,
  SVGBANK2,
  SVGBamkAdd,
  SVGBankImg,
  SVGBilPay,
  SVGBit,
  SVGCopy3,
  SVGCredit,
  SVGDebit,
  SVGDebitAdd,
  SVGDebitCardAdd,
  SVGDownArrow,
  SVGDownArrow2,
  SVGDownArrow3,
  SVGGuide1,
  SVGHolding,
  SVGKYC2,
  SVGLogo2,
  SVGLogo3,
  SVGNewBank,
  SVGReceive,
  SVGRecharge,
  SVGRef,
  SVGSecurities,
  SVGSend,
  SVGSliders,
  SVGUSD,
  SVGUSDT,
  SVGVoucher,
} from "../../constants/images";
import useDispatchAction from "../../hooks/useDispatchAction";
import useSelectorAction from "../../hooks/useSelectorAction";
import {
  setActiveTab,
  setBankLists,
  setBankbalances,
  setBiometricAvailable,
  setCalculatedBalance,
  setGuides,
  setNetworkLists,
  setSeletedCrypto,
  setWalletData,
  setisCrypto,
} from "../../redux/slices/authenticationSlice";
import { showError, showSuccess } from "../../utils/toast";
import {
  getGuide,
  getKYCAccpted,
  getPin,
  setKYCAcceopted,
  setPin,
  setWalletDataAuth,
} from "../../services/Auth";
import {
  addbankAccountRoth,
  createPin,
  getBalance,
  getBalanceCrypto,
  getBankDetails,
  getBanks,
  getBanksAllAccount,
  getContacts,
  getCryptoTx,
  getKYC,
  getMerchentTx,
  getPayAeroTx,
  getPinFromSev,
  getWallet,
  getWalletBalance,
  uploadKYC,
} from "../../services/Services";
import PincodeScreen from "../Authentications/PincodeScreen";
import AssetsCards from "../../components/AssetsCards";
import CustomPieChart from "../../components/CustomPieChart";
import SelectionModal from "../../components/SelectionModal";
import LineChartCustom from "../../components/LineChartCustom";
import SelectionModal2 from "../../components/SelectionModal2";
import BiometricModal from "../../components/BiometricModal";
import { useSelector } from "react-redux";
import BankModal from "../../components/BankModal";
import BankModal2 from "../../components/BankModal2";
import {
  LinkIOSPresentationStyle,
  LinkLogLevel,
  create,
  dismissLink,
  open,
} from "react-native-plaid-link-sdk";

import { BASE_URL } from "../../constants/mockData";
import KYCModal from "../../components/KYCModal";
import { get } from "react-native/Libraries/TurboModule/TurboModuleRegistry";
import CustomModal from "../../components/CustomModal";
import GenericButton from "../../components/GenericButton";
import GuideModal from "../../components/GuideModal";
import GhostSlide from "../../animations/animations-components/GhostSlide";

export default function Dashboard(props) {
  const translateY = useRef(new Animated.Value(0)).current;
  const translateX = useRef(new Animated.Value(100)).current;
  const translateY2 = useRef(new Animated.Value(100)).current;
  const {
    walletData,
    tokens,
    userData,
    selectedCrypto,
    networkLists,
    isCrypto,
    calculatedBalance,
    biometricAvailable,
  } = useSelector((state) => state.authenticationSlice);
  const [balance, setbalance] = useState("");
  const [txLists, settxLists] = useState([]);
  const [contactLists, setcontactLists] = useState([]);
  const [web3TxLists, setweb3TxLists] = useState([]);
  const [isVisible, setisVisible] = useState(false);
  const [isVisible2, setisVisible2] = useState(false);
  const [isVisble3, setisVisble3] = useState(isCrypto);
  const [show, setshow] = useState(true);
  const [showPin, setshowPin] = useState(false);
  const [isVisible4, setisVisible4] = useState(false);
  const [mxTx, setmxTx] = useState([]);
  const data = [{ value: 50 }, { value: 80 }, { value: 90 }, { value: 70 }];
  const [kycStep, setkycStep] = useState(false);
  const [isShow, setisShow] = useState(true);
  const [isShowKYC, setisShowKYC] = useState(false);

  const [selectedGraph, setselectedGraph] = useState("Assets");
  const [timeframe, settimeframe] = useState("Week");
  const [isShowWeeks, setisShowWeeks] = useState(false);

  const isFoucused = useIsFocused();
  const [isConfirm, setisConfirm] = useState(false);
  const [pinTxt, setpinTxt] = useState("Create your pin");
  const [refreshing, setRefreshing] = useState(false);
  const [isBioMetricVisible, setisBioMetricVisible] = useState(false);
  const [isCardModalVisible, setisCardModalVisible] = useState(false);
  const [isBankModalVisible, setisBankModalVisible] = useState(false);
  const [datas, setdatas] = useState(false);
  const [bankbalance, setBankbalance] = useState(null);
  const [totalDisbursable, settotalDisbursable] = useState(0);
  const [alloCationLists, setalloCationLists] = useState([]);
  const [totalDisbursablePending, settotalDisbursablePending] = useState(0);
  const [isGuideVisible, setisGuideVisible] = useState(false);

  // for animation
  const [ghostSlideVisible, setGhostSlideVisible] = useState(false);

  useEffect(() => {
    getGuideStatus();
    // setKYCAcceopted(n ull);
    if (isFoucused) {
      useDispatchAction(setActiveTab("1"));
    }
  }, [isFoucused]);

  useEffect(() => {
    kycHandle();
    handleBalance();
    getBank();
    handleBanksBalance();
    getWallets();
    getWalletBalances();
    getTxLists();
    getContactLists();
    getCryptoTxs();
  }, []);

  const [linkToken, setLinkToken] = useState(null);
  const [bankLists, setbankLists] = useState([]);

  const handleBalance = async () => {
    const data = await getBalanceCrypto(tokens?.access);
    // console.log(data?.data?.data, 'cryptoBalance');
    if (data?.data?.data) {
      setalloCationLists(
        data?.data?.data.filter((asset) => asset?.assetType !== "usd")
      );
      const totalDisbursable = data?.data?.data
        .filter((asset) => asset.assetType !== "usd")
        .reduce((sum, asset) => sum + asset?.disbursable, 0);

      const totalPending = data?.data?.data
        .filter((asset) => asset?.assetType !== "usd")
        .reduce((sum, asset) => sum + asset.pending, 0);

      settotalDisbursable(Number(totalDisbursable));
      settotalDisbursablePending(Number(totalPending));
    }
  };
  const getBankDetailsOfPayAiro = async () => {
    const data = await getBanksAllAccount(tokens?.access);

    return [
      ...data?.data?.bank_accounts,
      ...data?.data?.traditional_ira_accounts,
      ...data?.data?.roth_ira_accounts,
    ];
    setbankLists(data?.data);
  };

  const handleBanksBalance = async () => {
    const data = await getBalance(tokens?.access);
    // console.log(data, 'datatbankBalanseas');
    setBankbalance(data?.data);
    useDispatchAction(setBankbalances(data?.data));
  };
  const handleIsShow = () => {
    setisShow(false);
    setTimeout(() => {
      setisShow(true);
    }, 2000);
  };

  const MemoizedPieChart = React.memo(CustomPieChart);

  useEffect(() => {
    fetch(`${BASE_URL}kyc/link-token/`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${tokens?.access}`,
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setLinkToken(data?.data?.link_token);
      })
      .catch((err) => console.error("Error fetching link token:", err));
  }, []);

  const getGuideStatus = async () => {
    const guilde = await getGuide();
    useDispatchAction(setGuides(guilde));
    if (!guilde) {
      setisGuideVisible(true);
    }
  };

  const onSuccess = useCallback(async (publicToken) => {
    try {
      // Parse the metadataJson string
      const metadata = publicToken?.metadata;
      const metadataJson = metadata?.metadataJson
        ? JSON.parse(metadata.metadataJson)
        : null;

      if (!metadataJson) {
        // console.error('Invalid metadataJson structure');
        return;
      }

      const accountId = metadataJson?.account_id;
      // console.log('Extracted Account ID:', accountId);
      // console.log('Public Token ID:', publicToken.publicToken);

      // Exchange public token for access token
      const exchangeResponse = await fetch(`${BASE_URL}kyc/exchange-token/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${tokens?.access}`,
        },
        body: JSON.stringify({
          public_token: publicToken.publicToken,
        }),
      });

      const exchangeData = await exchangeResponse.json();
      if (!exchangeResponse.ok) {
        throw new Error(
          `Exchange token error: ${exchangeData?.message || "Unknown error"}`
        );
      }

      // console.log('Exchange Token Response:', exchangeData);

      const accessToken = exchangeData?.data?.access_token;
      if (!accessToken) {
        // console.error('Missing access token in exchange response');
        return;
      }

      // Get processor token
      const processorResponse = await fetch(`${BASE_URL}kyc/processor-token/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${tokens?.access}`,
        },
        body: JSON.stringify({
          access_token: accessToken,
          account_id: accountId,
        }),
      });

      const processorData = await processorResponse.json();
      if (!processorResponse.ok) {
        throw new Error(
          `Processor token error: ${processorData?.message || "Unknown error"}`
        );
      }

      // console.log('Processor Token Response:', processorData);

      const processorToken = processorData?.data?.processor_token;
      if (!processorToken) {
        // console.error('Missing processor token in processor response');
        return;
      }

      // Register Bank
      const registerBankResponse = await fetch(
        `${BASE_URL}kyc/register-bank/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${tokens?.access}`,
          },
          body: JSON.stringify({
            processor_token: processorToken,
            identityId: exchangeData?.data?.identityId, // Assuming identityId comes from exchangeData
            type: "financial",
            accountNumberLast4: metadataJson?.account_id?.slice(-4), // Extract last 4 digits
          }),
        }
      );

      const registerBankData = await registerBankResponse.json();
      if (!registerBankResponse.ok) {
        throw new Error(
          `Register bank error: ${registerBankData?.message || "Unknown error"}`
        );
      }

      // console.log('Register Bank Response:', registerBankData);
    } catch (error) {
      // console.error('Error in onSuccess:', error);
    }
  }, []);

  const handleOpenLink = () => {
    if (linkToken) {
      const config = {
        token: linkToken,
        onSuccess,
        onExit: (linkExit) => {
          console.log("Exit: ", linkExit);
          dismissLink();
        },
        iOSPresentationStyle: LinkIOSPresentationStyle.MODAL,
        logLevel: LinkLogLevel.ERROR,
      };

      create(config);
      open(config);
    }
  };

  const getBank = async () => {
    try {
      const data = await getBankDetails(tokens?.access);
      // console.log(data, 'data===>>>>>>');
      const data2 = await getBankDetailsOfPayAiro();
      // console.log(data2, 'datats2');
      // console.log([...data2], '[...data?.data, ...data2?.data?.accounts]');
      if (data && data?.data?.accounts) {
        setbankLists([...data.data.accounts, ...data2]);
        useDispatchAction(setBankLists([...data.data.accounts, ...data2]));
      } else {
        setbankLists([...data2]);
        useDispatchAction(setBankLists([...data2]));
      }
    } catch (error) {
      // console.log(error, 'error==>>>>>');
    }
  };
  const handlePin = async () => {
    const pins = await getPin();
    // const data = await getPinFromSev(tokens?.access);
    try {
      const data = await getPinFromSev(tokens?.access);

      if (data && data?.status) {
        await setPin(data?.data?.tpin);
        setshowPin(false);
      } else {
        setshowPin(true);
      }
    } catch (error) {
      // console.log(error);
      setshowPin(true);
    }
  };

  useEffect(() => {
    handlePin();
  }, []);
  const symbol = selectedCrypto?.image?.includes("btc")
    ? "BTC"
    : selectedCrypto?.image?.includes("eth")
    ? "ETH"
    : selectedCrypto?.image?.includes("matic")
    ? "MATIC"
    : "XRP";

  const balanceAssets = selectedCrypto?.image?.includes("btc")
    ? Number(
        networkLists[0]?.balance_in_tether +
          networkLists[0]?.btc_in_eth +
          networkLists[0]?.btc_in_matic +
          networkLists[0]?.btc_in_xrp
      )
    : selectedCrypto?.image?.includes("eth")
    ? Number(
        networkLists[1]?.balance +
          Number(networkLists[1]?.eth_in_btc) +
          networkLists[1]?.eth_in_eth +
          networkLists[1]?.eth_in_matic
      ).toFixed(3)
    : selectedCrypto?.image?.includes("matic")
    ? Number(
        networkLists[2]?.balance +
          networkLists[2]?.matic_in_btc +
          networkLists[2]?.matic_in_eth +
          networkLists[2]?.matic_in_xrp
      )
    : Number(
        networkLists[3]?.balance +
          networkLists[3]?.xrp_in_btc +
          networkLists[3]?.xrp_in_eth +
          networkLists[3]?.xrp_in_matic
      );

  const getWallets = async () => {
    const data = await getWallet(tokens?.access);
    // useDispatchAction(setSeletedCrypto(data?.data?.eth));

    let arr = [
      data?.data?.btc,
      data?.data?.eth,
      data?.data?.matic,
      data?.data?.xrp,
    ];
    // setWalletDataAuth(data?.data);
    useDispatchAction(setWalletData(data?.data));
  };
  const getCryptoTxs = async () => {
    const data = await getCryptoTx(tokens?.access);
    // console.log(data?.data, 'datatatas');
    setweb3TxLists(
      [...data?.data?.nft_transactions, ...data?.data?.trades] ?? []
    );
  };
  const getWalletBalances = async () => {
    const data = await getWalletBalance(tokens?.access);

    setbalance(data?.data?.wallet_balance ?? 0);
  };

  const getContactLists = async () => {
    const data = await getContacts(tokens?.access);
    const newData = data?.data.sort((a, b) => {
      const timestampA = getEarliestTimestamp(a.pending_requests);
      const timestampB = getEarliestTimestamp(b.pending_requests);

      if (timestampA === null && timestampB === null) return 0;
      if (timestampA === null) return 1;
      if (timestampB === null) return -1;
      return timestampA - timestampB;
    });

    setcontactLists(newData ?? []);
  };

  const getEarliestTimestamp = (requests) => {
    if (requests.length === 0) return null;
    return new Date(
      Math.min(...requests.map((request) => new Date(request.timestamp)))
    );
  };

  const getMerTx = async () => {
    const data = await getMerchentTx(tokens?.access);

    setmxTx(data?.data?.transactions ?? []);
  };

  const toggleGhostSlide = () => setGhostSlideVisible((prev) => !prev);

  const handleSwitch = () => {
    toggleGhostSlide();
    // setshow(false);

    useDispatchAction(
      setCalculatedBalance(selectedCrypto?.balance_in_tether ?? 0)
    );
    useDispatchAction(setisCrypto(!isCrypto));
    // setshow(true);
    // getCryptoTxs();

    // Animated.sequence([
    //   Animated.timing(translateY, {
    //     toValue: -1400, // Move up by 50 pixels
    //     duration: 600,
    //     useNativeDriver: true,
    //   }),
    //   Animated.timing(translateY, {
    //     toValue: 0, // Move back to the original position
    //     duration: 600,
    //     useNativeDriver: true,
    //   }),
    // ]).start();

    // Animated.sequence([
    //   Animated.timing(translateX, {
    //     toValue: 1000, // Move up by 50 pixels
    //     duration: 600,
    //     useNativeDriver: true,
    //   }),
    //   Animated.timing(translateX, {
    //     toValue: 0, // Move back to the original position
    //     duration: 600,
    //     useNativeDriver: true,
    //   }),
    // ]).start();

    // Animated.sequence([
    //   Animated.timing(translateY2, {
    //     toValue: 10, // Move up by 50 pixels
    //     duration: 600,
    //     useNativeDriver: true,
    //   }),
    //   Animated.timing(translateY2, {
    //     toValue: 100, // Move back to the original position
    //     duration: 600,
    //     useNativeDriver: true,
    //   }),
    // ]).start();
  };
  useEffect(() => {
    getkycStep();
  }, []);

  const getkycStep = async () => {
    const kycData = await getKYC(tokens?.access);

    if (kycData?.data && kycData?.data?.is_varified) {
      const accepted = await getKYCAccpted();
      if (!accepted) {
        setkycStep(true);
      }
    }
  };
  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      kycHandle();
      getBank();
      handleBanksBalance();
      handleBalance();
      getWallets();
      getWalletBalances();
      getTxLists();
      getContactLists();
      setRefreshing(false);
    }, 2000); // Simulate a network request
  };
  const renderButtonGraph = () => {
    return (
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <View
          style={{
            flexDirection: "row",
            justifyContent: "flex-start",
            alignItems: "center",
          }}
        >
          <TouchableOpacity
            onPress={() => setselectedGraph("pnl")}
            style={{
              backgroundColor:
                selectedGraph === "pnl"
                  ? "rgba(44, 106, 63, 1)"
                  : "rgba(255, 255, 255, 0.1)",
              // padding: 10,
              paddingBottom: 10,
              paddingTop: 7,
              width: "33%",
              borderRadius: 30,
            }}
          >
            <Text
              style={{
                color: selectedGraph === "pnl" ? "#fff" : "#fff",
                fontFamily: Fonts.bold,
                textAlign: "center",
                fontSize: 12,
              }}
            >
              PnL(%)
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setselectedGraph("Assets")}
            style={{
              backgroundColor:
                selectedGraph === "Assets" ? "rgba(44, 106, 63, 1)" : "#000",
              // padding: 10,
              paddingBottom: 10,
              paddingTop: 7,
              width: "33%",
              borderRadius: 30,
              marginLeft: 15,
            }}
          >
            <Text
              style={{
                color: selectedGraph === "Assets" ? "#fff" : "#fff",
                fontFamily: Fonts.bold,
                textAlign: "center",
                fontSize: 12,
              }}
            >
              Assets
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          onPress={() => {
            setisShowWeeks(true);
          }}
          style={{
            backgroundColor: "#fff",
            // padding: 10,
            paddingBottom: 10,
            paddingTop: 7,
            width: "27%",
            borderRadius: 30,
          }}
        >
          <Text
            style={{
              color: "black",
              fontFamily: Fonts.bold,
              textAlign: "center",
              fontSize: 12,
              textTransform: "capitalize",
            }}
          >
            {timeframe} <SvgXml xml={SVGDownArrow2} />
          </Text>
        </TouchableOpacity>
      </View>
    );
  };
  // Interpolating opacity based on translateY
  const opacity = translateY.interpolate({
    inputRange: [-100, 0], // As translateY moves from -50 to 0
    outputRange: [0.2, 1], // Opacity changes from 0.5 to 1
    extrapolate: "clamp", // Ensures values don't go beyond the range
  });
  const opacity1 = translateX.interpolate({
    inputRange: [-100, 0], // As translateY moves from -50 to 0
    outputRange: [0.2, 1], // Opacity changes from 0.5 to 1
    extrapolate: "clamp", // Ensures values don't go beyond the range
  });

  const getTxLists = async () => {
    const data = await getPayAeroTx(tokens?.access);
    console.log(data?.data, "data?.data");
    settxLists(
      [
        ...data?.data?.merchantTransactions,
        ...data?.data?.userToUserTransactions,
      ].filter((i) => i?.status === "success") ?? []
    );
  };

  const kycHandle = async () => {
    const data = await uploadKYC(tokens?.access);
    if (data?.data?.status === 400 || !data?.status) {
      if (data?.data?.title === "Identity suspended") {
        setisShowKYC(true);
      } else {
        setisShowKYC(false);
      }
    } else {
      setisShowKYC(true);
    }
  };
  const kycHandleUrl = async () => {
    const data = await uploadKYC(tokens?.access);
    // console.log(data, 'kycHandle');
    if (data?.data?.status === 400) {
      if (data?.data?.title === "Identity suspended") {
        useDispatchAction(
          setErrorMsg("Operation is forbidden. Custodial account is suspended")
        );
        // navigation.navigate('InAppKYCBrowser', {
        //   url: 'https://docv.alloy.co/02797998-719f-407b-bf98-ed852e3540b3',
        // });
      }
    } else {
      navigation.navigate("InAppKYCBrowser", {
        url: data?.data?.url,
      });
    }
  };
  const navigation = useNavigation();
  const handleRothBank = async () => {
    try {
      const data = await addbankAccountRoth(tokens?.access);
      // console.log(data?.data, 'royjir');
      if (data && data?.data && !data?.data?.error) {
        showSuccess("Bank Account Created Successfully");
        getBank();
      } else {
        showError(data?.data?.error ?? "Something went wrong");
      }
    } catch (error) {}
  };

  return (
    <Container bgColor={"rgba(226, 241, 227, 0.2)"}>
      {/* {isShow && (
        <CustomModal isVisible={isShow} onClose={() => handleIsShow()} />
      )} */}

      <BankModal
        isVisible={isCardModalVisible}
        onClose={() => setisCardModalVisible(false)}
      />
      {/* <KYCModal
        isVisible={kycStep}
        onClose={() => {
          setKYCAcceopted(true);
          setkycStep(false);
        }}
      /> */}
      {isBankModalVisible && (
        <BankModal2
          isVisible={isBankModalVisible}
          onClose={() => setisBankModalVisible(false)}
        />
      )}
      {/* <Animated.View
        style={[
          {transform: [{translateY}], opacity}, // Add opacity here
          {
            padding: 10,
            backgroundColor: 'black',
            borderRadius: 20,
            position: 'absolute',
            bottom: 20,
            zIndex: 9999,
            width: '92%',
            alignSelf: 'center',
          },
        ]}>
        {!showPin && <BottomNavigation isVer={true} />}
      </Animated.View> */}
      {/* <View style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 10,
        backgroundColor: 'black',
        width: '92%',
        alignSelf: 'center',
        marginTop: 100,
      }}>
        <Text style={{
          color: 'white',
          fontSize: 16,
          fontWeight: 'bold',
        }}>Ghost Slide Effect</Text>
        <TouchableOpacity

          onPress={toggleGhostSlide}
        >
          <Text style={{
            color: 'white',
            fontSize: 16,
            fontWeight: 'bold',
          }}>{ghostSlideVisible ? 'Hide' : 'Show'}</Text>
        </TouchableOpacity>
      </View> */}
      <View
        style={{
          position: "absolute",
          bottom: 20,
          zIndex: 9999,
          width: "92%",
          alignSelf: "center",
        }}
      >
        <GhostSlide
          visible={ghostSlideVisible}
          direction="custom"
          duration={2500}
          distance={1000}
          customX={0}
          customY={-400}
          ghostOpacity={1}
          onAnimationComplete={() => console.log("Ghost slide completed")}
        >
          <View
            style={{
              padding: 10,
              backgroundColor: "black",
              borderRadius: 20,
              position: "absolute",
              bottom: 20,
              zIndex: 9999,
              width: "92%",
              alignSelf: "center",
            }}
          >
            <BottomNavigation isVer={true} />
          </View>
        </GhostSlide>
      </View>

      <BalanceModal
        isVisible={isVisible}
        onClose={() => setisVisible(false)}
        onSelected={() => {
          setisVisible(false);
          navigation.navigate(SCREENS.Receive);
        }}
      />
      <SelectionModal
        isVisible={isVisible2}
        onClose={() => setisVisible2(false)}
      />
      <SelectionModal2
        isVisible={isShowWeeks}
        onClose={() => setisShowWeeks(false)}
        timeframe={timeframe}
        settimeframe={settimeframe}
      />
      {/* <SvgXml xml={SVGGuide1} /> */}
      <GuideModal
        isVisible={isGuideVisible}
        onClose={() => setisGuideVisible(false)}
      />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#B1FF84", "#000"]}
            />
          }
          contentContainerStyle={{ flexGrow: 1 }}
        >
          <Header name={walletData?.name} />
          {isShowKYC && (
            <View
              style={{
                backgroundColor: "#000",
                width: "95%",
                padding: 15,
                borderRadius: 15,
                alignSelf: "center",
                marginBottom: 10,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "flex-start",
                  alignItems: "flex-start",
                }}
              >
                <SvgXml xml={SVGKYC2} />
                <Text
                  style={{
                    color: "rgba(177, 177, 177, 1)",
                    fontFamily: Fonts.semibold,
                    fontSize: 14,
                    marginLeft: 10,
                  }}
                >
                  Your Second level KYC verification is pending.{" "}
                  <TouchableOpacity onPress={kycHandleUrl}>
                    <Text style={{ color: "white", fontFamily: Fonts.bold }}>
                      {" "}
                      Verify Now!
                    </Text>
                  </TouchableOpacity>
                </Text>
              </View>
              <SvgXml
                xml={SVGSliders}
                style={{ marginTop: 15, width: "80%", alignSelf: "center" }}
              />
            </View>
          )}
          <View style={{ backgroundColor: "rgba(249, 249, 249, 1)" }}>
            <View
              style={{
                backgroundColor: "rgba(224, 239, 225, 1)",
                borderRadius: 40,
                width: "90%",
                alignSelf: "center",
                // elevation: 2,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  paddingVertical: 15,
                  paddingHorizontal: 25,
                }}
              >
                <Text style={{ fontFamily: Fonts.semibold, color: "#000" }}>
                  {!isCrypto ? "SECURITY" : "PAYAIRO"} ACCOUNT
                </Text>
                {isCrypto ? (
                  <Animated.View
                    style={[
                      {
                        transform: [{ translateY: translateY }],
                        opacity: opacity,
                      }, // Add opacity here
                    ]}
                  >
                    <TouchableOpacity
                      disabled={true}
                      onPress={() => setisVisible2(true)}
                      style={{
                        backgroundColor: "rgba(224, 239, 225, 1)",
                        padding: 5,
                        borderRadius: 40,
                        elevation: 3,
                        borderWidth: 1,
                        borderColor: "rgba(224, 239, 225, 1)",
                        flexDirection: "row",
                        justifyContent: "flex-start",
                        alignItems: "center",
                        // backfaceVisibility: 'hidden',
                      }}
                    >
                      <SvgXml xml={SVGUSD} />

                      <View
                        style={{
                          flexDirection: "row",
                          justifyContent: "flex-start",
                          alignItems: "center",
                          marginLeft: 5,
                        }}
                      >
                        <Text
                          style={{
                            color: "#000",
                            fontSize: 14,
                            fontFamily: Fonts.semibold,
                            marginRight: 5,
                          }}
                        >
                          USD
                        </Text>
                        <SvgXml xml={SVGDownArrow3} />
                      </View>
                    </TouchableOpacity>
                  </Animated.View>
                ) : (
                  <Animated.View
                    style={[
                      {
                        transform: [{ translateY: translateY }],
                        opacity: opacity,
                      }, // Add opacity here
                    ]}
                  >
                    <TouchableOpacity
                      disabled={true}
                      onPress={() => setisVisible2(true)}
                      style={{
                        backgroundColor: "rgba(224, 239, 225, 1)",
                        padding: 5,
                        borderRadius: 40,
                        elevation: 3,
                        borderWidth: 1,
                        borderColor: "rgba(224, 239, 225, 1)",
                        flexDirection: "row",
                        justifyContent: "flex-start",
                        alignItems: "center",
                        // backfaceVisibility: 'hidden',
                      }}
                    >
                      <SvgXml xml={SVGUSD} width={30} height={30} />
                      <View
                        style={{
                          flexDirection: "row",
                          justifyContent: "flex-start",
                          alignItems: "center",
                          marginLeft: 5,
                        }}
                      >
                        <Text
                          style={{
                            color: "#000",
                            fontSize: 14,
                            fontFamily: Fonts.semibold,
                            marginRight: 5,
                          }}
                        >
                          USD
                        </Text>
                        <SvgXml xml={SVGDownArrow3} />
                      </View>
                    </TouchableOpacity>
                  </Animated.View>
                )}
              </View>
              <View
                style={[
                  {
                    padding: 10,
                    borderRadius: 25,
                    backgroundColor: isCrypto ? "rgba(44, 106, 63, 1)" : "#fff",
                    marginVertical: 5,
                    elevation: 7,
                  },
                ]}
              >
                <Animated.View
                  style={{
                    transform: [{ translateY: translateY }],
                    opacity: opacity,
                    width: "100%",
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    {show && (
                      <View style={{ padding: 10, width: "80%" }}>
                        <Text
                          style={{
                            fontFamily: Fonts.semibold,
                            color: isCrypto ? "#fff" : "black",
                            marginTop: 0,
                          }}
                        >
                          {!isCrypto ? "Holdings" : "PayAiro Balance"}
                        </Text>
                        <Text
                          style={{
                            fontFamily: Fonts.bold,
                            color: isCrypto ? "#fff" : "black",
                            fontSize: 25,
                            marginBottom: !isCrypto ? 0 : 40,
                          }}
                        >
                          {!isCrypto
                            ? Number(totalDisbursable).toFixed(5)
                            : "$" +
                              Number(
                                bankbalance?.bank_account?.usd ?? 0
                              ).toFixed(2)}{" "}
                        </Text>
                        {!isCrypto && (
                          <Text
                            style={{
                              fontFamily: Fonts.regular,
                              color: "red",
                              fontSize: 12,
                              marginBottom: 30,
                            }}
                          >
                            (
                            {!isCrypto &&
                              "Pending " +
                                Number(totalDisbursablePending).toFixed(5)}
                            )
                          </Text>
                        )}
                        <Text
                          style={{
                            fontFamily: Fonts.semibold,
                            color: isCrypto ? "#fff" : "black",
                          }}
                        >
                          {!isCrypto ? "" : "PayAiro ID"}{" "}
                        </Text>
                        <Text
                          numberOfLines={1}
                          style={{
                            fontFamily: Fonts.semibold,
                            color: isCrypto ? "#fff" : "black",
                            fontSize: 12,
                            width: "80%",
                          }}
                        >
                          {!isCrypto ? "" : walletData?.username}{" "}
                          <SvgXml xml={SVGCopy3} />
                        </Text>
                      </View>
                    )}
                    <SvgXml
                      xml={isCrypto ? SVGLogo3 : SVGLogo2}
                      style={{ marginLeft: -100 }}
                      onPress={() => handleSwitch()}
                    />
                  </View>
                </Animated.View>
              </View>
            </View>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginVertical: 10,
                marginHorizontal: 15,
              }}
            >
              <SvgXml
                xml={SVGSend}
                onPress={() => {
                  navigation.navigate(
                    !isCrypto ? SCREENS.SendToken : SCREENS.Send,
                    {
                      requested: false,
                    }
                  );
                }}
              />
              <SvgXml
                xml={SVGReceive}
                onPress={() =>
                  navigation.navigate(
                    !isCrypto ? SCREENS.ReceiveToken : SCREENS.Receive
                  )
                }
              />
              <SvgXml
                xml={!isCrypto ? SVGHolding : SVGAdd}
                style={{ marginBottom: 20 }}
                onPress={() => {
                  if (!isCrypto) {
                    navigation.navigate("CryptoDashboard");
                  } else {
                    setisVisible(true);
                  }
                }}
              />
            </View>
          </View>
          <BiometricModal
            isVisible={isBioMetricVisible}
            onCancel={() => setisBioMetricVisible(false)}
            onClose={() => console.log("object")}
          />
          <View
            style={{
              flex: 1,
              backgroundColor: "#fff",
              borderTopEndRadius: 32,
              borderTopStartRadius: 32,

              marginTop: 20,
            }}
          >
            {!isCrypto && (
              <View>
                <Animated.View
                  style={[
                    {
                      transform: [{ translateX: translateX }],
                      opacity: opacity1,
                    }, // Add opacity here
                  ]}
                >
                  <Text
                    style={{
                      color: "#1D1D1D",
                      fontFamily: Fonts.semibold,
                      fontSize: 20,
                      marginLeft: 30,
                      marginTop: 15,
                    }}
                  >
                    PnL & Assets Allocation
                  </Text>
                  {selectedGraph !== "Assets" && (
                    <>
                      <View
                        style={{
                          width: "80%",
                          alignSelf: "center",
                          marginTop: 30,
                          marginBottom: 20,
                        }}
                      >
                        {renderButtonGraph()}
                      </View>
                      <LineChartCustom timeframe={timeframe.toLowerCase()} />
                    </>
                  )}
                  {selectedGraph === "Assets" && (
                    <View
                      style={{
                        backgroundColor: "#000",
                        padding: 20,
                        borderRadius: 20,
                        width: "90%",
                        alignSelf: "center",
                        marginVertical: 15,
                      }}
                    >
                      {renderButtonGraph()}
                      <View style={{ width: "90%", alignSelf: "center" }}>
                        {/* <MemoizedPieChart
                          alloCationLists={useMemo(
                            () => alloCationLists,
                            [alloCationLists],
                          )}
                        /> */}
                      </View>

                      <View
                        style={{
                          backgroundColor: "rgba(255, 255, 255, 0.1)",
                          padding: 20,
                          borderRadius: 20,
                        }}
                      >
                        <Text
                          style={{
                            color: "white",
                            fontFamily: Fonts.bold,
                            marginBottom: 10,
                            fontSize: 16,
                          }}
                        >
                          Assets Allocation
                        </Text>
                        {alloCationLists &&
                          alloCationLists.length > 0 &&
                          alloCationLists.map((item, key) => (
                            <View key={key}>
                              <AssetsCards item={item} />
                            </View>
                          ))}
                      </View>
                    </View>
                  )}
                </Animated.View>
              </View>
            )}
            {!isCrypto && (
              <>
                <Text
                  style={{
                    color: "#000",
                    fontFamily: Fonts.semibold,
                    padding: 13,
                    marginLeft: 5,
                    fontSize: 20,
                  }}
                >
                  Explore Securities
                </Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ paddingHorizontal: 10 }}
                  style={{ marginVertical: 10 }}
                >
                  <View
                    style={{
                      backgroundColor: "rgba(248, 248, 248, 1)",
                      borderRadius: 15,
                      padding: 15,
                      flexDirection: "row",
                      justifyContent: "flex-start",
                      width: 170,
                    }}
                  >
                    <SvgXml xml={SVGBit} />
                    <View style={{ marginLeft: 15 }}>
                      <Text
                        style={{
                          color: "black",
                          fontFamily: Fonts.semibold,
                          textAlign: "left",
                          marginLeft: 15,
                          marginBottom: 10,
                        }}
                      >
                        Crypto
                      </Text>
                      <GenericButton
                        title={"Explore "}
                        onPress={() => navigation.navigate("CryptoScreen")}
                        cStyle={{
                          backgroundColor: "#000",
                          padding: 5,
                          width: "80%",
                        }}
                        tStyle={{ color: "white", fontSize: 10 }}
                      />
                    </View>
                  </View>
                  <View
                    style={{
                      backgroundColor: "rgba(248, 248, 248, 1)",
                      borderRadius: 15,
                      padding: 15,
                      flexDirection: "row",
                      justifyContent: "flex-start",
                      width: 170,
                      marginLeft: 10,
                    }}
                  >
                    <SvgXml xml={SVGSecurities} />
                    <View style={{ marginLeft: 15 }}>
                      <Text
                        style={{
                          color: "black",
                          fontFamily: Fonts.semibold,
                          textAlign: "left",
                          marginLeft: 8,
                          marginBottom: 10,
                        }}
                      >
                        Stocks
                      </Text>
                      <GenericButton
                        onPress={() => navigation.navigate("StocksScreen")}
                        title={"Explore "}
                        cStyle={{
                          backgroundColor: "#000",
                          padding: 5,
                          width: "80%",
                        }}
                        tStyle={{ color: "white", fontSize: 10 }}
                      />
                    </View>
                  </View>
                  <View
                    style={{
                      backgroundColor: "rgba(248, 248, 248, 1)",
                      borderRadius: 15,
                      padding: 15,
                      flexDirection: "row",
                      justifyContent: "flex-start",
                      width: 170,
                      marginLeft: 10,
                    }}
                  >
                    <SvgXml xml={SVGSecurities} />
                    <View style={{ marginLeft: 15 }}>
                      <Text
                        style={{
                          color: "black",
                          fontFamily: Fonts.semibold,
                          textAlign: "left",
                          marginLeft: 8,
                          marginBottom: 10,
                        }}
                      >
                        Stocks
                      </Text>
                      <GenericButton
                        onPress={() => navigation.navigate("StocksScreen")}
                        title={"Explore "}
                        cStyle={{
                          backgroundColor: "#000",
                          padding: 5,
                          width: "80%",
                        }}
                        tStyle={{ color: "white", fontSize: 10 }}
                      />
                    </View>
                  </View>
                </ScrollView>
              </>
            )}
            {isCrypto && (
              <>
                <Text
                  style={{
                    color: "#000",
                    fontFamily: Fonts.semibold,
                    padding: 13,
                    marginLeft: 5,
                    fontSize: 20,
                  }}
                >
                  Your Accounts
                </Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ paddingHorizontal: 10 }}
                  style={{ marginVertical: 10 }}
                >
                  {bankLists &&
                    bankLists?.map((item, index) => (
                      <View
                        key={index}
                        style={{
                          backgroundColor: "rgba(247, 247, 247, 1)",
                          padding: 10,
                          width: 200, // Fixed width for consistent horizontal scrolling
                          borderRadius: 15,
                          marginRight: 10, // Space between cards
                        }}
                      >
                        <View
                          style={{
                            flexDirection: "row",
                            justifyContent: "flex-start",
                            alignItems: "center",
                            width: "90%",
                          }}
                        >
                          <SvgXml xml={SVGUSD} width={25} height={25} />
                          <Text
                            style={{
                              fontFamily: Fonts.semibold,
                              color: "#000",
                              fontSize: 16,
                              marginLeft: 8,
                            }}
                          >
                            {item?.bank_name ?? item?.name}
                            <Text
                              style={{
                                color: "rgba(44, 106, 63, 1)",
                                fontSize: 10,
                                textTransform: "uppercase",
                              }}
                            >
                              {" "}
                              ({item?.account_type ?? "Personal"})
                            </Text>
                          </Text>
                        </View>
                        <Text
                          numberOfLines={1}
                          style={{
                            color: "rgba(106, 106, 106, 1)",
                            fontSize: 10,
                            fontFamily: Fonts.bold,
                            marginLeft: 5,
                            marginTop: 2,
                          }}
                        >
                          {item?.bank_address ?? item?.official_name}
                        </Text>

                        <Text
                          numberOfLines={1}
                          style={{
                            color: "black",
                            fontSize: 10,
                            fontFamily: Fonts.bold,
                            marginLeft: 5,
                            marginTop: 5,
                          }}
                        >
                          Account No: {item?.account_number ?? item?.account_id}{" "}
                        </Text>
                        <View
                          style={{
                            flexDirection: "row",
                            justifyContent: "space-between",
                            alignItems: "center",
                            width: "100%",
                          }}
                        >
                          <Text
                            numberOfLines={1}
                            style={{
                              color: "rgba(44, 106, 63, 1)",
                              fontSize: 16,
                              fontFamily: Fonts.bold,
                              marginLeft: 5,
                              marginTop: 5,
                              width: "60%",
                            }}
                          >
                            ${" "}
                            {item?.balances?.available
                              ? item?.balances?.available
                              : item?.account_type === "rothIra"
                              ? bankbalance?.roth_ira_account?.usd
                              : item?.account_type === "traditionalIra"
                              ? bankbalance?.traditional_ira_account?.usd
                              : bankbalance?.bank_account?.usd}
                          </Text>

                          <Text
                            onPress={() =>
                              navigation.navigate("BankDetails", {
                                item,
                                bankbalance: item?.balances?.available
                                  ? item?.balances?.available
                                  : item?.account_type === "rothIra"
                                  ? bankbalance?.roth_ira_account?.usd
                                  : item?.account_type === "traditionalIra"
                                  ? bankbalance?.traditional_ira_account?.usd
                                  : bankbalance?.bank_account?.usd,
                              })
                            }
                            style={{
                              color: "rgba(106, 106, 106, 1)",
                              fontSize: 10,
                              fontFamily: Fonts.regular,
                              marginLeft: 5,
                              marginTop: 5,
                              textDecorationLine: "underline",
                            }}
                          >
                            View Details
                          </Text>
                        </View>
                      </View>
                    ))}
                  <SvgXml xml={SVGNewBank} onPress={handleOpenLink} />
                </ScrollView>
              </>
            )}

            {/* <LineChart data={data} areaChart /> */}

            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                width: "95%",
                alignSelf: "center",
                paddingVertical: 20,
                marginLeft: 5,
                paddingHorizontal: 5,
              }}
            >
              <Text
                style={{
                  color: "#1D1D1D",
                  fontFamily: Fonts.semibold,
                  fontSize: 20,
                }}
              >
                Pay Airo Contacts
              </Text>
              <Text
                onPress={() =>
                  navigation.navigate("ContactScreen", {
                    isVisble3: isCrypto,
                  })
                }
                style={{
                  color: "#6A6A6A",
                  fontFamily: Fonts.semibold,
                  fontSize: 12,
                }}
              >
                See all
              </Text>
            </View>

            {contactLists.length > 0 ? (
              <StoryLists data={contactLists} isVisble3={isCrypto} />
            ) : (
              <TouchableOpacity
                onPress={() => navigation.navigate("AddContact")}
                style={{
                  backgroundColor: "rgba(44, 106, 63, 1)",
                  paddingBottom: 10,
                  paddingTop: 7,
                  paddingHorizontal: 10,
                  borderRadius: 30,
                  alignSelf: "center",
                  marginTop: 20,
                }}
              >
                <Text
                  style={{
                    color: "white",
                    fontSize: 12,
                    fontFamily: Fonts.semibold,
                  }}
                >
                  + Add People
                </Text>
              </TouchableOpacity>
            )}
            {isCrypto && (
              <>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    width: "95%",
                    alignSelf: "center",
                    paddingVertical: 20,
                    marginLeft: 5,
                    paddingHorizontal: 5,
                  }}
                >
                  <Text
                    style={{
                      color: "#1D1D1D",
                      fontFamily: Fonts.semibold,
                      fontSize: 20,
                    }}
                  >
                    Finance
                  </Text>
                  <Text
                    // onPress={() =>
                    //   navigation.navigate('ContactScreen', {
                    //     isVisble3: isCrypto,
                    //   })
                    // }
                    style={{
                      color: "#6A6A6A",
                      fontFamily: Fonts.semibold,
                      fontSize: 12,
                    }}
                  >
                    See all
                  </Text>
                </View>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ paddingHorizontal: 10 }}
                  style={{ marginVertical: 10 }}
                >
                  <SvgXml
                    xml={SVGBANK2}
                    onPress={() => navigation.navigate("SelectBankScreen")}
                    style={{ marginRight: 10 }}
                  />
                  <SvgXml xml={SVGDebit} style={{ marginRight: 10 }} />
                  <SvgXml xml={SVGCredit} />
                </ScrollView>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    width: "95%",
                    alignSelf: "center",
                    paddingVertical: 20,
                    marginLeft: 5,
                    paddingHorizontal: 5,
                  }}
                >
                  <Text
                    style={{
                      color: "#1D1D1D",
                      fontFamily: Fonts.semibold,
                      fontSize: 20,
                    }}
                  >
                    Utilities
                  </Text>
                  <Text
                    // onPress={() =>
                    //   navigation.navigate('ContactScreen', {
                    //     isVisble3: isCrypto,
                    //   })
                    // }
                    style={{
                      color: "#6A6A6A",
                      fontFamily: Fonts.semibold,
                      fontSize: 12,
                    }}
                  >
                    See all
                  </Text>
                </View>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ paddingHorizontal: 10 }}
                  style={{ marginVertical: 10 }}
                >
                  <SvgXml xml={SVGRecharge} style={{ marginRight: 10 }} />
                  <SvgXml xml={SVGBilPay} style={{ marginRight: 10 }} />
                  <SvgXml xml={SVGBilPay} />
                </ScrollView>
              </>
            )}
            <View
              style={{
                marginHorizontal: 25,
                marginTop: 20,
                paddingBottom: 10,
              }}
            >
              {(txLists && txLists.length > 0) ||
              (web3TxLists && web3TxLists.length > 0) ? (
                <Text
                  style={{
                    color: "#1D1D1D",
                    fontFamily: Fonts.semibold,
                    fontSize: 20,
                    marginBottom: 10,
                  }}
                >
                  Recent Transactions
                </Text>
              ) : null}
              {txLists && isCrypto && txLists.length > 0 ? (
                txLists
                  ?.sort(
                    (a, b) => new Date(b.created_at) - new Date(a.created_at)
                  )
                  ?.slice(0, 5)
                  .map((item, key) => (
                    <View key={key}>
                      <TransactionCard
                        item={item}
                        isMerchent={item?.order_id}
                        isCrypto={item?.order_id}
                      />
                    </View>
                  ))
              ) : (
                <></>
              )}
              {web3TxLists &&
                !isCrypto &&
                web3TxLists.length > 0 &&
                web3TxLists
                  ?.sort(
                    (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
                  )
                  ?.slice(0, 5)
                  .map((item, key) => (
                    <View key={key}>
                      <TransactionCard isCrypto={true} item={item} />
                    </View>
                  ))}
            </View>
            {isCrypto && (
              <>
                <View style={{ marginHorizontal: 25, marginTop: 20 }}>
                  <Text
                    style={{
                      color: "#1D1D1D",
                      fontFamily: Fonts.semibold,
                      fontSize: 20,
                      marginBottom: 10,
                    }}
                  >
                    Offer & Rewards{" "}
                  </Text>
                </View>
                <Animated.View
                  style={[
                    {
                      transform: [{ translateY: translateY }],
                      opacity: opacity,
                    }, // Add opacity here
                  ]}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginHorizontal: 10,
                    }}
                  >
                    <Rewards />
                    <Rewards
                      item={{
                        name: "Vouchers",
                        icon: SVGVoucher,
                        route: "VouchersScreens",
                        bgColor: "#f1edfe",
                      }}
                    />
                    <Rewards
                      item={{
                        name: "Referrals",
                        icon: SVGRef,
                        route: "VouchersScreens",
                        bgColor: "rgba(95, 255, 0, 0.09)",
                      }}
                    />
                  </View>
                  {isCrypto && (
                    <>
                      <Text
                        style={{
                          color: "#000",
                          fontFamily: Fonts.semibold,
                          padding: 13,
                          marginLeft: 5,
                          fontSize: 20,
                        }}
                      >
                        Others Services
                      </Text>
                      <View style={{ marginBottom: 130, marginHorizontal: 20 }}>
                        <SvgXml
                          xml={SVGBamkAdd}
                          style={{ marginVertical: 10 }}
                          onPress={() => handleRothBank()}
                        />
                        <SvgXml
                          xml={SVGDebitCardAdd}
                          onPress={() => setisCardModalVisible(true)}
                        />
                        <Pressable
                          onPress={() =>
                            navigation.navigate("IntraAccountTransfer")
                          }
                          style={{
                            flexDirection: "row",
                            justifyContent: "flex-start",
                            alignItems: "center",
                            marginVertical: 10,
                          }}
                        >
                          <SvgXml xml={SVGDebitAdd} />
                          <Text
                            style={{
                              color: "black",
                              fontFamily: Fonts.semibold,
                              marginLeft: 10,
                            }}
                          >
                            Intra account transfer
                          </Text>
                        </Pressable>
                      </View>
                    </>
                  )}
                </Animated.View>
              </>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {showPin && (
        <PincodeScreen
          pinTxt={pinTxt}
          onPress={async (e, f) => {
            setshowPin(false);

            if (!f) {
              if (e !== isConfirm) {
                showError("Pin not matched , Try Again");
                setpinTxt("Confirm your pin");
                setshowPin(true);
                return;
              }
              const formData = new FormData();
              formData.append("tpin", e);
              const data = await createPin(formData, tokens?.access);
              if (data && data?.status) {
                setPin(e);
                showSuccess("Transaction Pin created successfully");
              } else {
                showError("Something Went Wrong");
              }
            } else {
              setisConfirm(e);
              setpinTxt("Confirm your pin");
              setshowPin(f);
            }
          }}
        />
      )}
    </Container>
  );
}

// const PlaidConnect = () => {

//   return (
//     <View>
//       {linkToken ? (
//         <GenericButton title="Connect Bank Account" onPress={handleOpenLink} />
//       ) : (
//         <GenericButton title="Fetching Link Token..." disabled />
//       )}
//     </View>
//   );
// };

// export default PlaidConnect;
