import { Anchor, Card, List, Stack, Text, Title } from "@mantine/core";
import {
  IconChartPie,
  IconSettings2,
  IconFileImport,
  IconCalculator,
  IconClipboard,
} from "@tabler/icons-react";
import { memo } from "react";

export const Homepage = memo(function Homepage() {
  return (
    <Stack gap="xl">
      <Stack gap="md">
        <Title order={1}>Welcome to Portfolio Rebalancer</Title>
        <Text size="lg" c="dimmed">
          A contribution based rebalancing calculator to help maintain your
          target asset allocation and minimize transactions/taxes.
        </Text>
      </Stack>

      <Card withBorder shadow="sm" p="xl">
        <Title order={2} mb="md">
          Getting Started
        </Title>
        <List spacing="sm">
          <List.Item>
            <Text>
              <strong>Step 1:</strong> Go to Settings to configure your accounts
              and target asset allocation
            </Text>
          </List.Item>
          <List.Item>
            <Text>
              <strong>Step 2:</strong> Navigate to the Portfolio tab to enter
              your current holding values
            </Text>
          </List.Item>
          <List.Item>
            <Text>
              <strong>Step 3:</strong> Input how much you are investing in the{" "}
              <strong>Amount to Invest</strong> input
            </Text>
          </List.Item>
          <List.Item>
            <Text>
              <strong>Step 4:</strong> Buy the suggested amount of each asset
              class in order to get closer to your target allocation; or ensure
              you remain on target if already there.
            </Text>
          </List.Item>
        </List>
      </Card>

      <Stack gap="lg">
        <Title order={2}>Key Features</Title>

        <Card withBorder p="lg">
          <Stack gap="sm">
            <Title order={3} size="h4">
              <IconChartPie
                size={20}
                style={{ verticalAlign: "middle", marginRight: "8px" }}
              />
              Portfolio Management
            </Title>
            <Text>
              Track your current holdings across multiple accounts and asset
              classes. Input fund tickers and amounts to get a complete picture
              of your portfolio.
            </Text>
          </Stack>
        </Card>

        <Card withBorder p="lg">
          <Stack gap="sm">
            <Title order={3} size="h4">
              <IconCalculator
                size={20}
                style={{ verticalAlign: "middle", marginRight: "8px" }}
              />
              New Money Rebalancing Analysis
            </Title>
            <Text>
              Uses the new contribution rebalancing technique to move
              towards/maintain your target allocation while minimizing
              transactions/taxes.
            </Text>
          </Stack>
        </Card>

        <Card withBorder p="lg">
          <Stack gap="sm">
            <Title order={3} size="h4">
              <IconClipboard
                size={20}
                style={{ verticalAlign: "middle", marginRight: "8px" }}
              />
              Planning mode
            </Title>
            <Text>
              Allows entering fund specific buys/sells that update the
              rebalancing analysis in real time. Useful for yearly rebalancing.
            </Text>
          </Stack>
        </Card>

        <Card withBorder p="lg">
          <Stack gap="sm">
            <Title order={3} size="h4">
              <IconSettings2
                size={20}
                style={{ verticalAlign: "middle", marginRight: "8px" }}
              />
              Flexible Configuration
            </Title>
            <Text>
              Configure your investment accounts (401k, IRA, Taxable, etc.) and
              define your target asset allocation percentages.
            </Text>
          </Stack>
        </Card>

        <Card withBorder p="lg">
          <Stack gap="sm">
            <Title order={3} size="h4">
              <IconFileImport
                size={20}
                style={{ verticalAlign: "middle", marginRight: "8px" }}
              />
              Data Management
            </Title>
            <Text>
              Export your portfolio data for backup or import previously saved
              configurations. All data is stored locally in your browser for
              privacy.
            </Text>
          </Stack>
        </Card>

        <Card withBorder p="lg">
          <Stack gap="sm">
            <Title order={3} size="h4">
              <IconFileImport
                size={20}
                style={{ verticalAlign: "middle", marginRight: "8px" }}
              />
              Free and Open Source
            </Title>
            <Text>Free, without ads, fully open source MIT licensed.</Text>
            <Text size="sm" c="dimmed">
              Support development:{" "}
              <Anchor
                rel="noopener noreferrer"
                href="https://ko-fi.com/blacksmoke16/tip"
                target="_blank"
              >
                Buy me a coffee
              </Anchor>
            </Text>
          </Stack>
        </Card>
      </Stack>

      <Card withBorder p="lg">
        <Title order={2} mb="md">
          Need Help? Have an idea?
        </Title>
        <Text mb="sm">
          Open an issue or start a discussion on the{" "}
          <Anchor
            rel="noopener noreferrer"
            href="https://github.com/blacksmoke16/rebalancer"
            target="_blank"
          >
            Github Repository
          </Anchor>
          .
        </Text>
      </Card>
    </Stack>
  );
});
