import React, {useEffect, useState} from 'react';
import {ScrollView, StyleSheet, Text, View} from 'react-native';
import {colors, radii} from '../theme';
import Jungle from '../components/Jungle';
import {Card, PrimaryButton} from '../components/ui';
import {api} from '../api';

export default function AgilityScreen() {
  const [list, setList] = useState([]);
  const [chosen, setChosen] = useState(null);
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api.territories().then((r) => {
      setList(r.territories);
      if (r.territories.length) setChosen(r.territories[0]);
    });
  }, []);

  const run = async () => {
    if (!chosen) return;
    setBusy(true);
    try {
      const r = await api.agility(chosen.id);
      setResult(r);
    } finally { setBusy(false); }
  };

  return (
    <Jungle>
      <ScrollView contentContainerStyle={styles.wrap}>
        <Text style={styles.eyebrow}>Monkey Agility Test</Text>
        <Text style={styles.title}>How fast can the troop swing?</Text>

        <Card eyebrow="Pick a territory" title={chosen ? `${chosen.flag} ${chosen.name}` : ''} style={{marginTop: 12}}>
          <View style={{flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 6}}>
            {list.slice(0, 8).map((t) => (
              <Text
                key={t.id}
                onPress={() => setChosen(t)}
                style={[styles.chip, chosen?.id === t.id && styles.chipActive]}>
                {t.flag} {t.name}
              </Text>
            ))}
          </View>
          <PrimaryButton title={busy ? 'Running…' : '⚡ Run Agility Test'} onPress={run} disabled={busy} style={{marginTop: 14}} />
        </Card>

        {result && (
          <Card eyebrow="Result" title={result.verdict} style={{marginTop: 12}}>
            <View style={styles.statRow}>
              <Stat label="Ping" value={`${result.ping_ms} ms`} />
              <Stat label="Down" value={`${result.download_mbps.toFixed(0)} Mbps`} />
              <Stat label="Up" value={`${result.upload_mbps.toFixed(0)} Mbps`} />
              <Stat label="Score" value={result.score} />
            </View>
          </Card>
        )}
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
  wrap: {padding: 18},
  eyebrow: {color: colors.moss300, letterSpacing: 2, textTransform: 'uppercase', fontSize: 11},
  title: {color: colors.gold500, fontSize: 22, fontWeight: '800', marginTop: 2},
  chip: {
    color: colors.moss300, paddingHorizontal: 10, paddingVertical: 6,
    borderRadius: 999, borderWidth: 1, borderColor: 'rgba(157,201,134,0.3)',
  },
  chipActive: {backgroundColor: colors.gold500, color: colors.canopy, borderColor: colors.gold500, fontWeight: '800'},
  statRow: {flexDirection: 'row', gap: 8, marginTop: 4, flexWrap: 'wrap'},
  stat: {flexBasis: '48%', backgroundColor: 'rgba(1,24,15,0.5)', borderRadius: radii.md, padding: 10, alignItems: 'center'},
  statValue: {color: colors.gold500, fontWeight: '800', fontSize: 18},
  statLabel: {color: colors.moss300, fontSize: 10, letterSpacing: 1.5, textTransform: 'uppercase'},
});
