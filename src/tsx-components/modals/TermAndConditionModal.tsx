import GenericButton from "components/GenericButton";
import HeaderTitle from "components/HeaderTitle";
import { SvgIcons } from "constants/svgs";
import React, { forwardRef, useImperativeHandle, useState } from "react";
import {
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import WebView from "react-native-webview";
import { Theme, useTheme } from "styles";
import CustomText from "tsx-components/CustomText";
import {
  TermAndConditionModalProps,
  TermAndConditionModalRef,
} from "./modal.types";
import { LINKS } from "api/endpoints";

const TermAndConditionModal = forwardRef<
  TermAndConditionModalRef,
  TermAndConditionModalProps
>(({ onAgree, isAgree = true }: TermAndConditionModalProps, ref) => {
  const [isVisible, setIsVisible] = useState(false);
  const [modalHeaderTitle, setModalHeaderTitle] = useState("");
  const [conditionArray, setConditionArray] = useState<any>([]);
  const [showWebView, setShowWebView] = useState(false);
  const [layout, setLayout] = useState({});
  const [showButton, setShowButton] = useState(false);
  const { theme } = useTheme();
  const styles = customStyles(theme);

  useImperativeHandle(ref, () => ({
    showPatriotAct: () => {
      setIsVisible(true);
      setModalHeaderTitle("Patriot Act");
      setConditionArray(PatroitAct);
      setShowWebView(false);
      setShowButton(false);
    },
    showESignDisclosure() {
      setIsVisible(true);
      setModalHeaderTitle("E-Sign Disclosure");
      setConditionArray(ESignDisclosure);
      setShowWebView(false);
      setShowButton(false);
    },
    showTermsAndConditions: () => {
      setIsVisible(true);
      setModalHeaderTitle("Terms and Conditions");
      setShowWebView(true);
      setShowButton(true);
    },
    showConsumerDisclosure: () => {
      setIsVisible(true);
      setModalHeaderTitle("Consumer Disclosures");
      setConditionArray(ConsumerDisclosure);
      setShowWebView(false);
      setShowButton(false);
    },
    hide: () => {
      console.log("setchecked(state => !state)");
      setIsVisible(false);
      setShowWebView(false);
      setShowButton(false);
    },
  }));
  return (
    <Modal
      animationType="fade"
      transparent={false}
      visible={isVisible}
      onRequestClose={() => setIsVisible(false)}
    >
      <SafeAreaView
        style={{ flex: 1, backgroundColor: theme.colors.palette.green50 }}
      >
        {/* <View > */}
        <HeaderTitle
          rightIcon={<SvgIcons.CrossIcon />}
          title={modalHeaderTitle}
          isBack={true}
          onPressRight={() => setIsVisible(false)}
        />
        {showWebView ? (
          <WebView
            source={{ uri: LINKS.termsAndConditions }}
            style={{ flex: 1, marginTop: 20 }}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            startInLoadingState={true}
            scalesPageToFit={true}
            originWhitelist={["*"]}
          />
        ) : (
          <View style={styles.contentWrapper}>
            <ScrollView
              onScroll={({ nativeEvent }) => {
                const { layoutMeasurement, contentOffset, contentSize } =
                  nativeEvent;
                const isEndReached =
                  layoutMeasurement.height + contentOffset.y >=
                  contentSize.height - 20; // adjust buffer

                if (isEndReached) {
                  setShowButton(true);
                } else {
                  setShowButton(false);
                }
              }}
              scrollEventThrottle={16}
              style={styles.scrollView}
              contentContainerStyle={[
                styles.container,
                isAgree && styles.scrollViewContent,
              ]}
            >
              {conditionArray.length > 0 && (
                <View>
                  {conditionArray.map((item: any, index: number) => (
                    <View
                      key={index}
                      style={{ marginBottom: theme.spacing.spacing.sm }}
                    >
                      {item?.mainHeading && (
                        <CustomText
                          variant="h3"
                          style={{
                            marginBottom: theme.spacing.spacing.sm,
                            textDecorationLine: "underline",
                          }}
                        >
                          {item.mainHeading}
                        </CustomText>
                      )}

                      <CustomText
                        variant="h4"
                        style={{ marginBottom: theme.spacing.spacing.sm }}
                      >
                        {item.heading}
                      </CustomText>

                      <CustomText variant="body2">{item.text}</CustomText>
                    </View>
                  ))}
                </View>
              )}
            </ScrollView>
            {isAgree && (
              <GenericButton
                title="I Agree"
                cStyle={{
                  marginTop: 10,
                  marginHorizontal: 20,
                  marginBottom: 10,
                  opacity: showButton ? 1 : 0.7,
                  width: "90%",
                }}
                onPress={() => {
                  setIsVisible(false);
                  onAgree?.();
                }}
                tStyle={{}}
                disabled={!showButton}
                icon={false}
              />
            )}
          </View>
        )}
        {/* </View> */}
      </SafeAreaView>
    </Modal>
  );
});

export default TermAndConditionModal;

const customStyles = (theme: Theme) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      // backgroundColor: colors.green100,
    },
    headerContainer: {},
    contentWrapper: {
      flex: 1,
    },
    scrollView: {
      flex: 1,
    },
    container: {
      backgroundColor: theme.colors.palette.white,
      borderTopEndRadius: 32,
      borderTopStartRadius: 32,
      padding: theme.spacing.layout.screenPadding,
      marginTop: theme.spacing.spacing.md,
      paddingVertical: theme.spacing.spacing.xl,
    },
    scrollViewContent: {
      paddingBottom: 100,
    },
  });

