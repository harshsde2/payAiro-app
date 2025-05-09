import { View, Text, StyleSheet, StyleProp, ViewStyle } from 'react-native'
import React, { memo } from 'react'
import SectionHeader from './SectionHeader';

interface DashboardSectionProps {
  title?: string;
  actionText?: string;
  onActionPress?: () => void;
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
}

const DashboardSection = ({ title, actionText, onActionPress, children, style, contentContainerStyle }: DashboardSectionProps) => {
  // console.log("actionText =>",actionText)
  return (
    <View 
        style={[styles.container,style]}
    >
      <SectionHeader title={title} actionText={actionText} onActionPress={onActionPress} />
      <View style={[styles.contentContainer,contentContainerStyle]}> 
        {children}
      </View>
    </View>
  )
}

export default memo(DashboardSection); 

const styles = StyleSheet.create({
    container: {
        flex:1,
    },
    contentContainer:{
        flex:1
    }
})
