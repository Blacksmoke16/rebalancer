import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import App from "../App";
import { renderWithMantine, screen } from "../test/utils";

vi.mock("./Homepage", () => ({
  Homepage: () => {
    throw new Error("Homepage failed to render");
  },
}));

describe("AppContent", () => {
  beforeEach(() => {
    // No saved tab or portfolio, so the app opens on the home tab.
    vi.mocked(localStorage.getItem).mockReturnValue(null);
  });

  it("keeps the navigation usable when a page fails to render", async () => {
    const user = userEvent.setup();
    renderWithMantine(<App />);

    expect(screen.getByText("Something went wrong")).toBeInTheDocument();

    await user.click(screen.getByRole("link", { name: "Portfolio" }));

    expect(
      screen.getByRole("heading", { name: "Current Holdings" }),
    ).toBeInTheDocument();
    expect(screen.queryByText("Something went wrong")).not.toBeInTheDocument();
  });
});