const ESignDisclosure = [
  {
    heading: "Electronic Statement Disclosure Agreement",
    text: "By accepting Fortress Trust’s Electronic Statement Disclosure Agreement”, you consent and agree that Fortress Trust may provide certain disclosures and notices to you in electronic form, in lieu of paper form, including electronic delivery of statements for your Fortress Trust account(s). The words “we,” “us,” and “our” refer to Fortress Trust, and the words “you” and “your” mean you, the individual(s) or entity identified on the Account(s). As used in the Disclosure, “Account” means the account you have with us. “Communication” means any customer agreements or amendments thereto, monthly billing or account statements, tax statements, disclosures, notices, responses to claims, transaction history, privacy policies and all other information related to the product, service, or Account, including but not limited to information that we are required by law to provide to you in writing. We do not currently provide you with a right or option to have the required information made available to you in paper format or in other non-electronic form.",
  },
  {
    heading: "Communications Provided in Electronic Form",
    text: `You agree that we may provide you with any Communications that we may choose to make available in electronic
format, to the extent allowed by law. Your consent to receive electronic communications and transactions includes, but
is not limited to:
• All legal and regulatory disclosures and Communications associated with the Account.
• Account details, history, transaction receipts, confirmations, and any other Account or transaction information.
• Notices or disclosures about a change in the terms or change in fees of your Account.
• Responses to claims or customer support inquiries filed in connection with your Account.
• Privacy policies and notices.
• Monthly (or other periodic) billing or account statements for your Account(s).
`,
  },
  {
    heading: "Method of Providing Communications in Electronic Form",
    text: `All Communications provided by Fortress Trust to you in electronic form will be provided either: (i) Email sent to your primary email address listed in your Account profile; (ii) Communicating via instant chat and/or through other electronic forms of communication; or (iii) by logging into your Account.`,
  },
  {
    heading: "Updating Your Records",
    text: `It is your responsibility to provide us with a true, accurate, and complete e-mail address at the time your Account is opened in order for us to provide you with electronic Communications. You must promptly notify us of any changes to this information. You may update your information by logging into your account or contacting our support team at support@fortresstrust.us.`,
  },
  {
    heading: "Hardware and Software Requirements",
    text: `In order to access, view and retain electronic Communications that we make available to you, you will need the following computer hardware and software: (i) A device with an Internet connection; (ii) A current web browser that includes 128-bit encryption with cookies enables; (iii) Adobe Acrobat Reader version 8.0 or higher; (iv) A valid email
address; and (iv) Sufficient storage space to save past Communications or an installed printer to print them.
`,
  },
  {
    heading: "How to Withdraw Your Consent",
    text: `You may withdraw your consent to receive Communications electronically by contacting us at support@fortresstrust.com. If you fail to provide or if you withdraw your consent to receive Communications electronically, Fortress Trust reserves the right to immediately close your Fortress Trust Account.`,
  },
];

