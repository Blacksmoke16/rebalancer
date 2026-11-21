import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { renderWithMantine, screen } from "../test/utils";
import { Account } from "../types";
import { AccountId } from "../types/branded";
import { AccountsSettings } from "./AccountsSettings";

const accounts: Account[] = [{ name: "401k", key: "account-1" as AccountId }];

function renderAccountsSettings(onAccountsChange = vi.fn()) {
  renderWithMantine(
    <AccountsSettings
      accounts={accounts}
      onAccountsChange={onAccountsChange}
    />,
  );
  return {
    onAccountsChange,
    nameInput: screen.getByRole("textbox", { name: "Name" }),
    saveButton: screen.getByRole("button", { name: "Save Changes" }),
  };
}

describe("AccountsSettings", () => {
  it("keeps spaces typed between words in an account name", async () => {
    const user = userEvent.setup();
    const { nameInput } = renderAccountsSettings();

    await user.clear(nameInput);
    await user.type(nameInput, "Roth IRA");

    expect(nameInput).toHaveValue("Roth IRA");
  });

  it("saves account names with surrounding and repeated whitespace collapsed", async () => {
    const user = userEvent.setup();
    const { nameInput, saveButton, onAccountsChange } =
      renderAccountsSettings();

    await user.clear(nameInput);
    await user.type(nameInput, "  Roth   IRA  ");
    await user.click(saveButton);

    expect(onAccountsChange).toHaveBeenCalledWith([
      { name: "Roth IRA", key: "account-1" },
    ]);
  });

  it("rejects a blank account name", async () => {
    const user = userEvent.setup();
    const { nameInput, saveButton } = renderAccountsSettings();

    await user.clear(nameInput);
    await user.type(nameInput, "   ");

    expect(screen.getByText("Name is required")).toBeInTheDocument();
    expect(saveButton).toBeDisabled();
  });
});
