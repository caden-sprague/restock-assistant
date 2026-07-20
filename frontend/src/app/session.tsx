import { useState } from "react";
import { router } from "expo-router";
import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRestockSession } from "../context/RestockSessionContext";

export default function SessionScreen() {
  const [isListening, setIsListening] = useState(false);
  const [command, setCommand] = useState("");

  const { changes, addChange, removeChange } =
    useRestockSession();

  const canSubmit = command.trim().length > 0;

  function openSettings() {
    Keyboard.dismiss();
    setIsListening(false);
    router.push("/settings");
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

    const parsedCommand = parseRestockCommand(cleanedCommand);

    if (!parsedCommand) {
      Alert.alert(
        "Command not recognized",
        'Try something like "Set Fairlife to 5".'
      );
      return;
    }

    addChange({
      product: parsedCommand.product,
      count: parsedCommand.count,
      originalCommand: cleanedCommand,
    });

    setCommand("");
    setIsListening(false);
    Keyboard.dismiss();
  }

  function reviewSession() {
    Keyboard.dismiss();
    setIsListening(false);

    if (changes.length === 0) {
      Alert.alert(
        "No changes added",
        "Add at least one restocking command before ending the session."
      );
      return;
    }

    router.push("/review-session");
  }

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

          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Active Session</Text>

            <Text style={styles.headerSubtitle}>
              {changes.length} pending{" "}
              {changes.length === 1 ? "change" : "changes"}
            </Text>
          </View>

          <Pressable
            style={({ pressed }) => [
              styles.endButton,
              pressed && styles.buttonPressed,
            ]}
            onPress={reviewSession}
          >
            <Text style={styles.endButtonText}>End</Text>
          </Pressable>
        </View>

        <KeyboardAvoidingView
          style={styles.keyboardView}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
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
              Speak or type a command
            </Text>

            <Text style={styles.instructions}>
              Add each product change to this restocking session.
            </Text>

            <View style={styles.inputSection}>
              <Text style={styles.inputLabel}>TYPE A COMMAND</Text>

              <TextInput
                style={styles.commandInput}
                value={command}
                onChangeText={setCommand}
                placeholder="Example: Set Fairlife to 5"
                placeholderTextColor="#8B9690"
                returnKeyType="done"
                onSubmitEditing={submitCommand}
                autoCapitalize="sentences"
                autoCorrect
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
                <Text style={styles.submitButtonText}>
                  Add Change
                </Text>
              </Pressable>
            </View>

            <View style={styles.pendingSection}>
              <Text style={styles.pendingTitle}>
                Pending Changes
              </Text>

              {changes.length === 0 ? (
                <View style={styles.emptyCard}>
                  <Text style={styles.emptyText}>
                    No changes have been added yet.
                  </Text>
                </View>
              ) : (
                changes.map((change, index) => (
                  <View key={change.id} style={styles.changeCard}>
                    <View style={styles.changeNumber}>
                      <Text style={styles.changeNumberText}>
                        {index + 1}
                      </Text>
                    </View>

                    <View style={styles.changeInformation}>
                      <Text style={styles.changeProduct}>
                        {change.product}
                      </Text>

                      <Text style={styles.changeCount}>
                        Set count to {change.count}
                      </Text>
                    </View>

                    <Pressable
                      style={({ pressed }) => [
                        styles.removeButton,
                        pressed && styles.buttonPressed,
                      ]}
                      onPress={() => removeChange(change.id)}
                    >
                      <Text style={styles.removeButtonText}>
                        Remove
                      </Text>
                    </Pressable>
                  </View>
                ))
              )}
            </View>

            {changes.length > 0 && (
              <Pressable
                style={({ pressed }) => [
                  styles.reviewButton,
                  pressed && styles.buttonPressed,
                ]}
                onPress={reviewSession}
              >
                <Text style={styles.reviewButtonText}>
                  Review Session
                </Text>
              </Pressable>
            )}
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </SafeAreaView>
  );
}

function parseRestockCommand(command: string) {
  const cleaned = command.trim();

  const match = cleaned.match(
    /^(?:set\s+)?(.+?)\s+(?:count\s+)?(?:to\s+)?(\d+)$/i
  );

  if (!match) {
    return null;
  }

  const product = capitalizeWords(match[1]);
  const count = Number(match[2]);

  if (!product || !Number.isFinite(count)) {
    return null;
  }

  return {
    product,
    count,
  };
}

function capitalizeWords(value: string) {
  return value
    .trim()
    .split(/\s+/)
    .map(
      (word) =>
        word.charAt(0).toUpperCase() +
        word.slice(1).toLowerCase()
    )
    .join(" ");
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
    minHeight: 76,
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
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },

  settingsIcon: {
    fontSize: 22,
  },

  headerCenter: {
    alignItems: "center",
  },

  headerTitle: {
    color: "#17221D",
    fontSize: 18,
    fontWeight: "700",
  },

  headerSubtitle: {
    color: "#758179",
    fontSize: 12,
    marginTop: 2,
  },

  endButton: {
    minWidth: 60,
    height: 44,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E0D4D4",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },

  endButtonText: {
    color: "#C83232",
    fontSize: 16,
    fontWeight: "700",
  },

  keyboardView: {
    flex: 1,
  },

  scrollView: {
    flex: 1,
  },

  scrollContent: {
    flexGrow: 1,
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 30,
    paddingBottom: 48,
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
    textAlign: "center",
    marginTop: 9,
  },

  inputSection: {
    width: "100%",
    maxWidth: 500,
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

  pendingSection: {
    width: "100%",
    maxWidth: 500,
    marginTop: 34,
  },

  pendingTitle: {
    color: "#17221D",
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 12,
  },

  emptyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#E1E7E3",
    padding: 20,
  },

  emptyText: {
    color: "#7B8680",
    fontSize: 14,
    textAlign: "center",
  },

  changeCard: {
    minHeight: 76,
    backgroundColor: "#FFFFFF",
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#E1E7E3",
    padding: 14,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
  },

  changeNumber: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: "#E8F4EE",
    alignItems: "center",
    justifyContent: "center",
  },

  changeNumberText: {
    color: "#147653",
    fontWeight: "800",
  },

  changeInformation: {
    flex: 1,
    marginLeft: 12,
  },

  changeProduct: {
    color: "#17221D",
    fontSize: 16,
    fontWeight: "700",
  },

  changeCount: {
    color: "#738078",
    fontSize: 13,
    marginTop: 3,
  },

  removeButton: {
    paddingHorizontal: 10,
    paddingVertical: 8,
  },

  removeButtonText: {
    color: "#C83232",
    fontSize: 13,
    fontWeight: "700",
  },

  reviewButton: {
    width: "100%",
    maxWidth: 500,
    minHeight: 56,
    backgroundColor: "#17221D",
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 22,
  },

  reviewButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },

  buttonPressed: {
    opacity: 0.7,
  },
});