const PatroitAct = [
  {
    heading: "USA Patriot Act Disclosure",
    text: `IMPORTANT INFORMATION ABOUT PROCEDURES FOR OPENING A NEW ACCOUNT: To help the government fight the funding of terrorism and money laundering activities, federal law requires all financial institutions to obtain, verify, and record information that identifies each person who opens an Account. What this means for you: When you open an Account, we will ask for your name, address, date of birth, and other information that will allow us to identify you. We may also ask to see a copy of your driver's license or other identifying documents.`,
  },
];

const ConsumerDisclosure = [
  {
    mainHeading: "Electronic Fund Transfers",
    heading: "Consumer Liability ",
    text: `Tell us AT ONCE if you believe an electronic fund transfer has been made without your permission. Telephoning is the best way of keeping your possible losses down. You could lose all the money in your account. If you tell us within 2 business days after you learn of the loss, you can lose no more than $50 if someone used your funds without your permission. If you do NOT tell us within 2 business days after you learn of the loss, and we can prove we could have stopped someone from using your funds without your permission if you had told us, you could lose as much as $500. Also, if your statement shows transfers that you did not make, including those made by card, code or other means, tell us at once. If you do not tell us within 60 days after the statement was mailed to you, you may not get back any money you lost after the 60 days if we can prove that we could have stopped someone from taking the money if you had told us in time. If a good reason (such as a long trip or a hospital stay) kept you from telling us, we will extend the time periods.`,
  },
  {
    heading: "Contact in event of unauthorized transfer",
    text: `If you believe an electronic fund transfer has been made without your permission, call: 702.813.3800 or write: Fortress Trust, Error Resolution Department, 10845 Griffith Peak Dr., Suite 200, Las Vegas, NV 89135`,
  },
  {
    heading: "Business days",
    text: `For purposes of these disclosures, our business days are Monday through Friday.  Holidays are not included.`,
  },
  {
    heading: "Confidentiality",
    text: `We will disclose information to third parties about your account or the transfers you make: (i) where it is necessary for completing transfers, or (ii) In order to verify the existence and condition of your account for a third party, such as a credit bureau or merchant, or (iii) In order to comply with government agency or court orders, or (iv) If you give us your written permission.`,
  },
  {
    heading: "Documentation",
    text: `Preauthorized credits. If you have arranged to have direct contributions made to your account at least once every 60 days from the same person or company, the person or company making the deposit will tell you every time they send us money.  
‍Periodic statements. You will get a monthly account statement (unless there are no transfers in a particular month. In any case you will get the statement at least quarterly).`,
  },
  {
    heading: "Preauthorized payments",
    text: `i. Stopping payment and procedure for doing so. If you have told us in advance to make regular payments out of your account, you can stop any of these payments. Here's how:
‍
Call us at 702.813.3800, or write us at Fortress Trust, 10845 Griffith Peak Dr., Suite 200, Las Vegas, NV 89135, in time for us to receive your request 3 business days or more before the payment is scheduled to be made. If you call, we may also require you to put your request in writing and get it to us within 14 days after you call. 
‍
ii. Notice of varying amounts. If these regular payments may vary in amount, the person you are going to pay will tell you, 10 days before each payment, when it will be made and how much it will be. 
‍
iii. Liability for failure to stop payment of preauthorized transfer. If you order us to stop one of these payments 3 business days or more before the transfer is scheduled, and we do not do so, we will be liable for your losses or damages.`,
  },
  {
    heading: "Financial institution's liability",
    text: `If we do not complete a transfer to or from your account on time or in the correct amount according to our agreement with you, we will be liable for your losses or damages. However, there are some exceptions. We will not be liable, for instance:
i. If, through no fault of ours, you do not have enough money in your account to make the transfer.
ii. If the system was not working properly and you knew about the breakdown when you started the transfer.
iii. If circumstances beyond our control (such as fire or flood) prevent the transfer, despite reasonable precautions that we have taken.
iv. There may be other exceptions stated in our agreement with you.
`,
  },
  {
    mainHeading: "Truth in Savings Disclosure",
    heading: "RATE INFORMATION INCLUDING COMPOUNDING & CREDITING",
    text: `Unless otherwise agreed in writing, your account is a non-interest bearing account.`,
  },
  {
    heading: "MINIMUM BALANCE REQUIREMENTS",
    text: `There is no minimum balance required to open an account.
There is no minimum balance required to avoid the imposition of a fee.
`,
  },
  {
    heading: "FEES",
    text: `Monthly Fee: You will not be charged a monthly fee to maintain your account.  `,
  },
  {
    heading: "TRANSACTION LIMITS",
    text: `Fortress reserves the rights to apply transaction limits. 
There is no debit, ATM or check features associated with this account.
‍`,
  },
  {
    heading: "STATEMENTS",
    text: `As stated in the Electronic Statement Disclosure Agreement, you have consented to receive electronic statements for your account.  If you withdraw your consent to receive electronic statements (or any other electronic communications), your account will be closed.  `,
  },
  {
    heading: "ACCOUNT CLOSING",
    text: `Fortress Trust reserves the right to terminate your account at any time.  If your account is terminated, any proceeds in your account will be returned to the original source of payment that you, the account holder, used to fund the account unless otherwise agreed.  
`,
  },
  {
    mainHeading: "FUNDS AVAILABILITY DISCLOSURE",
    heading: "YOUR ABILITY TO WITHDRAW FUNDS",
    text: `‍Our policy is to make funds from deposits of cash, electronic direct deposits and wire transfers to your account available on the day we receive the deposit. All check deposits, including, but not limited to; official bank, cashier's, certified, tellers, traveler's, and federal, state and local government checks will be available on the next business day following the day of your deposit. Once the funds are available, you can withdraw them in cash and we will use them to pay checks that you have written. For determining the availability of your deposits, every day is a business day, except Saturdays, Sundays, and federal holidays. If you make a deposit before the close of business on a business day that we are open, we will consider that day to be the day of your deposit. However, if you make a deposit after the close of business, or on a day we are not open, we will consider the day of your deposit to be the next business day that we are open (for example, if you mail the deposit or utilize our night deposit drop). Even after we have made funds available to you, and you have withdrawn the funds, you are still responsible for deposited checks that are returned to us unpaid and for any other problems involving your deposit. `,
  },
  {
    heading: "LONGER DELAYS MAY APPLY ",
    text: `‍Funds you deposit by check may be delayed for a longer period under the following circumstances: 
‍
• We believe a check you deposit will not be paid. 
• You deposit checks totaling more than $5,525 on any one day. 
• You/we redeposit a check that has been returned unpaid. 
• You have overdrawn your account repeatedly in the last six months. 
• There is an emergency, such as failure of computer or communications equipment. 

We will notify you if we delay your ability to withdraw funds for any of these reasons, and we will tell you when the funds will be available. They will generally be available on the fifth business day after the day of your deposit. `,
  },
  {
    heading: "SPECIAL RULES FOR NEW ACCOUNTS",
    text: `‍If you are a new customer, the following special rules will apply during the first 30 days your account is open. Our policy is to make funds from deposits of cash, electronic direct deposits and wire transfers to your account available on the day we receive the deposit. The first $5,525 of a day's total deposits of official bank, cashier's, certified, teller's, traveler's, and federal, state and local government checks will be available on the first business day after the day of your deposit if the deposit meets certain conditions. For example, the checks must be payable to you. The excess over $5,525 will be available on the seventh business day after the day of your deposit. If your deposit of these checks (other than a U.S. Treasury check) is not made in person to one of our employees, the first $5,525 will not be available until the second business day after the day of your deposit. 
‍
Funds from all other check deposits will be available on the seventh business day after the day of your deposit. `,
  },
  {
    heading: "FOREIGN ITEMS",
    text: `Deposited items that are drawn on financial institutions outside of the U.S., and not payable at or through a U.S. branch correspondent financial institution will not be available to you until we receive payment. Even after we have made funds available to you, and you have withdrawn the funds, you are still responsible for deposited checks that are returned to us unpaid and for any other problems involving your deposit. `,
  },
  {
    heading: "HOLDS ON OTHER FUNDS ",
    text: `‍If we accept for deposit a check that is drawn on another bank, we may make funds from the deposit available for withdrawal immediately but delay your availability to withdraw a corresponding amount of funds that you have on deposit in another account with us. The funds in the other account would then not be available for withdrawal until the time periods that are described elsewhere in this disclosure for the type of check that you deposited. `,
  },
];

