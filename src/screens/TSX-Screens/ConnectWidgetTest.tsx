// ConnectWidgetTest.tsx
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { ConnectWidget } from "@mxenabled/react-native-widget-sdk";
import { useRoute } from "@react-navigation/native";

const ConnectWidgetTest = () => {
    const route = useRoute();
    const { URL } = route.params as any;

    console.log("🔗 Widget URL =>", URL);

    // Logging function for all events/messages
    const handleEvent = (type: string, payload: any) => {
        console.group(`📡 MX Connect Event: ${type}`);
        console.log("Payload:", payload);
        console.groupEnd();
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>MX Connect Widget Test</Text>

            <View style={styles.widgetContainer}>
                <ConnectWidget
                    url={URL}
                    onLoaded={() => console.log("✅ Widget Loaded")}
                    onEnterCredentials={(metadata) => {
                        console.log('onEnterCredentials =>', metadata)
                    }}
                    onMemberConnected={(metadata) => {
                        console.log('onMemberConnected =>', metadata)
                    }}
                    onCreateMemberError={(metadata) => {
                        console.log('onCreateMemberError =>', metadata)                        
                    }}
                    onOAuthError={(metadata) => {
                        console.log('onOAuthError =>', metadata)
                    }}
                    onOAuthRequested={(metadata) => {
                        console.log('onOAuthRequested =>', metadata)
                    }}
                    onSubmitMFA={(metadata) => {
                        console.log('onSubmitMFA =>', metadata)
                    }}
                    style={{
                        minHeight: '100%',
                    }}
                />
            </View>
        </View>
    );
};


const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 50,
        paddingHorizontal: 10,
        backgroundColor: "#fff",
    },
    title: {
        fontSize: 22,
        fontWeight: "600",
        textAlign: "center",
        marginBottom: 20,
    },
    widgetContainer: {
        flex: 1,
    },
});

export default ConnectWidgetTest;
