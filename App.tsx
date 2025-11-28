import React from 'react';
import { Provider } from 'react-redux';
import { QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { store } from './src/redux/store';
import { queryClient } from './src/query/queryClient';
import { ThemeProvider } from './src/styles/ThemeContext';
import { BottomSheetProvider } from './src/components/common-components/BottomSheet';
import RootNavigator from './src/navigations/RootNavigator';

const App: React.FC = () => {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <Provider store={store}>
          <QueryClientProvider client={queryClient}>
            <ThemeProvider>
              <BottomSheetProvider>
                <RootNavigator />
              </BottomSheetProvider>
            </ThemeProvider>
          </QueryClientProvider>
        </Provider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
};

export default App;