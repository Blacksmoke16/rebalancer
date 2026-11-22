import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { renderWithMantine, screen } from "../test/utils";
import { AssetClass, ShareFund } from "../types";
import {
  AccountId,
  AssetClassId,
  DollarAmount,
  ShareCount,
} from "../types/branded";
import { AssetClassSettings } from "./AssetClassSettings";

const portfolio: AssetClass[] = [
  {
    name: "Stocks",
    allocation: 100,
    funds: [
      {
        ticker: "VTI",
        unit: "dollars",
        values: { ["account-1" as AccountId]: 500 as DollarAmount },
        key: "fund-1",
      },
    ],
    key: "asset-class-1" as AssetClassId,
  },
];

const shareFund: ShareFund = {
  ticker: "VXUS",
  unit: "shares",
  shares: { ["account-1" as AccountId]: 12.5 as ShareCount },
  price: 71.25,
  priceAsOf: "2026-11-20T21:00:00.000Z",
  key: "fund-2",
};

function renderAssetClassSettings(
  onPortfolioChange = vi.fn(),
  initialPortfolio = portfolio,
) {
  renderWithMantine(
    <AssetClassSettings
      portfolio={initialPortfolio}
      onPortfolioChange={onPortfolioChange}
    />,
  );
  return {
    onPortfolioChange,
    nameInput: screen.getByRole("textbox", { name: "Name" }),
    allocationInput: screen.getByRole("textbox", { name: "Target %" }),
    tickerInput: screen.getByRole("textbox", { name: "Ticker" }),
    saveButton: screen.getByRole("button", { name: "Save Changes" }),
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

  it("saves a newly added fund without balances, even if its ticker matches an existing fund", async () => {
    const user = userEvent.setup();
    const { saveButton, onPortfolioChange } = renderAssetClassSettings();

    await user.click(screen.getByRole("button", { name: "Add Fund" }));
    const newTickerInput = screen.getAllByRole("textbox", {
      name: "Ticker",
    })[1];
    await user.type(newTickerInput, "VTI");
    await user.click(saveButton);

    const [[savedPortfolio]] = onPortfolioChange.mock.calls as [[AssetClass[]]];
    expect(savedPortfolio[0].funds[0]).toEqual(portfolio[0].funds[0]);
    expect(savedPortfolio[0].funds[1]).toEqual({
      ticker: "VTI",
      unit: "dollars",
      values: {},
      key: expect.any(String),
    });
  });

  it("keeps a share fund's shares and price when its ticker is edited", async () => {
    const user = userEvent.setup();
    const { tickerInput, saveButton, onPortfolioChange } =
      renderAssetClassSettings(vi.fn(), [
        { ...portfolio[0], funds: [shareFund] },
      ]);

    await user.clear(tickerInput);
    await user.type(tickerInput, "VEU");
    await user.click(saveButton);

    expect(onPortfolioChange).toHaveBeenCalledWith([
      { ...portfolio[0], funds: [{ ...shareFund, ticker: "VEU" }] },
    ]);
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

    expect(screen.getByText("Name is required")).toBeInTheDocument();
    expect(saveButton).toBeDisabled();
  });

  it("rejects a blank allocation", async () => {
    const user = userEvent.setup();
    const { allocationInput, saveButton } = renderAssetClassSettings();

    await user.clear(allocationInput);

    expect(
      screen.getByText("Must be a number between 0 and 100"),
    ).toBeInTheDocument();
    expect(saveButton).toBeDisabled();
  });

  it("rejects a ticker containing unsupported characters", async () => {
    const user = userEvent.setup();
    const { tickerInput, saveButton } = renderAssetClassSettings();

    await user.clear(tickerInput);
    await user.type(tickerInput, "VTI-A");

    expect(screen.getByText("Ticker is required")).toBeInTheDocument();
    expect(saveButton).toBeDisabled();
  });

  it("requires a share fund's ticker to be a single symbol", async () => {
    const user = userEvent.setup();
    const { tickerInput, saveButton } = renderAssetClassSettings(vi.fn(), [
      { ...portfolio[0], funds: [shareFund] },
    ]);

    await user.clear(tickerInput);
    await user.type(tickerInput, "VXUS / VEU");

    expect(
      screen.getByText("Use a single ticker symbol, like VTI or BRK-B"),
    ).toBeInTheDocument();
    expect(saveButton).toBeDisabled();
  });

  it("accepts a share fund ticker with a dash", async () => {
    const user = userEvent.setup();
    const { tickerInput, saveButton, onPortfolioChange } =
      renderAssetClassSettings(vi.fn(), [
        { ...portfolio[0], funds: [shareFund] },
      ]);

    await user.clear(tickerInput);
    await user.type(tickerInput, "BRK-B");
    await user.click(saveButton);

    expect(onPortfolioChange).toHaveBeenCalledWith([
      { ...portfolio[0], funds: [{ ...shareFund, ticker: "BRK-B" }] },
    ]);
  });

  it("rejects allocations that do not total 100%", async () => {
    const user = userEvent.setup();
    const { allocationInput, saveButton } = renderAssetClassSettings();

    await user.clear(allocationInput);
    await user.type(allocationInput, "90");

    expect(saveButton).toBeDisabled();
  });
});
