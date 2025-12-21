import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  chartContainer: { flex: 1, width: '100%' },
  timelineSelector: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    // gap: 8,
    minHeight: 50,
    flex: 1,
  },
  timelineSelectorItem: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 0,
    margin: 0,
    paddingHorizontal: 12,
    borderRadius: 4,
    height: 30,
    minWidth: 50,
  },
  cartisianContainer: {
    flex: 1,
    minHeight: 250,
    marginVertical: 24,
  },
});
