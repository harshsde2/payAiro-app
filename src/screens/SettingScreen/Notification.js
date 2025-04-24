import React, {useState, useCallback, useEffect} from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  BackHandler,
} from 'react-native';
import HeaderTitle from '../../components/HeaderTitle';
import {SVGLeftArrow} from '../../constants/images';
import Notificatiom from '../Authentications/Notificatiom';
import {getNotification} from '../../services/Services';
import useSelectorAction from '../../hooks/useSelectorAction';
import {useNavigation} from '@react-navigation/native';
import {useTheme} from '../../styles/ThemeContext';
import CustomText from '../../tsx-components/CustomText';
import {colors} from 'styles';
import { ScreenContainer } from 'HOC';

// Constants
const TAB_GENERAL = '1';
const TAB_TRANSACTION = '2';
const TAB_OPTIONS = [
  {id: TAB_GENERAL, label: 'General'},
  {id: TAB_TRANSACTION, label: 'Transaction'},
];

export default function Notification() {
  const navigation = useNavigation();
  const {tokens} = useSelectorAction();
  const {theme} = useTheme();
  const [activeTab, setActiveTab] = useState(TAB_GENERAL);
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const styles = customStyles(theme);
  
  // Handle back action
  const handleGoBack = useCallback(() => {
    // Clear data before navigating
    setNotifications([]);
    
    try {
      if (navigation.canGoBack()) {
        navigation.goBack();
      } else {
        console.log('Cannot go back, no screens in history');
        BackHandler.exitApp();
      }
    } catch (err) {
      console.log('Navigation error:', err);
    }
  }, [navigation]);
  
  // Handle hardware back button
  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        handleGoBack();
        return true;
      }
    );

    return () => backHandler.remove();
  }, [handleGoBack]);
  
  // Fetch notifications with error handling
  const fetchNotifications = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await getNotification(tokens?.access);
      if (response?.data) {
        setNotifications(response.data || []);
      }
    } catch (err) {
      setError('Failed to load notifications');
    } finally {
      setIsLoading(false);
    }
  }, [tokens?.access]);
  
  // Load notifications on mount
  useEffect(() => {
    let isMounted = true;
    
    const loadData = async () => {
      try {
        setIsLoading(true);
        const response = await getNotification(tokens?.access);
        if (isMounted && response?.data) {
          setNotifications(response.data || []);
        }
      } catch (error) {
        if (isMounted) {
          setError('Failed to load notifications');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };
    
    loadData();
    
    return () => {
      isMounted = false;
      setNotifications([]);
    };
  }, [tokens?.access]);
  
  // Tab Button Component
  const TabButton = ({isActive, label, onPress}) => (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.tabButton,
        isActive && styles.activeTabButton,
      ]}>
      <CustomText
        variant="button"
        color={isActive ? theme.colors.text.inverse : theme.colors.palette.green700}
        style={styles.tabText}>
        {label}
      </CustomText>
    </TouchableOpacity>
  );
  
  // Render content based on current state
  const renderContent = () => {
    if (isLoading) {
      return (
        <View style={styles.centerContainer}>
          <CustomText variant="body1" color={theme.colors.text.secondary}>
            Loading notifications...
          </CustomText>
        </View>
      );
    }
    
    if (error) {
      return (
        <View style={styles.centerContainer}>
          <CustomText variant="body1" color={theme.colors.error}>
            {error}
          </CustomText>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={fetchNotifications}>
            <CustomText variant="button" color={theme.colors.text.inverse}>
              Retry
            </CustomText>
          </TouchableOpacity>
        </View>
      );
    }
    
    if (notifications.length === 0) {
      return (
        <View style={styles.centerContainer}>
          <CustomText variant="body1" color={theme.colors.text.secondary}>
            No notifications available
          </CustomText>
        </View>
      );
    }
    
    // Using ScrollView instead of FlatList
    return (
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={false}>
        {notifications.map((item, index) => (
          <View key={`notification-${item?.id || index}`}>
            <Notificatiom item={item} />
          </View>
        ))}
      </ScrollView>
    );
  };
  
  return (
    <ScreenContainer padding={0} backgroundColor={theme.colors.palette.green50} style={styles.safeArea}>
      <HeaderTitle
        title="Notification"
        leftIcon={SVGLeftArrow}
        isBack={true}
        onPressLeft={handleGoBack}
        />
      
      <View style={styles.container}>
        <View style={styles.tabContainer}>
          {TAB_OPTIONS.map((tab) => (
            <TabButton
              key={tab.id}
              isActive={activeTab === tab.id}
              label={tab.label}
              onPress={() => setActiveTab(tab.id)}
            />
          ))}
        </View>
        {renderContent()}
      </View>
    </ScreenContainer>
  );
}

const customStyles = (theme) => StyleSheet.create({
  safeArea: {
    flex: 1,
    // backgroundColor: colors.green100,
  },
  headerContainer: {
    // paddingHorizontal: theme.spacing.layout,
    // paddingTop: theme.spacing.spacing.md,
    // backgroundColor:'green'
  },
  container: {
    flex: 1,
    backgroundColor: theme.colors.palette.white,
    borderTopEndRadius: 32,
    borderTopStartRadius: 32,
    padding: theme.spacing.layout.screenPadding,
    // marginTop: theme.spacing.spacing.md,
  },
  tabContainer: {
    padding: theme.spacing.spacing.xs,
    backgroundColor: theme.colors.palette.green100,
    borderRadius: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.spacing.md,
  },
  tabButton: {
    width: '50%',
    borderRadius: 30,
    padding: theme.spacing.spacing.md,
  },
  activeTabButton: {
    backgroundColor: theme.colors.palette.green700,
  },
  tabText: {
    textAlign: 'center',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  retryButton: {
    padding: theme.spacing.spacing.md,
    backgroundColor: theme.colors.palette.green600,
    borderRadius: 8,
    marginTop: theme.spacing.spacing.md,
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    paddingVertical: theme.spacing.spacing.md,
  },
});
