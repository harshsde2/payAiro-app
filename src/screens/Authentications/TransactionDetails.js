import {View, Text, Image, StyleSheet, TouchableOpacity} from 'react-native';
import React from 'react';
import Container from '../../HOC/Container';
import HeaderTitle from '../../components/HeaderTitle';
import {SVGLeftArrow} from '../../constants/images';
import Fonts from '../../constants/Fonts';
import GenericButton from '../../components/GenericButton';
import {useNavigation} from '@react-navigation/native';

export default function TransactionDetails() {
  const navigation = useNavigation();
  return (
    <Container>
      <HeaderTitle title={'Transaction Details'} leftIcon={SVGLeftArrow} />
      <View
        style={{
          flex: 1,
          backgroundColor: '#fff',
          borderTopEndRadius: 32,
          borderTopStartRadius: 32,
          padding: 25,
          marginTop: 20,
        }}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'flex-start',
            alignItems: 'center',
          }}>
          <Image
            source={require('../../../assets/images/profile.png')}
            style={{width: 50, height: 50}}
          />
          <View style={{marginLeft: 10}}>
            <Text style={{fontFamily: Fonts.semibold, fontSize: 14}}>
              Kimberly
            </Text>
            <Text
              style={{
                fontFamily: Fonts.regular,
                fontSize: 12,
                marginTop: 5,
                color: 'rgba(106, 106, 106, 0.7)',
              }}>
              6586 5589 4586 2231{' '}
            </Text>
          </View>
        </View>
        <View
          style={{
            borderBottomWidth: 1,
            marginVertical: 7,
            borderColor: 'rgba(224, 224, 224, 1)',
          }}
        />

        <View style={styles.container}>
          {/* Amount */}
          <View style={styles.row}>
            <Text style={styles.label}>Amount</Text>
            <Text style={styles.value}>$1584</Text>
          </View>

          {/* Transfer Date */}
          <View style={styles.row}>
            <Text style={styles.label}>Transfer Date</Text>
            <Text style={styles.value}>30 May 2024</Text>
          </View>

          {/* Transfer Time */}
          <View style={styles.row}>
            <Text style={styles.label}>Transfer Time</Text>
            <Text style={styles.value}>10:23 am</Text>
          </View>

          {/* Transaction ID */}
          <View style={styles.row}>
            <Text style={styles.label}>Transaction ID</Text>
            <Text style={styles.value}>31122409331250</Text>
          </View>

          {/* Sender */}
          <View style={styles.row}>
            <Text style={styles.label}>Sender</Text>
            <Text style={styles.value}>Dennis</Text>
          </View>

          {/* Status */}
          <View style={styles.row}>
            <Text style={styles.label}>Status</Text>
            <TouchableOpacity style={styles.statusButton}>
              <Text style={styles.statusText}>Received</Text>
            </TouchableOpacity>
          </View>
          <View
            style={{
              borderBottomWidth: 1,
              marginVertical: 7,
              marginBottom: 15,
              borderColor: 'rgba(224, 224, 224, 1)',
            }}
          />
          {/* Successfully Sent */}
          <View style={styles.row}>
            <Text style={styles.label}>Successfully Sent</Text>
            <Text style={styles.value}>$5015.00</Text>
          </View>
          <View
            style={{
              borderBottomWidth: 1,
              marginTop: 7,
              borderColor: 'rgba(224, 224, 224, 1)',
            }}
          />
          {/* Note */}
          <View style={styles.noteContainer}>
            <Text style={styles.noteLabel}>Note</Text>
            <Text style={styles.noteText}>
              Align frame rectangle invite effect text.
            </Text>
          </View>
        </View>
        <GenericButton title={'Receipt'} cStyle={{marginTop: 100}} />
      </View>
    </Container>
  );
}
const styles = StyleSheet.create({
  container: {
    // padding: 20,
    backgroundColor: '#fff',
    marginTop: 20,
    // flex: 1,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    color: '#666',
    fontFamily: Fonts.regular,
  },
  value: {
    fontSize: 18,
    color: 'rgba(29, 29, 29, 1)',
    fontFamily: Fonts.regular,
  },
  statusButton: {
    backgroundColor: '#008000',
    paddingVertical: 5,
    paddingHorizontal: 15,
    borderRadius: 20,
  },
  statusText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: Fonts.semibold,
  },
  noteContainer: {
    marginTop: 20,
  },
  noteLabel: {
    fontSize: 14,
    color: '#666',
    fontFamily: Fonts.regular,
    marginBottom: 5,
  },
  noteText: {
    fontSize: 16,
    color: '#000',
    fontFamily: Fonts.semibold,
  },
});
