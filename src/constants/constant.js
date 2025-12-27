import { NAVIGATION_SCREENS } from "navigations/navigationConstants";
import {
  SVG2FA,
  SVGAccountsFD,
  SVGAch,
  SVGBills,
  SVGCard,
  SVGCard4,
  SVGChangePin,
  SVGFA,
  SVGFastTag,
  SVGLimit,
  SVGLoan,
  SVGLock,
  SVGLog,
  SVGMFund,
  SVGNoti,
  SVGPro,
  SVGRecharge,
  SVGRecharges,
  SVGReward,
  SVGSec,
  SVGSendMonsy,
  SVGSupp,
  SVGUPI,
  SVGVoucher,
} from "./images";
import { SvgIcons } from "./svgs";
import { View } from "react-native";
import { themes } from "styles";

export const REWARDS = [
  {
    name: "Rewards",
    bgColor: "rgba(255, 234, 177, 0.7)",
    icon: <SvgIcons.RewardsIcon />,
    route: NAVIGATION_SCREENS.SCRATCH,
    description: "Earn upto $100 rewards by scratching cards",
    earned: 100,
  },
  // {
  //   name: "Vouchers",
  //   bgColor: "rgba(255, 234, 177, 0.7)",
  //   icon: <SvgIcons.Vouchers />,
  //   route: NAVIGATION_SCREENS.VOUCHERS_SCREENS,
  // },
  {
    name: "Referrals",
    bgColor: "rgba(206, 177, 255, 0.7)",
    icon: <SvgIcons.ReferralsIcon />,
    route: NAVIGATION_SCREENS.REFERRAL_SCREEN,
    earned: 5,
    description: "Earn $5 for each Referral"
  },
];

export const TRANSACTION_HISTORY = [
  { "Transfer Date": "30 May 2024" },
  { Sender: "Dennis" },
  { "Receiver ID": "Frances_swann" },
  { "Requested Amount": "$5000" },
  { "Successfully Sent": "$5025" },
];

export const SETTINGS_LISTS = [
  {
    name: "My Profile",
    icon: <SvgIcons.UserProfile />,
    isDisvled: false,
    route: "Personal",
  },
  {
    name: "Security & Privacy",
    icon: <SvgIcons.SecurityIcon />,
    isDisvled: false,
    route: "Settings2",
  },
  // {
  //   name: "Add Card",
  //   icon: <SvgIcons.AddCardIcon />,
  //   isDisvled: false,
  //   route: "AddCard",
  // },
  {
    name: "Bank Statement",
    icon: <SvgIcons.BankStatement />,
    isDisvled: false,
    route: NAVIGATION_SCREENS.STATEMENT,
  },
  {
    name: "Rewards & Referrals",
    icon: <View style={{backgroundColor: themes.dark.colors.palette.green700, justifyContent: 'center', alignItems: 'center',borderRadius: 25,width: 55,height:45}}>
      <SvgIcons.Refferal width={25} height={25} />
    </View>,
    isDisvled: false,
    route: NAVIGATION_SCREENS.REWARDS,
  },
  // {
  //   name: "Alerts",
  //   icon: <SvgIcons.AlertIcon />,
  //   isDisvled: false,
  //   route: "AlertScreen",
  // },
  {
    name: "Terms & Condition",
    icon: <SvgIcons.TermsAndConditions />,
    isDisvled: false,
    route: "",
  },
  {
    name: "Cybrid User Agreement",
    icon: <SvgIcons.TermsAndConditions />,
    isDisvled: false,
    route: "",
  },
  {
    name: "Support",
    icon: <SvgIcons.ChatSupport />,
    isDisvled: false,
    route: NAVIGATION_SCREENS.SUPPORT_SCREEN,
  },
  // {
  //   name: "Chat Support",
  //   icon: <SvgIcons.ChatSupport />,
  //   isDisvled: false,
  //   route: NAVIGATION_SCREENS.FRESHCHAT_SCREEN,
  // },
  {
    name: "Logout",
    icon: <SvgIcons.LogoutIcon />,
    isDisvled: false,
    route: "Profile",
  },
  // {
  //   name: "ACH",
  //   icon: SVGLog,
  //   isDisvled: false,
  //   route: NAVIGATION_SCREENS.ACH_SCREEN,
  // },
];
export const SECURITY_LISTS = [
  // { name: "App Lock", icon: SVG2FA, route: "2FA" },
  { name: "Change Pin", icon: SVGChangePin, route: "ChangePinScreen" },
  // { name: "Device Management", icon: SVGChangePin, route: "DeviceManagement" },
];

export const CARD_TYPE = [
  // { name: "ACH", icon: SVGAch, route: "AchScreen" },
  { name: "Credit Card", icon: <SvgIcons.DebitCard />, route: "AddCreditCard" },
  { name: "Debit Card", icon: <SvgIcons.DebitCard />, route: "AddCard" },
];
export const BANK_TYPE = [
  { name: "Pension Account", icon: "", route: "" },
  { name: "Salary Account", icon: "", route: "" },
  { name: "Savings Account", icon: "", route: "" },
];
export const FINANCE_LISTS = [
  {
    name: "Send Money",
    icon: <SvgIcons.SendIcon2 />,
    route: NAVIGATION_SCREENS.SEND,
  },
  {
    name: "Receive Money",
    icon: <SvgIcons.ReceiveIcon />,
    route: NAVIGATION_SCREENS.RECEIVE,
  },
  {
    name: "Add Money",
    icon: <SvgIcons.AddWallet width={20} height={20} />,
    route: NAVIGATION_SCREENS.ADD_BALANCE,
  },
  {
    name: "Withdraw Money",
    icon: <SvgIcons.WithdrawIcon2 />,
    route: NAVIGATION_SCREENS.WITHDRAW_BALANCE,
  },
  {
    name: "Buy / Sell Crypto",
    icon: <SvgIcons.CryptoIcon2 width={20} height={20} />,
    route: NAVIGATION_SCREENS.CRYPTO_SCREEN,
  },
  // {
  //   name: "Mutual Fund",
  //   icon: <SvgIcons.DollarCircleIcon />,
  //   route: NAVIGATION_SCREENS.COMING_SOON,
  // },
  // {
  //   name: "UPI",
  //   icon: <SvgIcons.UPIIcon />,
  //   route: NAVIGATION_SCREENS.COMING_SOON,
  // },
  // {
  //   name: "Bills",
  //   icon: <SvgIcons.BillsIcon />,
  //   route: NAVIGATION_SCREENS.COMING_SOON,
  // },
];
