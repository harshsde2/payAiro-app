import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { SvgXml } from 'react-native-svg';
import { SVGSend2 } from '../constants/images';
import Fonts from '../constants/Fonts';

interface MinimalChatComponentProps {
  contact: any;
  token: string;
  currentUser: any;
  onBackPress: () => void;
}

/**
 * MinimalChatComponent 
 * 
 * A simplified version of CustomChatComponent for testing rendering
 */
const MinimalChatComponent: React.FC<MinimalChatComponentProps> = ({ 
  contact, 
  token, 
  currentUser,
  onBackPress
}) => {
  const [messageText, setMessageText] = useState<string>('');

  console.log('MinimalChatComponent rendering', {
    contactName: contact?.nickname || contact?.username,
    hasToken: !!token
  });
  
  // Simple message sending function
  const handleSendMessage = () => {
    if (!messageText.trim()) return;
    Alert.alert('Message', `Would send message: ${messageText}`);
    setMessageText('');
  };
  
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerText}>
          Chat with {contact?.nickname || contact?.username || 'Contact'}
        </Text>
      </View>
      
      {/* Messages area */}
      <View style={styles.messagesArea}>
        <Text style={styles.placeholderText}>
          This is a minimal chat component for testing.
        </Text>
      </View>
      
      {/* Message input */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          placeholder="Type a message..."
          placeholderTextColor="#999"
          value={messageText}
          onChangeText={setMessageText}
        />
        <TouchableOpacity
          style={[
            styles.sendButton,
            !messageText.trim() && styles.disabledSendButton
          ]}
          onPress={handleSendMessage}
          disabled={!messageText.trim()}
        >
          <SvgXml xml={SVGSend2} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    padding: 15,
    backgroundColor: '#f5f5f5',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerText: {
    fontSize: 16,
    fontFamily: Fonts.bold,
    textAlign: 'center',
  },
  messagesArea: {
    flex: 1,
    padding: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    fontFamily: Fonts.regular,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
  },
  textInput: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    fontSize: 16,
    marginRight: 10,
    fontFamily: Fonts.regular,
    color: '#333',
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(44, 106, 63, 1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledSendButton: {
    opacity: 0.5,
  },
});

export default MinimalChatComponent; 