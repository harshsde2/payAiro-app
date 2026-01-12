import React from "react";
import { useNavigation } from "@react-navigation/native";
import { ScreenContainer } from "HOC";
import HeaderTitle from "components/HeaderTitle";
import WebView from "react-native-webview";
import { Card } from "tsx-components";
import { useGlobalStyles } from "styles/GlobalStyles";
import { useRoute } from "@react-navigation/native";
const TestWebView: React.FC = () => {
  const navigation = useNavigation<any>();
  const globalStyles = useGlobalStyles();
  const route = useRoute();
  const { checkoutLink } = (route.params as any) || {};
  

  return (
    <ScreenContainer padding={0}>
      <HeaderTitle
        title="Checkout"
        leftIcon={"true"}
        onPressLeft={() => navigation.goBack()}
      />
      <Card
        style={[globalStyles.whiteSheetContainer, { flex: 1, marginTop: 10 }]}
      >
        <WebView
          source={{ uri: checkoutLink }}
          style={{ flex: 1 }}
          userAgent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        />
      </Card>
    </ScreenContainer>
  );
};

export default TestWebView;
