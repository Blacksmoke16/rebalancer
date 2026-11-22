import { describe, expect, it, vi } from "vitest";
import {
  describePriceError,
  describeRefresh,
  fetchQuotes,
  parseQuoteResponse,
  PriceError,
  type Quote,
} from "./prices";
import fixtureText from "./test/fixtures/yfapi-quote-response.json?raw";

// A real response to a request for VTI, BND, VTSAX, BRK-B, and FOSDFSD234O,
// which the API left out because it doesn't exist.
const fixture: unknown = JSON.parse(fixtureText);

// A response like the API's, with one result per symbol.
function quoteResponse(symbols: string[]) {
  return {
    quoteResponse: {
      result: symbols.map((symbol) => ({
        symbol,
        regularMarketPrice: 100,
        regularMarketTime: 1795208402,
        currency: "USD",
      })),
      error: null,
    },
  };
}

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

// A fetch that answers each request with quotes for the symbols it asked for.
function fetchReturningRequestedQuotes() {
  return vi.fn((url: string) => {
    const symbols = new URL(url).searchParams.get("symbols")?.split(",") ?? [];
    return Promise.resolve(jsonResponse(quoteResponse(symbols)));
  });
}

async function priceErrorFrom(promise: Promise<unknown>): Promise<PriceError> {
  try {
    await promise;
  } catch (error) {
    if (error instanceof PriceError) return error;
    throw error;
  }
  throw new Error("Expected a PriceError");
}

describe("parseQuoteResponse", () => {
  it("reads each quote's regular market price and time from a real response", () => {
    expect(parseQuoteResponse(fixture)).toEqual([
      {
        symbol: "VTI",
        price: 340.02,
        asOf: "2026-11-20T21:00:02.000Z",
        currency: "USD",
      },
      {
        symbol: "BND",
        price: 71.33,
        asOf: "2026-11-20T21:00:02.000Z",
        currency: "USD",
      },
      {
        symbol: "VTSAX",
        price: 165.34,
        asOf: "2026-11-21T01:08:23.000Z",
        currency: "USD",
      },
      {
        symbol: "BRK-B",
        price: 570,
        asOf: "2026-11-20T21:04:07.000Z",
        currency: "USD",
      },
    ]);
  });

  it("skips results without a usable price", () => {
    const response = quoteResponse(["VTI", "BND", "OLD"]);
    const [, bnd, old] = response.quoteResponse.result as Record<
      string,
      unknown
    >[];
    bnd.regularMarketPrice = 0;
    delete old.regularMarketPrice;

    expect(parseQuoteResponse(response).map((q) => q.symbol)).toEqual(["VTI"]);
  });

  it("rejects a response that isn't a quote response", () => {
    for (const json of [null, {}, { quoteResponse: { result: "nope" } }]) {
      expect(() => parseQuoteResponse(json)).toThrow(
        new PriceError("unexpected", "Unexpected response from the API"),
      );
    }
  });
});

