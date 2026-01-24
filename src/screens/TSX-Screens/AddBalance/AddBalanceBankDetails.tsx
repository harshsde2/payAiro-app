import { View, Clipboard, Platform, ToastAndroid, Alert, StyleSheet, TouchableOpacity } from 'react-native'
import React, { useRef } from 'react'
import HeaderTitle from 'components/HeaderTitle'
import { ScreenContainer } from 'HOC'
import { useAppLock } from 'hooks/useAppLock'
import useSelectorAction from 'hooks/useSelectorAction'
import { useTheme } from 'styles/ThemeContext'
import { useNavigation, useRoute } from '@react-navigation/native'
import Share from "react-native-share";
import { Theme } from 'styles'
import { SvgIcons } from 'constants/svgs'
import { ReceiveQRCard } from 'components/common-components/ReceiveQRCard'
import type { IReceiveQRCardRef } from 'components/common-components/ReceiveQRCard'
import { BankDetailsDisplay, CapturingProvider, useCapturing } from 'components/common-components/BankDetailsDisplay'

const AddBalanceBankDetailsContent = () => {
    const { theme } = useTheme();
    const { walletData } = useSelectorAction() as any;
    const { setIsCapturing } = useCapturing();
    const { setNativeModalVisible } = useAppLock();
    const route = useRoute<any>();
    const navigation = useNavigation<any>();
    const qrCardRef = useRef<any>(null);

    const copyToClipboard = (text: string, label: string) => {
        Clipboard.setString(text);
        if (Platform.OS === "android") {
            ToastAndroid.show(`${label} copied`, ToastAndroid.SHORT);
        } else {
            Alert.alert(`${label} copied`);
        }
    };

    const handleShareQR = async (uri: string) => {
        try {
            const shareOptions: any = {
                title: "PayAiro Bank Details",
                subject: "PayAiro Bank Details",
                url: uri,
                type: "image/png",
                filename: `PayAiro_BankDetails_${walletData?.username || "details"}`,
                failOnCancel: false,
            };

            await Share.open(shareOptions);
        } catch (err: any) {
            if (err?.message !== "User did not share") {
                console.log("Error sharing bank details:", err);
            }
        }
    };

    const handleDownloadQR = async (uri: string) => {
        try {
            // Use Share to allow user to save to gallery
            const shareOptions: any = {
                title: "PayAiro Bank Details",
                subject: "PayAiro Bank Details",
                url: uri,
                type: "image/png",
                filename: `PayAiro_BankDetails_${walletData?.username || "details"}`,
                failOnCancel: false,
                saveToFiles: true,
            };

            await Share.open(shareOptions);
        } catch (err: any) {
            if (err?.message !== "User did not share") {
                console.log("Error downloading bank details:", err);
                Alert.alert("Failed to download bank details");
            }
        }
    };

    return (
        <ScreenContainer scrollable={true} padding={0} >
            <HeaderTitle title="Add Balance Bank Details" leftIcon="true" />
            <View style={styles(theme).container}>

                <ReceiveQRCard
                    ref={qrCardRef}
                    title="PayAiro"
                    subtitle="Primary account for receiving funds"
                    qrValue={{
                        type: "receive",
                        username: walletData?.username,
                        tag: walletData?.username,
                    }}
                    payAiroTag={walletData?.username || "N/A"}
                    onCopyTag={() =>
                        copyToClipboard(walletData?.username || "", "PayAiro Tag")
                    }
                    leftButton={{
                        text: "Download",
                        icon: <SvgIcons.DownloadBlack width={20} height={20} />,
                        onPress: () => qrCardRef.current?.capture(handleDownloadQR),
                    }}
                    rightButton={{
                        text: "Share",
                        icon: <SvgIcons.ShareIcon width={20} height={20} />,
                        onPress: () => qrCardRef.current?.capture(handleShareQR),
                    }}
                    onBeforeCapture={() => setNativeModalVisible(true)}
                    onAfterCapture={() => {
                        setTimeout(() => setNativeModalVisible(false), 1000);
                    }}
                    onCapturingChange={(capturing: boolean) => setIsCapturing(capturing)}
                    bankDetails={<BankDetailsDisplay />}
                />
            </View>
        </ScreenContainer>
    )
}

const AddBalanceBankDetails = () => {
    return (
        <CapturingProvider>
            <AddBalanceBankDetailsContent />
        </CapturingProvider>
    );
};

export default AddBalanceBankDetails

