import {
  SVGBankIcon,
  SVGBillPaymentIcon,
  SVGCreditIcon,
  SVGDebitIcon,
  SVGRechargeIcon,
  SVGUtilitiesIcon,
} from "constants/images";
import { SvgIcons } from "constants/svgs";
import { NAVIGATION_SCREENS } from "navigations/navigationConstants";

export const size = {
  width: 45,
  height: 45,
};

export const renderFinanceIcons = [
  {
    label: "Bank",
    IconName: SVGBankIcon,
    width: size.width,
    height: size.height,
    navigationScreenName: NAVIGATION_SCREENS.SELECT_BANK_SCREEN,
  },
  {
    label: "Debit",
    IconName: SVGDebitIcon,
    width: size.width,
    height: size.height,
    navigationScreenName: "",
  },
  {
    label: "Credit",
    IconName: SVGCreditIcon,
    width: size.width,
    height: size.height,
    navigationScreenName: "",
  },
];

export const renderUtilitiesIcons = [
  {
    label: "Recharge",
    IconName: SvgIcons.RechargeIcon,
    width: size.width,
    height: size.height,
    navigationScreenName: NAVIGATION_SCREENS.COMING_SOON,
  },
  {
    label: "Bill Payment",
    IconName: SvgIcons.BillPaymentIcon,
    width: size.width,
    height: size.height,
    navigationScreenName: NAVIGATION_SCREENS.COMING_SOON,
  },
  {
    label: "Utilities",
    IconName: SvgIcons.UtilitiesIcon,
    width: size.width,
    height: size.height,
    navigationScreenName: NAVIGATION_SCREENS.COMING_SOON,
  },
];
