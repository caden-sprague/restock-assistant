import { useState } from "react";
import { router } from "expo-router";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { startRestockSession } from "../services/api";

export default function HomeScreen() {
  const [isStarting, setIsStarting] = useState(false);

  async function startSession() {
    if (isStarting) {
      return;
    }

    setIsStarting(true);

    try {
      const response = await startRestockSession();

      if (response.status === "error") {
        Alert.alert("Session unavailable", response.message);
        return;
      }

      router.push("/session");
    } catch (error) {
      Alert.alert(
        "Unable to start session",
        error instanceof Error ? error.message : "Please try again."
      );
    } finally {
      setIsStarting(false);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>Restock Assistant</Text>

        <Pressable
          style={({ pressed }) => [
            styles.startButton,
            pressed && styles.pressed,
          ]}
          onPress={startSession}
          disabled={isStarting}
        >
          <Text style={styles.startButtonText}>
            {isStarting ? "Starting..." : "Start Session"}
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F7F9F8",
  },

  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },

  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#17221D",
    marginBottom: 30,
  },

  startButton: {
    width: "100%",
    maxWidth: 320,
    height: 56,
    backgroundColor: "#147653",
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },

  startButtonText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "700",
  },

  pressed: {
    opacity: 0.75,
  },
});