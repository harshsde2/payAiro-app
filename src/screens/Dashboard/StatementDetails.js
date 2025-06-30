import {
  View,
  Text,
  TextInput,
  Platform,
  Alert,
  ScrollView,
} from "react-native";
import React, { useRef } from "react";
import CommonHeaderv2 from "../../HOC/CommonHeaderv2";
import HeaderTitle from "../../components/HeaderTitle";
import {
  SVGArrow,
  SVGDebitTx,
  SVGDownloaded,
  SVGLeftArrow,
  SVGSearch,
  SVGShare,
  SVGSupports,
  SVGTx,
} from "../../constants/images";
import { SvgXml } from "react-native-svg";
import Fonts from "../../constants/Fonts";
import moment from "moment";
import ViewShot from "react-native-view-shot";
import RNHTMLtoPDF from "react-native-html-to-pdf";
import RNFS from "react-native-fs";
import Share from "react-native-share";
import useDispatchAction from "../../hooks/useDispatchAction";
import { setSuccessMsg } from "../../redux/slices/authenticationSlice";
import { ScreenContainer } from "HOC";
import { themes } from "styles";
export default function StatementDetails(props) {
  const { data } = props.route.params;
  const viewShotRef = useRef(null);

  const generatePDF = async (isShare) => {
    try {
      // Create HTML table
      const htmlContent = `
        <html>
          <head>
            <style>
              table {
                width: 100%;
                border-collapse: collapse;
              }
              th, td {
                border: 1px solid black;
                text-align: left;
                padding: 8px;
              }
              th {
                background-color: #f2f2f2;
              }
            </style>
          </head>
          <body>
            <h2>Transaction Report</h2>
            <table>
              <thead>
                <tr>
                  <th>Amount</th>
                  <th>Date & Time</th>
                  <th>Sender</th>
                  <th>Status</th>
                  <th>Transaction ID</th>
                </tr>
              </thead>
              <tbody>
                ${data
                  .map(
                    (item) => `
                      <tr>
                        <td>${item.amount}</td>
                        <td>${item.datetime}</td>
                        <td>${item.sender}</td>
                        <td>${item.status}</td>
                        <td>${item.option}</td>
                        <td>${item.transaction_id}</td>
                      </tr>
                    `
                  )
                  .join("")}
              </tbody>
            </table>
          </body>
        </html>
      `;

      // Generate PDF
      const pdfOptions = {
        html: htmlContent,
        fileName: "Transaction_Report",
        directory: "Documents",
      };
      const pdf = await RNHTMLtoPDF.convert(pdfOptions);
      if (!isShare) {
        // Move PDF to Download Directory for Access
        const downloadDir =
          Platform.OS === "android"
            ? `${RNFS.DownloadDirectoryPath}/Transaction_Report.pdf`
            : `${RNFS.DocumentDirectoryPath}/Transaction_Report.pdf`;

        await RNFS.moveFile(pdf.filePath, downloadDir);
        useDispatchAction(
          setSuccessMsg(`Your PDF has been saved to: ${downloadDir}`)
        );
      } else {
        // Share PDF
        const shareOptions = {
          url: `file://${pdf.filePath}`,
          type: "application/pdf",
        };
        await Share.open(shareOptions);
      }
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <ScreenContainer padding={0}>
      <HeaderTitle title={"Statement"} leftIcon={SVGLeftArrow} />
      <ScrollView>
        <View
          style={{
            flex: 1,
            backgroundColor: "#fff",
            borderTopEndRadius: 32,
            borderTopStartRadius: 32,
            padding: 20,
            marginTop: 10,
          }}
        >
          <ViewShot ref={viewShotRef} options={{ format: "pdf", quality: 0.9 }}>
            <View
              style={{
                borderWidth: 1,
                borderColor: "rgba(237, 237, 237, 1)",
                flexDirection: "row",
                justifyContent: "space-between",
                borderRadius: 40,
                width: "100%",
                alignSelf: "center",
                paddingTop: 3,
                paddingBottom: 1,
                paddingHorizontal: 4,
                backgroundColor: "#fff",
              }}
            >
              <SvgXml xml={SVGSearch} />
              <TextInput
                style={{
                  width: "90%",
                  paddingLeft: 10,
                  color: "rgba(106, 106, 106, 1)",
                }}
                placeholderTextColor={"rgba(106, 106, 106, 1)"}
                placeholder="Search Transaction..."
              />
            </View>
            {data &&
              data?.map((item, key) => (
                <View
                  key={key}
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: 5,
                    marginTop: 10,
                  }}
                >
                  <View>
                    <Text
                      style={{
                        color: "#000",
                        fontFamily: Fonts.bold,
                        fontSize: 16,
                      }}
                    >
                      {item?.sender}
                    </Text>
                    <Text
                      style={{
                        color: "rgba(106, 106, 106, 1)",
                        fontFamily: Fonts.regular,
                        fontSize: 12,
                        marginTop: 3,
                      }}
                    >
                      {moment(item?.datetime).format("YYYY-MMM-DD , LT")}
                    </Text>
                  </View>
                  <View style={{ flexDirection: "column" }}>
                    <Text
                      style={{
                        color:
                          item?.status === "cancelled" ? "orange" : "green",
                        fontFamily: Fonts.regular,
                        fontSize: 12,
                        textAlign: "right",
                      }}
                    >
                      {item?.status.toUpperCase()}
                    </Text>
                    <Text
                      style={{
                        color: "#000",
                        fontFamily: Fonts.regular,
                        fontSize: 16,
                        textAlign: "right",
                      }}
                    >
                      {item.type == "credit" ? (
                        <SvgXml xml={SVGTx} />
                      ) : (
                        <SvgXml xml={SVGDebitTx} />
                      )}
                      ${item?.amount}
                    </Text>
                  </View>
                </View>
              ))}
          </ViewShot>
        </View>
      </ScrollView>

      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          margin: 10,
          padding: 5,
          paddingHorizontal: 20,
          backgroundColor: themes.dark.colors.palette.white,
          borderRadius: 32,
        }}
      >
        <SvgXml xml={SVGSupports} />
        <SvgXml xml={SVGDownloaded} onPress={() => generatePDF(false)} />
        <SvgXml xml={SVGShare} onPress={() => generatePDF(true)} />
      </View>
    </ScreenContainer>
  );
}
