import { useState } from "react";
import { router, useLocalSearchParams } from "expo-router";
import {
  Keyboard,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ConfirmationScreen() {
  const params = useLocalSearchParams<{ command?: string }>();

  const originalCommand =
    typeof params.command === "string" ? params.command : "";

  const [command, setCommand] = useState(originalCommand);
  const [isEditing, setIsEditing] = useState(false);

  const confirmationText = formatCommand(command);
  const canConfirm = command.trim().length > 0;

  function beginEditing() {
    setIsEditing(true);
  }

  function saveEdit() {
    if (!command.trim()) {
      return;
    }

    Keyboard.dismiss();
    setIsEditing(false);
  }

  function confirmCommand() {
  if (!canConfirm) return;

  router.push({
    pathname: "/success",
    params: {
      command,
    },
  });
}

  function goBack() {
    router.back();
  }

  function endSession() {
    router.replace("/");
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.topBar}>
          <Pressable
            style={({ pressed }) => [
              styles.backButton,
              pressed && styles.buttonPressed,
            ]}
            onPress={goBack}
          >
            <Text style={styles.backButtonText}>‹</Text>
          </Pressable>

          <Text style={styles.headerTitle}>Confirm Command</Text>

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
          <Text style={styles.pageTitle}>Is this correct?</Text>

          <Text style={styles.pageDescription}>
            Review the command before updating the machine.
          </Text>

          <View style={styles.confirmationCard}>
            <Text style={styles.confirmationLabel}>
              RESTOCK COMMAND
            </Text>

            {isEditing ? (
              <TextInput
                style={styles.commandInput}
                value={command}
                onChangeText={setCommand}
                placeholder="Example: Set Fairlife to 5"
                placeholderTextColor="#89948E"
                autoFocus
                multiline
                returnKeyType="done"
                onSubmitEditing={saveEdit}
              />
            ) : (
              <Text style={styles.confirmationText}>
                {confirmationText}
              </Text>
            )}

            {isEditing ? (
              <Pressable
                style={({ pressed }) => [
                  styles.editButton,
                  pressed && styles.buttonPressed,
                ]}
                onPress={saveEdit}
              >
                <Text style={styles.editButtonText}>Save Edit</Text>
              </Pressable>
            ) : (
              <Pressable
                style={({ pressed }) => [
                  styles.editButton,
                  pressed && styles.buttonPressed,
                ]}
                onPress={beginEditing}
              >
                <Text style={styles.editButtonText}>Edit Command</Text>
              </Pressable>
            )}
          </View>

          <View style={styles.originalCard}>
            <Text style={styles.originalLabel}>YOU ENTERED</Text>

            <Text style={styles.originalText}>
              “{originalCommand}”
            </Text>
          </View>

          <View style={styles.actions}>
            <Pressable
              style={({ pressed }) => [
                styles.confirmButton,
                !canConfirm && styles.confirmButtonDisabled,
                pressed && canConfirm && styles.buttonPressed,
              ]}
              onPress={confirmCommand}
              disabled={!canConfirm}
            >
              <Text style={styles.confirmButtonText}>
                Confirm
              </Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.tryAgainButton,
                pressed && styles.buttonPressed,
              ]}
              onPress={goBack}
            >
              <Text style={styles.tryAgainButtonText}>
                Go Back
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

function formatCommand(command: string) {
  const cleaned = command.trim();

  const match = cleaned.match(
    /^(?:set\s+)?(.+?)\s+(?:count\s+)?(?:to\s+)?(\d+)$/i
  );

  if (!match) {
    return cleaned || "No command entered";
  }

  const product = capitalizeWords(match[1]);
  const quantity = match[2];

  return `${product} set to ${quantity}`;
}

function capitalizeWords(value: string) {
  return value
    .trim()
    .split(/\s+/)
    .map((word) => {
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
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
    height: 72,
    paddingHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E1E7E3",
  },

  backButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#D8DEDA",
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },

  backButtonText: {
    color: "#17221D",
    fontSize: 34,
    lineHeight: 36,
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
    paddingHorizontal: 24,
    paddingTop: 42,
  },

  pageTitle: {
    color: "#17221D",
    fontSize: 28,
    fontWeight: "800",
    textAlign: "center",
  },

  pageDescription: {
    color: "#69756E",
    fontSize: 15,
    lineHeight: 22,
    textAlign: "center",
    marginTop: 10,
    marginBottom: 28,
  },

  confirmationCard: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#DDE4E0",
    borderRadius: 18,
    padding: 20,
  },

  confirmationLabel: {
    color: "#718078",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.1,
    marginBottom: 12,
  },

  confirmationText: {
    color: "#17221D",
    fontSize: 24,
    lineHeight: 32,
    fontWeight: "800",
  },

  commandInput: {
    minHeight: 90,
    borderWidth: 1,
    borderColor: "#147653",
    borderRadius: 14,
    padding: 14,
    color: "#17221D",
    backgroundColor: "#F9FBFA",
    fontSize: 18,
    lineHeight: 25,
    textAlignVertical: "top",
  },

  editButton: {
    alignSelf: "flex-start",
    minHeight: 42,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#147653",
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
  },

  editButtonText: {
    color: "#147653",
    fontSize: 14,
    fontWeight: "700",
  },

  originalCard: {
    width: "100%",
    backgroundColor: "#E9F3EE",
    borderRadius: 16,
    padding: 17,
    marginTop: 16,
  },

  originalLabel: {
    color: "#5D7468",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1,
  },

  originalText: {
    color: "#33483E",
    fontSize: 14,
    lineHeight: 20,
    marginTop: 7,
  },

  actions: {
    marginTop: "auto",
    paddingBottom: 24,
  },

  confirmButton: {
    width: "100%",
    minHeight: 56,
    borderRadius: 16,
    backgroundColor: "#147653",
    alignItems: "center",
    justifyContent: "center",
  },

  confirmButtonDisabled: {
    opacity: 0.4,
  },

  confirmButtonText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "800",
  },

  tryAgainButton: {
    minHeight: 50,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 7,
  },

  tryAgainButtonText: {
    color: "#147653",
    fontSize: 15,
    fontWeight: "700",
  },

  buttonPressed: {
    opacity: 0.7,
  },
});