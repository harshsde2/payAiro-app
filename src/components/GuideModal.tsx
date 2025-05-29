import React, { useState } from "react";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Fonts from "../constants/Fonts";
import GenericButton from "./GenericButton";
import { SvgXml } from "react-native-svg";
import {
  SVGAdd2,
  SVGArrow,
  SVGArrow2,
  SVGGuide1,
  SVGNewBank,
  SVGReceive,
} from "../constants/images";
import { setGuide } from "../services/Auth";
import useDispatchAction from "../hooks/useDispatchAction";
import {
  setGuides,
  setShowGuide,
  setShowRedeemReward,
} from "../redux/slices/authenticationSlice";
import { useNavigation } from "@react-navigation/native";
import { setItem, STORAGE_KEYS } from "storage/mmkv";

type GuideModalProps = {
  isVisible: boolean;
  onClose: () => void;
  onConfirm?: () => void;
};

const GuideModal: React.FC<GuideModalProps> = ({ isVisible, onClose }) => {
  const navigation = useNavigation();
  const [steps, setSteps] = useState<"1" | "2" | "3" | "4">("1");

  const onSetGuide = () => {
    setItem(STORAGE_KEYS.GUIDE, JSON.stringify(false));
    useDispatchAction(setGuides(false));
    setTimeout(() => {
      useDispatchAction(setShowRedeemReward(true));
    }, 3000);
    onClose();
  };

  const onSkip = () => {
    onSetGuide();
  };

  const handleNext = async () => {
    if (steps === "3") {
      onSetGuide();
    } else {
      setSteps(
        ((parseInt(steps) + 1) as 1 | 2 | 3 | 4).toString() as
          | "1"
          | "2"
          | "3"
          | "4"
      );
    }
  };

  return (
    <Modal
      visible={isVisible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        {steps === "1" && (
          <View style={{ position: "absolute", top: 150 }}>
            <SvgXml
              xml={SVGGuide1}
              style={{ alignSelf: "center", marginTop: 20 }}
            />
            <SvgXml
              xml={SVGArrow}
              style={{ alignSelf: "center", marginTop: 20 }}
            />
            <Text style={styles.stepText}>
              List rotate comment variant prototype pen follower. Move select
              inspect blur device
            </Text>
          </View>
        )}
        {steps === "2" && (
          <View style={{ position: "absolute", top: 320 }}>
            <SvgXml
              xml={SVGAdd2}
              style={{ alignSelf: "flex-end", marginTop: 20, marginRight: 15 }}
            />
            <SvgXml
              xml={SVGArrow}
              style={{ alignSelf: "center", marginTop: 20 }}
            />
            <Text style={styles.stepText}>
              List rotate comment variant prototype pen follower. Move select
              inspect blur device
            </Text>
          </View>
        )}
        {steps === "3" && (
          <View style={{ position: "absolute", top: 270 }}>
            <Text style={styles.stepText}>
              List rotate comment variant prototype pen follower. Move select
              inspect blur device
            </Text>
            <SvgXml
              xml={SVGArrow2}
              style={{ alignSelf: "center", marginTop: 20 }}
            />
            <SvgXml
              xml={SVGNewBank}
              style={{ alignSelf: "flex-start", marginTop: 20, marginLeft: 15 }}
            />
          </View>
        )}
        {steps === "4" && (
          <View style={{ position: "absolute", top: 320 }}>
            <SvgXml
              xml={SVGReceive}
              style={{
                alignSelf: "flex-start",
                marginTop: 20,
                marginLeft: 100,
              }}
            />
            <SvgXml
              xml={SVGArrow2}
              style={{ alignSelf: "center", marginTop: 20 }}
            />
            <Text style={styles.stepText}>
              List rotate comment variant prototype pen follower. Move select
              inspect blur device
            </Text>
          </View>
        )}

        <View style={styles.buttonRow}>
          <GenericButton
            onPress={handleNext}
            cStyle={{ width: "40%" }}
            title={"Next"}
          />
          {steps !== "4" && (
            <TouchableOpacity onPress={onSkip}>
              <Text style={styles.skipText}>Skip</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  );
};

export default GuideModal;

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  stepText: {
    color: "white",
    textAlign: "center",
    marginHorizontal: 70,
    marginTop: 50,
  },
  skipText: {
    color: "#fff",
    textAlign: "right",
    fontFamily: Fonts.bold,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    position: "absolute",
    bottom: 30,
    width: "80%",
  },
});
