import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { PrimaryButton } from '@/components/primary-button';
import { Screen } from '@/components/screen';
import { TextField } from '@/components/text-field';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { verifyPin } from '@/services/pin';
import { markUnlocked } from '@/state/session';

export default function LockScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const [checking, setChecking] = useState(false);

  async function handleUnlock() {
    setChecking(true);
    const valid = await verifyPin(pin);
    setChecking(false);
    if (valid) {
      markUnlocked();
      router.replace('/(tabs)');
    } else {
      setError(true);
      setPin('');
    }
  }

  return (
    <Screen>
      <View style={styles.content}>
        <IconSymbol name="lock.fill" size={28} color={colors.tint} />
        <ThemedText type="title" style={styles.title}>
          Code d&apos;accès
        </ThemedText>

        <TextField
          value={pin}
          onChangeText={(value) => {
            setError(false);
            setPin(value.replace(/\D/g, '').slice(0, 6));
          }}
          placeholder="••••"
          keyboardType="number-pad"
          secureTextEntry
          maxLength={6}
          autoFocus
          onSubmitEditing={handleUnlock}
        />
        {error && (
          <ThemedText style={[styles.error, { color: colors.text }]}>Code incorrect.</ThemedText>
        )}
      </View>

      <View style={styles.footer}>
        <PrimaryButton label="Déverrouiller" onPress={handleUnlock} loading={checking} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { flex: 1, justifyContent: 'center', gap: 16 },
  title: { fontSize: 26 },
  error: { fontSize: 14 },
  footer: { paddingBottom: 16 },
});
