import React, { useLayoutEffect, useMemo, useRef } from 'react';
import { useSelector } from 'react-redux';
import {
  View,
  ActivityIndicator,
  Image,
  Alert,
  Clipboard,
  Platform,
  ToastAndroid,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Share from 'react-native-share';
import { SvgUri } from 'react-native-svg';
import ScreenWrapper from '@new-ui/components/common-components/ScreenWrapper';
import CustomText from '@new-ui/components/common-components/CustomText';
import { Button } from '@new-ui/components/common-components/layout';
import { useTheme } from '@new-ui/styles/ThemeContext';
import { cryptoReceiveStyles } from '@new-ui/styles/screens/cryptoReceive/cryptoReceiveStyles';
import { ReceiveQRCard } from 'components/common-components/ReceiveQRCard';
import type { IReceiveQRCardRef } from 'components/common-components/ReceiveQRCard';
import { SvgIcons } from 'constants/svgs';
import { useWalletAddresses } from 'query/hooks/useCrypto';
import { findWalletRowForSymbol } from 'utils/findWalletRowForSymbol';

type ReceiveRouteParams = {
  details?: {
    symbol?: string;
    logo?: string;
  };
};

function chainSubtitle(chain: string): string {
  const c = chain?.toUpperCase();
  if (c === 'SOL') return 'Solana';
  return chain || '';
}

const CryptoReceiveScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const { theme } = useTheme();
  const styles = cryptoReceiveStyles(theme);
  const qrCardRef = useRef<IReceiveQRCardRef | null>(null);

  const { details } = (route.params ?? {}) as ReceiveRouteParams;
  const symbol = details?.symbol;
  const logo = details?.logo;

  const isLogin = useSelector(
    (state: { authenticationSlice?: { isLogin?: boolean } }) =>
      state.authenticationSlice?.isLogin === true
  );

  const { data, isPending, isError, error, refetch, isFetching } =
    useWalletAddresses();

  const rows = data?.walletAddresses ?? [];

  const matched = useMemo(
    () => findWalletRowForSymbol(rows, symbol),
    [rows, symbol]
  );

  useLayoutEffect(() => {
    navigation.setOptions({ headerTitle: 'Receive' });
  }, [navigation]);

  const displayTitle = matched?.currencyName ?? symbol ?? 'Crypto';
  const address = matched?.walletAddress ?? '';

  // The scannable QR carries just enough structured asset info (not just the raw address) so
  // PayAiro's scanner can preselect the same coin/chain on the Send flow. Kept compact — the
  // logo URL is intentionally NOT embedded (it bloats the payload and, with the centered logo
  // overlay, made the QR too dense to decode; the Send flow resolves the logo from the symbol).
  // The copied/shared value below stays the plain wallet address for external wallets.
  const qrValue = useMemo(() => {
    if (!address) return '';
    return JSON.stringify({
      type: 'crypto_wallet',
      address,
      symbol: String(symbol ?? '').toUpperCase(),
      chain: String(matched?.chain ?? '').toUpperCase(),
    });
  }, [address, symbol, matched?.chain]);

  const copyToClipboard = (text: string, label: string = 'Text') => {
    Clipboard.setString(text);
    if (Platform.OS === 'android') {
      ToastAndroid.show(`${label} copied`, ToastAndroid.SHORT);
    } else {
      Alert.alert(`${label} copied`);
    }
  };

  const shareMessage = (addr: string) =>
    `PayAiro Payment Details\n\nScan the QR code to send crypto\n\nWallet address: ${addr}`;

  const handleShareQR = async (uri: string) => {
    try {
      await Share.open({
        title: `${displayTitle} Wallet Address`,
        subject: `${displayTitle} Wallet Address`,
        url: uri,
        type: 'image/png',
        filename: `PayAiro_${displayTitle}_WalletAddress`,
        failOnCancel: false,
        message: shareMessage(address),
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg !== 'User did not share') {
        console.log('Error sharing wallet address:', err);
      }
    }
  };

  const handleDownloadQR = async (uri: string) => {
    try {
      await Share.open({
        title: `${displayTitle} Wallet Address`,
        subject: `${displayTitle} Wallet Address`,
        url: uri,
        type: 'image/png',
        filename: `PayAiro_${displayTitle}_WalletAddress`,
        failOnCancel: false,
        saveToFiles: true,
        message: shareMessage(address),
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg !== 'User did not share') {
        console.log('Error downloading wallet address:', err);
        Alert.alert('Failed to download wallet address');
      }
    }
  };

  const cryptoIcon = useMemo(() => {
    if (!logo) return null;
    if (logo.toLowerCase().endsWith('.svg')) {
      return <SvgUri uri={logo} width={22} height={22} />;
    }
    return (
      <Image
        source={{ uri: logo }}
        style={styles.cryptoIcon}
        resizeMode="contain"
      />
    );
  }, [logo, styles.cryptoIcon]);

  const disclaimer = useMemo(() => {
    const name = matched?.currencyName ?? symbol ?? 'this asset';
    return `Only send ${name} to this address. Sending other assets may result in permanent loss.`;
  }, [matched?.currencyName, symbol]);

  const renderBody = () => {
    if (!symbol) {
      return (
        <View style={styles.emptyContainer}>
          <CustomText
            variant="body"
            color={theme.colors.textSecondary}
            style={{ textAlign: 'center' }}
          >
            No asset was selected. Go back and choose a crypto to receive.
          </CustomText>
        </View>
      );
    }

    if (!isLogin) {
      return (
        <View style={styles.emptyContainer}>
          <CustomText
            variant="body"
            color={theme.colors.textSecondary}
            style={{ textAlign: 'center' }}
          >
            Sign in to load your wallet addresses.
          </CustomText>
        </View>
      );
    }

    if (isError) {
      const msg =
        (error as { message?: string })?.message ??
        'Could not load wallet addresses.';
      return (
        <View style={styles.errorContainer}>
          <CustomText
            variant="body"
            color={theme.colors.error}
            style={{ textAlign: 'center' }}
          >
            {msg}
          </CustomText>
          <Button onPress={() => refetch()} style={styles.retryButton}>
            Retry
          </Button>
        </View>
      );
    }

    const showInitialLoader =
      !isError && data === undefined && (isPending || isFetching);
    if (showInitialLoader) {
      return (
        <View style={styles.qrLoadingCard}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      );
    }

    if (!matched) {
      return (
        <View style={styles.emptyContainer}>
          <CustomText
            variant="body"
            fontWeight="semiBold"
            style={{ textAlign: 'center', marginBottom: theme.spacing.sm }}
          >
            No deposit wallet for {symbol}
          </CustomText>
          <CustomText
            variant="caption"
            color={theme.colors.textSecondary}
            style={{ textAlign: 'center' }}
          >
            You do not have an on-chain wallet for this asset yet. Try another
            asset or contact support if you need a deposit address.
          </CustomText>
        </View>
      );
    }

    return (
      <View style={styles.qrSection}>
        <View style={styles.qrCardContainer}>
          <ReceiveQRCard
            ref={qrCardRef}
            title={displayTitle}
            titleIcon={cryptoIcon}
            subtitle={chainSubtitle(matched.chain)}
            qrValue={qrValue}
            payAiroTag={address}
            tagLabel={`${displayTitle} wallet address:`}
            tagValueStyle={styles.qrTagValue}
            onCopyTag={() => copyToClipboard(address, 'Wallet address')}
            leftButton={{
              text: 'Download',
              icon: (
                <SvgIcons.DownloadBlack
                  color={theme.colors.white}
                  width={20}
                  height={20}
                />
              ),
              onPress: () => qrCardRef.current?.capture(handleDownloadQR),
            }}
            rightButton={{
              text: 'Share',
              icon: (
                <SvgIcons.ShareIcon
                  width={20}
                  height={20}
                  color={theme.colors.white}
                />
              ),
              onPress: () => qrCardRef.current?.capture(handleShareQR),
            }}
          />
        </View>

        <View style={styles.noticeContainer}>
          <View style={styles.noticeIconContainer}>
            <SvgIcons.InfoNote width={18} height={18} />
          </View>
          <CustomText
            variant="caption"
            color={theme.colors.text}
            style={styles.noticeText}
          >
            {disclaimer}
          </CustomText>
        </View>
      </View>
    );
  };

  return (
    <ScreenWrapper
      safeArea
      safeAreaEdges={['bottom']}
      padding={16}
      scrollable
      contentStyle={styles.scrollContent}
      backgroundColor={theme.colors.background}
    >
      {renderBody()}
    </ScreenWrapper>
  );
};

export default CryptoReceiveScreen;
