import {createNativeStackNavigator} from '@react-navigation/native-stack';
import React from 'react';
import Address from '../screens/Authentications/Address';
import DebitCard from '../screens/Authentications/DebitCard';
import IDProof from '../screens/Authentications/IDProof';
import Invite from '../screens/Authentications/Invite';
import Legal from '../screens/Authentications/Legal';
import Login from '../screens/Authentications/Login';
import Name from '../screens/Authentications/Name';
import OTP from '../screens/Authentications/OTP';
import PayTag from '../screens/Authentications/PayTag';
import Pincode from '../screens/Authentications/Pincode';
import Signature from '../screens/Authentications/Signature';
import Dob from '../screens/Authentications/Dob';
import SuccesScreen from '../screens/Authentications/SuccesScreen';
import SelfieScreen from '../screens/Authentications/SelfieScreen';
import Biometcric from '../screens/Dashboard/Biometcric';

const Stack = createNativeStackNavigator();
export default function AuthStack() {
  return (
    <Stack.Navigator
      headerMode="none"
      initialRouteName="Login"
      screenOptions={{
        headerShown: false,
      }}>
      <Stack.Screen
        options={{headerShown: false}}
        name="Login"
        component={Login}
      />
      <Stack.Screen options={{headerShown: false}} name="OTP" component={OTP} />
      <Stack.Screen
        options={{headerShown: false}}
        name="Invite"
        component={Invite}
      />
      <Stack.Screen
        options={{headerShown: false}}
        name="Address"
        component={Address}
      />
      <Stack.Screen
        options={{headerShown: false}}
        name="Name"
        component={Name}
      />
      <Stack.Screen
        options={{headerShown: false}}
        name="IDProof"
        component={IDProof}
      />
      <Stack.Screen
        options={{headerShown: false}}
        name="Signature"
        component={Signature}
      />
      <Stack.Screen
        options={{headerShown: false}}
        name="DebitCard"
        component={DebitCard}
      />
      <Stack.Screen
        options={{headerShown: false}}
        name="Legal"
        component={Legal}
      />
      <Stack.Screen
        options={{headerShown: false}}
        name="PayTag"
        component={PayTag}
      />
      <Stack.Screen
        options={{headerShown: false}}
        name="Pincode"
        component={Pincode}
      />
      <Stack.Screen
        options={{headerShown: false}}
        name="SuccesScreen"
        component={SuccesScreen}
      />
      <Stack.Screen
        options={{headerShown: false}}
        name="SelfieScreen"
        component={SelfieScreen}
      />
      <Stack.Screen
        options={{headerShown: false}}
        name="Biometcric"
        component={Biometcric}
      />
      <Stack.Screen options={{headerShown: false}} name="Dob" component={Dob} />
    </Stack.Navigator>
  );
}
