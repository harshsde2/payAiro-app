import React, { ReactNode } from 'react';
import { 
  View, 
  StyleSheet, 
  TouchableOpacity, 
  Text,
  StyleProp,
  ViewStyle,
  TextStyle
} from 'react-native';
import { useTheme } from '../styles/ThemeContext';
import ScreenContainer from './ScreenContainer';

// Interface for header items (left, right)
interface HeaderItem {
  icon?: ReactNode;
  text?: string;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

interface ScreenWithHeaderProps {
  children: ReactNode;
  title?: string;
  titleStyle?: StyleProp<TextStyle>;
  headerStyle?: StyleProp<ViewStyle>;
  headerContainerStyle?: StyleProp<ViewStyle>;
  leftItem?: HeaderItem;
  rightItem?: HeaderItem;
  scrollable?: boolean;
  avoidKeyboard?: boolean;
  safeArea?: boolean;
  statusBarColor?: string;
  statusBarStyle?: 'light-content' | 'dark-content';
  padding?: boolean | number;
  paddingHorizontal?: boolean | number;
  paddingVertical?: boolean | number;
  style?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
  backgroundColor?: string;
  showHeader?: boolean;
  showShadow?: boolean;
}

/**
 * A screen component with header that extends ScreenContainer functionality
 */
const ScreenWithHeader: React.FC<ScreenWithHeaderProps> = ({
  children,
  title,
  titleStyle,
  headerStyle,
  headerContainerStyle,
  leftItem,
  rightItem,
  showHeader = true,
  showShadow = true,
  ...screenProps
}) => {
  const { theme } = useTheme();
  
  // Render the header if enabled
  const renderHeader = () => {
    if (!showHeader) return null;
    
    return (
      <View 
        style={[
          styles.headerContainer, 
          showShadow && { 
            shadowColor: theme.colors.shadow.default,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 3,
          },
          { backgroundColor: theme.colors.background.primary },
          headerContainerStyle
        ]}
      >
        <View style={[styles.header, headerStyle]}>
          {/* Left item (usually back button) */}
          <View style={styles.headerSide}>
            {leftItem && (
              <TouchableOpacity 
                style={[styles.headerButton, leftItem.style]} 
                onPress={leftItem.onPress}
              >
                {leftItem.icon}
                {leftItem.text && (
                  <Text 
                    style={[
                      styles.headerButtonText, 
                      { color: theme.colors.text.primary },
                      leftItem.textStyle
                    ]}
                  >
                    {leftItem.text}
                  </Text>
                )}
              </TouchableOpacity>
            )}
          </View>
          
          {/* Title */}
          <View style={styles.headerCenter}>
            {title && (
              <Text 
                style={[
                  styles.headerTitle, 
                  { color: theme.colors.text.primary },
                  titleStyle
                ]}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {title}
              </Text>
            )}
          </View>
          
          {/* Right item (optional) */}
          <View style={styles.headerSide}>
            {rightItem && (
              <TouchableOpacity 
                style={[styles.headerButton, rightItem.style]} 
                onPress={rightItem.onPress}
              >
                {rightItem.icon}
                {rightItem.text && (
                  <Text 
                    style={[
                      styles.headerButtonText, 
                      { color: theme.colors.text.primary },
                      rightItem.textStyle
                    ]}
                  >
                    {rightItem.text}
                  </Text>
                )}
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    );
  };
  
  return (
    <ScreenContainer {...screenProps}>
      {renderHeader()}
      {children}
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    width: '100%',
  },
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerSide: {
    width: 80,
    height: '100%',
    justifyContent: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  headerButton: {
    height: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  headerButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
});

export default ScreenWithHeader; 