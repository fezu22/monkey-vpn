import React, {useEffect, useState} from 'react';
import {Pressable, ScrollView, StyleSheet, Text, View} from 'react-native';
import {colors, radii} from '../theme';
import Jungle from '../components/Jungle';
import {Card, SecondaryButton} from '../components/ui';
import {api} from '../api';
import {useAuth} from '../auth';

const monkeyEmoji = {lemur: '🦝', capuchin: '🐒', spider: '🕷️', orangutan: '🦧', gorilla: '🦍', mandrill: '🐵'};

export default function ProfileScreen() {
  const {user, refresh, logout} = useAuth();
  const [avatars, setAvatars] = useState([]);

  useEffect(() => { api.avatars().then((r) => setAvatars(r.avatars)); }, [user]);

  const equip = async (slug) => {
    await api.equipAvatar(slug);
    await refresh();
    setAvatars((await api.avatars()).avatars);
  };

  return (
    <Jungle>
      <ScrollView contentContainerStyle={styles.wrap}>
        <Text style={styles.eyebrow}>My Monkey</Text>
        <Text style={styles.title}>Profile & gamification</Text>

        <Card eyebrow="You" title="The Explorer" style={{marginTop: 14}}>
          <View style={{flexDirection: 'row', alignItems: 'center', gap: 14}}>
            <View style={styles.avatar}><Text style={{fontSize: 36}}>{monkeyEmoji[user?.avatar_slug] || '🐒'}</Text></View>
            <View style={{flex: 1}}>
              <Text style={styles.name}>{user?.display_name}</Text>
              <Text style={styles.email}>{user?.email}</Text>
              <Text style={styles.meta}>Tier: <Text style={{color: colors.gold500}}>{user?.tier}</Text> · Stealth Lv {user?.stealth_level}</Text>
            </View>
          </View>
        </Card>

        <Card eyebrow="Avatars" title="Unlock more monkeys" style={{marginTop: 12}}>
          {avatars.map((a) => (
            <Pressable
              key={a.slug}
              disabled={!a.unlocked}
              onPress={() => equip(a.slug)}
              style={[styles.avatarRow, !a.unlocked && {opacity: 0.5}, user?.avatar_slug === a.slug && styles.avatarRowActive]}>
              <Text style={{fontSize: 28, marginRight: 10}}>{monkeyEmoji[a.slug] || '🐒'}</Text>
              <View style={{flex: 1}}>
                <Text style={styles.avatarName}>{a.name}</Text>
                <Text style={styles.avatarDesc}>{a.description}</Text>
              </View>
              {!a.unlocked && <Text style={styles.locked}>Lv {a.unlock_level}</Text>}
            </Pressable>
          ))}
        </Card>

        <SecondaryButton title="Climb down (logout)" onPress={logout} style={{marginTop: 16}} />
      </ScrollView>
    </Jungle>
  );
}

const styles = StyleSheet.create({
  wrap: {padding: 18, paddingBottom: 60},
  eyebrow: {color: colors.moss300, letterSpacing: 2, textTransform: 'uppercase', fontSize: 11},
  title: {color: colors.gold500, fontSize: 22, fontWeight: '800', marginTop: 2},
  avatar: {width: 64, height: 64, borderRadius: 32, backgroundColor: colors.canopy, borderWidth: 2, borderColor: 'rgba(255,215,0,0.4)', alignItems: 'center', justifyContent: 'center'},
  name: {color: colors.gold500, fontWeight: '800', fontSize: 18},
  email: {color: colors.moss300, fontSize: 12},
  meta: {color: colors.moss300, fontSize: 12, marginTop: 4},
  avatarRow: {flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderRadius: radii.md, paddingHorizontal: 6},
  avatarRowActive: {borderWidth: 2, borderColor: colors.gold500},
  avatarName: {color: colors.gold500, fontWeight: '700'},
  avatarDesc: {color: colors.moss300, fontSize: 12},
  locked: {color: colors.moss300, fontSize: 11},
});