describe("fetchQuotes", () => {
  it("requests the symbols with the API key", async () => {
    const fetchImpl = fetchReturningRequestedQuotes();

    await fetchQuotes(["VTI", "BRK-B"], "my-key", fetchImpl);

    expect(fetchImpl).toHaveBeenCalledWith(
      "https://yfapi.net/v6/finance/quote?region=US&lang=en&symbols=VTI,BRK-B",
      { headers: { "x-api-key": "my-key" } },
    );
  });

  it("uppercases and deduplicates symbols", async () => {
    const fetchImpl = fetchReturningRequestedQuotes();

    const { quotes } = await fetchQuotes(
      ["vti", "VTI", " bnd "],
      "key",
      fetchImpl,
    );

    expect(fetchImpl).toHaveBeenCalledTimes(1);
    expect(
      new URL(fetchImpl.mock.calls[0][0]).searchParams.get("symbols"),
    ).toBe("VTI,BND");
    expect([...quotes.keys()]).toEqual(["VTI", "BND"]);
  });

  it("asks for at most 10 symbols per request", async () => {
    const fetchImpl = fetchReturningRequestedQuotes();
    const symbols = Array.from({ length: 23 }, (_, i) => `S${i}`);

    const { quotes } = await fetchQuotes(symbols, "key", fetchImpl);

    const batchSizes = fetchImpl.mock.calls.map(
      ([url]) => new URL(url).searchParams.get("symbols")?.split(",").length,
    );
    expect(batchSizes).toEqual([10, 10, 3]);
    expect(quotes.size).toBe(23);
  });

  it("reports symbols the API left out of its response", async () => {
    const fetchImpl = vi.fn(() =>
      Promise.resolve(jsonResponse(quoteResponse(["VTI"]))),
    );

    const { quotes, missing } = await fetchQuotes(
      ["VTI", "NOPE"],
      "key",
      fetchImpl,
    );

    expect([...quotes.keys()]).toEqual(["VTI"]);
    expect(missing).toEqual(["NOPE"]);
  });

  it("makes no request without symbols", async () => {
    const fetchImpl = vi.fn();

    expect(await fetchQuotes([], "key", fetchImpl)).toEqual({
      quotes: new Map(),
      missing: [],
    });
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it.each([
    [401, "invalid-key"],
    [403, "invalid-key"],
    [402, "quota"],
    [429, "quota"],
    [500, "unexpected"],
  ])(
    "treats HTTP %i as %s, keeping the API's message",
    async (status, kind) => {
      const fetchImpl = vi.fn(() =>
        Promise.resolve(jsonResponse({ message: "Forbidden" }, status)),
      );

      const error = await priceErrorFrom(
        fetchQuotes(["VTI"], "key", fetchImpl),
      );

      expect(error.kind).toBe(kind);
      expect(error.message).toBe("Forbidden");
    },
  );

  it("falls back to the HTTP status when an error has no message", async () => {
    const fetchImpl = vi.fn(() =>
      Promise.resolve(
        new Response("<html>Bad gateway</html>", { status: 502 }),
      ),
    );

    const error = await priceErrorFrom(fetchQuotes(["VTI"], "key", fetchImpl));

    expect(error).toEqual(new PriceError("unexpected", "HTTP 502"));
  });

  it("treats a failed request as a network error", async () => {
    const fetchImpl = vi.fn(() => Promise.reject(new TypeError("Failed")));

    const error = await priceErrorFrom(fetchQuotes(["VTI"], "key", fetchImpl));

    expect(error.kind).toBe("network");
  });
});

describe("describeRefresh", () => {
  function quote(symbol: string, currency: string | null = "USD"): Quote {
    return { symbol, price: 100, asOf: "2026-11-20T21:00:02.000Z", currency };
  }

  it("counts the prices updated", () => {
    expect(
      describeRefresh({
        quotes: new Map([
          ["VTI", quote("VTI")],
          ["BND", quote("BND")],
        ]),
        missing: [],
      }),
    ).toEqual({
      title: "Prices updated",
      message: "Updated 2 prices.",
      color: "green",
    });
    expect(
      describeRefresh({ quotes: new Map([["VTI", quote("VTI")]]), missing: [] })
        .message,
    ).toBe("Updated 1 price.");
  });

  it("names symbols that couldn't be priced", () => {
    expect(
      describeRefresh({
        quotes: new Map([["VTI", quote("VTI")]]),
        missing: ["NOPE", "GONE"],
      }),
    ).toEqual({
      title: "Some prices not updated",
      message:
        "Updated 1 price. Couldn't find a price for NOPE, GONE; check those tickers in Settings.",
      color: "yellow",
    });
  });

  it("warns about prices quoted in another currency", () => {
    expect(
      describeRefresh({
        quotes: new Map([["SHOP.TO", quote("SHOP.TO", "CAD")]]),
        missing: [],
      }),
    ).toEqual({
      title: "Some prices not in US dollars",
      message:
        "Updated 1 price. SHOP.TO is quoted in CAD, but its price is used as US dollars.",
      color: "yellow",
    });
  });
});

describe("describePriceError", () => {
  it("explains each kind of failure", () => {
    expect(describePriceError(new PriceError("invalid-key", "Forbidden"))).toBe(
      "The API key was rejected. Check it in Settings → Price data.",
    );
    expect(describePriceError(new PriceError("quota", "Limit Exceeded"))).toBe(
      "The API's request limit has been reached (Limit Exceeded). Try again later.",
    );
    expect(describePriceError(new PriceError("network", "Failed"))).toBe(
      "Couldn't reach financeapi.net. Check your connection and try again.",
    );
    expect(describePriceError(new PriceError("unexpected", "HTTP 502"))).toBe(
      "The price service returned an error: HTTP 502.",
    );
  });
});
