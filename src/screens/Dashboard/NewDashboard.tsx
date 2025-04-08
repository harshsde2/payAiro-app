import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import ThemeUsageExample from '../../styles/ThemeUsageExample';
import { DashboardHeader } from '../../tsx-components';
import FontTest from '../../tsx-components/FontTest';
import { ScreenContainer } from '../../HOC';
import { useTheme } from '../../styles/ThemeContext';

const NewDashboard = () => {
  const { theme, toggleTheme } = useTheme();
  const [userName, setUserName] = useState('Daniel Hamilton');
  const [showFontTest, setShowFontTest] = useState(false);
  
  // Example custom theme handling
  const styles = createStyles(theme);

  return (
    <ScreenContainer>
      <DashboardHeader 
        name={userName}
      />
      
      {/* <ScrollView style={styles.content}>
        <Text style={styles.title}>Dashboard</Text>
        
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Your Balance</Text>
          <Text style={styles.balanceText}>$12,345.67</Text>
          
          <View style={styles.actionsRow}>
            <TouchableOpacity style={styles.actionButton}>
              <Text style={styles.actionButtonText}>Send</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionButton}>
              <Text style={styles.actionButtonText}>Receive</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionButton}>
              <Text style={styles.actionButtonText}>Scan</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.buttonRow}>
          <TouchableOpacity 
            style={styles.themeToggleButton} 
            onPress={toggleTheme}
          >
            <Text style={styles.themeToggleText}>
              Toggle Theme ({theme.mode})
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.fontTestButton} 
            onPress={() => setShowFontTest(!showFontTest)}
          >
            <Text style={styles.themeToggleText}>
              {showFontTest ? 'Hide' : 'Show'} Font Test
            </Text>
          </TouchableOpacity>
        </View>
        
        {showFontTest && <FontTest />}
      </ScrollView> */}
    </ScreenContainer>
  );
};

// Create styles with theme
const createStyles = (theme: any) => StyleSheet.create({
  content: {
    flex: 1,
    padding: theme.spacing.spacing.md,
  },
  title: {
    fontFamily: theme.typography.fontFamily.nexaHeavy,
    fontSize: theme.typography.fontSize.xl,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.spacing.lg,
  },
  card: {
    backgroundColor: theme.colors.card.background,
    borderRadius: 16,
    padding: theme.spacing.spacing.md,
    marginBottom: theme.spacing.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.card.border,
    shadowColor: theme.colors.shadow.default,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardTitle: {
    fontFamily: theme.typography.fontFamily.montserrat,
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.spacing.xs,
  },
  balanceText: {
    fontFamily: theme.typography.fontFamily.nexaHeavy,
    fontSize: theme.typography.fontSize.xxxl,
    color: theme.colors.palette.green700,
    marginBottom: theme.spacing.spacing.md,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    backgroundColor: theme.colors.button.primary.background,
    paddingVertical: theme.spacing.spacing.xs,
    paddingHorizontal: theme.spacing.spacing.sm,
    borderRadius: 8,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: theme.spacing.spacing.xs,
  },
  actionButtonText: {
    fontFamily: theme.typography.fontFamily.montserratSemiBold,
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.button.primary.text,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.spacing.md,
  },
  themeToggleButton: {
    backgroundColor: theme.colors.button.secondary.background,
    padding: theme.spacing.spacing.sm,
    borderRadius: 8,
    alignItems: 'center',
    flex: 1,
    marginRight: theme.spacing.spacing.xs,
  },
  fontTestButton: {
    backgroundColor: theme.colors.button.secondary.background,
    padding: theme.spacing.spacing.sm,
    borderRadius: 8,
    alignItems: 'center',
    flex: 1,
    marginLeft: theme.spacing.spacing.xs,
  },
  themeToggleText: {
    fontFamily: theme.typography.fontFamily.montserratSemiBold,
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.button.secondary.text,
  },
});

export default NewDashboard;