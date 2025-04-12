import AssetClassList from './AssetClassList.tsx';

export interface Account {
    name: string;
    allocation: number;
}

export interface Fund {
    name: string;
    value: number;
}

export interface AssetClass {
    name: string;
    funds: Fund[];
}

export interface Portfolio {
    version: number;
    accounts: Account[];
    asset_classes: AssetClass[];
}

export default function App() {
    return <AssetClassList/>
}