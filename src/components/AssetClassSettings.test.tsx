import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { renderWithMantine, screen } from "../test/utils";
import { AssetClass } from "../types";
import {
  AccountId,
  AssetClassId,
  DollarAmount,
  FundTicker,
  Percentage,
} from "../types/branded";
import { AssetClassSettings } from "./AssetClassSettings";

const portfolio: AssetClass[] = [
  {
    name: "Stocks",
    allocation: 100 as Percentage,
    funds: [
      {
        ticker: "VTI" as FundTicker,
        values: { ["account-1" as AccountId]: 500 as DollarAmount },
        key: "fund-1",
      },
    ],
    key: "asset-class-1" as AssetClassId,
  },
];

// The settings form renders separate mobile and desktop copies of each
// input and button; both copies are bound to the same form field.
function renderAssetClassSettings(onPortfolioChange = vi.fn()) {
  renderWithMantine(
    <AssetClassSettings
      portfolio={portfolio}
      onPortfolioChange={onPortfolioChange}
    />,
  );
  return {
    onPortfolioChange,
    nameInput: screen.getAllByTestId("asset-class-name-0")[0],
    allocationInput: screen.getAllByTestId("asset-class-allocation-0")[0],
    tickerInput: screen.getAllByTestId("fund-ticker-0-0")[0],
    saveButton: screen.getAllByRole("button", { name: "Save Changes" })[0],
  };
}

describe("AssetClassSettings", () => {
  it("keeps spaces typed between words in an asset class name", async () => {
    const user = userEvent.setup();
    const { nameInput } = renderAssetClassSettings();

    await user.clear(nameInput);
    await user.type(nameInput, "US Total Stock Market");

    expect(nameInput).toHaveValue("US Total Stock Market");
  });

  it("saves names with whitespace collapsed and tickers trimmed", async () => {
    const user = userEvent.setup();
    const { nameInput, tickerInput, saveButton, onPortfolioChange } =
      renderAssetClassSettings();

    await user.clear(nameInput);
    await user.type(nameInput, "  US   Stocks  ");
    await user.clear(tickerInput);
    await user.type(tickerInput, " VTSAX / VTI ");
    await user.click(saveButton);

    expect(onPortfolioChange).toHaveBeenCalledWith([
      {
        ...portfolio[0],
        name: "US Stocks",
        funds: [{ ...portfolio[0].funds[0], ticker: "VTSAX / VTI" }],
      },
    ]);
  });

  it("rejects a blank asset class name", async () => {
    const user = userEvent.setup();
    const { nameInput, saveButton } = renderAssetClassSettings();

    await user.clear(nameInput);
    await user.type(nameInput, "   ");

    expect(screen.getAllByText("Name is required")[0]).toBeInTheDocument();
    expect(saveButton).toBeDisabled();
  });

  it("rejects a blank allocation", async () => {
    const user = userEvent.setup();
    const { allocationInput, saveButton } = renderAssetClassSettings();

    await user.clear(allocationInput);

    expect(
      screen.getAllByText("Must be a number between 0 and 100")[0],
    ).toBeInTheDocument();
    expect(saveButton).toBeDisabled();
  });

  it("rejects a ticker containing unsupported characters", async () => {
    const user = userEvent.setup();
    const { tickerInput, saveButton } = renderAssetClassSettings();

    await user.clear(tickerInput);
    await user.type(tickerInput, "VTI-A");

    expect(screen.getAllByText("Ticker is required")[0]).toBeInTheDocument();
    expect(saveButton).toBeDisabled();
  });

  it("rejects allocations that do not total 100%", async () => {
    const user = userEvent.setup();
    const { allocationInput, saveButton } = renderAssetClassSettings();

    await user.clear(allocationInput);
    await user.type(allocationInput, "90");

    expect(saveButton).toBeDisabled();
  });
});
