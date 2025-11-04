import { Alert, Button, Group, Stack, Text } from "@mantine/core";
import { IconAlertCircle, IconCheck } from "@tabler/icons-react";
import { memo } from "react";
import { usePortfolioContext } from "../../contexts/PortfolioContext";

export const PlanningModeToggle = memo(function PlanningModeToggle() {
  const { planningMode, enterPlanningMode, exitPlanningMode } =
    usePortfolioContext();

  if (planningMode) {
    return (
      <Button onClick={exitPlanningMode} variant="outline" size="sm">
        Exit Planning
      </Button>
    );
  }

  return (
    <Button onClick={enterPlanningMode} variant="light" size="sm">
      Plan Transactions
    </Button>
  );
});

export const PlanningModeAlert = memo(function PlanningModeAlert() {
  const { planningMode, pendingBalance, pendingChanges, applyPendingChanges } =
    usePortfolioContext();

  if (!planningMode) {
    return null;
  }

  const hasChanges = Object.keys(pendingChanges).length > 0;
  const isValid = pendingBalance >= 0;

  // Determine alert state
  let alertColor: "green" | "red" | "blue" = "blue";
  let alertIcon = <IconCheck size={20} />;
  let alertTitle = "";
  let alertMessage = "";

  if (!hasChanges) {
    // No changes yet - starting state
    alertColor = "blue";
    alertIcon = <IconAlertCircle size={20} />;
    alertTitle = "Planning Mode Active";
    alertMessage =
      "Enter pending transactions in the grid below. Use positive values to buy, negative values to sell.";
  } else if (pendingBalance === 0) {
    // Pure rebalancing
    alertColor = "green";
    alertIcon = <IconCheck size={20} />;
    alertTitle = "Balanced";
    alertMessage = "Rebalancing within portfolio - ready to apply";
  } else if (pendingBalance > 0) {
    // Net contribution
    alertColor = "green";
    alertIcon = <IconCheck size={20} />;
    alertTitle = "Adding to Portfolio";
    alertMessage = `Adding $${pendingBalance.toLocaleString()} to portfolio - ready to apply`;
  } else {
    // Negative balance - error
    alertColor = "red";
    alertIcon = <IconAlertCircle size={20} />;
    alertTitle = "Unaccounted Sales";
    alertMessage = `You're removing $${Math.abs(pendingBalance).toLocaleString()} more than you're adding. Enter offsetting purchases to balance.`;
  }

  return (
    <Stack gap="md">
      <Alert icon={alertIcon} title={alertTitle} color={alertColor}>
        <Text>{alertMessage}</Text>
      </Alert>

      <Group justify="flex-end">
        <Button
          onClick={applyPendingChanges}
          disabled={!isValid || !hasChanges}
          color="green"
          leftSection={<IconCheck size={16} />}
        >
          Apply Changes
        </Button>
      </Group>
    </Stack>
  );
});
