import React, { useState, useRef, useEffect } from 'react';
import { View, TouchableOpacity, StyleSheet, Image, LayoutChangeEvent, LayoutRectangle, Clipboard, Alert, Platform, ToastAndroid } from 'react-native';
import { SvgXml } from 'react-native-svg';
import { useTheme } from '../styles/ThemeContext';
import Card from './Card';
import CustomText from './CustomText';
import { colors, fontFamily, fontSize, fontWeight } from 'styles';
import { PayAiro_Green_logo, PayAiro_White_logo, SVGCopy2, SVGCopy3, SVGDownArrow3, SVGLogo2, SVGLogo3 } from 'constants/images';
import { Text } from 'react-native-gesture-handler';
import useDispatchAction from 'hooks/useDispatchAction';
import Slide from 'animations/animations-components/Slide';
import FadeWrapper from 'animations/animations-components/FadeWrapper';
import FlipSlide from 'animations/animations-components/FlipSlide';
import ExpandableComp, { ExpandableCompRef } from 'animations/animations-components/ExpandableComp';
import { setisCrypto } from 'redux/slices/authenticationSlice';
import { useSelector } from 'react-redux';
import GhostSlide from 'animations/animations-components/GhostSlide';

// Animation Constants
export const ANIMATION_CONSTANTS = {
  EXPANDABLE_CARD: {
    WIDTH: 80,
    HEIGHT: 165,
    POSITION: {
      top: 15,
      right: 30,
    },
    DURATION: 1500,
  },
  TEXT_FLIP: {
    DURATION: 2000,
    FAST_PORTION: 0.5,
  },
  CURRENCY_DROPDOWN: {
    DURATION: 1500,
  },
  LOGO_FADE: {
    DURATION: 500,
  },
  LOGO_SIZE: {
    WIDTH: 70,
    HEIGHT: 70,
  }
};

// Account data constants
const ACCOUNTS = {
  PAYAIRO: {
    id: 1,
    headerName: 'Payairo Account',
    balanceName: 'Payairo Balance',
    currencyName: 'USD',
    name: 'Payairo Account.',
    balance: '$25,076.08',
    tabBackgroundColor: null,
    cardBackgroundColor: '#fff',
    addressName: 'Payairo ID',
    walletAddress: 'Frances_swann568@payairo.com',
  },
  CRYPTO: {
    id: 2,
    headerName: 'Security Account',
    balanceName: 'Holdings',
    currencyName: 'USDT',
    name: 'Crypto Wallet.',
    balance: '75,182.10',
    tabBackgroundColor: '#fff',
    walletAddress: '0x36572a65f3c8.........b15E5',
    addressName: 'Wallet Address',
  },
};

interface CryptoCardProps {
  isCrypto: boolean;
  onSwitchView: () => void;
  headerTitle: string;
  balance: any;
  currencySymbol?: string;
  currencyIcon?: string | null;
  identifierType?: string;
  identifier?: string;
  pendingAmount?: number;
  onCopy?: () => void;
  onWithdraw?: () => void;
  rightSideIcon?: React.ReactNode;
  logoSvg?: string;
}

