import { View, Modal } from "react-native";
import { useState } from "react";
import { patch, post } from "@jarly/api-client";
import SpendForm from "./spendForm";

export default function SpendFormModal({
  visible,
  onClose,
  onSaved,
  prefilledData = {},
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSave = async ({ amount, label, jar, goalId }) => {
    setLoading(true);
    try {
      await patch(`/api/v1/spends/${prefilledData.id}`, {
        amount: Number(amount) * 100,
        label,
        jar,
        goalId,
      });
      onSaved();
      onClose();
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SpendForm
        onSave={handleSave}
        onClose={onClose}
        prefilledData={prefilledData}
        loading={loading}
        visible={visible}
      />
    </Modal>
  );
}
