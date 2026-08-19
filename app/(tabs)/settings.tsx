import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';

import { DangerButton } from '@/components/danger-button';
import { PrimaryButton } from '@/components/primary-button';
import { Screen } from '@/components/screen';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { deleteAllMessages } from '@/services/messages';
import { clearPin, hasPin } from '@/services/pin';
import { getSettings, resetSettings } from '@/services/settings';
import { hasSmsPermissions, isSmsSupported, requestSmsPermissions } from '@/services/smsGateway';

type State = {
  watchedNumber: string | null;
  numberVerified: boolean;
  permissionsGranted: boolean;
  pinEnabled: boolean;
};

export default function SettingsScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const [state, setState] = useState<State | null>(null);

  const refresh = useCallback(async () => {
    const [settings, permissionsGranted, pinEnabled] = await Promise.all([
      getSettings(),
      hasSmsPermissions(),
      hasPin(),
    ]);
    setState({
      watchedNumber: settings.watchedNumber,
      numberVerified: settings.numberVerified,
      permissionsGranted,
      pinEnabled,
    });
  }, []);

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  function handleReset() {
    Alert.alert(
      "Réinitialiser l'application ?",
      'Le numéro surveillé, le code d’accès et tous les messages enregistrés seront supprimés.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Réinitialiser',
          style: 'destructive',
          onPress: async () => {
            await Promise.all([deleteAllMessages(), resetSettings(), clearPin()]);
            router.replace('/onboarding/permissions');
          },
        },
      ]
    );
  }

  if (!state) return <Screen />;

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content}>
        <ThemedText type="title" style={styles.header}>
          Réglages
        </ThemedText>

        <Section title="Numéro surveillé">
          <ThemedText style={styles.value}>{state.watchedNumber ?? '—'}</ThemedText>
          <Row
            icon={state.numberVerified ? 'checkmark.circle.fill' : 'exclamationmark.triangle.fill'}
            label={state.numberVerified ? 'Vérifié' : 'Non vérifié'}
            color={colors.muted}
          />
        </Section>

        <Section title="Permissions SMS">
          {isSmsSupported ? (
            <>
              <Row
                icon={state.permissionsGranted ? 'checkmark.circle.fill' : 'exclamationmark.triangle.fill'}
                label={state.permissionsGranted ? 'Accordées' : 'Non accordées'}
                color={colors.muted}
              />
              {!state.permissionsGranted && (
                <PrimaryButton
                  label="Autoriser l'accès"
                  onPress={async () => {
                    await requestSmsPermissions();
                    refresh();
                  }}
                />
              )}
            </>
          ) : (
            <ThemedText style={[styles.value, { color: colors.muted }]}>
              Non applicable sur cette plateforme.
            </ThemedText>
          )}
        </Section>

        <Section title="Sécurité">
          <Row
            icon="lock.fill"
            label={state.pinEnabled ? 'Code d’accès activé' : 'Code d’accès désactivé'}
            color={colors.muted}
          />
          <PrimaryButton
            label={state.pinEnabled ? 'Modifier le code' : 'Activer un code'}
            onPress={() => router.push({ pathname: '/onboarding/create-pin', params: { mode: 'edit' } })}
          />
        </Section>

        <Section title="Données">
          <ThemedText style={[styles.description, { color: colors.muted }]}>
            Les messages sont conservés uniquement sur cet appareil. Une future synchronisation
            avec l&apos;application web se fera via une API dédiée.
          </ThemedText>
          <DangerButton label="Réinitialiser l'application" onPress={handleReset} />
        </Section>
      </ScrollView>
    </Screen>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  return (
    <View style={[styles.section, { borderColor: colors.border }]}>
      <ThemedText style={[styles.sectionTitle, { color: colors.muted }]}>{title}</ThemedText>
      <View style={styles.sectionBody}>{children}</View>
    </View>
  );
}

function Row({
  icon,
  label,
  color,
}: {
  icon: React.ComponentProps<typeof IconSymbol>['name'];
  label: string;
  color: string;
}) {
  return (
    <View style={styles.row}>
      <IconSymbol name={icon} size={16} color={color} />
      <ThemedText style={[styles.rowLabel, { color }]}>{label}</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 24, paddingBottom: 32, gap: 24 },
  header: { fontSize: 28, paddingTop: 8 },
  section: { borderTopWidth: StyleSheet.hairlineWidth, paddingTop: 16, gap: 12 },
  sectionTitle: { fontSize: 13, textTransform: 'uppercase', letterSpacing: 0.5 },
  sectionBody: { gap: 12 },
  value: { fontSize: 17, fontWeight: '600' },
  description: { fontSize: 14, lineHeight: 20 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  rowLabel: { fontSize: 14 },
});
