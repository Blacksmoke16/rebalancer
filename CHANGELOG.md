# Changelog

## [0.4.1] - 2026-11-22

### Added

- Add drag-and-drop reordering for funds within an asset class in Settings (George Dietrich)
- Show the amount to buy in shares when an asset class holds a single priced share fund (George Dietrich)
- Flag share prices that are over a week old (George Dietrich)
- Add a "Discard changes" button to the Settings forms (George Dietrich)

### Changed

- Save tickers in uppercase, and allow the `.`, `-`, and `=` used in symbols like `BRK-B` (George Dietrich)
- Rename the Settings save buttons to "Save accounts" and "Save asset classes" (George Dietrich)

### Fixed

- Fix deleting a fund, with no other changes, leaving the save button disabled (George Dietrich)
- Keep the prices already fetched when a later price request fails (George Dietrich)

[0.4.0]: https://github.com/blacksmoke16/rebalancer/releases/tag/v0.4.1

## [0.4.0] - 2026-11-22

### Added

- Track a fund's holdings as a number of shares valued at its price, instead of dollars ([#93]) (George Dietrich)
- Refresh share prices from financeapi.net with your own API key ([#94]) (George Dietrich)

[0.4.0]: https://github.com/blacksmoke16/rebalancer/releases/tag/v0.4.0
[#93]: https://github.com/Blacksmoke16/rebalancer/pull/93
[#94]: https://github.com/Blacksmoke16/rebalancer/pull/94

## [0.3.2] - 2026-06-07

### Fixed

- Fix renaming an account would orphan holdings within that account (George Dietrich)

[0.3.2]: https://github.com/blacksmoke16/rebalancer/releases/tag/v0.3.2

## [0.3.1] - 2026-01-01

### Fixed

- Fix planning mode input not clearing on select-all + delete (George Dietrich)

[0.3.1]: https://github.com/blacksmoke16/rebalancer/releases/tag/v0.3.1

## [0.3.0] - 2025-12-20

### Added

- Add drag-and-drop reordering for investment accounts in Settings ([#31]) (George Dietrich)

[0.3.0]: https://github.com/blacksmoke16/rebalancer/releases/tag/v0.3.0
[#31]: https://github.com/Blacksmoke16/rebalancer/pull/31

## [0.2.0] - 2025-11-03

### Changed

- Change order of Rebalancing Analysis columns to ensure Current is before Target ([#21]) (George Dietrich)

### Added

- Add a planning mode to help with modeling out transactions; such as for yearly rebalancing ([#21]) (George Dietrich)

### Fixed

- Relax fund name validation to avoid state in which the save button is permanently disabled ([#16]) (George Dietrich)

[0.2.0]: https://github.com/blacksmoke16/rebalancer/releases/tag/v0.2.0
[#16]: https://github.com/Blacksmoke16/rebalancer/pull/16
[#21]: https://github.com/Blacksmoke16/rebalancer/pull/21

## [0.1.0] - 2025-09-01

_Initial release._

[0.1.0]: https://github.com/blacksmoke16/rebalancer/releases/tag/v0.1.0
