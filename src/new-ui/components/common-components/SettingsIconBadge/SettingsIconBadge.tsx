import React from 'react';
import { View } from 'react-native';
import { useTheme } from '@new-ui/styles/ThemeContext';

type SettingsIconBadgeProps = {
  children: React.ReactNode;
  /** Diameter of the circle. Defaults to the 40px used by settings rows. */
  size?: number;
};

/**
 * Circular tinted badge behind a settings-row glyph.
 *
 * This circle used to be baked into each SVG as a near-white fill, which meant neither the
 * circle nor the glyph could follow the theme — in dark mode the rows rendered as bright
 * white discs. Drawing it here instead lets both track the palette, and gives every settings
 * row one treatment rather than a mix of badged and bare icons.
 */
const SettingsIconBadge: React.FC<SettingsIconBadgeProps> = ({ children, size = 40 }) => {
  const { theme } = useTheme();

  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: theme.colors.primaryLight,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {children}
    </View>
  );
};

export default SettingsIconBadge;
