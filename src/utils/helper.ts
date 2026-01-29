
export const getPayAiroBankDetails = (bankLists: any) => {
    if (!bankLists || !Array.isArray(bankLists) || bankLists.length === 0) {
      return null;
    }
    return (
      bankLists.find(
        (item: any) =>
          item?.bank_name?.toLowerCase().trim() === "payairo bank"
      ) ?? null
    );
};

export const sharePayAiroBankDetails = (walletData: any, bankLists: any) => {
    const payairoBank = getPayAiroBankDetails(bankLists) as any;
    const stringifyMessage = `PayAiro Payment Details\n\n Scan the QR code to send money\n\n PayAiro Tag: ${walletData?.username || "N/A"}\n\n Bank Details:\n Account Holder: ${walletData?.name || "N/A"}\n Routing Number: ${payairoBank?.ref_code || "N/A"}\n Account Number: ${payairoBank?.account_number || "N/A"}`;
    return stringifyMessage;
}

