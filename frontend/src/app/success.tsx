import { useEffect, useState } from "react";
import { router, useLocalSearchParams } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const REDIRECT_SECONDS = 5;

export default function SuccessScreen() {
  const { count } = useLocalSearchParams<{
    count?: string;
  }>();

  const [secondsRemaining, setSecondsRemaining] =
    useState(REDIRECT_SECONDS);

  useEffect(() => {
    if (secondsRemaining <= 0) {
      router.replace("/");
      return;
    }

    const timer = setTimeout(() => {
      setSecondsRemaining((current) => current - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [secondsRemaining]);

  function returnHome() {
    router.replace("/");
  }

  function startAnotherSession() {
    router.replace("/session");
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.checkCircle}>
          <Text style={styles.check}>✓</Text>
        </View>

        <Text style={styles.title}>Session Submitted</Text>

        <Text style={styles.subtitle}>
          {count || "All"} inventory{" "}
          {count === "1" ? "change was" : "changes were"} submitted
          successfully.
        </Text>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>
            Inventory updated
          </Text>

          <Text style={styles.infoText}>
            The completed restocking session has now been sent.
          </Text>
        </View>

        <Text style={styles.redirectText}>
          Returning home in {secondsRemaining}...
        </Text>

        <Pressable
          style={({ pressed }) => [
            styles.primaryButton,
            pressed && styles.buttonPressed,
          ]}
          onPress={startAnotherSession}
        >
          <Text style={styles.primaryButtonText}>
            Start Another Session
          </Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [
            styles.secondaryButton,
            pressed && styles.buttonPressed,
          ]}
          onPress={returnHome}
        >
          <Text style={styles.secondaryButtonText}>
            Return Home
          </Text>
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
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 28,
  },

  check: {
    color: "#FFFFFF",
    fontSize: 60,
    fontWeight: "700",
  },

  title: {
    color: "#17221D",
    fontSize: 30,
    fontWeight: "800",
    textAlign: "center",
  },

  subtitle: {
    color: "#69756E",
    fontSize: 16,
    lineHeight: 23,
    textAlign: "center",
    marginTop: 10,
  },

  infoCard: {
    width: "100%",
    maxWidth: 420,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#DDE4E0",
    borderRadius: 17,
    padding: 20,
    marginTop: 28,
  },

  infoTitle: {
    color: "#17221D",
    fontSize: 17,
    fontWeight: "700",
  },

  infoText: {
    color: "#69756E",
    fontSize: 14,
    lineHeight: 20,
    marginTop: 6,
  },

  redirectText: {
    color: "#7B8680",
    fontSize: 14,
    marginTop: 20,
    marginBottom: 18,
  },

  primaryButton: {
    width: "100%",
    maxWidth: 420,
    minHeight: 56,
    backgroundColor: "#147653",
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },

  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "700",
  },

  secondaryButton: {
    minHeight: 50,
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 6,
  },

  secondaryButtonText: {
    color: "#147653",
    fontSize: 15,
    fontWeight: "700",
  },

  buttonPressed: {
    opacity: 0.7,
  },
});