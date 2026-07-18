import { useState } from "react";
import { router } from "expo-router";
import {
  Keyboard,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SessionScreen() {
  const [isListening, setIsListening] = useState(false);
  const [command, setCommand] = useState("");

  function openSettings() {
    console.log("Settings pressed");
  }

  function toggleMicrophone() {
    Keyboard.dismiss();
    setIsListening((currentValue) => !currentValue);
  }

  function submitCommand() {
  const cleanedCommand = command.trim();

  if (!cleanedCommand) {
    return;
  }

  Keyboard.dismiss();

  router.push({
    pathname: "/confirmation",
    params: {
      command: cleanedCommand,
    },
  });
}

  function endSession() {
    setIsListening(false);
    setCommand("");
    router.replace("/");
  }

  const canSubmit = command.trim().length > 0;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.topBar}>
          <Pressable
            style={({ pressed }) => [
              styles.settingsButton,
              pressed && styles.buttonPressed,
            ]}
            onPress={openSettings}
          >
            <Text style={styles.settingsIcon}>⚙</Text>
          </Pressable>

          <Text style={styles.headerTitle}>Active Session</Text>

          <Pressable
            style={({ pressed }) => [
              styles.endButton,
              pressed && styles.buttonPressed,
            ]}
            onPress={endSession}
          >
            <Text style={styles.endButtonText}>End</Text>
          </Pressable>
        </View>

        <View style={styles.content}>
          <Text
            style={[
              styles.statusText,
              isListening
                ? styles.statusListening
                : styles.statusNotListening,
            ]}
          >
            {isListening ? "Listening..." : "Microphone off"}
          </Text>

          <Pressable
            style={({ pressed }) => [
              styles.microphoneOuter,
              isListening && styles.microphoneOuterActive,
              pressed && styles.microphonePressed,
            ]}
            onPress={toggleMicrophone}
          >
            <View
              style={[
                styles.microphoneButton,
                isListening
                  ? styles.microphoneButtonActive
                  : styles.microphoneButtonInactive,
              ]}
            >
              <Text style={styles.microphoneIcon}>🎙️</Text>
            </View>
          </Pressable>

          <Text style={styles.questionText}>
            {isListening
              ? "What are you restocking?"
              : "Speak or type a command"}
          </Text>

          <Text style={styles.instructions}>
            {isListening
              ? "Speak your restocking command now"
              : "Press the microphone or enter the command below"}
          </Text>

          <View style={styles.inputSection}>
            <Text style={styles.inputLabel}>TYPE A COMMAND</Text>

            <TextInput
              style={styles.commandInput}
              value={command}
              onChangeText={setCommand}
              placeholder="Example: Fairlife count 5"
              placeholderTextColor="#8B9690"
              returnKeyType="done"
              onSubmitEditing={submitCommand}
              autoCapitalize="sentences"
            />

            <Pressable
              style={({ pressed }) => [
                styles.submitButton,
                !canSubmit && styles.submitButtonDisabled,
                pressed && canSubmit && styles.buttonPressed,
              ]}
              onPress={submitCommand}
              disabled={!canSubmit}
            >
              <Text style={styles.submitButtonText}>Submit Command</Text>
            </Pressable>
          </View>
        </View>
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
  },

  topBar: {
    height: 72,
    paddingHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E1E7E3",
  },

  settingsButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#D8DEDA",
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },

  settingsIcon: {
    fontSize: 22,
  },

  headerTitle: {
    color: "#17221D",
    fontSize: 18,
    fontWeight: "700",
  },

  endButton: {
    minWidth: 60,
    height: 44,
    paddingHorizontal: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E0D4D4",
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },

  endButtonText: {
    color: "#C83232",
    fontSize: 16,
    fontWeight: "700",
  },

  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },

  statusText: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 22,
  },

  statusListening: {
    color: "#147653",
  },

  statusNotListening: {
    color: "#7B8680",
  },

  microphoneOuter: {
    width: 170,
    height: 170,
    borderRadius: 85,
    backgroundColor: "#E6EAE8",
    alignItems: "center",
    justifyContent: "center",
  },

  microphoneOuterActive: {
    backgroundColor: "#DFF2E9",
  },

  microphoneButton: {
    width: 128,
    height: 128,
    borderRadius: 64,
    alignItems: "center",
    justifyContent: "center",
  },

  microphoneButtonInactive: {
    backgroundColor: "#AAB3AE",
  },

  microphoneButtonActive: {
    backgroundColor: "#147653",
  },

  microphoneIcon: {
    fontSize: 52,
  },

  microphonePressed: {
    transform: [{ scale: 0.96 }],
  },

  questionText: {
    color: "#17221D",
    fontSize: 24,
    fontWeight: "700",
    textAlign: "center",
    marginTop: 26,
  },

  instructions: {
    color: "#69756E",
    fontSize: 15,
    lineHeight: 21,
    textAlign: "center",
    marginTop: 9,
  },

  inputSection: {
    width: "100%",
    maxWidth: 420,
    marginTop: 28,
  },

  inputLabel: {
    color: "#69756E",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.1,
    marginBottom: 8,
  },

  commandInput: {
    width: "100%",
    minHeight: 56,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#D8DEDA",
    borderRadius: 15,
    paddingHorizontal: 16,
    color: "#17221D",
    fontSize: 16,
  },

  submitButton: {
    width: "100%",
    minHeight: 54,
    backgroundColor: "#147653",
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
  },

  submitButtonDisabled: {
    opacity: 0.4,
  },

  submitButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },

  buttonPressed: {
    opacity: 0.72,
  },
});