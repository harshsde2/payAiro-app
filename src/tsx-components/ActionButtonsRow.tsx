import React, { memo } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from '../styles/ThemeContext';
import ActionButton from './ActionButton';

interface ActionItem {
  id: string;
  icon: string;
  label: string;
  onPress: () => void;
  disabled?: boolean;
}

interface ActionButtonsRowProps {
  actions: ActionItem[];
  scrollable?: boolean;
}

const ActionButtonsRow: React.FC<ActionButtonsRowProps> = ({
  actions,
  scrollable = true,
}) => {
  const { theme } = useTheme();
  const styles = createStyles(theme);

  const Container = scrollable ? ScrollView : View;
  const containerProps = scrollable ? {
    horizontal: true,
    showsHorizontalScrollIndicator: false,
    contentContainerStyle: styles.scrollContent,
  } : {};

  return (
    <Container style={styles.container} {...containerProps}>
      {actions.map((action) => (
        <ActionButton
          key={action.id}
          icon={action.icon}
          label={action.label}
          onPress={action.onPress}
          disabled={action.disabled}
        />
      ))}
    </Container>
  );
};

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    marginVertical: theme.spacing.spacing.md,
  },
  scrollContent: {
    paddingHorizontal: theme.spacing.spacing.xs,
    gap: theme.spacing.spacing.sm,
  },
});

export default memo(ActionButtonsRow); 