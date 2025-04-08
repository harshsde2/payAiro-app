# Font Setup Guide

This guide explains how to add the Nexa and Montserrat fonts to your React Native application.

## 1. Download the Font Files

First, download the required font files:

- Nexa Heavy (Nexa-Heavy.ttf or .otf)
- Montserrat Regular (Montserrat-Regular.ttf)
- Montserrat Medium (Montserrat-Medium.ttf)
- Montserrat SemiBold (Montserrat-SemiBold.ttf)
- Montserrat Bold (Montserrat-Bold.ttf)

You can download Montserrat from [Google Fonts](https://fonts.google.com/specimen/Montserrat) and Nexa from its official source or a trusted font provider.

## 2. Create a Fonts Directory

Create a directory in your project to store the font files:

```bash
mkdir -p assets/fonts
```

## 3. Add the Font Files

Move all downloaded font files to the `assets/fonts` directory.

## 4. Update react-native.config.js

Make sure you have a `react-native.config.js` file in your project root with the following content:

```javascript
module.exports = {
  project: {
    ios: {},
    android: {},
  },
  assets: ['./assets/fonts/'],
};
```

## 5. Link the Fonts

Run the following command to link the fonts to your project:

```bash
npx react-native-asset
```

## 6. iOS Specific Setup

### Add fonts to Info.plist

For iOS, you might need to manually add the fonts to your `Info.plist` file:

```xml
<key>UIAppFonts</key>
<array>
  <string>Nexa-Heavy.ttf</string>
  <string>Montserrat-Regular.ttf</string>
  <string>Montserrat-Medium.ttf</string>
  <string>Montserrat-SemiBold.ttf</string>
  <string>Montserrat-Bold.ttf</string>
</array>
```

## 7. Rebuild Your App

After linking the fonts, rebuild your app:

```bash
# For iOS
npx pod-install
npx react-native run-ios

# For Android
npx react-native run-android
```

## 8. Verify Fonts Are Working

To verify that your fonts are working correctly, you can create a simple component to test them:

```jsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const FontTest = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.nexaHeading}>This is Nexa Heavy</Text>
      <Text style={styles.montserratBody}>This is Montserrat Regular</Text>
      <Text style={styles.montserratMedium}>This is Montserrat Medium</Text>
      <Text style={styles.montserratSemiBold}>This is Montserrat SemiBold</Text>
      <Text style={styles.montserratBold}>This is Montserrat Bold</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  nexaHeading: {
    fontFamily: 'Nexa-Heavy',
    fontSize: 24,
    marginBottom: 10,
  },
  montserratBody: {
    fontFamily: 'Montserrat-Regular',
    fontSize: 16,
    marginBottom: 5,
  },
  montserratMedium: {
    fontFamily: 'Montserrat-Medium',
    fontSize: 16,
    marginBottom: 5,
  },
  montserratSemiBold: {
    fontFamily: 'Montserrat-SemiBold',
    fontSize: 16,
    marginBottom: 5,
  },
  montserratBold: {
    fontFamily: 'Montserrat-Bold',
    fontSize: 16,
    marginBottom: 5,
  },
});

export default FontTest;
```

## Troubleshooting

If you encounter issues:

1. Make sure the font filenames match exactly what you specified in your code
2. Check that the fonts are correctly copied to the assets/fonts directory
3. For iOS, verify that the fonts are listed in the Info.plist file
4. Clean and rebuild your project 