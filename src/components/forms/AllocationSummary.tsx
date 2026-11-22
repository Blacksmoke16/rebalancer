import { Group, Title } from "@mantine/core";
import { VALIDATION } from "../../constants";
import classes from "../AssetClassSettings.module.css";

interface AllocationSummaryProps {
  totalAllocation: number;
}

export function AllocationSummary({ totalAllocation }: AllocationSummaryProps) {
  const isValid = totalAllocation === VALIDATION.TARGET_ALLOCATION_SUM;

  return (
    <Group className={classes.totalAllocation} justify="center">
      <Title order={6}>
        Total Allocation: {totalAllocation}%
        {!isValid && (
          <span className={classes.allocationError}>
            {" "}
            (Must equal {VALIDATION.TARGET_ALLOCATION_SUM}%)
          </span>
        )}
      </Title>
    </Group>
  );
}
