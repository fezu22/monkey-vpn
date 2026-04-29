import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import {colors, radii} from '../theme';

export function Card({title, eyebrow, children, style}) {
  return (
    <View style={[styles.card, style]}>
      {(eyebrow || title) && (
        <View style={{marginBottom: 8}}>
          {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
          {title ? <Text style={styles.title}>{title}</Text> : null}
        </View>
      )}
      {children}
    </View>
  );
}

export function PrimaryButton({title, onPress, disabled, style}) {
  return (
    <Pressable onPress={onPress} disabled={disabled} style={({pressed}) => [
      styles.primary,
      disabled && {opacity: 0.5},
      pressed && {transform: [{scale: 0.98}]},
      style,
    ]}>
      <Text style={styles.primaryText}>{title}</Text>
    </Pressable>
  );
}

export function SecondaryButton({title, onPress, style}) {
  return (
    <Pressable onPress={onPress} style={({pressed}) => [styles.secondary, pressed && {opacity: 0.7}, style]}>
      <Text style={styles.secondaryText}>{title}</Text>
    </Pressable>
  );
}

export function Toggle({label, hint, value, onChange}) {
  return (
    <Pressable onPress={() => onChange(!value)} style={styles.toggleRow}>
      <View style={{flex: 1}}>
        <Text style={styles.toggleLabel}>{label}</Text>
        {hint ? <Text style={styles.toggleHint}>{hint}</Text> : null}
      </View>
      <View style={[styles.track, value && styles.trackOn]}>
        <View style={[styles.knob, value && styles.knobOn]} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(11,61,46,0.5)',
    borderRadius: radii.lg,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(157,201,134,0.18)',
  },
  eyebrow: {color: colors.moss300, fontSize: 11, letterSpacing: 2, textTransform: 'uppercase'},
  title: {color: colors.gold500, fontSize: 20, fontWeight: '700', marginTop: 2},
  primary: {
    backgroundColor: colors.gold500,
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: radii.pill,
    alignItems: 'center',
  },
  primaryText: {color: colors.canopy, fontWeight: '800', fontSize: 16},
  secondary: {
    borderWidth: 1,
    borderColor: 'rgba(157,201,134,0.4)',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: radii.pill,
    alignItems: 'center',
  },
  secondaryText: {color: colors.moss300, fontWeight: '700'},
  toggleRow: {flexDirection: 'row', alignItems: 'center', paddingVertical: 12},
  toggleLabel: {color: colors.gold500, fontWeight: '700', fontSize: 15},
  toggleHint: {color: colors.moss300, fontSize: 12, marginTop: 2},
  track: {
    width: 44,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.forest700,
    padding: 2,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(157,201,134,0.4)',
  },
  trackOn: {backgroundColor: colors.gold500},
  knob: {width: 22, height: 22, borderRadius: 11, backgroundColor: colors.canopy},
  knobOn: {transform: [{translateX: 18}]},
});