// const TermsAndConditions = [
//     {
//         heading: 'Privacy Policy for PayAiro.com & PayAiro Mobile Application',
//         text: `You may link an external, U.S.-issued bank account (an “Eligible Bank Account”) to your PayAiro App. PayAiro reserves the right to limit which banks or what types of accounts constitute an Eligible Bank Account. If you choose to link your Eligible Bank Account by providing the username and password you use to access your bank information online, you acknowledge (i) your personal and financial information is being provided to Plaid Inc.;(ii) that your personal and financial information will be collected, processed, transferred, or stored in accordance with Plaid Inc.’s Privacy Policy; and (iii) that you acknowledge and agree to Plaid Inc.’s Privacy Policy.

// Please Note: PayAiro Inc. does not take responsibility for the content, products, services or privacy policies of third-party services, including those referenced above. We encourage you to carefully review the privacy policies of any third-party services you access.`
//     },
//     {
//         heading: 'PayAiro Privacy Policy',
//         text: `This Privacy Policy describes PayAiro, Inc.’s (“we”, “our” or “us”) policies and procedures regarding our collection, use and disclosure of your information in connection with your access and use of our PayAiro mobile application (the “App”) and at PayAiro.com (the “Site”), and the other services, features, products, content or applications offered by PayAiro (together with the Site and the App, the “Services”). As used in this Privacy Policy, “Personal Data” means any information that can be used to individually identify a person or meets an applicable legal definition of “personal data,” “personal information,” or any similar term. All defined terms not defined herein shall have the meaning ascribed to them in the PayAiro Terms of Service, of which this Privacy Policy is a part.

