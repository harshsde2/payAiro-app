import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { resolveThemeWithoutProvider } from '@new-ui/styles/ThemeContext';

type ErrorBoundaryProps = {
  children: React.ReactNode;
  /** Hook for crash reporting (e.g. Sentry). Called once per caught error. */
  onError?: (error: Error, componentStack: string) => void;
};

type ErrorBoundaryState = {
  error: Error | null;
};

/**
 * App-wide crash guard.
 *
 * Without this, any render/lifecycle throw anywhere in the tree unmounts the whole app to a
 * blank screen with no way back. Catching it here turns that into a recoverable screen.
 *
 * Note this only catches errors thrown during React rendering — it cannot catch errors inside
 * event handlers or async callbacks (those need their own try/catch), and it cannot catch
 * native crashes, which kill the process before JS ever sees them.
 */
class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[ErrorBoundary] uncaught render error', error, info.componentStack);
    this.props.onError?.(error, info.componentStack ?? '');
  }

  private handleRetry = () => {
    this.setState({ error: null });
  };

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;

    // Resolved here rather than at module load so a crash reflects the theme the user is
    // actually on. Only runs on the crash path, so the StyleSheet cost is irrelevant.
    const styles = createStyles();

    return (
      <View style={styles.container}>
        <Text style={styles.title}>Something went wrong</Text>
        <Text style={styles.message}>
          The app hit an unexpected error. You can try again — your account and balances are
          unaffected.
        </Text>
        {__DEV__ ? (
          <Text style={styles.debug} numberOfLines={8}>
            {error.message}
          </Text>
        ) : null}
        <Pressable
          onPress={this.handleRetry}
          style={({ pressed }) => [styles.button, { opacity: pressed ? 0.85 : 1 }]}
        >
          <Text style={styles.buttonText}>Try again</Text>
        </Pressable>
      </View>
    );
  }
}

// Colours come straight from storage rather than the theme context: the provider itself
// may be what failed, so this screen must not depend on it. Falls back to light.
const createStyles = () => {
  const theme = resolveThemeWithoutProvider();
  return StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
      backgroundColor: theme.colors.background,
    },
    title: {
      fontSize: 20,
      fontWeight: '700',
      color: theme.colors.text,
      textAlign: 'center',
    },
    message: {
      marginTop: 12,
      fontSize: 15,
      lineHeight: 22,
      color: theme.colors.textSecondary,
      textAlign: 'center',
    },
    debug: {
      marginTop: 16,
      fontSize: 12,
      color: theme.colors.error,
      textAlign: 'center',
    },
    button: {
      marginTop: 28,
      paddingVertical: 14,
      paddingHorizontal: 40,
      borderRadius: 28,
      backgroundColor: theme.colors.primary,
    },
    buttonText: {
      color: theme.colors.onPrimary,
      fontSize: 16,
      fontWeight: '600',
    },
  });
};

export default ErrorBoundary;
