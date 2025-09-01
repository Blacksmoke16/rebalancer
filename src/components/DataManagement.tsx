import {
  Alert,
  Button,
  FileInput,
  Group,
  Paper,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconDownload, IconTrash, IconUpload } from "@tabler/icons-react";
import { memo, useCallback, useState } from "react";
import { usePortfolioContext } from "../contexts/PortfolioContext";
import {
  clearPortfolioData,
  exportPortfolioData,
  importPortfolioData,
} from "../storage";
import { Account, AssetClass } from "../types";
import { DollarAmount } from "../types/branded";
import commonClasses from "../styles/common.module.css";

interface DataManagementProps {
  onDataImported: (
    accounts: Account[],
    portfolio: AssetClass[],
    toInvest: DollarAmount,
  ) => void;
}

export const DataManagement = memo<DataManagementProps>(
  function DataManagement({ onDataImported }) {
    const { accounts, portfolio, toInvest, resetToDefaults } =
      usePortfolioContext();
    const [isImporting, setIsImporting] = useState(false);
    const [importFile, setImportFile] = useState<File | null>(null);

    const handleExport = useCallback(() => {
      try {
        exportPortfolioData(accounts, portfolio, toInvest);
        notifications.show({
          title: "Export Successful",
          message: "Your portfolio data has been downloaded",
          color: "green",
        });
      } catch {
        notifications.show({
          title: "Export Failed",
          message: "Failed to export portfolio data",
          color: "red",
        });
      }
    }, [accounts, portfolio, toInvest]);

    const handleImport = useCallback(async () => {
      if (!importFile) return;

      setIsImporting(true);
      try {
        const data = await importPortfolioData(importFile);
        onDataImported(data.accounts, data.portfolio, data.toInvest);

        notifications.show({
          title: "Import Successful",
          message: "Your portfolio data has been loaded",
          color: "green",
        });

        setImportFile(null);
      } catch (error) {
        notifications.show({
          title: "Import Failed",
          message:
            error instanceof Error
              ? error.message
              : "Failed to import portfolio data",
          color: "red",
        });
      } finally {
        setIsImporting(false);
      }
    }, [importFile, onDataImported]);

    const handleClearData = useCallback(() => {
      if (
        confirm(
          "Are you sure you want to clear all data? This action cannot be undone. Consider exporting your data first.",
        )
      ) {
        clearPortfolioData();
        resetToDefaults();
        notifications.show({
          title: "Data Cleared",
          message: "All portfolio data has been reset to defaults.",
          color: "green",
        });
      }
    }, [resetToDefaults]);

    return (
      <Paper shadow="xl" withBorder p="xl">
        <Title order={3}>Data Management</Title>
        <Stack mt="md">
          <div>
            <Title order={5}>Export Data</Title>
            <Text size="sm" c="dimmed" mb="xs">
              Download your portfolio data as a JSON backup file
            </Text>
            <Button
              leftSection={<IconDownload size={16} />}
              onClick={handleExport}
              variant="light"
            >
              Export Portfolio Data
            </Button>
          </div>

          <div>
            <Title order={5}>Import Data</Title>
            <Text size="sm" c="dimmed" mb="xs">
              Load portfolio data from a backup file (will replace current data)
            </Text>
            <Group>
              <FileInput
                placeholder="Select JSON backup file"
                accept=".json"
                value={importFile}
                onChange={setImportFile}
                className={commonClasses.flexGrow}
              />
              <Button
                leftSection={<IconUpload size={16} />}
                onClick={() => {
                  handleImport().catch((error: unknown) => {
                    console.error("Import failed:", error);
                  });
                }}
                disabled={!importFile || isImporting}
                loading={isImporting}
                variant="light"
              >
                Import Data
              </Button>
            </Group>
          </div>

          <Alert color="orange" title="Important">
            <Text size="sm">
              Importing data will replace all current accounts, asset classes,
              and fund values. Make sure to export your current data first if
              you want to keep it.
            </Text>
          </Alert>

          <div>
            <Title order={5} c="red">
              Clear All Data
            </Title>
            <Text size="sm" c="dimmed" mb="xs">
              Remove all saved data and reset to defaults
            </Text>
            <Button
              leftSection={<IconTrash size={16} />}
              onClick={handleClearData}
              color="red"
              variant="light"
            >
              Clear All Data
            </Button>
          </div>
        </Stack>
      </Paper>
    );
  },
);
