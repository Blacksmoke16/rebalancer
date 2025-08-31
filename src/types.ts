export interface Account {
    name: string;
    key: string;
}

/* Key representing name of an account and value being the value of the fund in that account */
export type FundValues = Record<string, number>;

export interface Fund {
    ticker: string;
    values: FundValues;
    key: string;
}

export interface AssetClass {
    name: string;
    allocation: number;
    funds: Fund[];
    key: string;
}

export interface PortfolioData {
    accounts: Account[];
    portfolio: AssetClass[];
    toInvest: number;
    version: string;
    lastSaved: string;
}