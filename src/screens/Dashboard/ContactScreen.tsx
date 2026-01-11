import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  BackHandler,
  FlatList,
  Pressable,
  Keyboard,
  Platform,
  ToastAndroid,
  Linking,
  Alert,
} from "react-native";
import React, { useEffect, useState, useCallback, useMemo } from "react";
import { SvgXml } from "react-native-svg";
import { useNavigation } from "@react-navigation/native";

// Components
import { ScreenContainer } from "../../HOC";
import HeaderTitle from "../../components/HeaderTitle";
import CustomText from "../../tsx-components/CustomText";
import CustomSearchTextInput from "tsx-components/CustomSearchTextInput";

// Constants & Services
import {
  SVGAddIcon,
  SVGInvitePeople,
} from "../../constants/images";
import Fonts from "../../constants/Fonts";
import { getContacts } from "../../services/Services";
import useSelectorAction from "../../hooks/useSelectorAction";
import { useTheme } from "../../styles/ThemeContext";
import { useDeviceContacts, useRecentContacts } from "query/hooks";
import { removeItem, STORAGE_KEYS } from "storage/mmkv";
import LoaderComponent from "tsx-components/LoaderComponent";
import { Theme } from "styles";
import Share from "react-native-share";
import { showSuccess, showError } from "utils/toast";
import { NAVIGATION_SCREENS } from "navigations/navigationConstants";

