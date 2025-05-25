import React from 'react'
import { View, StyleSheet, Platform } from 'react-native'
import LottieView from 'lottie-react-native'
import { BlurView } from '@react-native-community/blur'
import { LOTTIE_APP_LOADER } from 'lottie/lottie'
import CustomText from './CustomText'

const GlobalLoader = () => {
    return (
        <View style={styles.overlay}>
            {Platform.OS === 'ios' ? (
                <BlurView style={styles.blurView} blurType='dark' blurAmount={10} />
            ) : (
                // Android doesn't fully support BlurView well; use semi-transparent overlay instead
                <View style={styles.fallbackBlur} />
            )}
            <LottieView
                style={{ width: 250, height: 250 }}
                source={LOTTIE_APP_LOADER}
                autoPlay
                loop
            />
            <CustomText variant='h4' color='white' style={{ marginTop: -50 }}>
                Loading...
            </CustomText>
        </View>
    )
}

const styles = StyleSheet.create({
    overlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 9999,
    },
    blurView: {
        ...StyleSheet.absoluteFillObject,
        position: 'absolute',
    },
    fallbackBlur: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.1)', // fallback for Android
        position: 'absolute',
    },
})

export default GlobalLoader
