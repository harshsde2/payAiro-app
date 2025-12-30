import { StyleSheet } from 'react-native';
import { RADIUS } from './utils/contants';

export const styles = StyleSheet.create({
  chartContainer: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  itemContainer: {
    padding: 5,
    width: 130,
    marginRight: 5,
    marginBottom: 10,
    borderRadius: 20,
  },
  color: {
    width: 5,
    height: 5,
  },
  text: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  container: {
    flex: 1,
    // backgroundColor: 'blue',
    justifyContent: 'space-between',
    alignItems: 'flex-start', 
    gap: 10,
  },
  chartComponentContainer: {
    width: RADIUS * 2,
    height: RADIUS * 2,
    marginHorizontal: 10,
    // justifyContent: 'center',
    // alignItems: 'center',
    // backgroundColor: 'red', 
  },
  button: {
    marginVertical: 40,
    backgroundColor: 'black',
    paddingHorizontal: 60,
    paddingVertical: 15,
    borderRadius: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 20,
  },
});
