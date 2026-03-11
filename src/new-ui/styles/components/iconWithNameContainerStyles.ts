import { StyleSheet } from "react-native";
import { ITheme } from "../themes/themeTypes";

const iconWithNameContainerStyles = (theme: ITheme) => StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
        gap: theme.spacing.sm,
    },
    iconContainer: {
        borderRadius: theme.radius.full,
        backgroundColor: theme.colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    name: {
        fontSize: theme.typography.fontSize.xxs,
        fontFamily: theme.typography.fontFamily.interMedium,
        color: theme.colors.text,
    },
});

export default iconWithNameContainerStyles;