const styles = (theme: Theme) => StyleSheet.create({
    container: {
        flex: 1,
        padding: theme.spacing.spacing.md,
        backgroundColor: theme.colors.palette.white,
        borderTopEndRadius: theme.spacing.spacing.lg,
        borderTopStartRadius: theme.spacing.spacing.lg,
        marginTop: theme.spacing.spacing.md,
    },
    modalOverlay: {
        flex: 1,
        justifyContent: "flex-end",
    },
    overlayBackdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: theme.colors.palette.overlay || "rgba(0, 0, 0, 0.5)",
    },
    modalContainer: {
        backgroundColor: theme.colors.palette.white || "#FFFFFF",
        borderTopLeftRadius: theme.spacing.spacing[8] || 24,
        borderTopRightRadius: theme.spacing.spacing[8] || 24,
        flex: 1,
        zIndex: 1,
        marginTop: 80,
        paddingHorizontal: 10,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: theme.spacing.spacing[5] || 20,
        paddingTop: theme.spacing.spacing[5] || 20,
        paddingBottom: theme.spacing.spacing[4] || 16,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.palette.grey200 || "#E5E7EB",
    },
    closeButton: {
        paddingHorizontal: theme.spacing.spacing[2] || 4,
    },
    scrollView: {
        flex: 1,
    },
    scrollViewContent: {
        paddingHorizontal: theme.spacing.spacing[5] || 20,
        paddingBottom: theme.spacing.spacing[6] || 24,
        paddingTop: theme.spacing.spacing[4] || 16,
        alignItems: "center",
    },
    userName: {
        color: theme.colors.palette.grey900 || "#111827",
        marginBottom: theme.spacing.spacing[2] || 8,
        textAlign: "center",
    },
    upiIdContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: theme.spacing.spacing[4] || 16,
        gap: theme.spacing.spacing[2] || 8,
    },
    upiIdLabel: {
        color: theme.colors.palette.grey900 || "#111827",
    },
    shareableContentWrapper: {
        backgroundColor: theme.colors.palette.white || "#FFFFFF",
        padding: theme.spacing.spacing[4] || 16,
        borderRadius: theme.spacing.spacing[3] || 12,
        alignItems: "center",
        width: "100%",
    },
    qrCodeContainer: {
        alignItems: "center",
        marginVertical: theme.spacing.spacing[4] || 16,
    },
    qrCodeWrapper: {
        backgroundColor: theme.colors.palette.white || "#FFFFFF",
        padding: theme.spacing.spacing[4] || 16,
        borderRadius: theme.spacing.spacing[3] || 12,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1,
        borderColor: theme.colors.palette.grey200 || "#E5E7EB",
    },
    receiveMoneyText: {
        color: theme.colors.palette.grey700 || "#374151",
        textAlign: "center",
        marginTop: theme.spacing.spacing[2] || 8,
        marginBottom: theme.spacing.spacing[3] || 12,
    },
    paymentAppsContainer: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        gap: theme.spacing.spacing[4] || 16,
        marginBottom: theme.spacing.spacing[10] || 20,
        flexWrap: "wrap",
        width: "100%",
    },
    paymentAppText: {
        color: theme.colors.palette.grey600 || "#4B5563",
        opacity: 0.9,
    },
    actionButtonsContainer: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        gap: theme.spacing.spacing[3] || 12,
        marginBottom: 100,
        width: "100%",
    },
    actionButton: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: theme.colors.palette.primary || "#4F378B",
        paddingVertical: theme.spacing.spacing[3] || 12,
        paddingHorizontal: theme.spacing.spacing[4] || 16,
        borderRadius: theme.spacing.spacing[2] || 8,
        gap: theme.spacing.spacing[2] || 8,
    },
    actionButtonText: {
        color: theme.colors.palette.white || "#FFFFFF",
    },
    accountDetailsContainer: {
        width: "100%",
        gap: theme.spacing.spacing[4] || 16,
    },
    accountDetailRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 2,
    },
    detailLabel: {
        color: theme.colors.palette.grey600 || "#4B5563",
        flex: 1,
    },
    detailValueContainer: {
        flexDirection: "row",
        alignItems: "center",
        gap: theme.spacing.spacing[2] || 8,
        flex: 2,
        justifyContent: "flex-end",
    },
    detailValue: {
        color: theme.colors.palette.grey900 || "#111827",
    },
    iconButton: {
        padding: theme.spacing.spacing[1] || 4,
    },
    noteContainer: {
        flexDirection: "row",
        alignItems: "flex-start",
        backgroundColor: theme.colors.palette.grey50,
        borderRadius: 12,
        padding: 12,
        gap: 8,
        marginTop: theme.spacing.spacing[6] || 24,
        marginBottom: theme.spacing.spacing[6] || 24,
    },
    noteText: {
        flex: 1,
        color: theme.colors.palette.grey600,
    },
})