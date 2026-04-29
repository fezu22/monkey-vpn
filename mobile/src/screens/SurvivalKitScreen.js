import React, {useEffect, useState} from 'react';
import {Pressable, ScrollView, StyleSheet, Text, View} from 'react-native';
import {colors, radii} from '../theme';
import Jungle from '../components/Jungle';
import {Card, Toggle} from '../components/ui';
import {api} from '../api';

const presetApps = ['Banana Bank', 'Treehouse Browser', 'Vine Streamer', 'Coconut Mail', 'Jungle Maps', 'Howler Chat'];

export default function SurvivalKitScreen() {
  const [s, setS] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => { api.settings().then(setS); }, []);

  const update = async (patch) => {
    const next = {...s, ...patch};
    setS(next);
    setSaving(true);
    try { await api.updateSettings(next); } finally { setSaving(false); }
  };
  const toggleApp = (app) => {
    const has = s.split_tunnel_apps.includes(app);
    const next = has ? s.split_tunnel_apps.filter((a) => a !== app) : [...s.split_tunnel_apps, app];
    update({split_tunnel_apps: next});
  };

  if (!s) return <Jungle><Text style={{color: colors.moss300, padding: 18}}>Opening the kit…</Text></Jungle>;

  return (
    <Jungle>
      <ScrollView contentContainerStyle={styles.wrap}>
        <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end'}}>
          <View>
            <Text style={styles.eyebrow}>Survival Kit</Text>
            <Text style={styles.title}>Tools every monkey carries.</Text>
          </View>
          <Text style={styles.saving}>{saving ? 'Saving…' : 'Saved'}</Text>
        </View>

        <Card eyebrow="Defenses" title="Privacy" style={{marginTop: 14}}>
          <Toggle label="The Vines (Kill Switch)" hint="Cuts internet instantly if the tunnel drops."
            value={s.kill_switch} onChange={(v) => update({kill_switch: v})} />
          <Toggle label="DNS Leak Protection" hint="Force all DNS through encrypted resolvers."
            value={s.dns_leak_protection} onChange={(v) => update({dns_leak_protection: v})} />
          <Toggle label="Camo Mode (Obfuscation)" hint="Disguise VPN traffic as normal HTTPS."
            value={s.camo_mode} onChange={(v) => update({camo_mode: v})} />
          <Toggle label="Double Jungle (Multi-Hop)" hint="Two-territory routing for paranoid mode."
            value={s.multi_hop} onChange={(v) => update({multi_hop: v})} />
        </Card>

        <Card eyebrow="Habits" title="Behaviour" style={{marginTop: 12}}>
          <Toggle label="Auto-Connect on launch" value={s.auto_connect} onChange={(v) => update({auto_connect: v})} />
          <Text style={[styles.fieldLabel, {marginTop: 12}]}>Protocol</Text>
          <View style={{flexDirection: 'row', gap: 8, marginTop: 6}}>
            {['wireguard', 'openvpn'].map((p) => (
              <Pressable
                key={p}
                onPress={() => update({protocol: p})}
                style={[styles.proto, s.protocol === p && styles.protoActive]}>
                <Text style={[styles.protoText, s.protocol === p && styles.protoTextActive]}>
                  {p === 'wireguard' ? 'WireGuard' : 'OpenVPN'}
                </Text>
              </Pressable>
            ))}
          </View>
        </Card>

        <Card eyebrow="Apps that go through the VPN" title="Choose Your Path" style={{marginTop: 12, marginBottom: 24}}>
          <View style={{flexDirection: 'row', flexWrap: 'wrap', gap: 6}}>
            {presetApps.map((app) => {
              const on = s.split_tunnel_apps.includes(app);
              return (
                <Text key={app} onPress={() => toggleApp(app)} style={[styles.chip, on && styles.chipActive]}>
                  {on ? '🍌 ' : ''}{app}
                </Text>
              );
            })}
          </View>
        </Card>
      </ScrollView>
    </Jungle>
  );
}

const styles = StyleSheet.create({
  wrap: {padding: 18},
  eyebrow: {color: colors.moss300, letterSpacing: 2, textTransform: 'uppercase', fontSize: 11},
  title: {color: colors.gold500, fontSize: 22, fontWeight: '800', marginTop: 2},
  saving: {color: colors.moss300, fontSize: 11},
  fieldLabel: {color: colors.gold500, fontWeight: '700'},
  proto: {paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999, borderWidth: 1, borderColor: 'rgba(157,201,134,0.3)'},
  protoActive: {backgroundColor: colors.gold500, borderColor: colors.gold500},
  protoText: {color: colors.moss300},
  protoTextActive: {color: colors.canopy, fontWeight: '800'},
  chip: {color: colors.moss300, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, borderWidth: 1, borderColor: 'rgba(157,201,134,0.3)'},
  chipActive: {backgroundColor: colors.gold500, color: colors.canopy, borderColor: colors.gold500, fontWeight: '800'},
});
