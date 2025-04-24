export interface Contact {
    mobileno: string;
    email: string;
    wallet_address: string;
    nickname: string;
    username: string;
}

export interface TransactionData {
    sender_wallet_public_key: string;
    recipient_wallet_public_key: string;
    sender__email: string,
    recipient__email: string,
    amount: number;
    status: string;
    timestamp: string;
    description: string | null;
    is_read: boolean;
    content: string;
    id:string;
}

export interface MessageData {
    id:string;
    sender_email: string;
    recipient_email: string;
    content: string;
    timestamp: string;
    is_read: boolean;
}

export interface Interaction {
    type: 'crypto_transaction' | 'message' | 'nft_transactions' | 'payment_request';
    timestamp: string;
    data: TransactionData;
}

export interface ApiResponse {
    status: boolean;
    message: string;
    data: {
        contact: Contact;
        interactions: Interaction[];
    };
}

export interface ContactData {
    uuid: string;
    mobileno: string;
    email: string;
    wallet_address: string;
    nickname: string;
    username: string;
    profile_photo: string | null;
    transactions: {
        sender__wallet_public_key: string;
        recipient__wallet_public_key: string;
        amount: number;
        status: string;
        timestamp: string;
        description: string | null;
    };
    pending_requests: any[];
    messages: {
        id: number;
        sender_email: string;
        recipient_email: string;
        content: string;
        timestamp: string;
        is_read: boolean;
    };
    nft_transactions: any[];
    unread_count: number;
}

export interface WalletData {
    wallet_public_key: string;
    is_active: boolean;
    wallet_balance: number;
    account_email: string;
    username: string;
    name: string;
    btc: {
        color: string;
        percentage: number;
        btc_in_matic: number;
        btc_in_xrp: number;
        btc_in_eth: number;
        balance: number;
        balance_in_tether: string;
        image: string;
        details: {
            price: number;
            volume_24h: number;
            volume_change_24h: number;
            percent_change_1h: number;
            percent_change_24h: number;
            percent_change_7d: number;
            percent_change_30d: number;
            percent_change_60d: number;
            percent_change_90d: number;
            market_cap: number;
            market_cap_dominance: number;
            fully_diluted_market_cap: number;
            tvl: null;
            last_updated: string;
        }
    };
    eth: {
        color: string;
        eth_in_xrp: number;
        eth_in_btc: string;
        eth_in_matic: number;
        eth_in_eth: number;
        percentage: number;
        balance: number;
        balance_in_tether: string;
        image: string;
        details: {
            price: number;
            volume_24h: number;
            volume_change_24h: number;
            percent_change_1h: number;
            percent_change_24h: number;
            percent_change_7d: number;
            percent_change_30d: number;
            percent_change_60d: number;
            percent_change_90d: number;
            market_cap: number;
            market_cap_dominance: number;
            fully_diluted_market_cap: number;
            tvl: null;
            last_updated: string;
        }
    };
    matic: {
        color: string;
        percentage: number;
        matic_in_btc: number;
        matic_in_xrp: number;
        matic_in_eth: number;
        balance: number;
        balance_in_tether: string;
        image: string;
        details: {
            price: number;
            volume_24h: number;
            volume_change_24h: number;
            percent_change_1h: number;
            percent_change_24h: number;
            percent_change_7d: number;
            percent_change_30d: number;
            percent_change_60d: number;
            percent_change_90d: number;
            market_cap: number;
            market_cap_dominance: number;
            fully_diluted_market_cap: number;
            tvl: null;
            last_updated: string;
        }
    };
    xrp: {
        color: string;
        percentage: number;
        xrp_in_btc: number;
        xrp_in_matic: number;
        xrp_in_eth: number;
        balance: number;
        balance_in_tether: string;
        image: string;
        details: {
            price: number;
            volume_24h: number;
            volume_change_24h: number;
            percent_change_1h: number;
            percent_change_24h: number;
            percent_change_7d: number;
            percent_change_30d: number;
            percent_change_60d: number;
            percent_change_90d: number;
            market_cap: number;
            market_cap_dominance: number;
            fully_diluted_market_cap: number;
            tvl: null;
            last_updated: string;
        }
    };
}



