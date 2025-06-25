import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  KeyboardAvoidingView,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import Container from "../../HOC/Container";
import BottomNavigation from "../../components/BottomNavigation";
import HeaderTitle from "../../components/HeaderTitle";
import Fonts from "../../constants/Fonts";
import TransactionCard from "../../components/TransactionCard";
import RequestPayCard from "../../components/RequestPayCard";
import { SCREENS } from "../../constants/SCREENS";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import useDispatchAction from "../../hooks/useDispatchAction";
import {
  setActiveTab,
  setErrorMsg,
  setPendingRequest,
  setSuccessMsg,
} from "../../redux/slices/authenticationSlice";
import {
  cancelMerchent,
  cancelUser,
  getContactPay,
  getCryptoTx,
  getMechentPay,
  getPayAeroTx,
  getPayRequest,
} from "../../services/Services";
import useSelectorAction from "../../hooks/useSelectorAction";
import CustomPieChart from "../../components/CustomPieChart";
import { ScreenContainer } from "HOC";
import { themes, useTheme } from "styles";
import {
  useCryptoTrades,
  usePendingRequests,
  useTransactions,
  useUserPaymentRequests,
} from "query/hooks";
import { get } from "react-native/Libraries/TurboModule/TurboModuleRegistry";
import DashboardSection from "tsx-components/DashboardSection";

