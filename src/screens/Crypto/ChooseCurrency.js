import {View, Text} from 'react-native';
import React, {useEffect, useState} from 'react';
import CommonHeaderv2 from '../../HOC/CommonHeaderv2';
import {SVGLeftArrow, SVGSearch} from '../../constants/images';
import HeaderTitle2 from '../../components/HeaderTitle2';
import {getBalanceCrypto} from '../../services/Services';
import useSelectorAction from '../../hooks/useSelectorAction';
import CrryptoCard from '../../components/CrryptoCard';

export default function ChooseCurrency() {
  const {tokens} = useSelectorAction();
  const [alloCationLists, setalloCationLists] = useState([]);

  useEffect(() => {
    handleBalance();
  }, []);

  const handleBalance = async () => {
    const data = await getBalanceCrypto(tokens?.access);
    console.log(data?.data?.data, 'cryptoBalance');
    if (data?.data?.data) {
      setalloCationLists(
        data?.data?.data?.filter(asset => asset.assetType !== 'usd'),
      );
    }
  };
  return (
    <CommonHeaderv2>
      <HeaderTitle2
        leftIcon={SVGLeftArrow}
        title={'Choose Currency'}
        rightIcon={SVGSearch}
      />
      <View
        style={{
          flex: 1,
          backgroundColor: '#fff',
          borderTopEndRadius: 32,
          borderTopStartRadius: 32,
          padding: 20,
          marginTop: 20,
        }}>
        {alloCationLists &&
          alloCationLists?.length > 0 &&
          alloCationLists.map((i, k) => (
            <CrryptoCard key={k} item={i} type="withdraw" />
          ))}
      </View>
    </CommonHeaderv2>
  );
}
