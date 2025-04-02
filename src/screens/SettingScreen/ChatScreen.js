import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
} from 'react-native';
import HeaderTitle from '../../components/HeaderTitle';
import {SVGChat, SVGLeftArrow} from '../../constants/images';
import Container from '../../HOC/Container';
import {SvgXml} from 'react-native-svg';
import Fonts from '../../constants/Fonts';

const ChatScreen = () => {
  const [messages, setMessages] = useState([
    {id: 1, text: 'Hey', sender: 'user', time: '10:25 am'},
    {id: 2, text: 'Hi', sender: 'bot', time: '10:25 am'},
    {
      id: 3,
      text: 'Frame underline figma export selection clip boolean arrow editor. Library editor.',
      sender: 'bot',
      time: '10:25 am',
    },
    {
      id: 4,
      text: 'Community figma list bullet',
      sender: 'user',
      time: '10:27 am',
    },
  ]);

  const [inputText, setInputText] = useState('');

  const sendMessage = () => {
    if (inputText.trim() === '') return;

    const newMessage = {
      id: messages.length + 1,
      text: inputText,
      sender: 'user',
      time:
        new Date().toLocaleTimeString().slice(0, 5) +
        (new Date().getHours() >= 12 ? ' pm' : ' am'),
    };

    setMessages([...messages, newMessage]);
    setInputText('');
  };

  return (
    <Container>
      <KeyboardAvoidingView
        style={{flex: 1}}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{flexGrow: 1}}>
          <HeaderTitle title={'Chat with supports'} leftIcon={SVGLeftArrow} />{' '}
          {/* Chat Messages */}
          <View
            style={{
              flex: 1,
              backgroundColor: '#fff',
              borderTopEndRadius: 32,
              borderTopStartRadius: 32,
              padding: 20,
              marginTop: 20,
            }}>
            {messages.map(msg => (
              <View
                key={msg.id}
                style={{
                  alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                  backgroundColor:
                    msg.sender === 'user' ? '#e3f3e6' : '#f5f5f5',
                  padding: 10,
                  borderRadius: 15,
                  marginBottom: 5,
                  maxWidth: '80%',
                }}>
                <Text
                  style={{
                    color: '#333',
                    fontSize: 16,
                    fontFamily: Fonts.regular,
                  }}>
                  {msg.text}
                </Text>
                <Text
                  style={{
                    fontSize: 12,
                    color: '#777',
                    marginTop: 5,
                    alignSelf: 'flex-end',
                  }}>
                  {msg.time}
                </Text>
              </View>
            ))}

            {/* Message Input */}
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: '#e3f3e6',
                borderRadius: 30,
                paddingHorizontal: 15,
                paddingVertical: 10,
                margin: 5,
                marginTop: 250,
              }}>
              <TextInput
                style={{flex: 1, fontSize: 14, color: 'black'}}
                placeholder="Type here..."
                value={inputText}
                onChangeText={setInputText}
                placeholderTextColor={'grey'}
              />
              <TouchableOpacity onPress={sendMessage}>
                <SvgXml xml={SVGChat} />
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Container>
  );
};

export default ChatScreen;
