import { useState } from "react";
import { router } from "expo-router";
import {
  Alert,
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

export default function ReviewSessionScreen() {
  const {
    changes,
    updateChange,
    removeChange,
    clearSession,
  } = useRestockSession();

  const [isSubmitting, setIsSubmitting] = useState(false);

  function goBack() {
    router.back();
  }

  async function submitSession() {
    if (changes.length === 0 || isSubmitting) {
      return;
    }

    const hasInvalidChange = changes.some(
      (change) =>
        !change.product.trim() ||
        !Number.isFinite(change.count) ||
        change.count < 0
    );

    if (hasInvalidChange) {
      Alert.alert(
        "Check your changes",
        "Every product needs a valid name and count."
      );
      return;
    }

    setIsSubmitting(true);

    const sessionPayload = {
      completedAt: new Date().toISOString(),
      changes: changes.map((change) => ({
        product: change.product.trim(),
        count: change.count,
      })),
    };

    console.log("Submitting completed session:", sessionPayload);

    /*
      Replace the simulated delay below with the real backend request:

      const response = await fetch("YOUR_BACKEND_URL/restock-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(sessionPayload),
      });

      if (!response.ok) {
        throw new Error("Session submission failed");
      }
    */

    try {
      await new Promise((resolve) => setTimeout(resolve, 700));

      const submittedCount = changes.length;

      clearSession();

      router.replace({
        pathname: "/success",
        params: {
          count: String(submittedCount),
        },
      });
    } catch {
      Alert.alert(
        "Submission failed",
        "The session could not be submitted. Please try again."
      );

      setIsSubmitting(false);
    }
  }

  function cancelEntireSession() {
    Alert.alert(
      "Cancel session?",
      "All pending changes will be removed.",
      [
        {
          text: "Keep Session",
          style: "cancel",
        },
        {
          text: "Cancel Session",
          style: "destructive",
          onPress: () => {
            clearSession();
            router.replace("/");
          },
        },
      ]
    );
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

          <Text style={styles.headerTitle}>Review Session</Text>

          <View style={styles.headerSpacer} />
        </View>

        <KeyboardAvoidingView
          style={styles.keyboardView}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <ScrollView
            contentContainerStyle={styles.content}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.pageTitle}>
              Confirm all changes
            </Text>

            <Text style={styles.pageDescription}>
              Nothing is sent until you submit this completed
              session.
            </Text>

            <View style={styles.summaryCard}>
              <Text style={styles.summaryNumber}>
                {changes.length}
              </Text>

              <Text style={styles.summaryText}>
                {changes.length === 1
                  ? "pending inventory change"
                  : "pending inventory changes"}
              </Text>
            </View>

            {changes.map((change, index) => (
              <View key={change.id} style={styles.changeCard}>
                <View style={styles.changeHeader}>
                  <Text style={styles.changeTitle}>
                    Change {index + 1}
                  </Text>

                  <Pressable
                    onPress={() => removeChange(change.id)}
                  >
                    <Text style={styles.removeText}>Remove</Text>
                  </Pressable>
                </View>

                <Text style={styles.inputLabel}>PRODUCT</Text>

                <TextInput
                  style={styles.productInput}
                  value={change.product}
                  onChangeText={(product) =>
                    updateChange(change.id, { product })
                  }
                  placeholder="Product name"
                  placeholderTextColor="#8B9690"
                />

                <Text style={styles.inputLabel}>COUNT</Text>

                <TextInput
                  style={styles.countInput}
                  value={String(change.count)}
                  onChangeText={(value) => {
                    const numericValue = Number(
                      value.replace(/[^0-9]/g, "")
                    );

                    updateChange(change.id, {
                      count: Number.isFinite(numericValue)
                        ? numericValue
                        : 0,
                    });
                  }}
                  keyboardType="number-pad"
                  placeholder="0"
                  placeholderTextColor="#8B9690"
                />

                <Text style={styles.originalCommand}>
                  Original: “{change.originalCommand}”
                </Text>
              </View>
            ))}

            {changes.length === 0 ? (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyTitle}>
                  No changes remaining
                </Text>

                <Text style={styles.emptyDescription}>
                  Return to the session and add another command.
                </Text>

                <Pressable
                  style={styles.returnButton}
                  onPress={goBack}
                >
                  <Text style={styles.returnButtonText}>
                    Return to Session
                  </Text>
                </Pressable>
              </View>
            ) : (
              <>
                <Pressable
                  style={({ pressed }) => [
                    styles.submitButton,
                    isSubmitting && styles.disabledButton,
                    pressed &&
                      !isSubmitting &&
                      styles.buttonPressed,
                  ]}
                  onPress={submitSession}
                  disabled={isSubmitting}
                >
                  <Text style={styles.submitButtonText}>
                    {isSubmitting
                      ? "Submitting Session..."
                      : "Confirm and Submit Session"}
                  </Text>
                </Pressable>

                <Pressable
                  style={({ pressed }) => [
                    styles.continueButton,
                    pressed && styles.buttonPressed,
                  ]}
                  onPress={goBack}
                >
                  <Text style={styles.continueButtonText}>
                    Continue Restocking
                  </Text>
                </Pressable>

                <Pressable
                  style={({ pressed }) => [
                    styles.cancelButton,
                    pressed && styles.buttonPressed,
                  ]}
                  onPress={cancelEntireSession}
                >
                  <Text style={styles.cancelButtonText}>
                    Cancel Entire Session
                  </Text>
                </Pressable>
              </>
            )}
          </ScrollView>
        </KeyboardAvoidingView>
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

  backButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#D8DEDA",
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

  headerSpacer: {
    width: 44,
  },

  keyboardView: {
    flex: 1,
  },

  content: {
    paddingHorizontal: 22,
    paddingTop: 30,
    paddingBottom: 40,
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
    marginTop: 8,
    marginBottom: 22,
  },

  summaryCard: {
    backgroundColor: "#E8F4EE",
    borderRadius: 16,
    padding: 18,
    alignItems: "center",
    marginBottom: 18,
  },

  summaryNumber: {
    color: "#147653",
    fontSize: 34,
    fontWeight: "800",
  },

  summaryText: {
    color: "#537064",
    fontSize: 14,
    marginTop: 3,
  },

  changeCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 17,
    borderWidth: 1,
    borderColor: "#DDE4E0",
    padding: 18,
    marginBottom: 14,
  },

  changeHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 18,
  },

  changeTitle: {
    color: "#17221D",
    fontSize: 17,
    fontWeight: "700",
  },

  removeText: {
    color: "#C83232",
    fontSize: 14,
    fontWeight: "700",
  },

  inputLabel: {
    color: "#69756E",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1,
    marginBottom: 7,
  },

  productInput: {
    minHeight: 52,
    borderWidth: 1,
    borderColor: "#D8DEDA",
    borderRadius: 13,
    paddingHorizontal: 14,
    color: "#17221D",
    fontSize: 16,
    marginBottom: 16,
  },

  countInput: {
    width: 120,
    minHeight: 52,
    borderWidth: 1,
    borderColor: "#D8DEDA",
    borderRadius: 13,
    paddingHorizontal: 14,
    color: "#17221D",
    fontSize: 18,
    fontWeight: "700",
  },

  originalCommand: {
    color: "#87918C",
    fontSize: 12,
    fontStyle: "italic",
    marginTop: 16,
  },

  submitButton: {
    minHeight: 58,
    backgroundColor: "#147653",
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
  },

  submitButtonText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "800",
  },

  continueButton: {
    minHeight: 52,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 6,
  },

  continueButtonText: {
    color: "#147653",
    fontSize: 15,
    fontWeight: "700",
  },

  cancelButton: {
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
  },

  cancelButtonText: {
    color: "#C83232",
    fontSize: 14,
    fontWeight: "700",
  },

  disabledButton: {
    opacity: 0.5,
  },

  emptyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 17,
    padding: 24,
    alignItems: "center",
  },

  emptyTitle: {
    color: "#17221D",
    fontSize: 20,
    fontWeight: "700",
  },

  emptyDescription: {
    color: "#69756E",
    fontSize: 14,
    textAlign: "center",
    marginTop: 8,
  },

  returnButton: {
    minHeight: 52,
    backgroundColor: "#147653",
    borderRadius: 14,
    paddingHorizontal: 22,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
  },

  returnButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },

  buttonPressed: {
    opacity: 0.7,
  },
});