import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet } from 'react-native';

import { Screen } from '@/components/screen';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { hasPin } from '@/services/pin';
import { getSettings } from '@/services/settings';
import { isUnlocked } from '@/state/session';

type Destination = '/onboarding/permissions' | '/lock' | '/(tabs)';

export default function Bootstrap() {
  const [destination, setDestination] = useState<Destination | null>(null);
  const colorScheme = useColorScheme() ?? 'light';

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [settings, pinSet] = await Promise.all([getSettings(), hasPin()]);
      if (cancelled) return;
      if (!settings.onboardingComplete) {
        setDestination('/onboarding/permissions');
      } else if (pinSet && !isUnlocked()) {
        setDestination('/lock');
      } else {
        setDestination('/(tabs)');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (!destination) {
    return (
      <Screen style={styles.center}>
        <ActivityIndicator color={Colors[colorScheme].tint} />
      </Screen>
    );
  }

  return <Redirect href={destination} />;
}

const styles = StyleSheet.create({
  center: { alignItems: 'center', justifyContent: 'center' },
});