export default function Transaction() {
  const { walletData, tokens, isCrypto } = useSelectorAction();

  const {
    data: AllTransactions,
    isLoading: isLoadingAllTransactions,
    error: allTransactionsError,
    isSuccess: AllTransactionsSuccess,
    refetch: refetchAllTransactions,
    isFetched: isFetchedAllTransactions,
  } = useTransactions();

  const {
    data: AllTradesHistory,
    isLoading: isLoadingAllTradesHistorys,
    error: AllTradesHistoryError,
    isSuccess: AllTradesHistorySuccess,
    refetch: refetchAllTradesHistory,
    isFetched: isFetchedAllTradesHistory,
  } = useCryptoTrades();

  const {
    data: AllUserPaymentRequests,
    isLoading: isLoadingAllUserPaymentRequests,
    error: AllUserPaymentRequestsError,
    isSuccess: AllUserPaymentRequestsSuccess,
    refetch: refetchAllUserPaymentRequests,
    isFetched: isFetchedAllUserPaymentRequests,
  } = useUserPaymentRequests();

  const {
    data: AllPendingRequests,
    isLoading: isLoadingAllPendingRequests,
    error: AllPendingRequestsError,
    isSuccess: AllPendingRequestsSuccess,
    refetch: refetchAllPendingRequests,
    isFetched: isFetchedAllPendingRequests,
  } = usePendingRequests();

  const navigation = useNavigation();
  const isFocused = useIsFocused();

  const [txLists, setTxLists] = useState([]);
  const [merchentLists, setMerchentLists] = useState([]);
  const [contactsLists, setContactsLists] = useState([]);
  const [requestLists, setRequestLists] = useState([]);
  const [activeTab, setActiveTabState] = useState("1");
  const [activeTab2, setActiveTab2State] = useState("1");
  const [web3TxLists, setweb3TxLists] = useState([]);
  const [txListsWeb3, settxListsWeb3] = useState([]);
  const [formattedDataTx, setformattedDataTx] = useState([]);
  const [totalAmount, settotalAmount] = useState(0);

  const { theme } = useTheme();

  // Dispatch action when screen is focused
  useEffect(() => {
    if (isFocused) {
      useDispatchAction(setActiveTab("2"));
    }
  }, [isFocused]);

  useEffect(() => {
    if (AllTransactionsSuccess && isFetchedAllTransactions) {
      getTxLists(AllTransactions.data);
    }
    if (AllTradesHistorySuccess && isFetchedAllTradesHistory) {
      getCryptoTxs(AllTradesHistory.data);
    }
    if (AllUserPaymentRequests && isFetchedAllUserPaymentRequests) {
      getMerchentRequest(AllUserPaymentRequests.data);
    }
    if (AllPendingRequestsSuccess && isFetchedAllPendingRequests) {
      getContactRequests(AllPendingRequests.data);
    }
  }, [
    AllTransactions,
    AllTradesHistory,
    AllTransactionsSuccess,
    AllTradesHistorySuccess,
    AllUserPaymentRequestsSuccess,
    AllUserPaymentRequests,
    AllPendingRequests,
    isFetchedAllPendingRequests,
  ]);

  // console.log(isCrypto);
  // Handle tab switching
  useEffect(() => {
    if (activeTab === "1") {
      setRequestLists(merchentLists);
    } else if (activeTab === "2") {
      setRequestLists(contactsLists);
    }
  }, [activeTab, merchentLists, contactsLists]);

  useEffect(() => {
    if (activeTab2 === "1") {
      settxListsWeb3(txLists);
    } else if (activeTab2 === "2") {
      settxListsWeb3(web3TxLists);
    }
  }, [activeTab2, txLists, web3TxLists]);

  const getTxLists = async (data) => {
    // if (!data) {
    setformattedDataTx(data?.category_percentages);
    settotalAmount(data?.total_transaction_amount);
    setTxLists(
      [...data?.merchantTransactions, ...data?.userToUserTransactions].filter(
        (i) => i?.status === "success" || i?.status === "completed"
      ) ?? []
    );
    // }
  };

  const getCryptoTxs = async (data) => {
    setweb3TxLists([...data?.nft_transactions, ...data?.trades] ?? []);
  };

  const getMerchentRequest = async (data) => {
    // const data = await getPayRequest(tokens?.access);

    const merchant_transactions =
      data?.merchant_transactions?.transactions?.map((i) => {
        return { ...i, type: "merchant_transactions" };
      });

    const received_pending_requests =
      data?.user_to_user_requests?.received_pending_requests?.map((i) => {
        return { ...i, type: "received_pending_requests" };
      });

    const sent_pending_requests =
      data?.user_to_user_requests?.sent_pending_requests?.map((i) => {
        return { ...i, type: "sent_pending_requests" };
      });

    setMerchentLists([
      ...merchant_transactions,
      ...received_pending_requests,
      ...sent_pending_requests,
    ]);
    useDispatchAction(
      setPendingRequest(
        merchant_transactions?.length + received_pending_requests?.length ?? 0
      )
    );
  };

  const getContactRequests = async (data) => {
    setContactsLists(data?.received_pending_requests ?? []);
  };

  const handleTabSwitch = (tab) => {
    setActiveTabState(tab);
  };
  const handleTabSwitch2 = (tab) => {
    setActiveTab2State(tab);
  };

  const formattedData = (e) => {
    if (!e || typeof e !== "object") return [];

    return Object.keys(e).map((key) => {
      const item = e[key] || {};
      return {
        assetType: key.replace(/_/g, " "),
        percentage: item.percentage ?? 0,
        color: item.color ?? "#000000",
      };
    });
  };

  const handleCancel = async (item) => {
    let data;
    const formData = new FormData();
    if (item?.project_name) {
      formData.append("order_id", item?.order_id);
      data = await cancelMerchent(formData, tokens?.access);
      // console.log(data, "cancelPayment");
      if (data && data?.status) {
        useDispatchAction(setSuccessMsg(data?.data?.message));
        getMerchentRequest();
      } else {
        useDispatchAction(setErrorMsg("Failed to cancel a payment"));
      }
    } else {
      data = await cancelUser(
        item?.request_details?.request_id,
        tokens?.access
      );
      if (data && data?.status) {
        useDispatchAction(setSuccessMsg("Payment request has been cancelled."));
        getMerchentRequest();
      } else {
        useDispatchAction(setErrorMsg("Failed to cancel a payment"));
      }
    }
  };
  // console.log(
  //   "formattedDataTx =>",
  //   JSON.stringify(formattedData(formattedDataTx), null, 2)
  // );
  return (
    <ScreenContainer
      padding={0}
      backgroundColor={theme.colors.background.primary}
    >
      <BottomNavigation />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ flexGrow: 1 }}
        >
          <HeaderTitle title={"Transactions"} />
          <View
            style={{
              flex: 1,
              backgroundColor: "#fff",
              borderTopEndRadius: 32,
              borderTopStartRadius: 32,
              padding: 20,
              marginTop: 20,
            }}
          >
            {isCrypto && (
              <DashboardSection title="Transaction Summary">
                <CustomPieChart
                  isTx={true}
                  amount={totalAmount}
                  alloCationLists={formattedData(formattedDataTx) ?? []}
                />
              </DashboardSection>
            )}
            {isCrypto && merchentLists?.length > 0 && (
              <DashboardSection
                style={{ marginTop: "auto" }}
                title="Payment Requests"
              >
                {isCrypto &&
                  merchentLists?.length > 0 &&
                  merchentLists?.map((i, k) => (
                    <RequestPayCard
                      item={i}
                      key={k}
                      amount={i?.request_details?.amount}
                      reqId={i?.request_uuid}
                      isSentRequest={i?.recipient_details}
                      onPress={() =>
                        navigation.navigate(SCREENS.ScanPay, {
                          type: "request",
                          sender: i,
                        })
                      }
                      onCancel={() => handleCancel(i)}
                    />
                  ))}
              </DashboardSection>
            )}

            {/* Recent Transactions */}
            <DashboardSection
              title="Recent Transactions"
              style={{ paddingBottom: 160 }}
            >
              {isCrypto &&
                txLists &&
                txLists.length > 0 &&
                txLists
                  ?.sort(
                    (a, b) => new Date(b.created_at) - new Date(a.created_at)
                  )
                  .map((item, key) => (
                    <View key={key}>
                      <TransactionCard
                        item={item}
                        isMerchent={item?.order_id ? true : false}
                        isCrypto={item?.order_id ? true : false}
                      />
                    </View>
                  ))}
              {!isCrypto && web3TxLists.length > 0 ? (
                web3TxLists
                  ?.sort((a, b) => {
                    const dateA = new Date(a?.created_at || a?.timestamp);
                    const dateB = new Date(b?.created_at || b?.timestamp);
                    return dateB - dateA;
                  })
                  ?.map((i, k) => (
                    <TransactionCard isCrypto={true} item={i} key={k} />
                  ))
              ) : (
                <Text
                  style={{
                    fontFamily: Fonts.bold,
                    color: "#fff",
                    textAlign: "center",
                    marginTop: 100,
                  }}
                >
                  No Transaction Found
                </Text>
              )}
            </DashboardSection>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}
