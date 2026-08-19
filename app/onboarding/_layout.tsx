import { Stack } from 'expo-router';

export default function OnboardingLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="permissions" />
      <Stack.Screen name="number-setup" />
      <Stack.Screen name="verify-number" />
      <Stack.Screen name="create-pin" />
    </Stack>
  );
}
