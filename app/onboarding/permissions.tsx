import { router } from 'expo-router';
import { useState } from 'react';
import { Linking, StyleSheet, View } from 'react-native';

import { PrimaryButton } from '@/components/primary-button';
import { Screen } from '@/components/screen';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { isSmsSupported, requestSmsPermissions } from '@/services/smsGateway';

export default function PermissionsScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const [status, setStatus] = useState<'idle' | 'requesting' | 'denied' | 'blocked'>('idle');

  async function handleRequest() {
    setStatus('requesting');
    const result = await requestSmsPermissions();
    if (result === 'granted') {
      router.push('/onboarding/number-setup');
    } else {
      setStatus(result);
    }
  }

  if (!isSmsSupported) {
    return (
      <Screen>
        <View style={styles.center}>
          <IconSymbol name="exclamationmark.triangle.fill" size={32} color={colors.icon} />
          <ThemedText type="title" style={styles.title}>
            Android requis
          </ThemedText>
          <ThemedText style={[styles.description, { color: colors.muted }]}>
            La réception automatique des SMS est une fonctionnalité du système Android. Cet
            appareil ne peut pas faire office de passerelle SMS.
          </ThemedText>
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <View style={styles.content}>
        <IconSymbol name="message.fill" size={32} color={colors.tint} />
        <ThemedText type="title" style={styles.title}>
          Accès aux SMS
        </ThemedText>
        <ThemedText style={[styles.description, { color: colors.muted }]}>
          Cette application lit et conserve les SMS reçus d&apos;un seul numéro que vous
          choisirez à l&apos;étape suivante. Elle ne peut jamais en envoyer.
        </ThemedText>

        {status === 'denied' && (
          <ThemedText style={[styles.notice, { color: colors.text }]}>
            Autorisation refusée. Vous pouvez réessayer.
          </ThemedText>
        )}
        {status === 'blocked' && (
          <ThemedText style={[styles.notice, { color: colors.text }]}>
            L&apos;autorisation a été bloquée. Ouvrez les réglages de l&apos;application pour
            l&apos;activer manuellement.
          </ThemedText>
        )}
      </View>

      <View style={styles.footer}>
        {status === 'blocked' ? (
          <PrimaryButton label="Ouvrir les réglages" onPress={() => Linking.openSettings()} />
        ) : (
          <PrimaryButton
            label="Autoriser l'accès"
            onPress={handleRequest}
            loading={status === 'requesting'}
          />
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { flex: 1, justifyContent: 'center', gap: 16 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16 },
  title: { fontSize: 26 },
  description: { fontSize: 15, lineHeight: 22 },
  notice: { fontSize: 14, lineHeight: 20 },
  footer: { paddingBottom: 16 },
});
