import {
  Button,
  Popover,
  PopoverDropdown,
  PopoverTarget,
  SegmentedControl,
  Stack,
  Text,
} from "@mantine/core";
import { SubmitEvent, useState } from "react";
import { usePortfolioContext } from "../../contexts/PortfolioContext";
import { Fund, FundUnit } from "../../types";
import { formatDate } from "../../utils/format";
import { validateTicker } from "../../utils/validation";
import { NumberField } from "./NumberField";

// Matches the precision prices are shown with.
const PRICE_DECIMAL_SCALE = 4;

interface FundPriceCellProps {
  fund: Fund;
}

// A share fund's price and the date it's from, plus the control that switches
// a fund between dollars and shares. Neither can change while planning, since
// planned changes are valued at the current prices.
export function FundPriceCell({ fund }: FundPriceCellProps) {
  const { planningMode, updateFundPrice } = usePortfolioContext();

  return (
    <Stack gap={4}>
      {fund.unit === "shares" ? (
        <>
          <NumberField
            isCurrency
            allowDecimal
            decimalScale={PRICE_DECIMAL_SCALE}
            value={fund.price ?? ""}
            placeholder="Price"
            disabled={planningMode}
            aria-label={`${fund.ticker} price`}
            data-testid={`${fund.ticker}-price`}
            onValueChange={(value) => {
              updateFundPrice(fund.key, value);
            }}
          />
          {fund.priceAsOf && (
            <Text size="xs" c="dimmed">
              as of {formatDate(fund.priceAsOf)}
            </Text>
          )}
        </>
      ) : (
        <Text c="dimmed">—</Text>
      )}
      <FundUnitControl fund={fund} />
    </Stack>
  );
}

function FundUnitControl({ fund }: FundPriceCellProps) {
  const { planningMode, convertFundToShares, convertFundToDollars } =
    usePortfolioContext();
  const [priceFormOpened, setPriceFormOpened] = useState(false);
  const [conversionPrice, setConversionPrice] = useState(0);
  // Share funds are priced by ticker, so they need a single symbol.
  const canHoldShares = validateTicker(fund.ticker, "shares") === null;

  function handleUnitChange(unit: FundUnit): void {
    if (unit === "dollars") {
      convertFundToDollars(fund.key);
      return;
    }
    // Dollars convert to shares at a price, so ask for one first.
    setConversionPrice(0);
    setPriceFormOpened(true);
  }

  function handleConvert(event: SubmitEvent): void {
    event.preventDefault();
    convertFundToShares(fund.key, conversionPrice);
    setPriceFormOpened(false);
  }

  return (
    <>
      <Popover
        opened={priceFormOpened}
        onChange={setPriceFormOpened}
        trapFocus
        withArrow
      >
        <PopoverTarget>
          <SegmentedControl<FundUnit>
            size="xs"
            value={fund.unit}
            onChange={handleUnitChange}
            disabled={planningMode}
            data={[
              {
                value: "dollars",
                label: "$",
                disabled: fund.unit === "shares" && !fund.price,
              },
              { value: "shares", label: "Shares", disabled: !canHoldShares },
            ]}
            data-testid={`${fund.ticker}-unit`}
          />
        </PopoverTarget>
        <PopoverDropdown>
          <form onSubmit={handleConvert}>
            <Stack gap="xs">
              <NumberField
                label={`${fund.ticker} price per share`}
                isCurrency
                allowDecimal
                decimalScale={PRICE_DECIMAL_SCALE}
                value={conversionPrice || ""}
                onValueChange={setConversionPrice}
                data-autofocus
              />
              <Button type="submit" size="xs" disabled={!conversionPrice}>
                Convert to shares
              </Button>
            </Stack>
          </form>
        </PopoverDropdown>
      </Popover>
      {fund.unit === "dollars" && !canHoldShares && (
        <Text size="xs" c="dimmed">
          Shares need a single ticker symbol
        </Text>
      )}
    </>
  );
}
