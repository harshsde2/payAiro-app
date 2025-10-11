// PDFViewer.js
import { useNavigation, useRoute } from '@react-navigation/native';
import HeaderTitle from 'components/HeaderTitle';
import { ScreenContainer } from 'HOC';
import React, { FC } from 'react';
import { View, Dimensions, Platform } from 'react-native';
import Pdf from 'react-native-pdf';

interface PDFViewerProps {
    url: string
}
const PDFViewer: FC<PDFViewerProps> = ({ }) => {
    const navigation = useNavigation();
    const route = useRoute();
    const { url , isFileFromLocal, fileName } = (route as any).params;
    
    // For local bundled files, we need to handle them differently
    // iOS: can use require() directly
    // Android: needs bundle:// URI format with the asset path
    let source;
    if (isFileFromLocal) {
        if (Platform.OS === 'android') {
            // For Android, use bundle-assets:// protocol
            // The path should be relative to android/app/src/main/assets/
            const pdfFileName = fileName || 'Cybrid_User_Agreement.pdf';
            source = { uri: `bundle-assets://pdf/${pdfFileName}` };
        } else {
            // For iOS, pass the resource directly
            source = url;
        }
    } else {
        // For remote URLs
        source = { uri: url, cache: true };
    }

    return (
        <ScreenContainer padding={0} style={{ flex: 1 }}>
            <HeaderTitle leftIcon={'left'} onPressLeft={()=> navigation.goBack()} title='PDF Viewer' />
            <Pdf
                source={source}
                onLoadComplete={(numberOfPages, filePath) => {
                    console.log(`Number of pages: ${numberOfPages}`);
                }}
                onPageChanged={(page, numberOfPages) => {
                    console.log(`Current page: ${page}`);
                }}
                onError={(error) => {
                    console.log('PDF Error:', error);
                }}
                enableDoubleTapZoom
                onPressLink={(uri) => {
                    console.log(`Link pressed: ${uri}`);
                }}
                style={{ flex: 1, width: Dimensions.get('window').width }}
            />
        </ScreenContainer>
    );
};

export default PDFViewer;
