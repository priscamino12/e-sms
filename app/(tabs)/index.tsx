import { router, useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Alert, FlatList, StyleSheet } from 'react-native';

import { EmptyState } from '@/components/empty-state';
import { MessageRow } from '@/components/message-row';
import { Screen } from '@/components/screen';
import { ThemedText } from '@/components/themed-text';
import { deleteMessage, listMessages, Message } from '@/services/messages';
import { subscribeToIncomingMessages, syncPendingMessages } from '@/services/smsGateway';

export default function MessagesScreen() {
  const [messages, setMessages] = useState<Message[] | null>(null);

  const refresh = useCallback(async () => {
    await syncPendingMessages();
    setMessages(await listMessages());
  }, []);

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  useEffect(() => {
    const subscription = subscribeToIncomingMessages(() => {
      refresh();
    });
    return () => subscription.remove();
  }, [refresh]);

  function confirmDelete(id: string) {
    Alert.alert('Supprimer ce message ?', 'Cette action est définitive.', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer',
        style: 'destructive',
        onPress: async () => {
          await deleteMessage(id);
          refresh();
        },
      },
    ]);
  }

  return (
    <Screen style={styles.screen}>
      <ThemedText type="title" style={styles.header}>
        Messages
      </ThemedText>
      <FlatList
        data={messages ?? []}
        keyExtractor={(item) => item.id}
        contentContainerStyle={messages?.length ? undefined : styles.emptyContainer}
        renderItem={({ item }) => (
          <MessageRow
            message={item}
            onPress={() => router.push({ pathname: '/message/[id]', params: { id: item.id } })}
            onDelete={() => confirmDelete(item.id)}
          />
        )}
        ListEmptyComponent={
          messages === null ? null : (
            <EmptyState
              icon="tray.fill"
              title="Aucun message"
              description="Les SMS reçus du numéro surveillé apparaîtront ici."
            />
          )
        }
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { paddingHorizontal: 0 },
  header: { fontSize: 28, paddingHorizontal: 24, paddingBottom: 8 },
  emptyContainer: { flexGrow: 1 },
});
