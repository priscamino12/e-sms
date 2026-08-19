import { PropsWithChildren } from 'react';
import { StyleSheet, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedView } from '@/components/themed-view';

type Props = PropsWithChildren<{ style?: ViewStyle }>;

export function Screen({ children, style }: Props) {
  return (
    <ThemedView style={styles.flex}>
      <SafeAreaView style={[styles.container, style]} edges={['top', 'bottom']}>
        {children}
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { flex: 1, paddingHorizontal: 24, paddingTop: 16 },
});
