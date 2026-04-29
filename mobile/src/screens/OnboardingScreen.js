import React, {useState} from 'react';
import {Pressable, ScrollView, StyleSheet, Text, View} from 'react-native';
import {colors, radii} from '../theme';
import Jungle from '../components/Jungle';
import {PrimaryButton, SecondaryButton} from '../components/ui';

const screens = [
  {emoji: '🌴', title: 'The Internet is a wild place.', body: 'Trackers lurk behind every leaf. Public Wi-Fi is a swamp full of crocodiles.'},
  {emoji: '🦍', title: 'A monkey knows the safe paths.', body: 'WireGuard for speed. OpenVPN when censors are listening.'},
  {emoji: '🌿', title: 'Your trail vanishes.', body: 'AES-256-GCM, RSA-4096, RAM-only servers. We literally cannot keep logs.'},
  {emoji: '🍌', title: 'Pick your monkey.', body: 'Unlock new monkey avatars by raising your Stealth Level.'},
];

export default function OnboardingScreen({navigation}) {
  const [i, setI] = useState(0);
  const last = i === screens.length - 1;
  return (
    <Jungle>
      <ScrollView contentContainerStyle={styles.wrap}>
        <View style={styles.card}>
          <Text style={styles.eyebrow}>Expedition Briefing · {i + 1} / {screens.length}</Text>
          <Text style={styles.emoji}>{screens[i].emoji}</Text>
          <Text style={styles.title}>{screens[i].title}</Text>
          <Text style={styles.body}>{screens[i].body}</Text>
          <View style={styles.dots}>
            {screens.map((_, idx) => (
              <View key={idx} style={[styles.dot, idx === i && styles.dotActive]} />
            ))}
          </View>
          <View style={styles.actions}>
            <SecondaryButton
              title={i === 0 ? 'Skip' : 'Previous'}
              onPress={() => (i === 0 ? navigation.replace('Login') : setI(i - 1))}
            />
            {last ? (
              <PrimaryButton title="Enter the jungle →" onPress={() => navigation.replace('Login')} />
            ) : (
              <PrimaryButton title="Next →" onPress={() => setI(i + 1)} />
            )}
          </View>
        </View>
      </ScrollView>
    </Jungle>
  );
}

const styles = StyleSheet.create({
  wrap: {flexGrow: 1, justifyContent: 'center', padding: 20},
  card: {backgroundColor: 'rgba(11,61,46,0.55)', borderRadius: radii.xl, padding: 28, alignItems: 'center'},
  eyebrow: {color: colors.moss300, letterSpacing: 2, textTransform: 'uppercase', fontSize: 11},
  emoji: {fontSize: 80, marginVertical: 16},
  title: {color: colors.gold500, fontSize: 26, fontWeight: '800', textAlign: 'center'},
  body: {color: colors.moss300, fontSize: 14, textAlign: 'center', marginTop: 8},
  dots: {flexDirection: 'row', gap: 6, marginVertical: 20},
  dot: {width: 8, height: 8, borderRadius: 4, backgroundColor: 'rgba(79,121,66,0.5)'},
  dotActive: {width: 28, backgroundColor: colors.gold500},
  actions: {flexDirection: 'row', gap: 10, alignSelf: 'stretch', justifyContent: 'space-between'},
});
