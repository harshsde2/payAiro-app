import React from 'react';
import { View, Text } from 'react-native';
import { WebView } from 'react-native-webview';

const WebViewLogger = ({ url }: any) => {
    return (
        <View style={{ flex: 1 }}>
            <Text>WebView with Logging</Text>
            <WebView
                source={{ uri: url }}
                onMessage={(event) => {
                    console.log('📨 Message from WebView:', event.nativeEvent.data);
                }}
                injectedJavaScript={`
          // Override window.postMessage to route to React Native
          window.postMessage = function(data) {
            window.ReactNativeWebView.postMessage(data);
          };

          // Optionally log any JavaScript console logs to React Native
          (function () {
            const originalLog = console.log;
            console.log = function (...args) {
              window.ReactNativeWebView.postMessage("LOG: " + args.join(" "));
              originalLog.apply(console, args);
            };
          })();

          true; // Ensure script runs
        `}
                javaScriptEnabled={true}
                originWhitelist={['*']}
            />
        </View>
    );
};

export default WebViewLogger;
