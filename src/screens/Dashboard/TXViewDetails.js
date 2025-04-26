import {View, Text, Alert, StyleSheet} from 'react-native';
import React, {useRef} from 'react';
import CommonHeaderv2 from '../../HOC/CommonHeaderv2';
import HeaderTitle from '../../components/HeaderTitle';
import {
  SVGDownloaded,
  SVGLeftArrow,
  SVGReceived,
  SVGSent,
  SVGShare,
  SVGSupports,
} from '../../constants/images';
import Fonts from '../../constants/Fonts';
import GenericButton from '../../components/GenericButton';
import {SvgXml} from 'react-native-svg';
import useSelectorAction from '../../hooks/useSelectorAction';
import {useNavigation} from '@react-navigation/native';
import {SCREENS} from '../../constants/SCREENS';
import Share from 'react-native-share';
import ViewShot from 'react-native-view-shot';
import RNHTMLtoPDF from 'react-native-html-to-pdf';
import RNFS from 'react-native-fs';
import useDispatchAction from '../../hooks/useDispatchAction';
import {
  setErrorMsg,
  setSuccessMsg,
} from '../../redux/slices/authenticationSlice';
import moment from 'moment';
export default function TXViewDetails(props) {
  const {transactionLists, isCrypto} = props.route.params;
  const {walletData} = useSelectorAction();
  const navigation = useNavigation();
  const viewShotRef = useRef(null);
  const handleShare = async () => {
    try {
      const uri = await viewShotRef.current.capture();
      const shareOptions = {
        title: 'Transaction Details',
        url: uri,
        type: 'image/png',
      };
      const res = await Share.open(shareOptions);
      console.log('Share result:', res);
    } catch (err) {
      console.log('Error sharing:', err);
    }
  };

  const generatePDF = async () => {
    try {
      // Capture the view as an image
      const uri = await viewShotRef.current.capture();

      // Embed the image into an HTML structure
      const html = `
        <html>
          <body style="margin: 0; padding: 0;">
            <img src="${uri}" style="width: 100%; height: auto;" />
          </body>
        </html>
      `;

      // Generate the PDF file in a temporary location
      const pdfOptions = {
        html,
        fileName: 'TransactionDetails',
        directory: 'Documents',
      };

      const pdfFile = await RNHTMLtoPDF.convert(pdfOptions);

      // Define the Downloads folder path
      const downloadDir =
        Platform.OS === 'android'
          ? `${RNFS.DownloadDirectoryPath}/TransactionDetails.pdf`
          : `${RNFS.DocumentDirectoryPath}/TransactionDetails.pdf`;

      // Move the PDF to the Downloads folder
      await RNFS.moveFile(pdfFile.filePath, downloadDir);
      useDispatchAction(
        setSuccessMsg(`Your PDF has been saved to: ${downloadDir}`),
      );
      console.log('PDF saved to:', downloadDir);
    } catch (error) {
      console.log(error);
      useDispatchAction(
        setErrorMsg(`An error occurred while generating the PDF.`),
      );
    }
  };
  console.log(transactionLists, 'transactionLists');
  const formattedTransactionHistory = transactionLists?.map(entry => {
    const key = Object.keys(entry)[0];
    const value = entry[key];
    return {label: key, value};
  });
  return (
    <CommonHeaderv2>
      <HeaderTitle  leftIcon={SVGLeftArrow} />
      <View
        style={{
          flex: 1,
          backgroundColor: '#fff',
          borderTopEndRadius: 32,
          borderTopStartRadius: 32,
          padding: 20,
          marginTop: 0,
        }}>
        <ViewShot ref={viewShotRef} options={{format: 'png', quality: 0.9}}>
          <View style={{backgroundColor: '#fff', padding: 10}}>
            <View
              style={[
                {
                  width: 90,
                  height: 90,
                  borderRadius: 60,
                  justifyContent: 'center',
                  alignItems: 'center',
                  overflow: 'hidden',
                  alignSelf: 'center',
                },
                {backgroundColor: 'rgba(255, 37, 99, 1)'},
              ]}>
              <Text
                style={{
                  color: '#000',
                  fontSize: 30,
                  fontFamily: Fonts.semibold,
                }}>
                {transactionLists[0]?.To?.charAt(0)?.toUpperCase() +
                  transactionLists[0]?.To?.charAt(1)?.toUpperCase()}
              </Text>
            </View>
            <Text
              style={{
                color: 'black',
                fontFamily: Fonts.semibold,
                textAlign: 'center',
                fontSize: 12,
              }}>
              {transactionLists[0]?.To}
            </Text>
            <Text
              style={{
                color: 'rgba(106, 106, 106, 1)',
                fontFamily: Fonts.semibold,
                textAlign: 'center',
                fontSize: 12,
              }}>
              31122409331250
            </Text>

            <Text
              style={{
                color: 'rgba(29, 29, 29, 1)',
                fontFamily: Fonts.bold,
                textAlign: 'center',
                fontSize: 32,
                marginTop: 20,
              }}>
             { isCrypto ? `$${transactionLists[3]?.Amount}`:`${transactionLists[3]?.Amount}`}
            </Text>
            <GenericButton
              onPress={() =>
                navigation.navigate(SCREENS.Send, {
                  sender:
                    transactionLists[0]?.To !== walletData?.wallet_public_key
                      ? transactionLists[0]?.To
                      : transactionLists[0]?.From,
                  type: 'receive',
                })
              }
              title={
                transactionLists[0]?.To !== walletData?.wallet_public_key
                  ? 'Pay Again'
                  : 'Pay'
              }
              cStyle={{
                width: '40%',
                paddingTop: 12,
                alignSelf: 'center',
                marginTop: 20,
              }}
            />
            <Text
              style={{
                ...styles.typeText,
                marginLeft: 10,
                textAlign: 'center',
                marginTop: 15,
                marginBottom: 8,
                color:
                  transactionLists[0]?.To !== walletData?.wallet_public_key
                    ? 'rgba(0, 119, 4, 1)'
                    : 'rgba(52, 153, 224, 1)',
              }}>
              {transactionLists[0]?.To !== walletData?.wallet_public_key
                ? 'Paid'
                : 'Received'}{' '}
              {transactionLists[0]?.To !== walletData?.wallet_public_key ? (
                <SvgXml xml={SVGSent} />
              ) : (
                <SvgXml xml={SVGReceived} />
              )}
            </Text>

            <View
              style={{
                borderBottomWidth: 1,
                borderBottomColor: 'rgba(235, 235, 235, 1)',
              }}
            />

            <Text style={styles.dateText}>{transactionLists[4]?.Date}</Text>
            <View
              style={{
                borderRadius: 20,
                backgroundColor: 'rgba(252, 252, 252, 1)',
                borderWidth: 1,
                padding: 20,
                borderColor: 'rgba(237, 237, 237, 1)',
                marginTop: 30,
              }}>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'flex-start',
                  alignItems: 'center',
                }}>
                <View
                  style={[
                    {
                      width: 60,
                      height: 60,
                      borderRadius: 60,
                      justifyContent: 'center',
                      alignItems: 'center',
                      overflow: 'hidden',
                      alignSelf: 'center',
                    },
                    {backgroundColor: 'rgba(255, 37, 99, 1)'},
                  ]}>
                  <Text
                    style={{
                      color: '#000',
                      fontSize: 20,
                      fontFamily: Fonts.semibold,
                    }}>
                    {transactionLists[0]?.To?.charAt(0)?.toUpperCase() +
                      transactionLists[0]?.To?.charAt(1)?.toUpperCase()}
                  </Text>
                </View>
                <Text
                  numberOfLines={1}
                  style={{
                    color: 'rgba(29, 29, 29, 1)',
                    fontFamily: Fonts.semibold,
                    //   textAlign: 'center',
                    fontSize: 14,
                    marginLeft: 10,
                    width: '60%',
                  }}>
                  {transactionLists[0]?.To}
                </Text>
              </View>
              <View
                style={{
                  borderBottomWidth: 1,
                  borderColor: 'rgba(237, 237, 237, 1)',
                  marginVertical: 10,
                }}
              />
              {formattedTransactionHistory.map(({label, value}, index) => (
                <View
                  key={index}
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}>
                  <Text
                    style={{
                      fontFamily: Fonts.semibold,
                      color: 'rgba(29, 29, 29, 1)',
                      marginVertical: 15,
                    }}>
                    {label}
                  </Text>
                  <Text
                    numberOfLines={1}
                    style={{
                      fontFamily: Fonts.regular,
                      color: 'rgba(29, 29, 29, 1)',
                      marginVertical: 15,
                      fontSize: 10,
                      width: '60%',
                      textAlign: 'right',
                    }}>
                    {value}
                    {isCrypto}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </ViewShot>

        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: 10,
          }}>
          <SvgXml xml={SVGSupports} />
          <SvgXml xml={SVGDownloaded} onPress={generatePDF} />
          <SvgXml xml={SVGShare} onPress={handleShare} />
        </View>
      </View>
    </CommonHeaderv2>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#FFF',
  },
  header: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
    marginVertical: 8,
    color: '#9E9E9E',
  },
  listContainer: {
    paddingVertical: 16,
  },
  transactionCard: {
    padding: 5,
    marginVertical: 8,
    borderRadius: 12,
    width: '60%',
    borderWidth: 3,
    borderColor: 'rgba(52, 153, 224, 0.07)',
    // elevation: ,
  },
  typeText: {
    fontSize: 14,
    fontFamily: Fonts.regular,
    color: 'rgba(52, 153, 224, 1)',
  },
  amountText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
  },
  dateText: {
    fontSize: 10,
    color: 'rgba(106, 106, 106, 1)',
    fontFamily: Fonts.regular,
    textAlign: 'center',
    marginTop: 10,
  },
});
