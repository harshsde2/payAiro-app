import { TouchableOpacity, View, useWindowDimensions } from 'react-native';
import Animated, { FadeInDown, FadeOutDown, useAnimatedStyle } from 'react-native-reanimated';
import { styles } from '../styles';
import { RenderItemProps } from '../types';
import CustomText from 'tsx-components/CustomText';

const getTextSize = (labelLength: number) => {
  if (labelLength <= 10) return 10;
  if (labelLength <= 15) return 9;
  return 8;
};

const getMaxWidth = (labelLength: number) => {
  if (labelLength <= 10) return 50;
  if (labelLength <= 15) return 65;
  return 65; // For 23+ character labels
};

const RenderItem = ({ item, index, activeIndex }: RenderItemProps) => {
  const { width } = useWindowDimensions();
  const labelLength = item.label?.length || 0;
  const textSize = getTextSize(labelLength);
  const maxWidth = getMaxWidth(labelLength);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity:
      activeIndex?.value === undefined || activeIndex?.value === null ? 1 : activeIndex?.value === index ? 1 : 0.4,
  }));
  return (
    <Animated.View
      style={[styles.itemContainer, { backgroundColor: item.lightColor }, animatedStyle]}
      entering={FadeInDown.delay(index * 200)}
      exiting={FadeOutDown}>
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => {
          if (!activeIndex) return;
          activeIndex.value = index;
        }}>
        <View style={{ alignItems: 'center' }}>
          <View style={{ flexDirection: 'row', gap: 3, justifyContent: 'space-around', alignItems: 'center', width: '100%' }}>
            <View style={[styles.color, { backgroundColor: item.color }]} />
            {item.label && (
              <CustomText
                size={textSize}
                style={{ maxWidth: maxWidth }}
                numberOfLines={1} // Allow 2 lines for long labels
                color={item.color}
                ellipsizeMode='tail'
                fontWeight="semiBold"
                align="center">
                {item.label}
              </CustomText>
            )}
            <CustomText size={textSize} color={item.color} fontWeight="semiBold">
              {item.percentage.toFixed(2)}%
            </CustomText>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

export default RenderItem;
