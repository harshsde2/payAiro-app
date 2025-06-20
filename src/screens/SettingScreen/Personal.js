import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Image,
  Linking,
  TouchableOpacity,
} from "react-native";
import CommonHeaderv2 from "../../HOC/CommonHeaderv2";
import HeaderTitle from "../../components/HeaderTitle";
import {
  SVGAddMore,
  SVGAdhar2,
  SVGKYCADhar,
  SVGLeftArrow,
  SVGPdf,
} from "../../constants/images";
import GenericButton from "../../components/GenericButton";
import useSelectorAction from "../../hooks/useSelectorAction";
import TextInputField from "../../components/TextInputField";
import {
  setErrorMsg,
  setSuccessMsg,
  setUserData,
  setWalletData,
} from "../../redux/slices/authenticationSlice";
import { getKYC, patchKyc, patchUser } from "../../services/Services";
import useDispatchAction from "../../hooks/useDispatchAction";
import { setWalletDataAuth } from "../../services/Auth";
import { useNavigation } from "@react-navigation/native";
import Fonts from "../../constants/Fonts";
import { SvgXml } from "react-native-svg";
// import Pdf from 'react-native-pdf';
import DocumentPicker from "react-native-document-picker";

export default function Personal() {
  const { walletData, tokens } = useSelectorAction();
  const [idProof1, setidProof1] = useState([]);
  const [idProof2, setidProof2] = useState([]);
  const navugatiion = useNavigation();
  const handleUpload = async () => {
    const maxFileSize = 2 * 1024 * 1024; // 2 MB in bytes

    const result = await DocumentPicker.pick({
      type: [
        DocumentPicker.types.pdf,
        DocumentPicker.types.doc,
        DocumentPicker.types.docx,
      ],
    });
    console.log(result, "result");
    if (result[0].size > maxFileSize) {
      useDispatchAction(setErrorMsg("File Size should be less or 2MB"));
    } else {
      handleIdProof(result);
    }
  };
  const handleIdProof = async (proof) => {
    try {
      const formData = new FormData();
      formData.append("poi_doc", proof[0]);

      const datas = await patchKyc(formData, tokens?.access, true);
      if (datas) {
        useDispatchAction(setSuccessMsg("ID Proof Updated Successfully"));
        getkycStep();
      } else {
        useDispatchAction(setErrorMsg("Something went wrong"));
      }
    } catch (error) {
      useDispatchAction(
        setErrorMsg("Entity Too Large , Try To Upload Small File")
      );
    }
  };
  // Example walletData for reference
  // {
  //   "account_email": "rahul.webitss@gmail.com",
  //   "eth": 0,
  //   "is_active": true,
  //   "name": "Rahul",
  //   "username": "Rahuljha3456",
  //   "wallet_balance": 1006955.68574,
  //   "wallet_public_key": "0x838Dcc20Ce2617CC98A4ec7c0763d3386A1A64C9"
  // }
  const [kycStep, setkycStep] = useState(null);
  useEffect(() => {
    getkycStep();
  }, []);
  const [phone, setphone] = useState("");

  const getkycStep = async () => {
    const kycData = await getKYC(tokens?.access);
    // console.log(kycData, 'KYCDatata');
    if (kycData?.data) {
      setphone(kycData?.data?.mobile_number);
      setkycStep(kycData?.data);
    }
  };
  const [formData, setFormData] = useState({
    firstName: walletData?.name || "",
    payairoTag: walletData?.username || "",
    email: walletData?.account_email || "",
    phoneNumber: phone || "",
    address: walletData?.address || "",
  });

  console.log(" address =<>", JSON.stringify(kycStep, null, 2));

  const DETAILS_DATA = [
    { key: "PayAiro Tag", value: "#" + walletData?.username },
    { key: "Phone Number", value: kycStep?.mobile_number },
    {
      key: "Address",
      value: `${kycStep?.address2 ?? ""}  ${kycStep?.street_address ?? ""}`,
    },
    {
      key: "City",
      value: `${kycStep?.city ?? ""}`,
    },
    {
      key: "State",
      value: `${kycStep?.state ?? ""}`,
    },
    {
      key: "Zipcode",
      value: `${kycStep?.zip_code ?? ""}`,
    },
    { key: "Country", value: kycStep?.country ?? "" },
    { key: "Currency", value: "US Dollar" },
  ];
  const pdfDocs = [
    {
      label: "Address Proof",
      url: kycStep?.address_pov,
    },
    {
      label: "POI Document",
      url: kycStep?.poi_doc,
    },
    {
      label: "Signature",
      url: kycStep?.signature,
    },
    {
      label: "Self Image",
      url: kycStep?.selfimage,
    },
  ];
  // Handle input changes
  const handleInputChange = (field, value) => {
    setFormData((prevState) => ({
      ...prevState,
      [field]: value,
    }));
  };
  console.log(walletData, "walletData");
  // Handle Save Changes button
  const handleSaveChanges = async () => {
    const payload = {
      email: formData.email,
      mobile_number: formData.phoneNumber,
      name: formData.firstName,
      profile_photo: walletData?.profile_photo,
      address: formData.address,
      usernames: formData.payairoTag,
    };

    const datas = await patchUser(payload, tokens?.access);
    setWalletDataAuth(datas?.data?.data);
    useDispatchAction(setWalletData(datas?.data?.data));
    useDispatchAction(setUserData(datas?.data?.data));
    navugatiion.navigate("Dashboard");
  };

  return (
    <CommonHeaderv2>
      <HeaderTitle title="Personal" leftIcon={SVGLeftArrow} />
      <View style={styles.container}>
        <View
          style={{
            backgroundColor: "rgba(226, 241, 227, 1)",
            padding: 14,
            borderRadius: 20,
          }}
        >
          <View
            style={{
              padding: 10,
              borderRadius: 15,
              backgroundColor: "rgba(44, 106, 63, 1)",
              flexDirection: "row",
              justifyContent: "flex-start",
              alignItems: "center",
            }}
          >
            <View
              style={[
                styles.circle,
                { backgroundColor: "rgba(255, 172, 37, 1)" },
              ]}
            >
              {kycStep?.selfimage ? (
                <Image
                  source={{
                    uri: kycStep?.selfimage,
                  }}
                  style={styles.image}
                />
              ) : (
                <Text style={{ ...styles.initials, color: "#000" }}>
                  {walletData?.name?.charAt(0)?.toUpperCase()}
                </Text>
              )}
            </View>
            <View style={{ marginLeft: 15 }}>
              <Text
                style={{ fontFamily: Fonts.bold, color: "white", fontSize: 16 }}
              >
                {walletData?.name}
              </Text>
              <Text style={{ fontFamily: Fonts.regular, color: "white" }}>
                {walletData?.account_email}
              </Text>
            </View>
          </View>

          <View
            style={{
              flexDirection: "row",
              justifyContent: "flex-start",
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            {DETAILS_DATA.map((i, k) => (
              <View style={{ width: "40%", margin: 8 }} key={k}>
                <Text
                  style={{
                    color: "rgba(44, 106, 63, 1)",
                    fontFamily: Fonts.regular,
                    textAlign: k % 2 === 1 ? "right" : "left",
                  }}
                >
                  {i?.key}
                </Text>
                <Text
                  style={{
                    color: "black",
                    fontFamily: Fonts.semibold,
                    textAlign: k % 2 === 1 ? "right" : "left",
                  }}
                >
                  {i?.value}
                </Text>
              </View>
            ))}
          </View>
        </View>
        <Text
          style={{
            color: "black",
            fontSize: 18,
            fontFamily: Fonts.semibold,
            marginVertical: 10,
          }}
        >
          KYC Documents
        </Text>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "flex-start",
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          {/* <SvgXml xml={SVGKYCADhar} />
          <SvgXml xml={SVGAdhar2} />
          <SvgXml xml={SVGAddMore} /> */}
          {/* <View
            style={{
              backgroundColor: 'rgba(243, 251, 244, 1)',
              padding: 10,
              width: '30%',
              borderRadius: 20,
              marginRight: 10,
            }}>
            <Image
              source={require('../../../assets/images/adtest.png')}
              style={{resizeMode: 'cover', width: 80, height: 70}}
            />
            <Text
              style={{
                fontFamily: Fonts.regular,
                fontSize: 12,
                marginVertical: 15,
                textAlign: 'center',
              }}>
              Aadhar Card
            </Text>
          </View>

          <View
            style={{
              backgroundColor: 'rgba(243, 251, 244, 1)',
              padding: 10,
              width: '30%',
              borderRadius: 20,
              marginRight: 10,
            }}>
            <Image
              source={require('../../../assets/images/adtest.png')}
              style={{resizeMode: 'cover', width: 80, height: 70}}
            />
            <Text
              style={{
                fontFamily: Fonts.regular,
                fontSize: 12,
                marginVertical: 15,
                textAlign: 'center',
              }}>
              Pan Card
            </Text>
          </View> */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "flex-start",
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            {pdfDocs.map((doc, index) =>
              doc.url ? (
                <>
                  {/* PDF Pre */}
                  <TouchableOpacity
                    style={{
                      backgroundColor: "rgba(243, 251, 244, 1)",
                      padding: 10,
                      width: "30%",
                      borderRadius: 20,
                      marginRight: 10,
                      marginVertical: 5,
                    }}
                    onPress={() => Linking.openURL(doc.url)}
                    activeOpacity={0.8}
                  >
                    <Image
                      source={{
                        uri: doc.url,
                      }}
                      style={{ resizeMode: "cover", width: 80, height: 70 }}
                    />

                    <Text
                      style={{
                        fontFamily: Fonts.regular,
                        fontSize: 12,
                        marginVertical: 15,
                        textAlign: "center",
                      }}
                    >
                      {doc.label}
                    </Text>
                  </TouchableOpacity>
                </>
              ) : null
            )}
            <SvgXml xml={SVGAddMore} onPress={handleUpload} />
          </View>
        </View>
      </View>
    </CommonHeaderv2>
  );
}

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    borderTopEndRadius: 32,
    borderTopStartRadius: 32,
    padding: 20,
    marginTop: 20,
  },
  circle: {
    width: 50,
    height: 50,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  initials: {
    color: "#000",
    fontSize: 18,
    fontFamily: Fonts.semibold,
  },
  image: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  inputContainer: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    color: "#333",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
  },
  saveButton: {
    marginTop: 60,
  },
});
