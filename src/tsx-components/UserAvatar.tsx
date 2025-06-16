import { View, Text, StyleSheet, Image, ViewProps } from "react-native";
import React, { FC } from "react";
import { Theme, useTheme } from "styles";
import { defaultImage } from "utils/configs";

export interface RecentTransaction {
  id?: number;
  uuid?: string;
  transaction_id?: string;
  sender_wallet_public_key?: string;
  recipient_wallet_public_key?: string;
  sender_username?: string;
  recipient_username?: string;
  sender_profile_photo?: string | null;
  recipient_profile_photo?: string | null;
  sender_wallet?: string;
  recipient_wallet?: string;
  amount: number | string;
  status: string;
  description?: string | null;
  note?: string | null;
  created_at: string;
  updated_at?: string;
  order_id?: string;
  transaction_type?: string;
  project_name?: string;
}

interface UserAvatarProps extends ViewProps {
  item: RecentTransaction;
  currentUserWalletPublicKey: string; // needed to determine if 'you' sent/received
}

const UserAvatar: FC<UserAvatarProps> = ({
  item,
  currentUserWalletPublicKey,
}) => {
  const { theme } = useTheme();
  const styles = AvatarStyles(theme);

  const isSent = item.sender_wallet_public_key === currentUserWalletPublicKey;
  const isTransactionByProject = !!item.project_name;

  const imageURL = isSent
    ? item.recipient_profile_photo || null
    : item.sender_profile_photo || null;

  // Determine the other party's avatar and initials
  const avatarUrl = isTransactionByProject
    ? null
    : imageURL
    ? isSent
      ? `https://app.payairo.com${item.recipient_profile_photo}`
      : `https://app.payairo.com${item.sender_profile_photo}`
    : null;

  const initials = isTransactionByProject
    ? item.project_name?.charAt(0)?.toUpperCase()
    : isSent
    ? item.recipient_username?.slice(0, 2)?.toUpperCase()
    : item.sender_username?.slice(0, 2)?.toUpperCase();

  // console.log("avatar image ->", avatarUrl);

  return (
    <View style={styles.avatarWrapper}>
      {avatarUrl ? (
        <Image
          source={avatarUrl ? { uri: avatarUrl } : defaultImage}
          style={styles.avatarImage}
        />
      ) : (
        <View style={styles.initialsCircle}>
          <Text style={styles.initialsText}>{initials}</Text>
        </View>
      )}
    </View>
  );
};

export default UserAvatar;

const AvatarStyles = (theme: Theme) =>
  StyleSheet.create({
    avatarWrapper: {
      width: 40,
      height: 40,
      borderRadius: 35,
      overflow: "hidden",
      justifyContent: "center",
      alignItems: "center",
    },
    avatarImage: {
      width: "100%",
      height: "100%",
      borderRadius: 35,
    },
    initialsCircle: {
      width: 40,
      height: 40,
      borderRadius: 35,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: theme.colors.palette.green200,
    },
    initialsText: {
      color: theme.colors.palette.green700,
      fontSize: 16,
      fontFamily: theme.typography.fontWeight.semiBold,
    },
  });
