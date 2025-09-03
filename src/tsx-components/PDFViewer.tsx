// PDFViewer.js
import { useNavigation, useRoute } from '@react-navigation/native';
import HeaderTitle from 'components/HeaderTitle';
import { ScreenContainer } from 'HOC';
import React, { FC } from 'react';
import { View, Dimensions } from 'react-native';
import Pdf from 'react-native-pdf';

interface PDFViewerProps {
    url: string
}
const PDFViewer: FC<PDFViewerProps> = ({ }) => {
    const navigation = useNavigation();
    const route = useRoute();
    const { url , isFileFromLocal } = (route as any).params;
    // console.log("url =>",url);
    const source = {
        uri: isFileFromLocal ? url : url,
        cache: true,
    };

    return (
        <ScreenContainer padding={0} style={{ flex: 1 }}>
            <HeaderTitle leftIcon={'left'} onPressLeft={()=> navigation.goBack()} title='PDF Viewer' />
            <Pdf
                source={ isFileFromLocal ? url:source}
                onLoadComplete={(numberOfPages, filePath) => {
                    console.log(`Number of pages: ${numberOfPages}`);
                }}
                onPageChanged={(page, numberOfPages) => {
                    console.log(`Current page: ${page}`);
                }}
                onError={(error) => {
                    console.log(error);
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
