import { router } from "expo-router";
import { useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type MicrophoneMode = "pushToTalk" | "toggle";

export default function SettingsScreen() {
  const [microphoneMode, setMicrophoneMode] =
    useState<MicrophoneMode>("toggle");

  const [soundFeedback, setSoundFeedback] = useState(true);
  const [vibrationFeedback, setVibrationFeedback] = useState(false);
  const [showTranscript, setShowTranscript] = useState(true);

  function closeSettings() {
    router.back();
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.topBar}>
          <Pressable
            style={({ pressed }) => [
              styles.closeButton,
              pressed && styles.pressed,
            ]}
            onPress={closeSettings}
          >
            <Text style={styles.closeText}>×</Text>
          </Pressable>

          <Text style={styles.headerTitle}>Settings</Text>

          <View style={styles.headerSpacer} />
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.sectionLabel}>MICROPHONE MODE</Text>

          <View style={styles.card}>
            <Pressable
              style={[
                styles.modeRow,
                microphoneMode === "pushToTalk" &&
                  styles.selectedRow,
              ]}
              onPress={() => setMicrophoneMode("pushToTalk")}
            >
              <View style={styles.textArea}>
                <Text style={styles.settingTitle}>Push to Talk</Text>

                <Text style={styles.settingDescription}>
                  Hold the microphone button while speaking. Release it to
                  stop.
                </Text>
              </View>

              <RadioButton
                selected={microphoneMode === "pushToTalk"}
              />
            </Pressable>

            <View style={styles.divider} />

            <Pressable
              style={[
                styles.modeRow,
                microphoneMode === "toggle" && styles.selectedRow,
              ]}
              onPress={() => setMicrophoneMode("toggle")}
            >
              <View style={styles.textArea}>
                <Text style={styles.settingTitle}>Toggle On / Off</Text>

                <Text style={styles.settingDescription}>
                  Tap once to start listening and tap again to stop.
                </Text>
              </View>

              <RadioButton selected={microphoneMode === "toggle"} />
            </Pressable>
          </View>

          <Text style={styles.sectionLabel}>VOICE SETTINGS</Text>

          <View style={styles.card}>
            <SettingSwitch
              title="Sound Feedback"
              description="Play a sound when listening starts or stops."
              value={soundFeedback}
              onValueChange={setSoundFeedback}
            />

            <View style={styles.divider} />

            <SettingSwitch
              title="Vibration Feedback"
              description="Vibrate when the microphone starts or stops."
              value={vibrationFeedback}
              onValueChange={setVibrationFeedback}
            />

            <View style={styles.divider} />

            <SettingSwitch
              title="Show Transcript"
              description="Display recognized speech as text."
              value={showTranscript}
              onValueChange={setShowTranscript}
            />
          </View>

          <View style={styles.placeholderCard}>
            <Text style={styles.placeholderTitle}>
              Additional settings
            </Text>

            <Text style={styles.placeholderText}>
              Microphone sensitivity, language, listening timeout and other
              options can be added here later.
            </Text>
          </View>

          <Pressable
            style={({ pressed }) => [
              styles.doneButton,
              pressed && styles.pressed,
            ]}
            onPress={closeSettings}
          >
            <Text style={styles.doneButtonText}>Done</Text>
          </Pressable>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

type RadioButtonProps = {
  selected: boolean;
};

function RadioButton({ selected }: RadioButtonProps) {
  return (
    <View style={[styles.radio, selected && styles.radioSelected]}>
      {selected && <View style={styles.radioCenter} />}
    </View>
  );
}

type SettingSwitchProps = {
  title: string;
  description: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
};

function SettingSwitch({
  title,
  description,
  value,
  onValueChange,
}: SettingSwitchProps) {
  return (
    <View style={styles.switchRow}>
      <View style={styles.textArea}>
        <Text style={styles.settingTitle}>{title}</Text>

        <Text style={styles.settingDescription}>{description}</Text>
      </View>

      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{
          false: "#D2D8D5",
          true: "#8FCAB3",
        }}
        thumbColor={value ? "#147653" : "#F4F4F4"}
      />
    </View>
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
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E1E7E3",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  closeButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#D8DEDA",
    alignItems: "center",
    justifyContent: "center",
  },

  closeText: {
    color: "#17221D",
    fontSize: 30,
    lineHeight: 32,
  },

  headerTitle: {
    color: "#17221D",
    fontSize: 18,
    fontWeight: "700",
  },

  headerSpacer: {
    width: 44,
  },

  content: {
    paddingHorizontal: 22,
    paddingTop: 10,
    paddingBottom: 30,
  },

  sectionLabel: {
    color: "#69756E",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.1,
    marginTop: 22,
    marginBottom: 10,
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#DDE4E0",
    overflow: "hidden",
  },

  modeRow: {
    minHeight: 105,
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
  },

  selectedRow: {
    backgroundColor: "#F0F8F4",
  },

  switchRow: {
    minHeight: 95,
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
  },

  textArea: {
    flex: 1,
    paddingRight: 18,
  },

  settingTitle: {
    color: "#17221D",
    fontSize: 16,
    fontWeight: "700",
  },

  settingDescription: {
    color: "#738078",
    fontSize: 13,
    lineHeight: 19,
    marginTop: 5,
  },

  radio: {
    width: 23,
    height: 23,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#B9C4BE",
    alignItems: "center",
    justifyContent: "center",
  },

  radioSelected: {
    borderColor: "#147653",
  },

  radioCenter: {
    width: 11,
    height: 11,
    borderRadius: 6,
    backgroundColor: "#147653",
  },

  divider: {
    height: 1,
    backgroundColor: "#E7ECE9",
    marginLeft: 18,
  },

  placeholderCard: {
    backgroundColor: "#E8F4EE",
    borderRadius: 16,
    padding: 18,
    marginTop: 22,
  },

  placeholderTitle: {
    color: "#255D48",
    fontSize: 15,
    fontWeight: "700",
  },

  placeholderText: {
    color: "#537064",
    fontSize: 13,
    lineHeight: 20,
    marginTop: 6,
  },

  doneButton: {
    minHeight: 56,
    backgroundColor: "#147653",
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 28,
  },

  doneButtonText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "700",
  },

  pressed: {
    opacity: 0.7,
  },
});