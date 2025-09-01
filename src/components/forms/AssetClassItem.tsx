import { Box, Button, Group, Paper, Stack, Title } from "@mantine/core";
import { UseFormReturnType } from "@mantine/form";
import { memo } from "react";
import { AssetClass } from "../../types";
import {
  AssetClassNameInput,
  DeleteButton,
  FieldGroup,
  PercentageInput,
} from "../ui/FormFields";
import { FundsList } from "./FundsList";
import classes from "../AssetClassSettings.module.css";

interface AssetClassItemProps {
  assetClass: AssetClass;
  assetIdx: number;
  form: UseFormReturnType<{ portfolio: AssetClass[] }>;
  onRemove: (index: number) => void;
  onAddFund: (assetClassIndex: number) => void;
  onRemoveFund: (assetClassIndex: number, fundIndex: number) => void;
}

export const AssetClassItem = memo<AssetClassItemProps>(
  function AssetClassItem({
    assetClass,
    assetIdx,
    form,
    onRemove,
    onAddFund,
    onRemoveFund,
  }) {
    return (
      <Paper
        key={assetClass.key}
        withBorder
        p="md"
        className={classes.assetClassItem}
      >
        <Group align="flex-start">
          <Stack className={classes.assetClassContent}>
            <FieldGroup>
              <AssetClassNameInput
                {...form.getInputProps(`portfolio.${assetIdx}.name`)}
              />
              <PercentageInput
                value={assetClass.allocation}
                onChange={(value) => {
                  form.setFieldValue(`portfolio.${assetIdx}.allocation`, value);
                }}
              />
              <DeleteButton
                className={classes.deleteButton}
                onClick={() => {
                  onRemove(assetIdx);
                }}
                aria-label={`Delete ${assetClass.name || "asset class"}`}
              />
            </FieldGroup>
            <Box>
              <Title order={5}>Funds</Title>
              <FundsList
                funds={assetClass.funds}
                assetClassIndex={assetIdx}
                form={form}
                onRemoveFund={onRemoveFund}
              />
              <Button
                size="sm"
                className={classes.fundsSection}
                onClick={() => {
                  onAddFund(assetIdx);
                }}
              >
                Add Fund
              </Button>
            </Box>
          </Stack>
        </Group>
      </Paper>
    );
  },
);