const CryptoCard: React.FC<CryptoCardProps> = ({
  // isCrypto,
  onSwitchView,
  headerTitle,
  balance,
  currencySymbol = 'USD',
  currencyIcon,
  identifierType,
  identifier,
  pendingAmount,
  onCopy,
  onWithdraw,
  rightSideIcon,
  logoSvg,
}) => {
  // Refs
  const expandableRef = useRef<ExpandableCompRef>(null);

  // redux
  const { isCrypto } = useSelector((state: any) => state.authenticationSlice);

  // Theme
  const { theme } = useTheme();

  // State variables
  const [slideUpVisible, setSlideUpVisible] = useState(true);
  const [currencyDropdownVisible, setCurrencyDropdownVisible] = useState(true);
  const [parentLayout, setParentLayout] = useState<LayoutRectangle | null>(null);
  const [logoFadeVisible, setLogoFadeVisible] = useState(true);
  const [logoSwitch, setLogoSwitch] = useState(true);
  const [cardBackgroundColor, setCardBackgroundColor] = useState(theme.colors.palette.green700);
  const [userDetails, setUserDetails] = useState(ACCOUNTS.PAYAIRO as any);
  const [expandAnimationComplete, setExpandAnimationComplete] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [ghostSlideVisible, setGhostSlideVisible] = useState(false);
  const [ghostCryptoCardSlide, setGhostCryptoCardSlide] = useState(false);

  // Styles
  const styles = createStyles(theme);

  // Calculate total animation duration
  const totalAnimationDuration = ANIMATION_CONSTANTS.EXPANDABLE_CARD.DURATION +
    ANIMATION_CONSTANTS.LOGO_FADE.DURATION +
    ANIMATION_CONSTANTS.CURRENCY_DROPDOWN.DURATION + 100; // Additional buffer

  // Data processing
  const formattedBalance = balance.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: isCrypto ? 2 : 5,
  });

  const [wholePart, decimalPart] = formattedBalance.split('.');
  const [namePart, accountPart] = userDetails.name.split(' ');

  // Handlers
  const toggleCurrencyDropdown = (value?: boolean) => {
    setCurrencyDropdownVisible(!value);
  };

  const handleCardLayout = (event: LayoutChangeEvent) => {
    setParentLayout(event.nativeEvent.layout);
  };

  const handleSwitch = () => {
    
    if (isAnimating) return; // Prevent multiple clicks during animation

    onSwitchView()
    setGhostSlideVisible(!ghostSlideVisible)
    setGhostCryptoCardSlide(!ghostCryptoCardSlide)

    console.log("calling from handleSwitch ")

    setIsAnimating(true);

    // Toggle expandable card size
    expandableRef.current?.toggleCardSize();

    // Common operations regardless of account type
    setSlideUpVisible(!slideUpVisible);
    toggleCurrencyDropdown(true);

    if (isCrypto) {
      // Switching from PayAiro to Crypto
      switchToCrypto();
      setTimeout(()=>{
        useDispatchAction(setisCrypto(!isCrypto));
      },ANIMATION_CONSTANTS.EXPANDABLE_CARD.DURATION)

    } else {

      // Collapse expandable card size
      // expandableRef.current?.switchToPayAiro();

      // setSlideUpVisible(!slideUpVisible);
      // toggleCurrencyDropdown(true);
      // Switching from Crypto to PayAiro
      switchToPayAiro();
      useDispatchAction(setisCrypto(!isCrypto));

    }

    // Reset animation state after all animations complete
    setTimeout(() => {
      setIsAnimating(false);
    }, totalAnimationDuration);
  };

  const switchToCrypto = () => {
    // Fade out current logo and switch user details
    setTimeout(() => {
      setLogoFadeVisible(false);
      setUserDetails(ACCOUNTS.CRYPTO);
    }, ANIMATION_CONSTANTS.EXPANDABLE_CARD.DURATION);

    // Switch logo and update animation state
    setTimeout(() => {
      setLogoSwitch(!logoSwitch);
      setExpandAnimationComplete(!expandAnimationComplete);

      // Fade in new logo
      setTimeout(() => {
        setLogoFadeVisible(true);
      }, 100);
    }, ANIMATION_CONSTANTS.EXPANDABLE_CARD.DURATION + ANIMATION_CONSTANTS.LOGO_FADE.DURATION);

    // Update card background color
    setTimeout(() => {
      setCardBackgroundColor(theme.colors.palette.white);
    }, ANIMATION_CONSTANTS.EXPANDABLE_CARD.DURATION);

    // Show currency dropdown again
    setTimeout(() => {
      toggleCurrencyDropdown(false);
    }, ANIMATION_CONSTANTS.CURRENCY_DROPDOWN.DURATION);
  };

  const switchToPayAiro = () => {
    // Fade out current logo and switch user details
    setTimeout(() => {
      setLogoFadeVisible(false);
      setUserDetails(ACCOUNTS.PAYAIRO);
    }, ANIMATION_CONSTANTS.EXPANDABLE_CARD.DURATION);

    // Switch logo and update animation state
    setTimeout(() => {
      setLogoSwitch(!logoSwitch);
      setExpandAnimationComplete(!expandAnimationComplete);

      // Fade in new logo
      setTimeout(() => {
        setLogoFadeVisible(true);
      }, 100);
    }, ANIMATION_CONSTANTS.EXPANDABLE_CARD.DURATION + ANIMATION_CONSTANTS.LOGO_FADE.DURATION);

    // Update card background color
    setTimeout(() => {
      setCardBackgroundColor(theme.colors.palette.green700);
    }, ANIMATION_CONSTANTS.EXPANDABLE_CARD.DURATION);

    // Show currency dropdown again
    setTimeout(() => {
      toggleCurrencyDropdown(false);
    }, ANIMATION_CONSTANTS.CURRENCY_DROPDOWN.DURATION);
  };

  const copyToClipboard = (e: string) => {
    Clipboard.setString(e);

    // Display a success message
    if (Platform.OS === 'android') {
      ToastAndroid.show('Wallet Address Copied', ToastAndroid.SHORT);
    } else if (Platform.OS === 'ios') {
      Alert.alert('Text copied to clipboard!');
    }
  };

  // Render helpers
  const renderHeaderSection = () => (
    <View style={[
      styles.header,
      {
        paddingHorizontal: theme.spacing.spacing.md,
        marginVertical: theme.spacing.spacing.sm,
        justifyContent: 'space-between',
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center'
      }
    ]}>
      <View style={{ flex: 1, justifyContent: 'flex-start' }}>
        <FlipSlide
          visible={!slideUpVisible}
          topText={ACCOUNTS.PAYAIRO.headerName}
          bottomText={ACCOUNTS.CRYPTO.headerName}
          flipDuration={ANIMATION_CONSTANTS.TEXT_FLIP.DURATION}
          fastPortion={ANIMATION_CONSTANTS.TEXT_FLIP.FAST_PORTION}
          textStyle={{
            textAlign: 'left',
            fontSize: 18,
            fontWeight: 'bold',
            fontFamily: theme.typography.fontFamily.montserrat
          }}
          distance={100}
          style={{}}
          onAnimationComplete={() => { }}
        />
      </View>
      <GhostSlide
          visible={ghostSlideVisible}
          direction="custom"
          duration={2500}
          distance={1000}
          customX={-100}
          customY={400}
          ghostOpacity={1}
          onAnimationComplete={() => console.log('Ghost slide completed')}
        >
      {renderCurrencySelector()}
      </GhostSlide>
    </View>
  );

  const renderCurrencySelector = () => (
    <FadeWrapper
      visible={currencyDropdownVisible}
      duration={ANIMATION_CONSTANTS.CURRENCY_DROPDOWN.DURATION}
      onComplete={() => { }}
      style={{ width: 120, justifyContent: 'center', alignItems: 'center' }}
    >
      <TouchableOpacity
        style={[
          styles.currencySelector,
          {
            backgroundColor: theme.colors.palette.green100,
            padding: theme.spacing.spacing.xs,
            borderRadius: theme.spacing.spacing[10],
            borderWidth: 1 / 2,
            borderColor: theme.colors.palette.green700,
            width: 120
          }
        ]}
      >
        {currencyIcon && (
          <SvgXml xml={currencyIcon} width={30} height={30} />
        )}
        <View style={[styles.currencyTextContainer, { marginLeft: theme.spacing.spacing.xxs }]}>
          <CustomText
            variant="button"
            color={theme.colors.text.primary}
            style={[styles.currencyText, { marginHorizontal: theme.spacing.spacing.xxs }]}
          >
            {userDetails.currencyName}
          </CustomText>
          <SvgXml width={15} height={15} xml={SVGDownArrow3} />
        </View>
      </TouchableOpacity>
    </FadeWrapper>
  );

  const renderBalanceInfo = () => (
    <View style={[styles.leftContent, { padding: theme.spacing.spacing.sm }]}>
      <CustomText
        variant="subtitle2"
        color={isCrypto ? theme.colors.palette.white : theme.colors.text.primary}
        style={[styles.balanceTitle, { marginBottom: theme.spacing.spacing.sm }]}
        fontFamily={theme.typography.fontFamily.montserrat}
        fontWeight={'regular'}
      >
        {userDetails.balanceName}
      </CustomText>

      {renderCryptoBalance()}
      {renderPendingAmount()}
      {renderIdentifierInfo()}
    </View>
  );

  const renderCryptoBalance = () => {
    // Determine font size based on number of digits in wholePart
    const digits = wholePart.replace(/,/g, '').length;
    const isManyDigits = digits > 6;

    // Calculate appropriate font sizes based on available TextVariant types
    const wholePartFontSize = isManyDigits ? 'h3' : 'h2';
    const decimalPartFontSize = isManyDigits ? 'h4' : 'h4';

    return (
      <View style={styles.balanceWrapper}>
        <View style={[
          styles.balanceContainer,
          { maxWidth: digits > 8 ? '60%' : '65%' }
        ]}>
          {/* Combined balance display to ensure no spacing issues */}
          <CustomText
            variant={wholePartFontSize}
            color={isCrypto ? theme.colors.palette.white : theme.colors.text.primary}
            style={[
              styles.balanceAmount,
              isManyDigits && { fontSize: digits > 9 ? 20 : 24 }
            ]}
            numberOfLines={1}
            adjustsFontSizeToFit={true}
          >
            {isCrypto ? `$${wholePart}.${decimalPart}` : `${wholePart}.${decimalPart}`}
          </CustomText>
        </View>

        {/* <TouchableOpacity
          style={[
            styles.withdrawButton,
            isManyDigits && styles.withdrawButtonCompact
          ]}
          onPress={onWithdraw}
        >
          <CustomText style={[
            styles.withdrawText,
            isManyDigits && styles.withdrawTextCompact
          ]}>
            Withdraw
          </CustomText>
        </TouchableOpacity> */}
      </View>
    );
  };

  const renderPendingAmount = () => (
    <CustomText
      color={(pendingAmount !== undefined && !isCrypto) ?  "red" : theme.colors.palette.green700}
      variant="caption"
      style={[styles.pendingAmount, { marginBottom: theme.spacing.spacing.md }]}
    >
      {`(Pending ${pendingAmount?.toFixed(5)})`}
    </CustomText>
  );

  const renderIdentifierInfo = () => (
    identifierType && (
      <>
        <CustomText
          color={isCrypto ? theme.colors.palette.white : theme.colors.text.primary}
          fontFamily={theme.typography.fontFamily.montserrat}
          style={{
            fontSize: theme.typography.fontSize.sm,
            fontFamily: theme.typography.fontFamily.montserrat,
            fontWeight: "400"
          }}
        >
          {identifierType}
        </CustomText>

        <View style={styles.identifierRow}>
          <CustomText
            // variant="body2"
            color={isCrypto ? theme.colors.palette.white : theme.colors.text.primary}
            numberOfLines={1}
            style={[styles.identifier,{
              fontSize: theme.typography.fontSize.xs,
              fontWeight: "300"
            }]}
          >
            {identifier}
          </CustomText>

          {onCopy && (
            <TouchableOpacity 
              onPress={() => {
                if (identifier) {
                  copyToClipboard(identifier);
                  // onCopy();
                }
              }}
            >
              <SvgXml
                xml={isCrypto ? SVGCopy3 : SVGCopy2}
                width={18}
                height={18}
              />
            </TouchableOpacity>
          )}
        </View>
      </>
    )
  );

  const renderLogoSection = () => (
    <TouchableOpacity
      onPress={() => { }}
      activeOpacity={1}
      style={styles.logoContentContainer}
    >
      <View>
        <FadeWrapper
          visible={logoFadeVisible}
          duration={ANIMATION_CONSTANTS.LOGO_FADE.DURATION}
          onComplete={() => { }}
          style={{ width: 120, justifyContent: 'center', alignItems: 'center' }}
        >
          {logoSwitch ? (
            <SvgXml
              xml={PayAiro_Green_logo}
              style={{ margin: 10 }}
              width={ANIMATION_CONSTANTS.LOGO_SIZE.WIDTH}
              height={ANIMATION_CONSTANTS.LOGO_SIZE.HEIGHT}
              onPress={()=>{ 
                if(!isAnimating){
                  handleSwitch()
                }
              }}
            // opacity={isAnimating ? 0.7 : 1}
            />
          ) : (
            <SvgXml
              xml={PayAiro_White_logo}
              style={{ margin: 10 }}
              onPress={()=>{ 
                if(!isAnimating){
                  handleSwitch()
                }
              }}
            // opacity={isAnimating ? 0.7 : 1}
            />
          )}
        </FadeWrapper>
      </View>

      <View style={{ width: 70, height: 20 }} />

      <View style={styles.logoTextContainer}>
        <View style={styles.textAnimatedContainer}>
          <View style={{ flex: 1, justifyContent: 'flex-start' }}>
            <FlipSlide
              visible={!slideUpVisible}
              topText={namePart.toUpperCase()}
              bottomText={"Security".toUpperCase()}
              smallText='Account'
              flipDuration={ANIMATION_CONSTANTS.TEXT_FLIP.DURATION}
              fastPortion={ANIMATION_CONSTANTS.TEXT_FLIP.FAST_PORTION}
              textStyle={{
                ...styles.accountText,
                color: expandAnimationComplete ?
                  theme.colors.palette.white :
                  theme.colors.palette.black
              }}
              smallTextStyle={{
                ...styles.accountLabel,
                color: expandAnimationComplete ?
                  theme.colors.palette.white :
                  theme.colors.palette.black
              }}
              distance={100}
              style={{}}
              onAnimationComplete={() => { }}
            />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderExpandableCard = () => (
    <View
      style={{
        width: parentLayout?.width || '100%',
        height: parentLayout?.height || '100%',
        backgroundColor: 'transparent',
        position: 'absolute',
        zIndex: 1000,
        pointerEvents: 'box-none'
      }}
    >
      <ExpandableComp
        style={{ borderRadius: theme.spacing.spacing[10] }}
        ref={expandableRef}
        initialWidth={ANIMATION_CONSTANTS.EXPANDABLE_CARD.WIDTH}
        initialHeight={ANIMATION_CONSTANTS.EXPANDABLE_CARD.HEIGHT}
        backgroundColor={theme.colors.palette.white}
        borderRadius={theme.spacing.spacing[7]}
        parentLayout={parentLayout}
        position={ANIMATION_CONSTANTS.EXPANDABLE_CARD.POSITION}
        duration={ANIMATION_CONSTANTS.EXPANDABLE_CARD.DURATION}
        onAnimationComplete={() => { }}
      >
        <View style={styles.contentContainer} />
      </ExpandableComp>
    </View>
  );

  // Main render
  return (
    <Card
      style={styles.container}
      padding={0}
      borderRadius={theme.spacing.spacing[10]}
    >
      {renderHeaderSection()}
      {/* <GhostSlide
          visible={ghostCryptoCardSlide}
          direction="custom"
          duration={2500}
          distance={1000}
          customX={100}
          customY={100}
          ghostOpacity={1}
          onAnimationComplete={() => console.log('Ghost slide completed')}
      > */}
      <Card
        backgroundColor={cardBackgroundColor}
        borderRadius={theme.spacing.spacing[10]}
        elevation={7}
        padding={10}
        onLayout={handleCardLayout}
        style={styles.mainCard}
      >
        <View style={styles.cardContent}>
          {renderBalanceInfo()}
          {renderLogoSection()}
          {renderExpandableCard()}
        </View>
      </Card>
      {/* </GhostSlide> */}
    </Card>
  );
};

