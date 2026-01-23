import {View, Text, KeyboardAvoidingView, ScrollView} from 'react-native';
import React from 'react';
import Container from './Container';

export default function CommonHeaderv2({children, isBottomNav, ref, isCrypto}) {
  return (
    <Container>
      <KeyboardAvoidingView
        style={{flex: 1}}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView
          ref={ref}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{flexGrow: 1}}>
          {children}
        </ScrollView>
      </KeyboardAvoidingView>
    </Container>
  );
}
