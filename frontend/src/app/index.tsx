import { router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>Restock Assistant</Text>

        <Pressable
          style={({ pressed }) => [
            styles.startButton,
            pressed && styles.pressed,
          ]}
          onPress={() => router.push("/session")}
        >
          <Text style={styles.startButtonText}>Start Session</Text>
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