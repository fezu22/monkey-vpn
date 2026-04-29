import React, {useEffect, useMemo, useState} from 'react';
import {FlatList, Pressable, StyleSheet, Text, TextInput, View} from 'react-native';
import {colors, radii} from '../theme';
import Jungle from '../components/Jungle';
import {Card, PrimaryButton} from '../components/ui';
import {api} from '../api';

export default function TerritoriesScreen({navigation}) {
  const [list, setList] = useState([]);
  const [q, setQ] = useState('');
  const [busy, setBusy] = useState(null);

  useEffect(() => { api.territories().then((r) => setList(r.territories)); }, []);

  const filtered = useMemo(
    () =>
      list.filter(
        (t) =>
          q === '' ||
          t.name.toLowerCase().includes(q.toLowerCase()) ||
          t.region.toLowerCase().includes(q.toLowerCase()),
      ),
    [list, q],
  );

  const connect = async (t) => {
    setBusy(t.id);
    try {
      await api.connect(t.id, {obfuscation: t.obfuscation});
      navigation.navigate('Home');
    } finally { setBusy(null); }
  };

  return (
    <Jungle>
      <View style={styles.wrap}>
        <Text style={styles.eyebrow}>All Territories</Text>
        <Text style={styles.title}>Where shall we hide today?</Text>
        <TextInput
          value={q}
          onChangeText={setQ}
          placeholder="Search…"
          placeholderTextColor="rgba(157,201,134,0.4)"
          style={styles.search}
        />
        <FlatList
          data={filtered}
          keyExtractor={(t) => t.id}
          renderItem={({item: t}) => (
            <Card eyebrow={t.region} title={`${t.flag} ${t.name}`} style={{marginBottom: 10}}>
              <Text style={styles.italic}>{t.tagline}</Text>
              <View style={styles.statRow}>
                <Stat label="Ping" value={`${t.latency_ms} ms`} />
                <Stat label="Load" value={`${t.load_pct}%`} />
                <Stat label="Tier" value={t.tier} />
              </View>
              <View style={styles.tags}>
                {t.obfuscation && <Tag label="🦎 Camo" />}
                {t.multi_hop && <Tag label="🐒🐒 Multi-hop" />}
              </View>
              <PrimaryButton
                title={busy === t.id ? 'Swinging…' : 'Connect'}
                onPress={() => connect(t)}
                disabled={busy === t.id}
                style={{marginTop: 10}}
              />
            </Card>
          )}
        />
      </View>
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
function Tag({label}) {
  return <Text style={styles.tag}>{label}</Text>;
}

const styles = StyleSheet.create({
  wrap: {flex: 1, padding: 18},
  eyebrow: {color: colors.moss300, letterSpacing: 2, textTransform: 'uppercase', fontSize: 11},
  title: {color: colors.gold500, fontSize: 22, fontWeight: '800', marginTop: 2, marginBottom: 12},
  search: {
    backgroundColor: 'rgba(1,24,15,0.7)',
    borderWidth: 1,
    borderColor: 'rgba(157,201,134,0.3)',
    borderRadius: radii.md,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: colors.text,
    marginBottom: 12,
  },
  italic: {color: colors.moss300, fontStyle: 'italic'},
  statRow: {flexDirection: 'row', gap: 8, marginTop: 10},
  stat: {flex: 1, backgroundColor: 'rgba(1,24,15,0.5)', borderRadius: radii.md, padding: 8, alignItems: 'center'},
  statValue: {color: colors.gold500, fontWeight: '800', fontSize: 14},
  statLabel: {color: colors.moss300, fontSize: 10, letterSpacing: 1.5, textTransform: 'uppercase'},
  tags: {flexDirection: 'row', gap: 6, marginTop: 8},
  tag: {color: colors.moss300, backgroundColor: colors.forest700, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999, fontSize: 11},
});
