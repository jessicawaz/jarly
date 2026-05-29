import { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text } from "react-native";
import { colors, fonts } from "../constants/colors";

export default function AnimatedBanner({ style = {}, bannerText }) {
  const anim = useRef(new Animated.Value(-500)).current;

  useEffect(() => {
    Animated.spring(anim, {
      toValue: 50,
      useNativeDriver: true,
    }).start();

    setTimeout(() => {
      Animated.spring(anim, {
        toValue: -1500,
        useNativeDriver: true,
      }).start();
    }, 4000); // slide banner back up after 4 sec
  }, [anim]);

  return (
    <Animated.View
      style={[styles.banner, style, { transform: [{ translateY: anim }] }]}
    >
      <Text style={styles.bannerText}>{bannerText}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  banner: {
    backgroundColor: colors.goalsLight,
    padding: 16,
    position: 'absolute',
    zIndex: 100,
    alignSelf: 'center',
    borderRadius: 20,
    width: 'auto',
    marginHorizontal: 32
  },
  bannerText: {
    color: colors.textDark,
    fontFamily: fonts.extra,
  },
});