export default function ContactScreen(props: any) {
  const { isVisble3 } = props.route?.params || {};
  const { tokens, walletData } = useSelectorAction() as unknown as { tokens: any, walletData: any };
  const navigation = useNavigation<any>();
  const { theme } = useTheme();

  const [searchText, setSearchText] = useState("");
  const [onSearch, setOnSearch] = useState(false);

  const {
    data: deviceContacts,
    isLoading: isDeviceLoading,
    error: contactError,
  } = useDeviceContacts();
  const { data, isLoading: isLoading, error } = useRecentContacts();

  console.log("data =>",JSON.stringify(data,null,2))

  // Memoize contact lists to prevent infinite loops
  const contactLists = useMemo(() => {
    if (!data?.allContacts) return [];
    return Array.isArray(data.allContacts) ? data.allContacts : [];
  }, [data?.allContacts]);

  const deviceContactsData = useMemo(() => {
    if (!deviceContacts?.data) return [];
    return Array.isArray(deviceContacts.data) ? deviceContacts.data : [];
  }, [deviceContacts?.data]);

  const [filteredRecentContacts, setFilteredRecentContacts] = useState<any[]>([]);
  const [filteredDeviceContacts, setFilteredDeviceContacts] = useState<any[]>([]);

  // console.log(
  //   " deviceContacts contactLists -->",
  //   JSON.stringify(deviceContacts, null, 2)
  // );

  // Back Handler
  const handleGoBack = useCallback(() => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      BackHandler.exitApp();
    }
  }, [navigation]);

  // useEffect(() => {
  //   const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
  //     handleGoBack();
  //     return true;
  //   });
  //   return () => backHandler.remove();
  // }, [handleGoBack]);

  // const getContactLists = useCallback(async () => {
  //   try {
  //     setIsLoading(true);
  //     const response = await getContacts(tokens?.access);
  //     // console.log("response =>",JSON.stringify(response,null,2))
  //     if (response?.data) {
  //       setFullContactList(response.data || []);
  //       setContactLists(response.data || []);
  //     } else {
  //       setError('Failed to load contacts');
  //     }
  //   } catch (err) {
  //     console.error('Fetching error:', err);
  //     setError('An error occurred');
  //   } finally {
  //     setIsLoading(false);
  //   }
  // }, [tokens]);

  // useEffect(() => {
  //   getContactLists();
  // }, [getContactLists]);

  // useEffect(() => {
  //   if (!searchText.trim()) {
  //     setContactLists(fullContactList);
  //   } else {
  //     const filtered = fullContactList.filter(contact =>
  //       (contact?.name || contact?.nickname || contact?.email || contact?.username || '').toLowerCase()
  //         .includes(searchText.trim().toLowerCase())
  //     );
  //     setContactLists(filtered);
  //   }
  // }, [searchText, fullContactList]);

  const handleAddContact = useCallback(() => {
    navigation.navigate("AddContact");
  }, [navigation]);

  const handleInviteViaMessage = useCallback(async () => {
    const referralCode = walletData?.username as string || "";
    if (!referralCode) {
      showError("Referral code not available");
      return;
    }

    const referralLink = `https://payairo.com/ref/${referralCode}`;
    const message = `Join PayAiro and use my referral code: ${referralCode}\n\nDownload the app: ${referralLink}`;

    try {
      // Platform-specific SMS URL schemes
      let smsUrl: string;
      if (Platform.OS === "ios") {
        // iOS: sms: works without phone number
        smsUrl = `sms:&body=${encodeURIComponent(message)}`;
      } else {
        // Android: sms: with empty number and body
        smsUrl = `sms:?body=${encodeURIComponent(message)}`;
      }

      const canOpen = await Linking.canOpenURL(smsUrl);
      
      if (canOpen) {
        await Linking.openURL(smsUrl);
      } else {
        // Fallback: Show share options if SMS is not available
        const shareOptions = {
          message: message,
          title: "Invite to PayAiro",
        };
        await Share.open(shareOptions);
      }
    } catch (error: any) {
      // User cancelled or error occurred
      if (
        error?.message?.toLowerCase().includes("user did not share") ||
        error?.message === "User did not share" ||
        error?.message?.toLowerCase().includes("cancel")
      ) {
        // User cancelled, do nothing
        return;
      }
      console.log("Invite error:", error);
      // Fallback to share sheet if SMS fails
      try {
        const shareOptions = {
          message: message,
          title: "Invite to PayAiro",
        };
        await Share.open(shareOptions);
      } catch (shareError) {
        showError("Failed to open messaging app");
      }
    }
  }, [walletData]);

  const handleContactPress = useCallback(
    (item: any) => {
      navigation.navigate(NAVIGATION_SCREENS.SEND, { requested: false, sender: item?.username?.trim() ?? null });
    },
    [navigation, isVisble3]
  );

  // console.log("contactLists =>",JSON.stringify(contactLists,null,2))

  const renderRecentContact = useCallback(
    ({ item }: any) => {
      if (!item) return null;
      return (
        <TouchableOpacity
          onPress={() => handleContactPress(item)}
          style={styles(theme).contactItem}
        >
          <View style={styles(theme).contactLeftSection}>
            <View style={styles(theme).avatarContainer}>
              {item?.image ? (
                <Image
                  source={{ uri: item.image }}
                  style={styles(theme).avatar}
                />
              ) : (
                <Text style={styles(theme).initials}>
                  {(item?.name?.[0] || item?.nickname?.[0] || "U").toUpperCase()}
                </Text>
              )}
            </View>
            <View style={styles(theme).contactInfo}>
              <CustomText variant="subtitle1" color={theme.colors.text.primary}>
                {item?.nickname || item?.name || "Unknown"}
              </CustomText>
              {item?.messages?.content && (
                <CustomText
                  variant="body2"
                  color={theme.colors.text.secondary}
                  numberOfLines={1}
                >
                  {item?.messages?.content}
                </CustomText>
              )}
            </View>
          </View>
          {item?.unread_count > 0 && (
            <View style={styles(theme).unreadBadge}>
              <CustomText variant="caption" color={theme.colors.text.inverse}>
                {item?.unread_count}
              </CustomText>
            </View>
          )}
        </TouchableOpacity>
      );
    },
    [handleContactPress, theme]
  );

  const renderDeviceContact = useCallback(
    ({ item }: any) => {
      if (!item) return null;
      return (
        <TouchableOpacity
          style={styles(theme).contactItem}
          activeOpacity={0.8}
          onPress={() => {
            // Device contacts can be invited via the invite button
          }}
        >
          <View style={styles(theme).contactLeftSection}>
            <View style={styles(theme).avatarContainer}>
              <Text style={styles(theme).initials}>
                {(item?.name?.[0] || "U").toUpperCase()}
              </Text>
            </View>
            <View style={styles(theme).contactInfo}>
              <CustomText variant="subtitle1" color={theme.colors.text.primary}>
                {item?.name || "Unknown"}
              </CustomText>
              {item?.phoneNumber && (
                <CustomText variant="body2" color={theme.colors.text.secondary}>
                  {item.phoneNumber}
                </CustomText>
              )}
            </View>
            <TouchableOpacity
              onPress={(e) => {
                e.stopPropagation();
                handleInviteViaMessage();
              }}
              style={styles(theme).addButton}
            >
              <CustomText variant="button" color={theme.colors.text.inverse}>
                + Invite
              </CustomText>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      );
    },
    [handleAddContact, theme]
  );

  // Filter contacts based on search text
  useEffect(() => {
    if (!searchText.trim()) {
      setFilteredRecentContacts(contactLists);
      setFilteredDeviceContacts(deviceContactsData);
    } else {
      const searchLower = searchText.trim().toLowerCase();

      const filteredRecent = contactLists.filter((contact: any) => {
        if (!contact) return false;
        const searchableText = (
          contact?.name ||
          contact?.nickname ||
          contact?.username ||
          ""
        )
          .toLowerCase()
          .trim();
        return searchableText.includes(searchLower);
      });

      const filteredDevice = deviceContactsData.filter((contact: any) => {
        if (!contact) return false;
        const searchableText = (
          contact?.name || contact?.phoneNumber || ""
        )
          .toLowerCase()
          .trim();
        return searchableText.includes(searchLower);
      });

      setFilteredRecentContacts(filteredRecent);
      setFilteredDeviceContacts(filteredDevice);
    }
  }, [searchText, contactLists, deviceContactsData]);

  const handleSearch = (text: string) => {
    setSearchText(text);
  };

  const handleShare = useCallback(async () => {
    const referralCode = walletData?.username as string || "";
    if (!referralCode) {
      showError("Referral code not available");
      return;
    }

    const referralLink = `https://payairo.com/ref/${referralCode}`;
    const shareMessage = `Join PayAiro and use my referral code: ${referralCode}\n\nDownload the app: ${referralLink}`;

    try {
      const shareOptions = {
        message: shareMessage,
        title: "Invite to PayAiro",
      };

      await Share.open(shareOptions);
    } catch (error: any) {
      // User cancelled or error occurred
      if (
        error?.message?.toLowerCase().includes("user did not share") ||
        error?.message === "User did not share"
      ) {
        // User cancelled, do nothing
        return;
      }
      console.log("Share error:", error);
      showError("Failed to share referral link");
    }
  }, [walletData]);

  return (
    <ScreenContainer padding={0} backgroundColor={theme.colors.palette.green50}>
      <Pressable
        onPress={() => {
          setOnSearch(false);
          Keyboard.dismiss();
        }}
        style={{ flex: 1 }}
      >
        <HeaderTitle
          title="Discover"
          leftIcon={'true'}
          isBack
          onPressLeft={handleGoBack}
        />
        <View
          style={{
            width: "100%",
            paddingHorizontal: 20,
            flex: 1,
            maxHeight: 70,
          }}
        >
          <CustomSearchTextInput
            placeholder="Search Name or PayAiro tag..."
            placeholderTextColor={theme.colors.palette.green700}
            onChangeText={handleSearch}
            value={searchText}
            onFocus={() => {
              setOnSearch(true);
            }}
            onBlur={() => {
              setOnSearch(false);
            }}
          />
        </View>
        <View style={styles(theme).container}>
          {isLoading ? (
            <LoaderComponent
              style={{ flex: 1 }}
              loaderColor="black"
              loaderSize={"large"}
            />
          ) : (
            <FlatList
              removeClippedSubviews={true}
              ListHeaderComponent={
                <View>
                  {!onSearch && (
                    <View
                      style={{
                        width: "100%",
                        paddingHorizontal: 5,
                        marginVertical: 10,
                      }}
                    >
                      <TouchableOpacity
                        onPress={handleAddContact}
                        activeOpacity={0.7}
                        style={styles(theme).actionButton}
                      >
                        <SvgXml xml={SVGAddIcon} width={45} height={45} />
                        <CustomText
                          variant="subtitle1"
                          style={{ marginLeft: 10 }}
                        >
                          New Contact
                        </CustomText>
                      </TouchableOpacity>
                      <TouchableOpacity
                        activeOpacity={0.7}
                        style={styles(theme).actionButton}
                        onPress={handleShare}
                      >
                        <SvgXml xml={SVGInvitePeople} width={45} height={45} />
                        <CustomText
                          variant="subtitle1"
                          style={{ marginLeft: 10 }}
                        >
                          Invite People
                        </CustomText>
                      </TouchableOpacity>
                    </View>
                  )}

                  {/* Recent Contacts */}
                  <View style={styles(theme).header}>
                    <CustomText variant="h4" color={theme.colors.text.primary}>
                      Recent Contacts
                    </CustomText>
                  </View>
                  {isLoading ? (
                    <LoaderComponent
                      loaderColor="black"
                      loaderSize={"large"}
                    />
                  ) : (
                    <FlatList
                      data={filteredRecentContacts || []}
                      keyExtractor={(item, index) =>
                        `recent-${item?.id || item?.username || index}`
                      }
                      renderItem={renderRecentContact}
                      ListEmptyComponent={
                        <View style={{ padding: 20, alignItems: "center" }}>
                          <CustomText
                            variant="body2"
                            color={theme.colors.text.secondary}
                          >
                            No recent contacts
                          </CustomText>
                        </View>
                      }
                      scrollEnabled={false}
                    />
                  )}
                  <View style={styles(theme).header}>
                    <CustomText variant="h4" color={theme.colors.text.primary}>
                      All Contacts
                    </CustomText>
                  </View>
                </View>
              }
              data={filteredDeviceContacts || []}
              keyExtractor={(item, index) =>
                `device-${item?.id || item?.phoneNumber || index}`
              }
              renderItem={renderDeviceContact}
              ListEmptyComponent={
                <View style={{ padding: 20, alignItems: "center" }}>
                  <CustomText
                    variant="body2"
                    color={theme.colors.text.secondary}
                  >
                    No device contacts found
                  </CustomText>
                </View>
              }
            />
          )}
        </View>
      </Pressable>
    </ScreenContainer>
  );
}

