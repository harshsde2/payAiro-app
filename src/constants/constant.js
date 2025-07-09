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

export const REWARDS = [
  {
    name: "Rewards",
    bgColor: "rgba(255, 234, 177, 0.7)",
    icon: <SvgIcons.RewardsIcon />,
    route: NAVIGATION_SCREENS.SCRATCH,
  },
  {
    name: "Vouchers",
    bgColor: "rgba(255, 234, 177, 0.7)",
    icon: <SvgIcons.Vouchers />,
    route: NAVIGATION_SCREENS.VOUCHERS_SCREENS,
  },
  {
    name: "Referrals",
    bgColor: "rgba(255, 234, 177, 0.7)",
    icon: <SvgIcons.ReferralsIcon />,
    route: NAVIGATION_SCREENS.REWARDS,
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
    name: "Security & privacy",
    icon: <SvgIcons.SecurityIcon />,
    isDisvled: false,
    route: "Settings2",
  },
  {
    name: "Add Card",
    icon: <SvgIcons.AddCardIcon />,
    isDisvled: false,
    route: "AddCard",
  },
  {
    name: "Bank Statement",
    icon: <SvgIcons.BankStatement />,
    isDisvled: false,
    route: NAVIGATION_SCREENS.STATEMENT,
  },
  {
    name: "Alerts",
    icon: <SvgIcons.AlertIcon />,
    isDisvled: false,
    route: "AlertScreen",
  },
  {
    name: "Terms & Condition",
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
  { name: "App Lock", icon: SVG2FA, route: "2FA" },
  { name: "Change Pin", icon: SVGChangePin, route: "ChangePinScreen" },
  { name: "Device Management", icon: SVGChangePin, route: "DeviceManagement" },
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
    icon: <SvgIcons.SendMoneyIcon />,
    route: NAVIGATION_SCREENS.SEND,
  },
  {
    name: "Recharge",
    icon: <SvgIcons.SendMoneyIcon />,
    route: NAVIGATION_SCREENS.COMING_SOON,
  },
  {
    name: "FastTag",
    icon: <SvgIcons.FastTagIcon />,
    route: NAVIGATION_SCREENS.COMING_SOON,
  },
  {
    name: "Accounts & FD",
    icon: <SvgIcons.AccountsAndFDIcon />,
    route: NAVIGATION_SCREENS.COMING_SOON,
  },
  {
    name: "Loans",
    icon: <SvgIcons.LoansIcon />,
    route: NAVIGATION_SCREENS.COMING_SOON,
  },
  {
    name: "Mutual Fund",
    icon: <SvgIcons.DollarCircleIcon />,
    route: NAVIGATION_SCREENS.COMING_SOON,
  },
  {
    name: "UPI",
    icon: <SvgIcons.UPIIcon />,
    route: NAVIGATION_SCREENS.COMING_SOON,
  },
  {
    name: "Bills",
    icon: <SvgIcons.BillsIcon />,
    route: NAVIGATION_SCREENS.COMING_SOON,
  },
];
