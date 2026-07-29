import { Modal, Pressable, StyleSheet, Text, View } from "react-native";

export type AmbiguityOption = {
  name: string;
  siteInventoryId: number;
};

type CommandAmbiguityModalProps = {
  visible: boolean;
  options: AmbiguityOption[];
  quantity: number;
  onSelect: (siteInventoryId: number) => void;
  onCancel: () => void;
};

export default function CommandAmbiguityModal({
  visible,
  options,
  quantity,
  onSelect,
  onCancel,
}: CommandAmbiguityModalProps) {
  if (!visible) {
    return null;
  }

  return (
    <Modal transparent animationType="fade" visible={visible} onRequestClose={onCancel}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <Text style={styles.title}>Did you mean?</Text>
          <Text style={styles.description}>
            We found multiple matching items for this request. Pick the one you intended to restock.
          </Text>

          <View style={styles.optionsList}>
            {options.map((option) => (
              <Pressable
                key={option.siteInventoryId}
                style={({ pressed }) => [
                  styles.optionButton,
                  pressed && styles.optionButtonPressed,
                ]}
                onPress={() => onSelect(option.siteInventoryId)}
              >
                <Text style={styles.optionName}>{option.name}</Text>
                <Text style={styles.optionMeta}>Qty {quantity}</Text>
              </Pressable>
            ))}
          </View>

          <Pressable
            style={({ pressed }) => [
              styles.cancelButton,
              pressed && styles.cancelButtonPressed,
            ]}
            onPress={onCancel}
          >
            <Text style={styles.cancelText}>Cancel</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(8, 20, 15, 0.45)",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  sheet: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#14231D",
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: "#56645E",
    marginBottom: 16,
    lineHeight: 20,
  },
  optionsList: {
    gap: 10,
  },
  optionButton: {
    backgroundColor: "#F3F7F5",
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: "#DCE6E0",
  },
  optionButtonPressed: {
    opacity: 0.85,
  },
  optionName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#123023",
    marginBottom: 2,
  },
  optionMeta: {
    fontSize: 12,
    color: "#5B6C64",
  },
  cancelButton: {
    marginTop: 16,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
    backgroundColor: "#EAF2ED",
  },
  cancelButtonPressed: {
    opacity: 0.85,
  },
  cancelText: {
    color: "#26453A",
    fontWeight: "600",
  },
});
