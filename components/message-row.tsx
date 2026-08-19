import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Message } from '@/services/messages';

function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleString(undefined, {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

type Props = {
  message: Message;
  onPress: () => void;
  onDelete: () => void;
};

export function MessageRow({ message, onPress, onDelete }: Props) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        { borderColor: colors.border, backgroundColor: pressed ? colors.surface : 'transparent' },
      ]}>
      <View style={styles.text}>
        <ThemedText style={styles.sender}>{message.sender}</ThemedText>
        <ThemedText numberOfLines={2} style={[styles.body, { color: colors.muted }]}>
          {message.body}
        </ThemedText>
        <ThemedText style={[styles.date, { color: colors.muted }]}>
          {formatDate(message.receivedAt)}
        </ThemedText>
      </View>
      <Pressable onPress={onDelete} hitSlop={12} style={styles.deleteButton}>
        <IconSymbol name="trash.fill" size={20} color={colors.muted} />
      </Pressable>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 12,
  },
  text: { flex: 1, gap: 4 },
  sender: { fontSize: 16, fontWeight: '600' },
  body: { fontSize: 14, lineHeight: 20 },
  date: { fontSize: 12 },
  deleteButton: { padding: 4 },
});
