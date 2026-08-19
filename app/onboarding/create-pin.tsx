import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { PrimaryButton } from '@/components/primary-button';
import { Screen } from '@/components/screen';
import { TextField } from '@/components/text-field';
import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { clearPin, setPin } from '@/services/pin';
import { setOnboardingComplete } from '@/services/settings';
import { markUnlocked } from '@/state/session';

export default function CreatePinScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const { mode } = useLocalSearchParams<{ mode?: string }>();
  const isEdit = mode === 'edit';
  const [step, setStep] = useState<'choose' | 'confirm'>('choose');
  const [pin, setPinValue] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [error, setError] = useState<string | null>(null);

  async function finish() {
    if (isEdit) {
      router.back();
      return;
    }
    await setOnboardingComplete(true);
    markUnlocked();
    router.replace('/(tabs)');
  }

  async function handleSkip() {
    if (isEdit) {
      await clearPin();
    }
    finish();
  }

  function handleContinue() {
    if (step === 'choose') {
      if (pin.length < 4) {
        setError('Le code doit contenir au moins 4 chiffres.');
        return;
      }
      setError(null);
      setStep('confirm');
      return;
    }
    if (confirmation !== pin) {
      setError('Les codes ne correspondent pas.');
      setConfirmation('');
      return;
    }
    setPin(pin).then(finish);
  }

  return (
    <Screen>
      <View style={styles.content}>
        <ThemedText type="title" style={styles.title}>
          {step === 'choose' ? 'Choisissez un code' : 'Confirmez le code'}
        </ThemedText>
        <ThemedText style={[styles.description, { color: colors.muted }]}>
          Ce code protège l&apos;accès à l&apos;application sur cet appareil.
        </ThemedText>

        <TextField
          value={step === 'choose' ? pin : confirmation}
          onChangeText={(value) => {
            setError(null);
            if (step === 'choose') setPinValue(value.replace(/\D/g, '').slice(0, 6));
            else setConfirmation(value.replace(/\D/g, '').slice(0, 6));
          }}
          placeholder="••••"
          keyboardType="number-pad"
          secureTextEntry
          maxLength={6}
          autoFocus
        />
        {error && <ThemedText style={[styles.error, { color: colors.text }]}>{error}</ThemedText>}
      </View>

      <View style={styles.footer}>
        <PrimaryButton label="Continuer" onPress={handleContinue} />
        <Pressable style={styles.skip} onPress={handleSkip}>
          <ThemedText style={[styles.skipLabel, { color: colors.muted }]}>
            {isEdit ? 'Désactiver le code' : 'Passer cette étape'}
          </ThemedText>
        </Pressable>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { flex: 1, justifyContent: 'center', gap: 16 },
  title: { fontSize: 26 },
  description: { fontSize: 15, lineHeight: 22 },
  error: { fontSize: 14 },
  footer: { paddingBottom: 16, gap: 12 },
  skip: { alignItems: 'center', paddingVertical: 8 },
  skipLabel: { fontSize: 14 },
});
