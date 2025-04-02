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
} from './images';

export const REWARDS = [
  {
    name: 'Rewards',
    bgColor: 'rgba(255, 234, 177, 0.7)',
    image: SVGReward,
  },
  {
    name: 'Vouchers',
    bgColor: 'rgba(255, 234, 177, 0.7)',
    image: SVGVoucher,
  },
  {
    name: 'Referrals',
    bgColor: 'rgba(255, 234, 177, 0.7)',
    image: SVGReward,
  },
];

export const TRANSACTION_HISTORY = [
  {'Transfer Date': '30 May 2024'},
  {Sender: 'Dennis'},
  {'Receiver ID': 'Frances_swann'},
  {'Requested Amount': '$5000'},
  {'Successfully Sent': '$5025'},
];

export const SETTINGS_LISTS = [
  {name: 'My Profile', icon: SVGPro, isDisvled: false, route: 'Personal'},
  {
    name: 'Security & privacy',
    icon: SVGSec,
    isDisvled: false,
    route: 'Settings2',
  },
  {name: 'Add Card', icon: SVGCard, isDisvled: false, route: 'AddCard'},
  {name: 'Alerts', icon: SVGNoti, isDisvled: false, route: 'AlertScreen'},
  {name: 'Logout', icon: SVGLog, isDisvled: false, route: 'Profile'},
];
export const SECURITY_LISTS = [
  {name: 'App Lock', icon: SVG2FA, route: '2FA'},
  {name: 'Change Pin', icon: SVGChangePin, route: 'ChangePinScreen'},
  {name: 'Device Management', icon: SVGChangePin, route: 'DeviceManagement'},
];

export const CARD_TYPE = [
  {name: 'ACH', icon: SVGAch, route: 'AchScreen'},
  {name: 'Credit Card', icon: SVGCard4, route: 'AddCreditCard'},
  {name: 'Debit Card', icon: SVGCard4, route: 'AddCard'},
];
export const BANK_TYPE = [
  {name: 'Pension Account', icon: SVGAch, route: ''},
  {name: 'Salary Account', icon: SVGCard4, route: ''},
  {name: 'Savings Account', icon: SVGCard4, route: ''},
];
export const FINANCE_LISTS = [
  {
    name: 'Send Money',
    icon: SVGSendMonsy,
    route: 'Send',
  },
  {
    name: 'Recharge',
    icon: SVGRecharges,
  },
  {
    name: 'FastTag',
    icon: SVGFastTag,
  },
  {
    name: 'Accounts & FD',
    icon: SVGAccountsFD,
  },
  {
    name: 'Loans',
    icon: SVGLoan,
  },
  {
    name: 'Mutual Fund',
    icon: SVGMFund,
  },
  {
    name: 'UPI',
    icon: SVGUPI,
  },
  {
    name: 'Bills',
    icon: SVGBills,
  },
];
