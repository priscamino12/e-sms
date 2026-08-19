import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AppState, Pressable, StyleSheet, View } from 'react-native';

import { PrimaryButton } from '@/components/primary-button';
import { Screen } from '@/components/screen';
import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { listMessages } from '@/services/messages';
import { getSettings, setNumberVerified } from '@/services/settings';
import { subscribeToIncomingMessages, syncPendingMessages } from '@/services/smsGateway';
import { generateVerificationCode } from '@/utils/verification-code';

export default function VerifyNumberScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const { number } = useLocalSearchParams<{ number: string }>();
  const code = useMemo(() => generateVerificationCode(), []);
  const [checking, setChecking] = useState(false);
  const settledRef = useRef(false);

  const checkForVerification = useCallback(async () => {
    if (settledRef.current) return;
    await syncPendingMessages();
    const messages = await listMessages();
    const match = messages.find((message) => message.body.includes(code));
    if (match && !settledRef.current) {
      settledRef.current = true;
      await setNumberVerified(true);
      const settings = await getSettings();
      router.replace(settings.onboardingComplete ? '/(tabs)/settings' : '/onboarding/create-pin');
    }
  }, [code]);

  useEffect(() => {
    const subscription = subscribeToIncomingMessages(() => {
      checkForVerification();
    });
    const appStateSubscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') checkForVerification();
    });
    checkForVerification();
    return () => {
      subscription.remove();
      appStateSubscription.remove();
    };
  }, [checkForVerification]);

  async function handleManualCheck() {
    setChecking(true);
    await checkForVerification();
    setChecking(false);
  }

  async function handleDevSkip() {
    if (settledRef.current) return;
    settledRef.current = true;
    await setNumberVerified(true);
    const settings = await getSettings();
    router.replace(settings.onboardingComplete ? '/(tabs)/settings' : '/onboarding/create-pin');
  }

  return (
    <Screen>
      <View style={styles.content}>
        <ThemedText type="title" style={styles.title}>
          Vérifier le numéro
        </ThemedText>
        <ThemedText style={[styles.description, { color: colors.muted }]}>
          Avec un autre téléphone, envoyez le code ci-dessous par SMS depuis le {number} vers ce
          téléphone-passerelle.
        </ThemedText>

        <View style={[styles.codeBox, { borderColor: colors.border, backgroundColor: colors.surface }]}>
          <ThemedText style={styles.code}>{code}</ThemedText>
        </View>

        <ThemedText style={[styles.hint, { color: colors.muted }]}>
          Cette étape confirme une seule fois que le numéro est actif — elle ne sera plus
          redemandée ensuite.
        </ThemedText>
      </View>

      <View style={styles.footer}>
        <PrimaryButton label="J'ai envoyé le SMS" onPress={handleManualCheck} loading={checking} />
        {__DEV__ && (
          <Pressable style={styles.skip} onPress={handleDevSkip}>
            <ThemedText style={[styles.skipLabel, { color: colors.muted }]}>
              Passer la vérification (dev)
            </ThemedText>
          </Pressable>
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { flex: 1, justifyContent: 'center', gap: 16 },
  title: { fontSize: 26 },
  description: { fontSize: 15, lineHeight: 22 },
  codeBox: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 12,
    paddingVertical: 20,
    alignItems: 'center',
  },
  code: { fontSize: 32, fontWeight: '700', letterSpacing: 6 },
  hint: { fontSize: 13, lineHeight: 18 },
  footer: { paddingBottom: 16, gap: 12 },
  skip: { alignItems: 'center', paddingVertical: 8 },
  skipLabel: { fontSize: 14 },
});
