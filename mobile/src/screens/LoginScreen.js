import React, {useState} from 'react';
import {KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View} from 'react-native';
import {colors, radii} from '../theme';
import Jungle from '../components/Jungle';
import {PrimaryButton} from '../components/ui';
import {useAuth} from '../auth';

export default function LoginScreen() {
  const {login, register} = useAuth();
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setErr('');
    setBusy(true);
    try {
      if (mode === 'login') await login(email, password);
      else await register(email, password, name);
    } catch (e) {
      setErr(e.message || 'Something went wrong');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Jungle>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{flex: 1}}>
        <ScrollView contentContainerStyle={styles.wrap}>
          <Text style={styles.eyebrow}>{mode === 'login' ? 'Welcome back' : 'Join the troop'}</Text>
          <Text style={styles.title}>
            {mode === 'login' ? 'Pull the right vine.' : 'Plant a banana.'}
          </Text>
          {mode === 'register' && (
            <Field label="Display name" value={name} onChange={setName} placeholder="Banana Joe" />
          )}
          <Field label="Email" value={email} onChange={setEmail} placeholder="explorer@jungle.io" keyboardType="email-address" autoCapitalize="none" />
          <Field label="Password" value={password} onChange={setPassword} placeholder="At least 6 characters" secureTextEntry />
          {!!err && <Text style={styles.err}>{err}</Text>}
          <PrimaryButton title={busy ? 'Swinging…' : mode === 'login' ? 'Sign in' : 'Create account'} onPress={submit} disabled={busy} style={{marginTop: 12}} />
          <Pressable onPress={() => setMode(mode === 'login' ? 'register' : 'login')}>
            <Text style={styles.swap}>
              {mode === 'login' ? 'New here? Plant a banana →' : 'Already have an account? Sign in →'}
            </Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </Jungle>
  );
}

function Field({label, ...rest}) {
  return (
    <View style={{marginTop: 12}}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        {...rest}
        onChangeText={rest.onChange}
        placeholderTextColor="rgba(157,201,134,0.4)"
        style={styles.input}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {padding: 24, flexGrow: 1, justifyContent: 'center'},
  eyebrow: {color: colors.moss300, letterSpacing: 2, textTransform: 'uppercase', fontSize: 11},
  title: {color: colors.gold500, fontSize: 28, fontWeight: '800', marginTop: 4, marginBottom: 16},
  fieldLabel: {color: colors.moss300, letterSpacing: 1.5, textTransform: 'uppercase', fontSize: 11, marginBottom: 6},
  input: {
    backgroundColor: 'rgba(1,24,15,0.7)',
    borderWidth: 1,
    borderColor: 'rgba(157,201,134,0.3)',
    borderRadius: radii.md,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: colors.text,
    fontSize: 15,
  },
  err: {color: colors.danger, marginTop: 8},
  swap: {color: colors.moss300, marginTop: 16, textAlign: 'center'},
});
