import { router, useLocalSearchParams } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SuccessScreen() {
  const { command } = useLocalSearchParams<{
    command?: string;
  }>();

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>

        <View style={styles.checkCircle}>
          <Text style={styles.check}>✓</Text>
        </View>

        <Text style={styles.title}>
          Inventory Updated
        </Text>

        <Text style={styles.subtitle}>
          Your command has been confirmed.
        </Text>

        <View style={styles.card}>
          <Text style={styles.label}>COMMAND</Text>

          <Text style={styles.command}>
            {command}
          </Text>
        </View>

        <Pressable
          style={styles.button}
          onPress={() => router.replace("/session")}
        >
          <Text style={styles.buttonText}>
            Continue Restocking
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
    padding: 24,
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
    color: "white",
    fontSize: 60,
    fontWeight: "bold",
  },

  title: {
    fontSize: 30,
    fontWeight: "700",
    color: "#17221D",
  },

  subtitle: {
    fontSize: 17,
    color: "#69756E",
    marginTop: 10,
    textAlign: "center",
    marginBottom: 30,
  },

  card: {
    width: "100%",
    backgroundColor: "white",
    borderRadius: 16,
    padding: 20,
    marginBottom: 35,
    borderWidth: 1,
    borderColor: "#E1E7E3",
  },

  label: {
    fontSize: 12,
    fontWeight: "700",
    color: "#7A857F",
    marginBottom: 10,
  },

  command: {
    fontSize: 20,
    fontWeight: "600",
    color: "#17221D",
  },

  button: {
    width: "100%",
    height: 56,
    backgroundColor: "#147653",
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },

  buttonText: {
    color: "white",
    fontSize: 17,
    fontWeight: "700",
  },
});