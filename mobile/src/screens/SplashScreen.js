import React from 'react';
import {ActivityIndicator, StyleSheet, Text, View} from 'react-native';
import {colors} from '../theme';
import Jungle from '../components/Jungle';

export default function SplashScreen() {
  return (
    <Jungle>
      <View style={styles.center}>
        <Text style={styles.emoji}>🐒</Text>
        <Text style={styles.title}>Monkey VPN</Text>
        <ActivityIndicator color={colors.gold500} size="large" style={{marginTop: 16}} />
      </View>
    </Jungle>
  );
}

const styles = StyleSheet.create({
  center: {flex: 1, alignItems: 'center', justifyContent: 'center'},
  emoji: {fontSize: 72},
  title: {color: colors.gold500, fontSize: 28, fontWeight: '800', marginTop: 8},
});
