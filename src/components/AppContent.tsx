import {
  ActionIcon,
  Anchor,
  AppShell,
  Burger,
  Group,
  NavLink,
  ScrollArea,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import {
  IconChartPie,
  IconSettings,
  IconCoffee,
  IconHome,
  IconBrandGithub,
} from "@tabler/icons-react";
import { lazy, Suspense } from "react";
import { PortfolioInputTable } from "./PortfolioInputTable";
import { RebalancingAnalysisTable } from "./RebalancingAnalysisTable";
import { SettingsErrorBoundary } from "./SettingsErrorBoundary";
import { SettingsLoadingSkeleton } from "./ui/LoadingSkeleton";
import { PortfolioSummaryCards } from "./ui/PortfolioSummaryCards";
import { usePortfolioContext } from "../contexts/PortfolioContext";
import { useTabPersistence } from "../hooks/useTabPersistence";

// Lazy load settings components for better initial load performance
const AccountsSettings = lazy(() =>
  import("./AccountsSettings").then((m) => ({ default: m.AccountsSettings })),
);
const AssetClassSettings = lazy(() =>
  import("./AssetClassSettings").then((m) => ({
    default: m.AssetClassSettings,
  })),
);
const DataManagement = lazy(() =>
  import("./DataManagement").then((m) => ({ default: m.DataManagement })),
);
const Homepage = lazy(() =>
  import("./Homepage").then((m) => ({ default: m.Homepage })),
);

export function AppContent() {
  const { accounts, portfolio, handleDataImport, accountList, portfolioList } =
    usePortfolioContext();

  const [activeTab, handleTabChange] = useTabPersistence("home");
  const [opened, { toggle }] = useDisclosure();

  const renderContent = () => {
    if (activeTab === "home") {
      return (
        <Suspense fallback={<SettingsLoadingSkeleton />}>
          <Homepage />
        </Suspense>
      );
    }

    if (activeTab === "portfolio") {
      return (
        <Stack gap="xl">
          <PortfolioSummaryCards />
          <Title order={2}>Current Holdings</Title>
          <PortfolioInputTable />
          <Title order={2}>Rebalancing Analysis</Title>
          <RebalancingAnalysisTable />
        </Stack>
      );
    }

    if (activeTab === "settings") {
      return (
        <Stack gap="xl">
          <Title order={2}>Configuration</Title>
          <SettingsErrorBoundary>
            <Suspense fallback={<SettingsLoadingSkeleton />}>
              <AccountsSettings
                accounts={accounts}
                onAccountsChange={accountList.setState}
              />
              <AssetClassSettings
                portfolio={portfolio}
                onPortfolioChange={portfolioList.setState}
              />
              <DataManagement onDataImported={handleDataImport} />
            </Suspense>
          </SettingsErrorBoundary>
        </Stack>
      );
    }

    return null;
  };

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{
        width: 300,
        breakpoint: "sm",
        collapsed: { mobile: !opened },
      }}
      footer={{ height: 60 }}
      padding="md"
    >
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between">
          <Group>
            <Burger
              opened={opened}
              onClick={toggle}
              hiddenFrom="sm"
              size="sm"
            />
            <Title order={1}>Portfolio Rebalancer</Title>
          </Group>
          <ActionIcon
            component="a"
            href="https://ko-fi.com/blacksmoke16/tip"
            target="_blank"
            rel="noopener noreferrer"
            variant="subtle"
            size="lg"
            aria-label="Support on Ko-fi"
          >
            <IconCoffee size={25} />
          </ActionIcon>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="s">
        <AppShell.Section grow my="md" component={ScrollArea}>
          <NavLink
            href="#"
            label="Home"
            leftSection={<IconHome size={16} />}
            active={activeTab === "home"}
            onClick={(e) => {
              e.preventDefault();
              handleTabChange("home");
            }}
          />
          <NavLink
            href="#"
            label="Portfolio"
            leftSection={<IconChartPie size={16} />}
            active={activeTab === "portfolio"}
            onClick={(e) => {
              e.preventDefault();
              handleTabChange("portfolio");
            }}
          />
          <NavLink
            href="#"
            label="Settings"
            leftSection={<IconSettings size={16} />}
            active={activeTab === "settings"}
            onClick={(e) => {
              e.preventDefault();
              handleTabChange("settings");
            }}
          />
        </AppShell.Section>
      </AppShell.Navbar>

      <AppShell.Main>
        <Stack component="main" gap="xl">
          {renderContent()}
        </Stack>
      </AppShell.Main>

      <AppShell.Footer p="md">
        <Group justify="space-between" align="center" h="100%">
          <Text size="sm" c="dimmed">
            © 2025 George Dietrich (Blacksmoke16). All data stored locally in
            your browser.
          </Text>

          <Group gap="xs">
            <Anchor
              href="https://ko-fi.com/blacksmoke16/tip"
              target="_blank"
              rel="noopener noreferrer"
              c="dimmed"
            >
              <IconCoffee style={{ verticalAlign: "middle" }} size={16} />
            </Anchor>
            <Anchor
              href="https://github.com/blacksmoke16/rebalancer"
              target="_blank"
              rel="noopener noreferrer"
              c="dimmed"
            >
              <IconBrandGithub style={{ verticalAlign: "middle" }} size={16} />
            </Anchor>
            <Text size="sm" c="dimmed">
              Version 1.0.0
            </Text>
          </Group>
        </Group>
      </AppShell.Footer>
    </AppShell>
  );
}
