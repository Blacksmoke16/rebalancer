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
import { useDisclosure, useLocalStorage } from "@mantine/hooks";
import {
  IconChartPie,
  IconSettings,
  IconCoffee,
  IconHome,
  IconBrandGithub,
} from "@tabler/icons-react";
import { AccountsSettings } from "./AccountsSettings";
import { AssetClassSettings } from "./AssetClassSettings";
import { DataManagement } from "./DataManagement";
import { PriceDataSettings } from "./PriceDataSettings";
import { ErrorBoundary } from "./ErrorBoundary";
import { Homepage } from "./Homepage";
import { PortfolioInputTable } from "./PortfolioInputTable";
import { RebalancingAnalysisTable } from "./RebalancingAnalysisTable";
import {
  PlanningModeToggle,
  PlanningModeAlert,
} from "./ui/PlanningModeControls";
import { PortfolioSummaryCards } from "./ui/PortfolioSummaryCards";
import { PricesCallout } from "./ui/PricesCallout";
import { UnpricedFundsAlert } from "./ui/UnpricedFundsAlert";
import { usePortfolioContext } from "../contexts/PortfolioContext";

// Read once when the app loads rather than on every render, which must be pure.
const currentYear = new Date().getFullYear();

export function AppContent() {
  const {
    accounts,
    portfolio,
    handleDataImport,
    updateAccounts,
    updatePortfolio,
  } = usePortfolioContext();

  // Read during the first render so the saved tab shows without a flash of
  // the home tab, and kept per window rather than synced across windows.
  const [activeTab, handleTabChange] = useLocalStorage({
    key: "rebalancer-active-tab",
    defaultValue: "home",
    getInitialValueInEffect: false,
    sync: false,
  });
  const [opened, { toggle }] = useDisclosure();

  const renderContent = () => {
    if (activeTab === "home") {
      return <Homepage />;
    }

    if (activeTab === "portfolio") {
      return (
        <Stack gap="xl">
          <PortfolioSummaryCards />
          <Group justify="space-between" align="center">
            <Title order={2}>Current Holdings</Title>
            <PlanningModeToggle />
          </Group>
          <PlanningModeAlert />
          <PricesCallout
            onOpenSettings={() => {
              handleTabChange("settings");
            }}
          />
          <UnpricedFundsAlert />
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
          <AccountsSettings
            accounts={accounts}
            onAccountsChange={updateAccounts}
          />
          <AssetClassSettings
            portfolio={portfolio}
            onPortfolioChange={updatePortfolio}
          />
          <PriceDataSettings />
          <DataManagement onDataImported={handleDataImport} />
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
            <Title order={3}>Portfolio Rebalancer</Title>
          </Group>
          <ActionIcon
            visibleFrom="md"
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
              toggle();
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
              toggle();
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
              toggle();
            }}
          />
        </AppShell.Section>
      </AppShell.Navbar>

      <AppShell.Main>
        <Stack component="main" gap="xl">
          {/* Contains a page's errors so the navigation stays usable; keyed
              by tab so switching tabs clears the error. */}
          <ErrorBoundary key={activeTab}>{renderContent()}</ErrorBoundary>
        </Stack>
      </AppShell.Main>

      <AppShell.Footer p="md">
        <Group justify="space-between" align="center" h="100%">
          <Text size="sm" c="dimmed">
            © {currentYear} George Dietrich (Blacksmoke16)
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
              Version{" "}
              <Anchor
                href="https://github.com/Blacksmoke16/rebalancer/blob/master/CHANGELOG.md"
                target="_blank"
                rel="noopener noreferrer"
                c="dimmed"
              >
                {__APP_VERSION__}
              </Anchor>
            </Text>
          </Group>
        </Group>
      </AppShell.Footer>
    </AppShell>
  );
}
