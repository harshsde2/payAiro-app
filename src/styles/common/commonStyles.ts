import { StyleSheet } from 'react-native';
import { ITheme } from '../themes/themeTypes';

export const commonStyles = (theme: ITheme) =>
  StyleSheet.create({
    flexRow: {
      flexDirection: 'row',
    },
    flexColumn: {
      flexDirection: 'column',
    },
    centerContent: {
      justifyContent: 'center',
      alignItems: 'center',
    },
    spaceBetween: {
      justifyContent: 'space-between',
    },
    spaceAround: {
      justifyContent: 'space-around',
    },
    flex1: {
      flex: 1,
    },
    flexWrap: {
      flexWrap: 'wrap',
    },
  });

