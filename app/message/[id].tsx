import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';

import { DangerButton } from '@/components/danger-button';
import { Screen } from '@/components/screen';
import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { deleteMessage, listMessages, Message } from '@/services/messages';

export default function MessageDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const [message, setMessage] = useState<Message | null | undefined>(undefined);

  useEffect(() => {
    (async () => {
      const all = await listMessages();
      setMessage(all.find((item) => item.id === id) ?? null);
    })();
  }, [id]);

  function handleDelete() {
    if (!message) return;
    Alert.alert('Supprimer ce message ?', 'Cette action est définitive.', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer',
        style: 'destructive',
        onPress: async () => {
          await deleteMessage(message.id);
          router.back();
        },
      },
    ]);
  }

  if (message === undefined) {
    return <Screen />;
  }

  if (message === null) {
    return (
      <Screen>
        <ThemedText>Ce message a été supprimé.</ThemedText>
      </Screen>
    );
  }

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content}>
        <ThemedText style={[styles.sender, { color: colors.muted }]}>{message.sender}</ThemedText>
        <ThemedText style={[styles.date, { color: colors.muted }]}>
          {new Date(message.receivedAt).toLocaleString()}
        </ThemedText>
        <ThemedText style={styles.body}>{message.body}</ThemedText>
      </ScrollView>
      <View style={styles.footer}>
        <DangerButton label="Supprimer" onPress={handleDelete} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { gap: 8, paddingBottom: 24 },
  sender: { fontSize: 14 },
  date: { fontSize: 13, marginBottom: 12 },
  body: { fontSize: 17, lineHeight: 26 },
  footer: { paddingBottom: 16 },
});
