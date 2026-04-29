import React, {useEffect, useRef} from 'react';
import {Animated, View, StyleSheet} from 'react-native';
import {colors} from '../theme';

/** Animated jungle backdrop with fireflies. */
export default function Jungle({vibrant, children, style}) {
  const fireflies = Array.from({length: 14}).map((_, i) => i);
  return (
    <View style={[styles.container, style]}>
      <View style={[styles.glow, vibrant && styles.glowVibrant]} />
      {fireflies.map((i) => (
        <Firefly key={i} index={i} vibrant={vibrant} />
      ))}
      <View style={styles.content}>{children}</View>
    </View>
  );
}

function Firefly({index, vibrant}) {
  const opacity = useRef(new Animated.Value(0.2)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {toValue: 1, duration: 1500 + (index % 5) * 200, useNativeDriver: true}),
        Animated.timing(opacity, {toValue: 0.2, duration: 1500 + (index % 5) * 200, useNativeDriver: true}),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [index, opacity]);
  const top = `${(index * 53) % 90 + 5}%`;
  const left = `${(index * 37) % 95 + 2}%`;
  const size = 4 + (index % 3) * 2;
  return (
    <Animated.View
      style={{
        position: 'absolute',
        top,
        left,
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: vibrant ? colors.gold400 : colors.moss300,
        opacity,
        shadowColor: vibrant ? colors.gold400 : colors.moss300,
        shadowOpacity: 0.8,
        shadowRadius: 6,
      }}
    />
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: colors.canopy, overflow: 'hidden'},
  glow: {
    position: 'absolute',
    top: -200,
    left: -100,
    right: -100,
    height: 600,
    backgroundColor: colors.forest800,
    opacity: 0.6,
    borderRadius: 600,
  },
  glowVibrant: {opacity: 0.9, backgroundColor: colors.forest700},
  content: {flex: 1},
});
