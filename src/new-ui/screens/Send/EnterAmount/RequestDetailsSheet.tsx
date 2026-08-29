import React, { useState } from "react";
import {
  Modal,
  Platform,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { formatDotDateTime } from "utils/dateUtils";
import CustomText from "@new-ui/components/common-components/CustomText";
import { TextInput, Button } from "@new-ui/components/common-components/layout";
import { useTheme } from "@new-ui/styles/ThemeContext";
import type { ITheme } from "@new-ui/styles/themes/themeTypes";

interface Props {
  visible: boolean;
  /** Summary line shown at the top, e.g. "Request 0.001 BTC from John". */
  summary?: string;
  loading?: boolean;
  onClose: () => void;
  /** Returns the optional note + ISO-8601 expiry (undefined = never expires). */
  onConfirm: (values: { note?: string; expiresAt?: string }) => void;
}

/**
 * Bottom sheet to capture the optional note + expiry when creating a crypto
 * request. Both fields are optional per the integration guide.
 */
const RequestDetailsSheet: React.FC<Props> = ({
  visible,
  summary,
  loading = false,
  onClose,
  onConfirm,
}) => {
  const { theme } = useTheme();
  const styles = makeStyles(theme);

  const [note, setNote] = useState("");
  const [expiry, setExpiry] = useState<Date | null>(null);
  const [showPicker, setShowPicker] = useState(false);

  const handleConfirm = () => {
    const trimmed = note.trim();
    onConfirm({
      note: trimmed || undefined,
      expiresAt: expiry ? expiry.toISOString() : undefined,
    });
  };

  const onPickerChange = (event: { type: string }, date?: Date) => {
    // Android fires once and closes; iOS stays inline until done.
    if (Platform.OS === "android") setShowPicker(false);
    if (event.type === "dismissed") return;
    if (date) setExpiry(date);
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.backdrop} />
      </TouchableWithoutFeedback>

      <View style={styles.sheet}>
        <View style={styles.handle} />
        <CustomText variant="h4" fontWeight="bold" color={theme.colors.text}>
          Request details
        </CustomText>
        {!!summary && (
          <CustomText
            variant="caption"
            color={theme.colors.textSecondary}
            style={styles.summary}
          >
            {summary}
          </CustomText>
        )}

        <View style={styles.field}>
          <TextInput
            label="Note (optional)"
            placeholder="What's this for?"
            value={note}
            onChangeText={setNote}
            multiline
            borderRadius={10}
            borderWidth={1}
            borderColor={theme.colors.grey}
            maxLength={140}
            inputStyle={styles.noteInput}
            // @ts-ignore - RN multiline alignment
            textAlignVertical="top"
          />
        </View>

        <View style={styles.field}>
          <CustomText
            variant="label"
            fontWeight="semiBold"
            color={theme.colors.text}
            style={styles.expiryLabel}
          >
            Expiry (optional)
          </CustomText>
          <View style={styles.expiryRow}>
            <TouchableOpacity
              style={styles.expiryButton}
              activeOpacity={0.8}
              onPress={() => setShowPicker(true)}
            >
              <CustomText
                variant="body"
                color={expiry ? theme.colors.text : theme.colors.greyDark}
              >
                {expiry ? formatDotDateTime(expiry) : "Never expires"}
              </CustomText>
            </TouchableOpacity>
            {expiry && (
              <TouchableOpacity onPress={() => setExpiry(null)} hitSlop={8}>
                <CustomText variant="caption" color={theme.colors.error}>
                  Clear
                </CustomText>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {showPicker && (
          <DateTimePicker
            value={expiry ?? new Date(Date.now() + 24 * 60 * 60 * 1000)}
            mode="date"
            minimumDate={new Date()}
            onChange={onPickerChange}
          />
        )}

        <View style={styles.actions}>
          <Button
            color={theme.colors.onPrimary}
            style={styles.cancelButton}
            textStyle={{ color: theme.colors.text }}
            onPress={onClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            style={styles.confirmButton}
            onPress={handleConfirm}
            loading={loading}
            disabled={loading}
          >
            Send request
          </Button>
        </View>
      </View>
    </Modal>
  );
};

const makeStyles = (theme: ITheme) =>
  StyleSheet.create({
    backdrop: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.4)",
    },
    sheet: {
      position: "absolute",
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: theme.colors.surfaceElevated,
      borderTopLeftRadius: theme.radius["2xl"],
      borderTopRightRadius: theme.radius["2xl"],
      padding: theme.spacing.lg,
      paddingBottom: theme.spacing["2xl"],
    },
    handle: {
      alignSelf: "center",
      width: 40,
      height: 4,
      borderRadius: 2,
      backgroundColor: theme.colors.greyLight2,
      marginBottom: theme.spacing.base,
    },
    summary: {
      marginTop: theme.spacing.xs,
    },
    field: {
      marginTop: theme.spacing.base,
    },
    noteInput: {
      paddingTop: 10,
      minHeight: 64,
    },
    expiryLabel: {
      marginBottom: theme.spacing.xs,
    },
    expiryRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: theme.spacing.md,
    },
    expiryButton: {
      flex: 1,
      borderWidth: 1,
      borderColor: theme.colors.grey,
      borderRadius: 10,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.md,
    },
    actions: {
      flexDirection: "row",
      gap: theme.spacing.md,
      marginTop: theme.spacing.xl,
    },
    cancelButton: {
      flex: 1,
      borderWidth: 1,
      borderColor: theme.colors.grey,
    },
    confirmButton: {
      flex: 1,
    },
  });

export default RequestDetailsSheet;
