import { View, Text, StyleSheet } from 'react-native'
import React, { FC } from 'react'
import { IconTextComponentProps } from './components.types'
import { Theme, useTheme } from 'styles'
import CustomText from './CustomText'

const IconTextComponent: FC<IconTextComponentProps> = ({
    children,
    style,
    label,
    iconContainerStyle,
    labelStyle
}) => {
    const { theme } = useTheme();
    const styles = customStyles(theme);
    return (
        <View style={[styles.container, style]} >
            <View style={[styles.iconContainer, iconContainerStyle]} >
                {children}
            </View>
            <CustomText                
                style={[
                    styles.labelStyle,
                    labelStyle,
                ]}
            >
                {label}
            </CustomText>
        </View>
    )
}

export default IconTextComponent;

const customStyles = (theme: Theme) => StyleSheet.create({
    container: {
        marginRight:20,
        // backgroundColor: theme.colors.palette.green800,
        justifyContent: 'center',
        alignItems: 'center'
    },
    iconContainer: {
        // backgroundColor: 'red',
        justifyContent: 'center',
        alignItems: 'center',
        flex: 1,
    },
    labelStyle: {
        // backgroundColor: 'yellow',
        textAlign: 'center',
        textAlignVertical: 'center',
        marginTop:5,
        fontSize:theme.spacing.spacing[3],
        fontWeight:'500',
        fontFamily:theme.typography.fontFamily.montserratMedium

    }
})