const createStyles = (theme: any) => StyleSheet.create({
  // Layout containers
  container: {
    width: '100%',
    backgroundColor: colors.green100,
  },
  mainCard: {
    width: '100%',
  },
  cardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    // paddingVertical: theme?.spacing?.spacing?.sm,
    width: '100%',
    // backgroundColor:'red'
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  leftContent: {
    width: '70%', // Reduced width to ensure space for logo
  },

  // Header styles
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme?.spacing?.spacing.xxs,
  },

  // Currency selector styles
  currencySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  currencyTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  currencyText: {},

  // Balance styles
  balanceWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme?.spacing?.spacing?.xs,
    paddingRight: 10, // Ensure space from logo
    width: '100%', // Take full width
    // backgroundColor:'blue'
  },
  balanceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    maxWidth: '65%', // Limit width to prevent overflow
    flexShrink: 1, // Allow shrinking to fit available space
  },
  balanceAmount: {
    marginRight: 0,
    flexShrink: 1, // Allow shrinking to fit available space
    letterSpacing: -0.5, // Tighten character spacing
  },
  balanceDecimals: {
    marginTop: 0,
    marginLeft: -2, // Reduce space between the whole part and decimal
    flexShrink: 0, // Prevent the decimal part from shrinking
  },
  balanceTitle: {},
  pendingAmount: {},

  // Identifier styles
  identifierType: {},
  identifierRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  identifier: {
    // width: '80%',
    marginRight:20
  },

  // Logo styles
  logoContentContainer: {
    position: 'absolute',
    width: ANIMATION_CONSTANTS.EXPANDABLE_CARD.WIDTH,
    right: 8,
    top: -5,
    borderRadius: theme.spacing.spacing[6],
    justifyContent: 'center',
    alignItems: 'center',
    height: ANIMATION_CONSTANTS.EXPANDABLE_CARD.HEIGHT,
    zIndex: 15000,
  },
  logoImage: {
    width: 50,
    height: 55,
    marginBottom: 10,
  },
  logoTextContainer: {
    position: 'absolute',
    right: 5,
    bottom: 10,
    width: 70,
    height: 40,
    overflow: 'hidden',
  },
  textAnimatedContainer: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  accountText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#000',
    position: 'absolute',
    right: 25,
    bottom: 10
  },
  accountLabel: {
    fontSize: 10,
    color: '#000',
    textAlign: "right",
    position: 'absolute',
    right: 10,
    bottom: 20
  },

  // Button styles
  withdrawButton: {
    backgroundColor: theme.colors.palette.black,
    paddingHorizontal: theme?.spacing?.spacing?.sm,
    paddingVertical: theme?.spacing?.spacing?.xs,
    borderRadius: theme?.spacing?.spacing?.xxl,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0, // Prevent the button from shrinking
    marginLeft: 8, // Add consistent space between balance and button
  },
  withdrawButtonCompact: {
    paddingHorizontal: theme?.spacing?.spacing?.xs,
    paddingVertical: 4,
    borderRadius: theme?.spacing?.spacing?.lg,
  },
  withdrawText: {
    color: theme.colors.palette.white,
    fontSize: 12,
    fontFamily: theme.typography.fontFamily.montserrat,
    fontWeight: '600',
  },
  withdrawTextCompact: {
    fontSize: 10,
  },
  contentText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default CryptoCard; 