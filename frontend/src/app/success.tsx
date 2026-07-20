import { useEffect, useState } from "react";
import { router, useLocalSearchParams } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const REDIRECT_SECONDS = 4;

export default function SuccessScreen() {
  const { command } = useLocalSearchParams<{
    command?: string;
  }>();

  const [secondsRemaining, setSecondsRemaining] =
    useState(REDIRECT_SECONDS);

  useEffect(() => {
    if (secondsRemaining <= 0) {
      router.replace("/session");
      return;
    }

    const timer = setTimeout(() => {
      setSecondsRemaining((current) => current - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [secondsRemaining]);

  function continueRestocking() {
    router.replace("/session");
  }

  function endSession() {
    router.replace("/");
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.checkCircle}>
          <Text style={styles.check}>✓</Text>
        </View>

        <Text style={styles.title}>Inventory Updated</Text>

        <Text style={styles.subtitle}>
          Your command has been confirmed successfully.
        </Text>

        <View style={styles.card}>
          <Text style={styles.label}>CONFIRMED COMMAND</Text>

          <Text style={styles.command}>
            {command || "Restocking command confirmed"}
          </Text>
        </View>

        <Text style={styles.redirectText}>
          Returning to the active session in {secondsRemaining}...
        </Text>

        <Pressable
          style={({ pressed }) => [
            styles.continueButton,
            pressed && styles.buttonPressed,
          ]}
          onPress={continueRestocking}
        >
          <Text style={styles.continueButtonText}>
            Continue Restocking
          </Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [
            styles.endButton,
            pressed && styles.buttonPressed,
          ]}
          onPress={endSession}
        >
          <Text style={styles.endButtonText}>End Session</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F5F7F6",
  },

  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },

  checkCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#147653",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 30,
  },

  check: {
    color: "#FFFFFF",
    fontSize: 60,
    fontWeight: "bold",
  },

  title: {
    color: "#17221D",
    fontSize: 30,
    fontWeight: "700",
    textAlign: "center",
  },

  subtitle: {
    color: "#69756E",
    fontSize: 17,
    lineHeight: 24,
    textAlign: "center",
    marginTop: 10,
    marginBottom: 30,
  },

  card: {
    width: "100%",
    maxWidth: 420,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: "#E1E7E3",
  },

  label: {
    color: "#7A857F",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1,
    marginBottom: 10,
  },

  command: {
    color: "#17221D",
    fontSize: 20,
    fontWeight: "600",
  },

  redirectText: {
    color: "#69756E",
    fontSize: 14,
    marginTop: 20,
    marginBottom: 18,
  },

  continueButton: {
    width: "100%",
    maxWidth: 420,
    height: 56,
    backgroundColor: "#147653",
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },

  continueButtonText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "700",
  },

  endButton: {
    height: 48,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    marginTop: 8,
  },

  endButtonText: {
    color: "#C83232",
    fontSize: 15,
    fontWeight: "700",
  },

  buttonPressed: {
    opacity: 0.7,
  },
});