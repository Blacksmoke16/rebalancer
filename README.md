# Portfolio Rebalancer

[![CI](https://github.com/blacksmoke16/rebalancer/actions/workflows/ci.yml/badge.svg?branch=master&event=schedule)](https://github.com/blacksmoke16/rebalancer/actions/workflows/ci.yml)
[![Latest release](https://img.shields.io/github/release/blacksmoke16/rebalancer.svg)](https://github.com/blacksmoke16/rebalancer/releases)

A privacy-focused portfolio rebalancing tool that helps you optimize your investment allocation across asset classes. Calculate where to invest new money to maintain your target portfolio balance.

## Key Features

- **Portfolio Analysis**: View current vs target allocation across all your asset classes and accounts
- **Rebalancing Recommendations**: Get precise dollar amounts for where to invest new money
- **Planning Mode**: Plan complex transactions before applying them, with real-time balance and analysis
- **Shares or Dollars**: Track each fund as a dollar balance, or as a number of shares valued at its price
- **Price Refresh**: Update share prices from [financeapi.net](https://financeapi.net) with your own free API key, or type them in yourself
- **Responsive Design**: Works perfectly on desktop and mobile devices
- **Privacy First**: All data is stored locally in your browser. The only thing sent anywhere is your share funds' tickers, to financeapi.net, when you refresh prices
- **Real-time Calculations**: Instant updates as you modify your portfolio or investment amounts

## Development

### Prerequisites

- Node.js 26+
- npm

### Getting Started

```sh
# Clone the repository
git clone https://github.com/Blacksmoke16/rebalancer.git
cd rebalancer

# Install dependencies
npm install

# Start development server
npm run dev

# Open http://localhost:5173 in your browser
```

## License

[MIT](LICENSE)

## Contributors

- [George Dietrich](https://github.com/blacksmoke16) - creator and maintainer

[![ko-fi](https://ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/Q5Q31KJEFJ)
