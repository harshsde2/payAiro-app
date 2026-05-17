import { StyleSheet } from "react-native";
import { ITheme } from "../../themes/themeTypes";

const HERO_W = 260;
const HERO_H = 220;
const GLOW = 150;

export const coinmeMobileAuthStyles = (theme: ITheme) =>
  StyleSheet.create({
    loadingRoot: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: theme.spacing.lg,
    },
    heroBlock: {
      width: HERO_W,
      height: HERO_H,
      alignItems: "center",
      justifyContent: "center",
    },
    glowSquare: {
      width: GLOW,
      height: GLOW,
      borderRadius: theme.radius["2xl"],
      overflow: "hidden",
    },
    glowCanvas: {
      width: GLOW,
      height: GLOW,
    },
    starsOverlay: {
      position: "absolute",
      left: 0,
      top: 0,
      width: HERO_W,
      height: HERO_H,
    },
    starSmallWrap: {
      position: "absolute",
      left: 36,
      top: 48,
    },
    starLargeWrap: {
      position: "absolute",
      right: 28,
      bottom: 40,
    },
    title: {
      textAlign: "center",
      marginTop: theme.spacing.xl,
    },
    webview: {
      flex: 1,
    },
  });
