import React, { useCallback, useState } from 'react';
import { LayoutAnimation, Platform, TouchableOpacity, UIManager, View } from 'react-native';
import CustomText from '@new-ui/components/common-components/CustomText';
import { useTheme } from '@new-ui/styles/ThemeContext';
import { AppIcon } from '@new-ui/assets/svgs';
import { accordionItemStyles } from '@new-ui/styles/components/accordionItemStyles';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export interface IAccordionItemProps {
  title: string;
  children: React.ReactNode;
  defaultExpanded?: boolean;
}

const AccordionItem: React.FC<IAccordionItemProps> = ({ title, children, defaultExpanded = false }) => {
  const { theme } = useTheme();
  const styles = accordionItemStyles(theme);
  const [expanded, setExpanded] = useState(defaultExpanded);

  const toggle = useCallback(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded((v) => !v);
  }, []);

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={toggle} activeOpacity={0.7} style={styles.header}>
        <CustomText variant="body" fontWeight="medium" style={styles.title}>
          {title}
        </CustomText>
        <View style={{ transform: [{ rotate: expanded ? '180deg' : '0deg' }] }}>
          <AppIcon.ChevronDown width={18} height={18} color={theme.colors.text} />
        </View>
      </TouchableOpacity>
      {expanded && <View style={styles.body}>{children}</View>}
    </View>
  );
};

export default React.memo(AccordionItem);