// We urge you to read this Privacy Policy in full, but wanted to mention a few things upfront:

// This Privacy Policy covers our treatment of Personal Data that we collect about you (a) from you directly, when you register for and use your Account on the Services; (b) from your web browser and/or device, as you interact with the Services generally; and (c) from third party websites and services, including our business partners and service providers.

// The Services are hosted and operated in the United States and elsewhere throughout the world through us and certain of our service providers. By using the Services, you acknowledge that any Personal Data you provide to us will be hosted on servers in the United States and servers in other countries.

// If you have any questions about this Privacy Policy, about our collection and use of your Personal Data, or whether any of the following applies to you, please contact us directly at support@payairo.com , or at PayAiro Inc. 880 West Euless Blvd, Apt 3402, Euless, TX 76040, United States.

// As noted in our Terms of Service, we do not knowingly collect or solicit Personal Data from anyone under the age of 18. If you are under the age of 18, you are not allowed to use the Services, so please do not access or use the Site or the App, or attempt to send us any Personal Data. If we confirm that we have collected Personal Data from an individual under the age of 18, we will delete that information as quickly as possible.

// This Privacy Policy does not apply to the practices of third parties that we do not own or control, including, but not limited to, any third-party websites, services, products or applications (each a “Third-Party Service”) that you elect to access and may interact with during your use of the Services, or to individuals that we do not manage or employ. We take steps to only work with ThirdParty Services that share our respect for your privacy, although we cannot take responsibility for the content, products, services or privacy policies of those Third-Party Services. We encourage you to carefully review the privacy policies of any Third-Party Services you access.

// PayAiro takes the protection of your personal data very seriously. To find out more, go to “How Do We Protect Your Personal Data?”
// `
//     },
//     {
//         heading: 'Quick Links',
//         text: ``
//     },
//     {
//         heading: '',
//         text: ``
//     },
//     {
//         heading: '',
//         text: ``
//     },
//     {
//         heading: '',
//         text: ``
//     },
//     {
//         heading: '',
//         text: ``
//     },
//     {
//         heading: '',
//         text: ``
//     },
//     {
//         heading: '',
//         text: ``
//     },
//     {
//         heading: '',
//         text: ``
//     },
//     {
//         heading: '',
//         text: ``
//     },
// ]
