import { CometChat } from '@cometchat/chat-sdk-react-native';

/**
 * ChatAdapter - Adapts existing API data for CometChat UI components
 * 
 * This adapter allows using CometChat's UI components while maintaining
 * your existing backend API and polling approach.
 */
export class ChatAdapter {
  static currentUser: any = null;
  static token: string = '';
  static pollingInterval: NodeJS.Timeout | null = null;
  static messageListeners: Array<any> = [];
  static lastMessageTimestamp: number | null = null;
  
  /**
   * Initialize the adapter with user info
   */
  static init(user: any, token: string): Promise<void> {
    this.currentUser = {
      uid: user.username || user.id,
      name: user.name || user.nickname || user.username,
      avatar: user.image || '',
      role: 'default',
      status: 'online',
    };
    
    this.token = token;
    return Promise.resolve();
  }
  
  /**
   * Get current logged in user (mimics CometChat.getLoggedinUser())
   */
  static getLoggedinUser(): Promise<any> {
    return Promise.resolve(this.currentUser);
  }
  
  /**
   * Convert API message to CometChat format
   */
  static convertMessageFormat(apiMessage: any): any {
    const isSender = apiMessage?.data?.sender__email === this.currentUser.uid || 
                    apiMessage?.data?.sender__email === this.currentUser.name;
    
    const messageText = apiMessage?.data?.content || '';
    
    return {
      id: apiMessage.id || String(Date.now() + Math.floor(Math.random() * 1000)),
      conversationId: this.currentUser.uid + '_' + (apiMessage?.data?.recipient_user || 'user'),
      sender: {
        uid: isSender ? this.currentUser.uid : (apiMessage?.data?.recipient_user || 'other'),
        name: isSender ? this.currentUser.name : (apiMessage?.data?.recipient_name || 'Contact'),
        avatar: isSender ? this.currentUser.avatar : '',
      },
      receiver: {
        uid: isSender ? (apiMessage?.data?.recipient_user || 'other') : this.currentUser.uid,
        name: isSender ? (apiMessage?.data?.recipient_name || 'Contact') : this.currentUser.name,
        avatar: isSender ? '' : this.currentUser.avatar,
      },
      type: 'text',
      receiverType: 'user',
      category: 'message',
      data: { text: messageText },
      sentAt: apiMessage?.data?.timestamp ? new Date(apiMessage?.data?.timestamp).getTime() : Date.now(),
      deliveredAt: Date.now(),
      readAt: null,
      status: 'sent',
      metadata: { isFromApi: true },
    };
  }
  
  /**
   * Start polling for messages
   */
  static startMessagePolling(
    recipient: string, 
    apiClient: { 
      getContactListsForAll: Function; 
      sendMessage: Function; 
    }, 
    interval: number = 5000
  ): () => void {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
    }
    
    const pollMessages = async () => {
      try {
        const data = await apiClient.getContactListsForAll(
          'username',
          recipient,
          this.token
        );
        
        if (data?.data?.interactions) {
          const messages = data.data.interactions
            .filter((msg: any) => msg?.data?.content)
            .map((msg: any) => this.convertMessageFormat(msg));
          
          // Notify listeners of new messages
          this.messageListeners.forEach(listener => {
            if (listener.onTextMessageReceived) {
              messages.forEach((msg: any) => {
                listener.onTextMessageReceived(msg);
              });
            }
          });
        }
      } catch (error) {
        console.log('Error polling messages:', error);
      }
    };
    
    // Initial poll
    pollMessages();
    
    // Set up interval
    this.pollingInterval = setInterval(pollMessages, interval);
    
    // Return cleanup function
    return () => {
      if (this.pollingInterval) {
        clearInterval(this.pollingInterval);
        this.pollingInterval = null;
      }
    };
  }
  
  /**
   * Add message listener (mimics CometChat.addMessageListener)
   */
  static addMessageListener(listenerId: string, listener: any): void {
    this.messageListeners.push({
      id: listenerId,
      ...listener
    });
  }
  
  /**
   * Remove message listener
   */
  static removeMessageListener(listenerId: string): void {
    this.messageListeners = this.messageListeners.filter(
      listener => listener.id !== listenerId
    );
  }
  
  /**
   * Send message using existing API
   */
  static sendTextMessage(
    receiverId: string, 
    text: string, 
    apiClient: { sendMessage: Function }
  ): Promise<any> {
    return new Promise(async (resolve, reject) => {
      try {
        await apiClient.sendMessage(
          {
            recipient_user: receiverId,
            content: text,
          },
          this.token
        );
        
        // Create a message object to return
        const message = {
          id: String(Date.now()),
          sender: this.currentUser,
          receiver: {
            uid: receiverId,
          },
          type: 'text',
          receiverType: 'user',
          category: 'message',
          data: { text },
          sentAt: Date.now(),
          status: 'sent',
          metadata: { isFromApi: true },
        };
        
        resolve(message);
      } catch (error) {
        reject(error);
      }
    });
  }
} 