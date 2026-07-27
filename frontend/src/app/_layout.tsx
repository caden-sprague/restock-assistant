import { Stack } from "expo-router";
import { RestockSessionProvider } from "../context/RestockSessionContext";
import { VoiceSettingsProvider } from "../context/VoiceSettingsContext";

export default function RootLayout() {
  return (
    <VoiceSettingsProvider>
      <RestockSessionProvider>
        <Stack screenOptions={{ headerShown: false }} />
      </RestockSessionProvider>
    </VoiceSettingsProvider>
  );
}