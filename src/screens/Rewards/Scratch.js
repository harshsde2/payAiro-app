import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Image,
  Pressable,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import CommonHeaderv2 from "../../HOC/CommonHeaderv2";
import HeaderTitle from "../../components/HeaderTitle";
import { SVGLeftArrow } from "../../constants/images";
import Fonts from "../../constants/Fonts";
import { ScreenContainer } from "HOC";
import { NAVIGATION_SCREENS } from "navigations/navigationConstants";

const cards = [
  {
    id: "1",
    title: "Card 1",
    image: require("../../../assets/images/ScratchCard.png"),
    patternImage: require("../../../assets/images/ScratchCard.png"),
    revealedImage: require("../../../assets/images/ScratchCard.png"),
  },
  {
    id: "2",
    title: "Card 2",
    image: require("../../../assets/images/ScratchCard.png"),
    patternImage: require("../../../assets/images/ScratchCard.png"),
    revealedImage: require("../../../assets/images/ScratchCard.png"),
  },
  {
    id: "3",
    title: "Card 2",
    image: require("../../../assets/images/ScratchCard.png"),
    patternImage: require("../../../assets/images/ScratchCard.png"),
    revealedImage: require("../../../assets/images/ScratchCard.png"),
  },
  {
    id: "4",
    title: "Card 2",
    image: require("../../../assets/images/ScratchCard.png"),
    patternImage: require("../../../assets/images/ScratchCard.png"),
    revealedImage: require("../../../assets/images/ScratchCard.png"),
  },
  // Add more cards as necessary
];

const HomeScreen = () => {
  const navigation = useNavigation();

  return (
    <ScreenContainer padding={0}>
      <HeaderTitle title={"Rewards"} leftIcon={SVGLeftArrow} />
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          margin: 20,
        }}
      >
        <View>
          <Text style={{ color: "#000", fontFamily: Fonts.bold, fontSize: 25 }}>
            $71.00
          </Text>
          <Text
            style={{ color: "#000", fontFamily: Fonts.regular, fontSize: 18 }}
          >
            Total rewards
          </Text>
        </View>
      </View>
      <View
        style={{
          flex: 1,
          backgroundColor: "#fff",
          borderTopEndRadius: 32,
          borderTopStartRadius: 32,
          padding: 20,
          marginTop: 20,
        }}
      >
        {/* <FlatList
          data={cards}
          keyExtractor={item => item.id}
          renderItem={({item}) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() => navigation.navigate('ScratchCard', {card: item})}>
              <Text style={styles.cardText}>{item.title}</Text>
            </TouchableOpacity>
          )}
        /> */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          {cards &&
            cards.length > 0 &&
            cards.map((i, k) => (
              <Pressable
                key={k}
                style={{ width: "48%", height: 200, marginTop: 15 }}
                // onPress={() => navigation.navigate(NAVIGATION_SCREENS.SCRATCH_CARD, {card: i})}
              >
                <Image
                  source={i?.image}
                  style={{
                    width: "100%",
                    height: 200,
                    resizeMode: "cover",
                    borderRadius: 20,
                  }}
                />
              </Pressable>
            ))}
        </View>
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
  card: {
    backgroundColor: "#f0f0f0",
    padding: 20,
    marginBottom: 10,
    borderRadius: 8,
    width: 200,
    alignItems: "center",
  },
  cardText: {
    fontSize: 18,
  },
});

export default HomeScreen;
