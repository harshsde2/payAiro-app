import { MessageData, TransactionData, WalletData } from "./chat.types";



// Get message sender type (user or contact)
export const getMessageSender = (messageData: WalletData | null, currentMessageData: any,type:string) => {
    if (!messageData) return 'contact';

    // console.log("messageData =>",JSON.stringify(messageData,null,2))
    // For text messages, check the sender email
    if (messageData.account_email) {
        //If we can conclusively determine it's from the current user
        if(type == 'message'){
            if (isMessageFromCurrentUser(messageData.account_email, currentMessageData?.sender__email)) {
                return 'user';
            }
        }else if(type == 'crypto_transaction'){
            if (isMessageFromCurrentUser(messageData.wallet_public_key, currentMessageData?.sender__wallet_public_key)) {
                return 'user';
            }
        } else if(type == 'payment_request'){
            if (isMessageFromCurrentUser(messageData.wallet_public_key, currentMessageData?.requester__wallet_public_key)) {
                return 'user';
            }
        } else if(type == 'nft_transaction'){
            
            if (isMessageFromCurrentUser(messageData.wallet_public_key, currentMessageData?.from_address__wallet_public_key)) {
                return 'user';
            }
        }

        // If it's from the current contact
        return 'contact';
    }

    // For transactions, check the wallet public key
    return 'contact'; // Default if we can't determine
};

// Check if a message is from the current user
export const isMessageFromCurrentUser = (currentUserMail: string, senderEmail: string,): boolean => {
    if (!senderEmail) return false;

    const normalizedSenderEmail = senderEmail.toLowerCase();
    const normalizedCurrentUserMail = currentUserMail.toLowerCase();

    return normalizedSenderEmail == normalizedCurrentUserMail;

    // Check our set of known sent message emails first
    // if (normalizedSenderEmail == normalizedCurrentUserMail) {
    //     return true;
    // } else {
    //     return false
    // }

    // If we have a stored email from sendMessage
    // if (myEmail && normalizedEmail === myEmail.toLowerCase()) {
    //     return true;
    // }

    // // Check against current user email
    // if (currentUser?.email && normalizedEmail === currentUser.email.toLowerCase()) {
    //     return true;
    // }

    // For any email ending with yopmail.com - this is a temporary debug check
    // Remove this in production if not applicable!
    // if (normalizedEmail.endsWith('@yopmail.com')) {
    //     return true;
    // }

    // // Special check for the scenario you mentioned
    // if (normalizedEmail === "rishabhsingh321@yopmail.com") {
    //     return true;
    // }

    return false;
};