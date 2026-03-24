import { StyleSheet, Dimensions } from 'react-native';
import { ITheme } from '../themes/themeTypes';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export const bottomSheetStyles = (theme: ITheme) => {
  return StyleSheet.create({
    backdrop: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'black',
      zIndex: 9999,
      elevation: 9999,
    },
    container: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: theme.colors.background,
      borderTopLeftRadius: theme.radius.xl,
      borderTopRightRadius: theme.radius.xl,
      zIndex: 10000,
      elevation: 10000,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: -4,
      },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 16,
      maxHeight: SCREEN_HEIGHT * 0.95,
    },
    handleContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: theme.spacing.sm,
    },
    handleIndicator: {
      width: 40,
      height: 4,
      backgroundColor: theme.colors.grey,
      borderRadius: 2,
    },
    contentContainer: {
      flex: 1,
      paddingHorizontal: theme.spacing.base,
      paddingBottom: theme.spacing.xl,
    },
  });
};

export const BOTTOM_SHEET_CONSTANTS = {
  SCREEN_HEIGHT,
  DEFAULT_SNAP_POINTS: ['25%', '50%', '90%'],
  VELOCITY_THRESHOLD: 500,
  DRAG_THRESHOLD: 50,
  ANIMATION_CONFIG: {
    damping: 20,
    stiffness: 200,
    mass: 0.5,
    overshootClamping: false,
    restDisplacementThreshold: 0.01,
    restSpeedThreshold: 0.01,
  },
};

