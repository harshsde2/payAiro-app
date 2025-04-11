import React, { useEffect } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    runOnJS,
    interpolate,
    Extrapolate,
    Easing,
} from 'react-native-reanimated';
import { SlideProps } from '../animations-functions/types';
import { CustomText } from 'tsx-components';
import { fontFamily, useTheme } from 'styles';

interface FlipSlideProps extends Omit<SlideProps, 'children'> {
    topText?: string;
    bottomText?: string;
    smallText?: string;
    textStyle?: any;
    smallTextStyle?: any;
    flipDuration?: number;
    fastPortion?: number; // Percentage of animation that should be fast (0-1)
}

const FlipSlide = ({
    visible = true,
    topText,
    bottomText,
    textStyle,
    smallText,
    smallTextStyle,
    duration = 300,
    flipDuration = 500,
    style,
    distance = 100,
    fastPortion = 0.75, // Default 75% fast, 25% slow
    onAnimationComplete,
}: FlipSlideProps) => {
    // Animation progress (0 to 1)
    const progress = useSharedValue(visible ? 1 : 0);

    const { theme } = useTheme();

    useEffect(() => {
        // Use a predefined easing function from Reanimated instead of custom easing
        // This ensures compatibility with the worklet requirements
        const animationConfig = {
            duration: flipDuration,
            easing:
                // For fast initial movement and slow ending, use easeOut
                fastPortion > 0.5 ? Easing.out(Easing.quad) :
                    // For slow initial movement and fast ending, use easeIn
                    fastPortion < 0.3 ? Easing.in(Easing.quad) :
                        // For balanced movement, use standard ease
                        Easing.inOut(Easing.quad),
        };

        // Animate based on visibility
        progress.value = withTiming(
            visible ? 1 : 0,
            animationConfig,
            (finished) => {
                if (finished && onAnimationComplete) {
                    runOnJS(onAnimationComplete)();
                }
            }
        );
    }, [visible, flipDuration, fastPortion, onAnimationComplete]);

    // First text (Harsh) animated style
    const firstTextAnimatedStyle = useAnimatedStyle(() => {
        // Calculate the Y position of the first text
        const translateY = interpolate(
            progress.value,
            [0, 1],
            [0, -distance],
            Extrapolate.CLAMP
        );

        // Opacity follows a more regular curve
        const opacity = interpolate(
            progress.value,
            [0, 0.5],
            [1, 0],
            Extrapolate.CLAMP
        );

        return {
            opacity,
            transform: [{ translateY }]
        };
    });

    // Second text (Shubham) animated style
    const secondTextAnimatedStyle = useAnimatedStyle(() => {
        // Calculate the Y position of the second text
        const translateY = interpolate(
            progress.value,
            [0, 1],
            [distance, 0],
            Extrapolate.CLAMP
        );

        // Opacity follows a more regular curve
        const opacity = interpolate(
            progress.value,
            [0.5, 1],
            [0, 1],
            Extrapolate.CLAMP
        );

        return {
            opacity,
            transform: [{ translateY }]
        };
    });

    return (
        <View style={[styles.container, style]}>
            <View style={styles.textContainer}>
                <Animated.Text style={[styles.text, textStyle, firstTextAnimatedStyle]}>
                    {topText}{'\n'}
                    {smallText && <Text style={[styles.smallText, smallTextStyle, firstTextAnimatedStyle]}>
                        {smallText}
                    </Text>}
                </Animated.Text>
                <Animated.Text style={[styles.text, textStyle, secondTextAnimatedStyle]}>
                    {bottomText}{'\n'}
                    {smallText && <Text style={[styles.smallText, smallTextStyle, firstTextAnimatedStyle]}>
                        {smallText}
                    </Text>
                    }
                </Animated.Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'transparent',
        minHeight: 50,
        minWidth: 100,
    },
    textContainer: {
        minHeight: 50,
        justifyContent: 'center',
        alignItems: 'flex-start',
        overflow: 'hidden',
        backgroundColor: 'transparent',
        width: '100%',
    },
    text: {
        position: 'absolute',
        textAlign: 'center',
        color: 'black',
        fontSize: 16,
        fontWeight: 'bold',
    },
    smallText: {
        position: 'absolute',
        textAlign: 'center',
        color: 'black',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default FlipSlide; 