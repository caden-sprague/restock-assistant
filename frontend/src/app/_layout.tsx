import { Stack } from "expo-router";
import { RestockSessionProvider } from "../context/RestockSessionContext";

export default function RootLayout() {
  return (
    <RestockSessionProvider>
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      />
    </RestockSessionProvider>
  );
}