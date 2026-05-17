import React from "react";
import { TouchableOpacity, View } from "react-native";
import moment from "moment";
import { useTheme } from "@new-ui/styles/ThemeContext";
import { recentActivityCardStyles } from "@new-ui/styles/components/recentActivityCardStyles";
import CustomText from "@new-ui/components/common-components/CustomText";
import {
  formatCashOnRampCryptoAmount,
  formatCashOnRampFiatAmount,
  getCashOnRampCardTitle,
  resolveCashOnRampDisplayStatus,
} from "./cashOnRampActivity";
import {
  isCashOnRampActivity,
  isTradeActivity,
  type IRecentActivityCardProps,
  type SendHistoryParty,
} from "./types";

const truncateAddress = (addr: string | null | undefined): string => {
  if (!addr) return "";
  const t = addr.trim();
  if (t.length <= 12) return t;
  return `${t.slice(0, 4)}…${t.slice(-4)}`;
};

const getDisplayName = (
  party: SendHistoryParty | null | undefined,
  fallbackDestination: string | null | undefined
): string => {
  if (!party) {
    if (fallbackDestination) return truncateAddress(fallbackDestination);
    return "Unknown";
  }
  const full = [party.firstName, party.lastName].filter(Boolean).join(" ").trim();
  if (full) return full;
  if (party.username) return `@${party.username}`;
  if (party.destinationWalletAddress) return truncateAddress(party.destinationWalletAddress);
  if (fallbackDestination) return truncateAddress(fallbackDestination);
  return "Unknown";
};

const getInitial = (displayName: string): string => {
  const t = displayName.replace(/^@/, "").trim();
  if (!t) return "?";
  return t.charAt(0).toUpperCase();
};

const RecentActivityCard: React.FC<IRecentActivityCardProps> = ({
  item,
  usdPrice,
  onPress,
}) => {
  const { theme } = useTheme();
  const styles = recentActivityCardStyles(theme);

  if (isCashOnRampActivity(item)) {
    const display = resolveCashOnRampDisplayStatus(item);
    const statusColor =
      display.colorKey === "success"
        ? theme.colors.success
        : display.colorKey === "error"
          ? theme.colors.error
          : theme.colors.warning;
    const pressable = display.kind !== "expired" && onPress != null;

    const body = (
      <>
        <View style={styles.iconCircle}>
          <View style={styles.iconCircleInner}>
            <CustomText style={styles.cashIconText}>$</CustomText>
          </View>
        </View>
        <View style={styles.textContainer}>
          <CustomText style={styles.title} numberOfLines={1}>
            {getCashOnRampCardTitle()}
          </CustomText>
          <CustomText style={[styles.statusSubtitle, { color: statusColor }]} numberOfLines={1}>
            {display.label}
          </CustomText>
        </View>
        <View style={styles.amountsColumn}>
          <CustomText style={styles.fiatAmount}>{formatCashOnRampFiatAmount(item)}</CustomText>
          <CustomText style={styles.cryptoAmount} numberOfLines={1}>
            {formatCashOnRampCryptoAmount(item)}
          </CustomText>
        </View>
      </>
    );

    if (pressable) {
      return (
        <TouchableOpacity
          style={styles.container}
          onPress={() => onPress(item)}
          activeOpacity={0.7}
        >
          {body}
        </TouchableOpacity>
      );
    }

    return <View style={styles.container}>{body}</View>;
  }

  let title: string;
  let displayNameForInitial: string;
  let amountStr: string;
  let amountStyle = styles.amountNegative;
  let isPending = false;

  if (isTradeActivity(item)) {
    const crypto = item.cryptoCurrencyCode?.trim() || "?";
    displayNameForInitial = crypto;
    title =
      item.activity === "TRADE_BUY" || item.tradeType === "buy"
        ? `Bought ${crypto}`
        : `Sold ${crypto}`;

    const amt = Number.parseFloat(item.amountValue);
    const code = (item.amountCurrencyCode ?? "").toUpperCase();
    const fiatCode = (item.fiatCurrencyCode ?? "USD").toUpperCase();
    const cryptoCode = (item.cryptoCurrencyCode ?? "").toUpperCase();

    if (item.tradeType === "buy" || item.activity === "TRADE_BUY") {
      amountStyle = styles.amountNegative;
      const spendIsFiat = code === "USD" || code === fiatCode;
      const spendIsCrypto = cryptoCode.length > 0 && code === cryptoCode;
      let usdOut: number | null = null;
      if (spendIsFiat && Number.isFinite(amt)) {
        usdOut = amt;
      } else if (spendIsCrypto && usdPrice != null && Number.isFinite(usdPrice) && Number.isFinite(amt)) {
        usdOut = amt * usdPrice;
      } else if (spendIsCrypto && fiatCode === "USD" && Number.isFinite(amt)) {
        usdOut = amt;
      } else if (Number.isFinite(amt)) {
        usdOut = amt;
      }
      amountStr =
        usdOut != null
          ? `-$${usdOut.toFixed(2)}`
          : `-$${item.amountValue}`;
    } else {
      amountStyle = styles.amountPositive;
      const amountCode = item.amountCurrencyCode || item.cryptoCurrencyCode;
      amountStr = `+${item.amountValue} ${amountCode}`;
    }
  } else {
    const isIncoming = item.direction === "received";
    const counterparty = isIncoming ? item.sentBy : item.sentTo;
    displayNameForInitial = getDisplayName(counterparty, item.destinationWalletAddress);
    title = `${isIncoming ? "Received from" : "Transfer to"} ${displayNameForInitial}`;

    const sign = isIncoming ? "+" : "-";
    const hasUsd = usdPrice != null && Number.isFinite(usdPrice);
    const amountNum = Number.parseFloat(item.amount ?? "0");
    const formattedAmount = Number.isFinite(amountNum)
      ? amountNum.toFixed(2)
      : (item.amount ?? "0");
    const currencyLabel = (item.currency ?? item.chain ?? "").toString().trim();
    amountStr = hasUsd
      ? `${sign}$${(amountNum * (usdPrice as number)).toFixed(2)}`
      : currencyLabel
        ? `${sign}${formattedAmount} ${currencyLabel}`
        : `${sign}${formattedAmount}`;

    amountStyle = isIncoming ? styles.amountPositive : styles.amountNegative;

    const statusLower = String(item.status ?? "").toLowerCase();
    isPending = statusLower === "pending" || statusLower === "processing";
  }

  const datetime = moment(item.createdAt).format("DD MMM[.] YY | hh:mma");
  const pendingDotColor = theme.colors.warning;

  const avatar = (
    <View style={styles.iconCircle}>
      <View style={styles.iconCircleInner}>
        <CustomText style={styles.initialText}>{getInitial(displayNameForInitial)}</CustomText>
      </View>
      {isPending ? (
        <View style={[styles.pendingDot, { backgroundColor: pendingDotColor }]} />
      ) : null}
    </View>
  );

  const body = (
    <>
      {avatar}
      <View style={styles.textContainer}>
        <CustomText style={styles.title} numberOfLines={1}>
          {title}
        </CustomText>
        <CustomText style={styles.datetime}>{datetime}</CustomText>
      </View>
      <CustomText style={amountStyle}>{amountStr}</CustomText>
    </>
  );

  if (onPress) {
    return (
      <TouchableOpacity
        style={styles.container}
        onPress={() => onPress(item)}
        activeOpacity={0.7}
      >
        {body}
      </TouchableOpacity>
    );
  }

  return <View style={styles.container}>{body}</View>;
};

export default RecentActivityCard;
