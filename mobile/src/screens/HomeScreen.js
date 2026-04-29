import React, {useCallback, useEffect, useState} from 'react';
import {Pressable, ScrollView, StyleSheet, Text, View} from 'react-native';
import {colors, radii} from '../theme';
import Jungle from '../components/Jungle';
import MonkeyButton from '../components/MonkeyButton';
import {Card, PrimaryButton, SecondaryButton} from '../components/ui';
import {api} from '../api';
import {useAuth} from '../auth';

export default function HomeScreen({navigation}) {
  const {user} = useAuth();
  const [territories, setTerritories] = useState([]);
  const [chosen, setChosen] = useState(null);
  const [conn, setConn] = useState({active: false});
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  const refreshConn = useCallback(async () => {
    try {
      setConn(await api.connection());
    } catch {
      setConn({active: false});
    }
  }, []);

  useEffect(() => {
    api.territories().then((r) => {
      setTerritories(r.territories);
      if (r.territories.length) setChosen(r.territories[0]);
    });
    refreshConn();
    const id = setInterval(refreshConn, 4000);
    return () => clearInterval(id);
  }, [refreshConn]);

  const state = busy ? 'connecting' : conn.active ? 'connected' : 'disconnected';

  const toggle = async () => {
    setErr('');
    if (state === 'connected') {
      setBusy(true);
      try { await api.disconnect(); } catch (e) { setErr(e.message); }
      await refreshConn();
      setBusy(false);
      return;
    }
    if (!chosen) return;
    setBusy(true);
    try {
      await new Promise((r) => setTimeout(r, 1200));
      await api.connect(chosen.id, {obfuscation: chosen.obfuscation, multi_hop: false});
    } catch (e) { setErr(e.message); }
    await refreshConn();
    setBusy(false);
  };

  const quickSwing = async () => {
    try {
      const r = await api.quickSwing();
      setChosen(r.territory);
    } catch (e) { setErr(e.message); }
  };

  return (
    <Jungle vibrant={conn.active}>
      <ScrollView contentContainerStyle={styles.wrap}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.eyebrow}>Welcome back, {user?.display_name || 'Explorer'}</Text>
            <Text style={styles.title}>Pull the vine to disappear.</Text>
          </View>
        </View>

        <View style={styles.center}>
          <MonkeyButton state={state} onPress={toggle} />
        </View>

        <View style={styles.actions}>
          <SecondaryButton title="🍌 Quick Swing" onPress={quickSwing} style={{flex: 1}} />
          <SecondaryButton title="🌍 Territories" onPress={() => navigation.navigate('Territories')} style={{flex: 1}} />
        </View>
        {!!err && <Text style={styles.err}>{err}</Text>}

        <Card eyebrow="Selected Territory" title={chosen ? `${chosen.flag} ${chosen.name}` : 'Pick a territory'} style={{marginTop: 16}}>
          {chosen && (
            <>
              <Text style={styles.italic}>{chosen.tagline}</Text>
              <View style={styles.statRow}>
                <Stat label="Latency" value={`${chosen.latency_ms} ms`} />
                <Stat label="Load" value={`${chosen.load_pct}%`} />
                <Stat label="Tier" value={chosen.tier} />
              </View>
            </>
          )}
        </Card>

        <Card eyebrow="Top territories" title="Choose another" style={{marginTop: 12}}>
          {territories.slice(0, 5).map((t) => (
            <Pressable
              key={t.id}
              onPress={() => setChosen(t)}
              style={({pressed}) => [
                styles.terrRow,
                chosen?.id === t.id && styles.terrRowActive,
                pressed && {opacity: 0.7},
              ]}>
              <Text style={{fontSize: 22, marginRight: 8}}>{t.flag}</Text>
              <View style={{flex: 1}}>
                <Text style={styles.terrName}>{t.name}</Text>
                <Text style={styles.terrRegion}>{t.region}</Text>
              </View>
              <Text style={styles.terrPing}>{t.latency_ms} ms</Text>
            </Pressable>
          ))}
        </Card>
      </ScrollView>
    </Jungle>
  );
}

function Stat({label, value}) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {padding: 18, paddingBottom: 60},
  headerRow: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'},
  eyebrow: {color: colors.moss300, letterSpacing: 2, textTransform: 'uppercase', fontSize: 11},
  title: {color: colors.gold500, fontSize: 22, fontWeight: '800', marginTop: 2},
  center: {alignItems: 'center', marginVertical: 30},
  actions: {flexDirection: 'row', gap: 10},
  err: {color: colors.danger, textAlign: 'center', marginTop: 8},
  italic: {color: colors.moss300, fontStyle: 'italic'},
  statRow: {flexDirection: 'row', gap: 8, marginTop: 12},
  stat: {flex: 1, backgroundColor: 'rgba(1,24,15,0.5)', borderRadius: radii.md, padding: 8, alignItems: 'center'},
  statValue: {color: colors.gold500, fontWeight: '800', fontSize: 16},
  statLabel: {color: colors.moss300, fontSize: 10, letterSpacing: 1.5, textTransform: 'uppercase'},
  terrRow: {flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: 'rgba(79,121,66,0.15)'},
  terrRowActive: {backgroundColor: 'rgba(15,79,60,0.6)', borderRadius: radii.md, paddingHorizontal: 8},
  terrName: {color: colors.gold500, fontWeight: '700'},
  terrRegion: {color: colors.moss300, fontSize: 11},
  terrPing: {color: colors.moss300},
});
