import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { PrimaryButton } from '@/components/primary-button';
import { Screen } from '@/components/screen';
import { TextField } from '@/components/text-field';
import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { setWatchedNumber } from '@/services/smsGateway';

function isPlausiblePhoneNumber(value: string): boolean {
  return value.replace(/\D/g, '').length >= 8;
}

export default function NumberSetupScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const [number, setNumber] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleContinue() {
    const trimmed = number.trim();
    if (!isPlausiblePhoneNumber(trimmed)) {
      setError('Numéro invalide.');
      return;
    }
    setError(null);
    setSaving(true);
    await setWatchedNumber(trimmed);
    setSaving(false);
    router.push({ pathname: '/onboarding/verify-number', params: { number: trimmed } });
  }

  return (
    <Screen>
      <View style={styles.content}>
        <ThemedText type="title" style={styles.title}>
          Numéro à surveiller
        </ThemedText>
        <ThemedText style={[styles.description, { color: colors.muted }]}>
          Saisissez le numéro dont les SMS de paiement doivent être capturés.
        </ThemedText>

        <TextField
          value={number}
          onChangeText={(value) => {
            setNumber(value);
            setError(null);
          }}
          placeholder="+33 6 12 34 56 78"
          keyboardType="phone-pad"
          autoFocus
        />
        {error && (
          <ThemedText style={[styles.error, { color: colors.text }]}>{error}</ThemedText>
        )}
      </View>

      <View style={styles.footer}>
        <PrimaryButton label="Continuer" onPress={handleContinue} loading={saving} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { flex: 1, justifyContent: 'center', gap: 16 },
  title: { fontSize: 26 },
  description: { fontSize: 15, lineHeight: 22 },
  error: { fontSize: 14 },
  footer: { paddingBottom: 16 },
});
