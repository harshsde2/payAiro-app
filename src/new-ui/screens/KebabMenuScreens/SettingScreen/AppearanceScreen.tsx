import React from 'react'
import { TouchableOpacity, View } from 'react-native'
import ScreenWrapper from 'new-ui/components/common-components/ScreenWrapper'
import CustomText from 'new-ui/components/common-components/CustomText'
import { useTheme } from '@new-ui/styles/ThemeContext'
import { AppIcon } from 'new-ui/assets/svgs'
import type { ThemePreference } from '@new-ui/styles/themes/themeTypes'

const OPTIONS: {
  key: ThemePreference
  title: string
  subtitle: string
}[] = [
  {
    key: 'light',
    title: 'Light',
    subtitle: 'Always use the light appearance',
  },
  {
    key: 'dark',
    title: 'Dark',
    subtitle: 'Always use the dark appearance',
  },
  {
    key: 'system',
    title: 'System',
    subtitle: 'Match your device appearance setting',
  },
]

const AppearanceScreen = () => {
  const { theme, themePreference, setThemeMode } = useTheme()

  return (
    <ScreenWrapper
      safeArea
      safeAreaEdges={['bottom']}
      scrollable
      contentStyle={{ paddingHorizontal: 15, paddingTop: 20, paddingBottom: 40 }}
    >
      <View style={{ gap: 10 }}>
        {OPTIONS.map((option) => {
          const isSelected = themePreference === option.key
          return (
            <TouchableOpacity
              key={option.key}
              onPress={() => setThemeMode(option.key)}
              activeOpacity={0.7}
              accessibilityRole="radio"
              accessibilityState={{ selected: isSelected }}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderColor: isSelected
                  ? theme.colors.primary
                  : theme.colors.greyLight,
                borderWidth: isSelected ? 2 : 1,
                borderRadius: theme.radius.lg,
                padding: theme.spacing.md,
              }}
            >
              <View style={{ flex: 1, paddingRight: theme.spacing.sm }}>
                <CustomText variant="h5" size={16} fontWeight="semiBold">
                  {option.title}
                </CustomText>
                <CustomText
                  variant="body"
                  size={13}
                  fontWeight="light"
                  color={theme.colors.textSecondary}
                >
                  {option.subtitle}
                </CustomText>
              </View>
              {isSelected ? (
                <AppIcon.TickCheckedBox width={22} height={22} />
              ) : (
                <AppIcon.UntickCheckedBox width={22} height={22} />
              )}
            </TouchableOpacity>
          )
        })}
      </View>

      <CustomText
        variant="body"
        size={13}
        fontWeight="light"
        color={theme.colors.textSecondary}
        style={{ marginTop: theme.spacing.base }}
      >
        Choosing System lets PayAiro follow your device's light or dark setting
        automatically.
      </CustomText>
    </ScreenWrapper>
  )
}

export default AppearanceScreen
