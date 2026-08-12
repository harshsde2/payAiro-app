import React, { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, ListRenderItemInfo, TextInput, TouchableOpacity, View } from 'react-native';
import { useTheme } from '@new-ui/styles/ThemeContext';
import ScreenWrapper from '@new-ui/components/common-components/ScreenWrapper';
import CustomText from '@new-ui/components/common-components/CustomText';
import AccordionItem from '@new-ui/components/common-components/AccordionItem';
import { AppIcon } from '@new-ui/assets/svgs';
import { faqScreenStyles } from '@new-ui/styles/screens/faq/faqScreenStyles';
import { useFaqList } from 'query/hooks/useFaq';
import { FaqItem } from '@new-ui/types/faq';
import useDebounce from 'hooks/useDebounce';

const FAQScreen = () => {
  const { theme } = useTheme();
  const styles = faqScreenStyles(theme);
  const [searchInput, setSearchInput] = useState('');
  const debouncedSearch = useDebounce(searchInput, 300);
  const { data, isLoading, isError, refetch } = useFaqList(debouncedSearch);
  const items = data?.data ?? [];

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<FaqItem>) => (
      <AccordionItem title={item.question}>
        <CustomText variant="body" color={theme.colors.text} style={{ lineHeight: 22 }}>
          {item.answer}
        </CustomText>
      </AccordionItem>
    ),
    [theme]
  );

  const keyExtractor = useCallback((item: FaqItem) => String(item.id), []);

  return (
    <ScreenWrapper safeArea safeAreaEdges={['bottom']} scrollable={false} contentStyle={styles.content} flex={1}>
      <View style={styles.searchContainer}>
        <AppIcon.Search width={18} height={18} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search FAQs"
          placeholderTextColor={theme.colors.textSecondary}
          value={searchInput}
          onChangeText={setSearchInput}
          returnKeyType="search"
          autoCorrect={false}
        />
      </View>

      {isLoading ? (
        <ActivityIndicator color={theme.colors.primary} style={styles.loader} />
      ) : isError ? (
        <View style={styles.centerState}>
          <CustomText variant="body" color={theme.colors.textSecondary}>
            Unable to load FAQs. Please try again.
          </CustomText>
          <TouchableOpacity onPress={() => refetch()}>
            <CustomText variant="body" fontWeight="medium" color={theme.colors.primary}>
              Retry
            </CustomText>
          </TouchableOpacity>
        </View>
      ) : items.length === 0 ? (
        <View style={styles.centerState}>
          <CustomText variant="body" color={theme.colors.textSecondary}>
            {debouncedSearch ? `No FAQs found for "${debouncedSearch}".` : 'No FAQs available right now.'}
          </CustomText>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          initialNumToRender={12}
          maxToRenderPerBatch={12}
          windowSize={7}
          removeClippedSubviews
        />
      )}
    </ScreenWrapper>
  );
};

export default FAQScreen;
