import React, {useEffect, useRef} from 'react';
import {Animated, Easing, Pressable, StyleSheet, Text, View} from 'react-native';
import Svg, {Circle, Defs, LinearGradient, Path, RadialGradient, Stop} from 'react-native-svg';
import {colors} from '../theme';

/** Golden Banana power button with Monkey states. */
export default function MonkeyButton({state = 'disconnected', onPress}) {
  const isConnected = state === 'connected';
  const isConnecting = state === 'connecting';

  const pulse = useRef(new Animated.Value(0)).current;
  const swing = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isConnected) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulse, {toValue: 1, duration: 1400, useNativeDriver: true}),
          Animated.timing(pulse, {toValue: 0, duration: 1400, useNativeDriver: true}),
        ]),
      ).start();
    } else {
      pulse.stopAnimation();
      pulse.setValue(0);
    }
  }, [isConnected, pulse]);

  useEffect(() => {
    if (isConnecting) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(swing, {toValue: 1, duration: 600, easing: Easing.inOut(Easing.quad), useNativeDriver: true}),
          Animated.timing(swing, {toValue: -1, duration: 600, easing: Easing.inOut(Easing.quad), useNativeDriver: true}),
        ]),
      ).start();
    } else {
      swing.stopAnimation();
      swing.setValue(0);
    }
  }, [isConnecting, swing]);

  const rot = swing.interpolate({inputRange: [-1, 0, 1], outputRange: ['-15deg', '0deg', '15deg']});
  const aura = pulse.interpolate({inputRange: [0, 1], outputRange: [0.4, 0.9]});
  const auraScale = pulse.interpolate({inputRange: [0, 1], outputRange: [0.95, 1.1]});

  const label =
    state === 'connected' ? 'Tap the banana to disconnect'
    : state === 'connecting' ? 'Swinging through the canopy…'
    : 'Pull the vine to connect';

  return (
    <View style={styles.wrap}>
      <Pressable onPress={onPress} style={({pressed}) => [styles.button, pressed && {transform: [{scale: 0.96}]}]}>
        {isConnected && (
          <Animated.View style={[styles.aura, {opacity: aura, transform: [{scale: auraScale}]}]} />
        )}
        <View style={[styles.ring, isConnected && styles.ringConnected]} />
        <Animated.View style={{transform: [{rotate: isConnecting ? rot : '0deg'}]}}>
          <Monkey state={state} />
        </Animated.View>
      </Pressable>
      <Text style={styles.title}>
        {state === 'connected' ? 'Connected — the jungle hides you' : state === 'connecting' ? 'Connecting…' : 'Disconnected'}
      </Text>
      <Text style={styles.subtitle}>{label}</Text>
    </View>
  );
}

function Monkey({state}) {
  const sleeping = state === 'disconnected';
  const crowned = state === 'connected';
  return (
    <Svg viewBox="0 0 200 200" width={170} height={170}>
      <Defs>
        <RadialGradient id="furG" cx="0.5" cy="0.45" r="0.6">
          <Stop offset="0" stopColor="#5C3A1A" />
          <Stop offset="1" stopColor="#2E1A0A" />
        </RadialGradient>
        <LinearGradient id="crownG" x1="0" x2="1">
          <Stop offset="0" stopColor="#FFE45C" />
          <Stop offset="1" stopColor="#D4A700" />
        </LinearGradient>
      </Defs>
      <Circle cx="50" cy="80" r="22" fill="url(#furG)" />
      <Circle cx="150" cy="80" r="22" fill="url(#furG)" />
      <Circle cx="50" cy="80" r="10" fill="#E8C8A2" />
      <Circle cx="150" cy="80" r="10" fill="#E8C8A2" />
      <Circle cx="100" cy="100" r="62" fill="url(#furG)" />
      {/* face plate */}
      <Path d="M62 120 a38 32 0 1 0 76 0 a38 32 0 1 0 -76 0" fill="#E8C8A2" />
      {sleeping ? (
        <>
          <Path d="M75 100 q10 -8 20 0" stroke="#1B1209" strokeWidth="3" fill="none" />
          <Path d="M105 100 q10 -8 20 0" stroke="#1B1209" strokeWidth="3" fill="none" />
        </>
      ) : (
        <>
          <Circle cx="85" cy="105" r="5" fill="#1B1209" />
          <Circle cx="115" cy="105" r="5" fill="#1B1209" />
        </>
      )}
      <Circle cx="100" cy="125" r="3" fill="#1B1209" />
      {crowned ? (
        <>
          <Path d="M58 60 L 78 30 L 95 55 L 100 25 L 105 55 L 122 30 L 142 60 Z" fill="url(#crownG)" stroke="#7A5A00" strokeWidth="2" />
          <Circle cx="100" cy="42" r="5" fill="#FFFFFF" />
          <Path d="M85 138 q15 12 30 0" stroke="#1B1209" strokeWidth="3" fill="none" />
        </>
      ) : (
        <Path d="M88 138 q12 8 24 0" stroke="#1B1209" strokeWidth="3" fill="none" />
      )}
    </Svg>
  );
}

const styles = StyleSheet.create({
  wrap: {alignItems: 'center', gap: 14},
  button: {
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: colors.forest700,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.gold500,
    shadowOpacity: 0.3,
    shadowRadius: 20,
    shadowOffset: {width: 0, height: 0},
  },
  aura: {
    position: 'absolute',
    width: 230,
    height: 230,
    borderRadius: 115,
    backgroundColor: 'rgba(255,215,0,0.35)',
  },
  ring: {
    position: 'absolute',
    width: 240,
    height: 240,
    borderRadius: 120,
    borderWidth: 2,
    borderColor: 'rgba(255,215,0,0.35)',
  },
  ringConnected: {borderWidth: 4, borderColor: colors.gold500},
  title: {color: colors.gold500, fontSize: 22, marginTop: 18, fontWeight: '700'},
  subtitle: {color: colors.moss300, fontSize: 13},
});
