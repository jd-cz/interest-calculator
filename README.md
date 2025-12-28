# Compound Interest Calculator

## Getting started

```bash
npm install
npm run dev
```

## Tests

```bash
npm test
```

The GitHub Pages workflow runs `npm test` before building, so deployments fail if unit tests fail.

## Manual test scenarios

Scenario 1
- Inputs: principal 10000, annual rate 5, years 10, compounding 12, monthly contribution 0
- Expected outputs (rounded to cents):
  - Final amount: 16,470.09
  - Total interest earned: 6,470.09
  - Total contributions: 10,000.00

Scenario 2
- Inputs: principal 5000, annual rate 7, years 5, compounding 4, monthly contribution 150
- Expected outputs (rounded to cents):
  - Final amount: 17,801.59
  - Total interest earned: 3,801.59
  - Total contributions: 14,000.00
