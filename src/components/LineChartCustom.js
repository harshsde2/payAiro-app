import React, {useState} from 'react';
import {
  View,
  Dimensions,
  TouchableOpacity,
  Text,
  StyleSheet,
} from 'react-native';
import {LineChart} from 'react-native-gifted-charts';
import Fonts from '../constants/Fonts';
import useSelectorAction from '../hooks/useSelectorAction';

const CryptoChart = ({isNoBg}) => {
  const {selectedCrypto} = useSelectorAction();
  // Static data for different timeframes
  const ptData = [
    {
      value: 130,
      date: '1  2022',

      labelTextStyle: {color: 'black', width: 20, fontSize: 10},
    },
    {
      value: 180,
      date: '2  2022',

      labelTextStyle: {color: 'black', width: 20, fontSize: 10},
    },
    {
      value: 190,
      date: '3  2022',

      labelTextStyle: {color: 'black', width: 20, fontSize: 10},
    },
    {
      value: 180,
      date: '4  2022',

      labelTextStyle: {color: 'black', width: 20, fontSize: 10},
    },
    {
      value: 140,
      date: '5  2022',

      labelTextStyle: {color: 'black', width: 20, fontSize: 10},
    },
    {
      value: 145,
      date: '6  2022',

      labelTextStyle: {color: 'black', width: 20, fontSize: 10},
    },
    {
      value: 130,
      date: '7  2022',

      labelTextStyle: {color: 'black', width: 20, fontSize: 10},
    },
    {
      value: 200,
      date: '8  2022',

      labelTextStyle: {color: 'black', width: 20, fontSize: 10},
    },

    {
      value: 220,
      date: '9  2022',

      labelTextStyle: {color: 'black', width: 20, fontSize: 10},
    },
    {
      value: 240,
      date: '10  2022',
      label: '10 ',
      labelTextStyle: {color: 'black', width: 20, fontSize: 10},
    },
    {value: 280, date: '11  2022'},
    {value: 230, date: '12  2022'},
    {value: 340, date: '13  2022'},
    {value: 385, date: '14  2022'},
    {value: 280, date: '15  2022'},
    {value: 390, date: '16  2022'},

    {value: 370, date: '17  2022'},
    {value: 285, date: '18  2022'},
    {value: 295, date: '19  2022'},
    {
      value: 300,
      date: '20  2022',
      label: '20 ',
      labelTextStyle: {color: 'black', width: 20, fontSize: 10},
    },
    {value: 280, date: '21  2022'},
    {value: 295, date: '22  2022'},
    {value: 230, date: '23  2022'},
    {value: 255, date: '24  2022'},

    {value: 190, date: '25  2022'},
    {value: 220, date: '26  2022'},
    {value: 205, date: '27  2022'},
    {value: 230, date: '28  2022'},
    {value: 210, date: '29  2022'},
    {
      value: 200,
      date: '30  2022',
      label: '30 ',
      labelTextStyle: {color: 'black', width: 20, fontSize: 10},
    },
    {value: 240, date: '1 May 2022'},
    {value: 250, date: '2 May 2022'},
    {value: 280, date: '3 May 2022'},
    {value: 250, date: '4 May 2022'},
    {value: 210, date: '5 May 2022'},
  ];

  // Adjust labels to avoid overlap for the yearly timeframe
  // const {data, labels} = dataByTimeframe[timeframe];
  // const adjustedLabels =
  //   timeframe === 'year'
  //     ? labels.map((label, index) => (index % 2 === 0 ? label : ''))
  //     : labels;

  return (
    <View
      style={{
        backgroundColor: 'transparent',
        paddingTop: 30,
        width: '100%',
        borderRadius: 20,
        alignSelf: 'center',
        margin: 10,
      }}>
      {/* Line Chart */}
      <LineChart
        areaChart
        data={ptData}
        // rotateLabel

        width={640}
        hideDataPoints
        spacing={10}
        color="rgba(0, 0, 0, 1)"
        thickness={2}
        // startFillColor="rgba(243, 251, 244, 1)"
        endFillColor="rgba(0, 0, 0, 0.1)"
        startOpacity={0.3}
        endOpacity={0}
        initialSpacing={0}
        noOfSections={6}
        maxValue={400}
        yAxisColor="rgba(243, 251, 244, 1)"
        yAxisThickness={0}
        xAxisThickness={0}
        rulesType=""
        rulesColor="rgba(243, 251, 244, 1)"
        yAxisTextStyle={{color: 'black', fontSize: 10}}
        // xAxisColor={"red"}
        // yAxisSide="right"
        // xAxisColor="rgba(243, 251, 244, 1)"
        // xAxisTextStyle={{color: 'black', fontSize: 10}}
        pointerConfig={{
          pointerStripHeight: 130,
          pointerStripColor: 'rgba(243, 251, 244, 1)',
          pointerStripWidth: 1,
          pointerColor: 'rgba(243, 251, 244, 1)',
          radius: 0,
          pointerLabelWidth: 100,
          pointerLabelHeight: 90,
          activatePointersOnLongPress: true,
          autoAdjustPointerLabelPosition: false,
          pointerLabelComponent: items => {
            return (
              <View
                style={{
                  height: 90,
                  width: 100,
                  justifyContent: 'center',
                  marginTop: -30,
                  marginLeft: -40,
                }}>
                {/* <Text
                  style={{
                    color: 'rgba(243, 251, 244, 1)',
                    fontSize: 10,
                    marginBottom: 6,
                    textAlign: 'center',
                  }}>
                  {items[0].date}
                </Text> */}

                <View
                  style={{
                    paddingHorizontal: 14,
                    paddingVertical: 6,
                    borderRadius: 16,
                    backgroundColor: 'white',
                  }}>
                  <Text
                    style={{
                      fontWeight: 'bold',
                      textAlign: 'center',
                      color: '#000',
                    }}>
                    {'$' + items[0].value + '.0'}
                  </Text>
                </View>
              </View>
            );
          },
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  timeframeSelector: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  timeframeButton: {
    padding: 10,
    marginHorizontal: 10,
    borderRadius: 10,
    backgroundColor: 'rgba(200, 200, 200, 0.2)',
  },
  selectedTimeframeButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  timeframeText: {
    fontSize: 12,
    fontFamily: Fonts.bold,
    color: '#000',
  },
  selectedTimeframeText: {
    color: '#fff',
  },
});

export default CryptoChart;