const styles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.palette.white,
      borderTopEndRadius: 32,
      borderTopStartRadius: 32,
      padding: theme.spacing.layout.screenPadding,
      marginTop: theme.spacing.spacing[0],
    },
    header: {
      marginTop: 20,
      marginBottom: 10,
    },
    contactItem: {
      flexDirection: "row",
      alignItems: "center",
      padding: 10,
      marginVertical: 5,
      borderRadius: 10,
      backgroundColor: theme.colors.palette.grey250,
    },
    contactLeftSection: {
      flexDirection: "row",
      alignItems: "center",
      flex: 1,
    },
    avatarContainer: {
      width: 50,
      height: 50,
      borderRadius: 25,
      backgroundColor: theme.colors.palette.green200,
      justifyContent: "center",
      alignItems: "center",
    },
    avatar: {
      width: "100%",
      height: "100%",
      borderRadius: 25,
    },
    initials: {
      color: theme.colors.palette.green700,
      fontFamily: Fonts.semibold,
      fontSize: 18,
    },
    contactInfo: {
      marginLeft: 10,
      flex: 1,
    },
    unreadBadge: {
      backgroundColor: theme.colors.palette.green700,
      width: 20,
      height: 20,
      borderRadius: 10,
      justifyContent: "center",
      alignItems: "center",
    },
    actionButton: {
      flexDirection: "row",
      alignItems: "center",
      marginVertical: 5,
    },
    addButton: {
      backgroundColor: theme.colors.palette.green700,
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 20,
      marginLeft: 10,
    },
  });
