// Share prices from financeapi.net's quote API, requested with the user's own
// API key.

const QUOTE_URL = "https://yfapi.net/v6/finance/quote";

// The API accepts at most 10 symbols per request, and each request counts
// against the key's daily quota.
const MAX_SYMBOLS_PER_REQUEST = 10;

export interface Quote {
  symbol: string;
  // The regular market price, which matches the official close.
  price: number;
  // ISO timestamp of that price.
  asOf: string;
  // e.g. "USD"; null when the API doesn't say.
  currency: string | null;
}

export interface QuoteResults {
  quotes: Map<string, Quote>;
  // Requested symbols the API had no price for. It leaves unknown symbols out
  // of its response rather than reporting an error.
  missing: string[];
  // Why the symbols after `quotes` weren't requested, when a request failed
  // after earlier ones succeeded.
  error: PriceError | null;
}

export type PriceErrorKind = "invalid-key" | "quota" | "network" | "unexpected";

export class PriceError extends Error {
  readonly kind: PriceErrorKind;

  constructor(kind: PriceErrorKind, message: string) {
    super(message);
    this.name = "PriceError";
    this.kind = kind;
  }
}

type Fetch = (url: string, init: RequestInit) => Promise<Response>;

// Fetches quotes for the given symbols, uppercased and deduplicated, in as few
// requests as the API allows. Throws a PriceError if the first request fails.
// If a later one fails, it stops there and returns the quotes it already has,
// since those used the key's quota too.
export async function fetchQuotes(
  symbols: string[],
  apiKey: string,
  fetchImpl: Fetch = fetch,
): Promise<QuoteResults> {
  const requested = [
    ...new Set(symbols.map((symbol) => symbol.trim().toUpperCase())),
  ];
  const quotes = new Map<string, Quote>();
  const answered: string[] = [];
  for (let i = 0; i < requested.length; i += MAX_SYMBOLS_PER_REQUEST) {
    const batch = requested.slice(i, i + MAX_SYMBOLS_PER_REQUEST);
    try {
      for (const quote of await fetchBatch(batch, apiKey, fetchImpl)) {
        quotes.set(quote.symbol, quote);
      }
    } catch (error) {
      if (i === 0 || !(error instanceof PriceError)) throw error;
      return { quotes, missing: missingFrom(answered, quotes), error };
    }
    answered.push(...batch);
  }
  return { quotes, missing: missingFrom(answered, quotes), error: null };
}

function missingFrom(symbols: string[], quotes: Map<string, Quote>): string[] {
  return symbols.filter((symbol) => !quotes.has(symbol));
}

async function fetchBatch(
  symbols: string[],
  apiKey: string,
  fetchImpl: Fetch,
): Promise<Quote[]> {
  const url = `${QUOTE_URL}?region=US&lang=en&symbols=${symbols
    .map(encodeURIComponent)
    .join(",")}`;

  let response: Response;
  try {
    response = await fetchImpl(url, { headers: { "x-api-key": apiKey } });
  } catch {
    throw new PriceError("network", "The request failed");
  }

  const body = await response.json().then(
    (json: unknown) => json,
    () => null,
  );
  if (!response.ok) {
    throw new PriceError(
      errorKindForStatus(response.status),
      messageFrom(body) ?? `HTTP ${response.status}`,
    );
  }
  return parseQuoteResponse(body);
}

// A rejected key gets 403 (a missing key does too). The quota codes are a
// guess, since checking them would use up a real key's quota; any other
// status still shows the API's message.
function errorKindForStatus(status: number): PriceErrorKind {
  if (status === 401 || status === 403) return "invalid-key";
  if (status === 402 || status === 429) return "quota";
  return "unexpected";
}

function messageFrom(body: unknown): string | null {
  if (isRecord(body) && typeof body.message === "string") {
    return body.message;
  }
  return null;
}

// Reads quotes from a response shaped like
// `{ quoteResponse: { result: [{ symbol, regularMarketPrice, ... }] } }`,
// skipping results without a usable price.
export function parseQuoteResponse(json: unknown): Quote[] {
  const result =
    isRecord(json) && isRecord(json.quoteResponse)
      ? json.quoteResponse.result
      : undefined;
  if (!Array.isArray(result)) {
    throw new PriceError("unexpected", "Unexpected response from the API");
  }

  return result.flatMap((item: unknown): Quote[] => {
    if (
      !isRecord(item) ||
      typeof item.symbol !== "string" ||
      typeof item.regularMarketPrice !== "number" ||
      !(item.regularMarketPrice > 0) ||
      typeof item.regularMarketTime !== "number"
    ) {
      return [];
    }
    return [
      {
        symbol: item.symbol.toUpperCase(),
        price: item.regularMarketPrice,
        // The API gives Unix seconds.
        asOf: new Date(item.regularMarketTime * 1000).toISOString(),
        currency: typeof item.currency === "string" ? item.currency : null,
      },
    ];
  });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export interface RefreshSummary {
  title: string;
  message: string;
  color: "green" | "yellow";
}

// What a refresh did, for a notification. Prices are assumed to be in US
// dollars, so quotes in another currency are called out rather than converted.
export function describeRefresh({
  quotes,
  missing,
  error,
}: QuoteResults): RefreshSummary {
  const sentences = [
    `Updated ${quotes.size} ${quotes.size === 1 ? "price" : "prices"}.`,
  ];
  if (missing.length > 0) {
    sentences.push(
      `Couldn't find a price for ${missing.join(", ")}; check those tickers in Settings.`,
    );
  }

  const otherCurrencies = [...quotes.values()].filter(
    (quote) => quote.currency !== null && quote.currency !== "USD",
  );
  if (otherCurrencies.length > 0) {
    const quotedIn = otherCurrencies
      .map((quote) => `${quote.symbol} is quoted in ${quote.currency ?? ""}`)
      .join(", ");
    sentences.push(
      `${quotedIn}, but ${otherCurrencies.length === 1 ? "its price is" : "their prices are"} used as US dollars.`,
    );
  }

  if (error) {
    sentences.push(`The rest weren't updated: ${describePriceError(error)}`);
  }

  const message = sentences.join(" ");
  if (missing.length > 0 || error) {
    return { title: "Some prices not updated", message, color: "yellow" };
  }
  if (otherCurrencies.length > 0) {
    return { title: "Some prices not in US dollars", message, color: "yellow" };
  }
  return { title: "Prices updated", message, color: "green" };
}

// How to fix a failed refresh, for a notification.
export function describePriceError(error: PriceError): string {
  switch (error.kind) {
    case "invalid-key":
      return "The API key was rejected. Check it in Settings → Price data.";
    case "quota":
      return `The API's request limit has been reached (${error.message}). Try again later.`;
    case "network":
      return "Couldn't reach financeapi.net. Check your connection and try again.";
    case "unexpected":
      return `The price service returned an error: ${error.message}.`;
  }
}
