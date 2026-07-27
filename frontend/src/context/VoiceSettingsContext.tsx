import { createContext, PropsWithChildren, useContext, useMemo, useState } from "react";

export type MicrophoneMode = "pushToTalk" | "toggle";

type VoiceSettings = {
  microphoneMode: MicrophoneMode;
  setMicrophoneMode: (mode: MicrophoneMode) => void;
  soundFeedback: boolean;
  setSoundFeedback: (value: boolean) => void;
  vibrationFeedback: boolean;
  setVibrationFeedback: (value: boolean) => void;
  showTranscript: boolean;
  setShowTranscript: (value: boolean) => void;
};

const VoiceSettingsContext = createContext<VoiceSettings | null>(null);

export function VoiceSettingsProvider({ children }: PropsWithChildren) {
  const [microphoneMode, setMicrophoneMode] = useState<MicrophoneMode>("toggle");
  const [soundFeedback, setSoundFeedback] = useState(true);
  const [vibrationFeedback, setVibrationFeedback] = useState(false);
  const [showTranscript, setShowTranscript] = useState(true);

  const value = useMemo(
    () => ({
      microphoneMode,
      setMicrophoneMode,
      soundFeedback,
      setSoundFeedback,
      vibrationFeedback,
      setVibrationFeedback,
      showTranscript,
      setShowTranscript,
    }),
    [microphoneMode, soundFeedback, vibrationFeedback, showTranscript]
  );

  return (
    <VoiceSettingsContext.Provider value={value}>
      {children}
    </VoiceSettingsContext.Provider>
  );
}

export function useVoiceSettings() {
  const context = useContext(VoiceSettingsContext);

  if (!context) {
    throw new Error("useVoiceSettings must be used inside VoiceSettingsProvider");
  }

  return context;
}
