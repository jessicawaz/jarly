import { View, Modal } from "react-native";
import { useState } from "react";
import { patch, post } from "@jarly/api-client";
import GoalForm from "./goalForm";

export default function GoalFormModal({
  visible,
  onClose,
  onSaved,
  prefilledData = {},
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSave = async ({
    goalName,
    targetCents,
    targetDate,
    category,
  }) => {
    setLoading(true);
    try {
      if (prefilledData?.id) {
        // Update goal
        await patch(`/api/v1/goals/${prefilledData.id}`, {
          name: goalName,
          targetCents,
          targetDate,
          category,
        });
      } else {
        // Insert new goal
        await post("/api/v1/goals", {
          name: goalName,
          targetCents,
          targetDate,
          category,
        });
      }
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
      <GoalForm
        onSave={handleSave}
        onClose={onClose}
        prefilledData={prefilledData}
        loading={loading}
      />
    </Modal>
  );
}
