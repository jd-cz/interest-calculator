import { useMemo, useState, type FormEvent } from "react";
import {
  calculateCompoundInterest,
  type CalculationResult,
} from "./lib/calc";
import "./styles.css";

const numberFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 2,
});

type FormState = {
  principal: string;
  annualRatePercent: string;
  years: string;
  compoundsPerYear: string;
  contributionAmount: string;
  contributionFrequency: "monthly" | "annual";
};

type FieldErrors = Partial<Record<keyof FormState, string>>;

const defaultState: FormState = {
  principal: "0",
  annualRatePercent: "6",
  years: "10",
  compoundsPerYear: "12",
  contributionAmount: "200",
  contributionFrequency: "monthly",
};

const compoundOptions = [
  { label: "Yearly (1)", value: "1" },
  { label: "Quarterly (4)", value: "4" },
  { label: "Monthly (12)", value: "12" },
  { label: "Daily (365)", value: "365" },
];

function parseNumber(value: string): number | null {
  const normalized = value.replace(/,/g, "").trim();
  if (!normalized) {
    return null;
  }
  const parsed = Number(normalized);
  if (!Number.isFinite(parsed)) {
    return null;
  }
  return parsed;
}

export default function App() {
  const [formState, setFormState] = useState<FormState>(defaultState);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [result, setResult] = useState<CalculationResult | null>(null);

  const chartPoints = useMemo(() => {
    if (!result) {
      return [];
    }
      const rows = result.yearlyRows;
      if (rows.length === 0) {
        return [];
      }
      const maxValue = Math.max(...rows.map((row) => row.endBalance));
      return rows.map((row, index) => {
      const x = rows.length === 1 ? 0 : index / (rows.length - 1);
      const y = maxValue === 0 ? 1 : 1 - row.endBalance / maxValue;
        return { x, y, label: row.yearLabel };
      });
    }, [result]);

  function updateField(field: keyof FormState, value: string) {
    setFormState((prev) => ({ ...prev, [field]: value }));
  }

  function validate(): { parsed: Record<string, number>; errors: FieldErrors } {
    const nextErrors: FieldErrors = {};

    let principal: number | null = null;
    if (formState.principal.trim() === "") {
      principal = 0;
    } else {
      principal = parseNumber(formState.principal);
      if (principal === null || principal < 0) {
        nextErrors.principal = "Enter a principal of 0 or higher.";
      }
    }

    const annualRatePercent = parseNumber(formState.annualRatePercent);
    if (annualRatePercent === null || annualRatePercent < 0) {
      nextErrors.annualRatePercent = "Enter an annual rate of 0 or higher.";
    }

    const years = parseNumber(formState.years);
    if (years === null || years <= 0) {
      nextErrors.years = "Enter a number of years greater than 0.";
    }

    const compoundsPerYear = parseNumber(formState.compoundsPerYear);
    if (compoundsPerYear === null || compoundsPerYear <= 0) {
      nextErrors.compoundsPerYear = "Select a compounding frequency.";
    }

    let contributionAmount: number | null = null;
    if (formState.contributionAmount.trim() === "") {
      contributionAmount = 0;
    } else {
      contributionAmount = parseNumber(formState.contributionAmount);
      if (contributionAmount === null || contributionAmount < 0) {
        nextErrors.contributionAmount = "Enter a contribution of 0 or higher.";
      }
    }

    return {
      parsed: {
        principal: principal ?? 0,
        annualRatePercent: annualRatePercent ?? 0,
        years: years ?? 0,
        compoundsPerYear: compoundsPerYear ?? 0,
        contributionAmount: contributionAmount ?? 0,
      },
      errors: nextErrors,
    };
  }

  function handleCalculate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const { parsed, errors: nextErrors } = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      setResult(null);
      return;
    }

    const calculation = calculateCompoundInterest({
      principal: parsed.principal,
      annualRatePercent: parsed.annualRatePercent,
      years: parsed.years,
      compoundsPerYear: parsed.compoundsPerYear,
      contributionAmount: parsed.contributionAmount,
      contributionFrequency: formState.contributionFrequency,
    });
    setResult(calculation);
  }

  return (
    <div className="page">
      <header className="hero">
        <div>
          <p className="eyebrow">Compound Interest Calculator</p>
          <h1>See how your savings grow.</h1>
          <p className="subhead">
            Enter your starting balance, interest rate, and contributions to estimate
            year-by-year growth.
          </p>
        </div>
      </header>

      <div className="content">
        <form className="card form" onSubmit={handleCalculate} noValidate>
          <div className="field">
            <label htmlFor="principal">Principal</label>
            <input
              id="principal"
              name="principal"
              inputMode="decimal"
              value={formState.principal}
              onChange={(event) => updateField("principal", event.target.value)}
              placeholder="10000"
              aria-invalid={Boolean(errors.principal)}
              aria-describedby={errors.principal ? "principal-error" : undefined}
            />
            {errors.principal ? (
              <span className="error" id="principal-error">
                {errors.principal}
              </span>
            ) : null}
          </div>

          <div className="field">
            <label htmlFor="annualRatePercent">Annual interest rate (%)</label>
            <input
              id="annualRatePercent"
              name="annualRatePercent"
              inputMode="decimal"
              value={formState.annualRatePercent}
              onChange={(event) => updateField("annualRatePercent", event.target.value)}
              placeholder="6"
              aria-invalid={Boolean(errors.annualRatePercent)}
              aria-describedby={errors.annualRatePercent ? "rate-error" : undefined}
            />
            {errors.annualRatePercent ? (
              <span className="error" id="rate-error">
                {errors.annualRatePercent}
              </span>
            ) : null}
          </div>

          <div className="field">
            <label htmlFor="years">Years</label>
            <input
              id="years"
              name="years"
              inputMode="decimal"
              value={formState.years}
              onChange={(event) => updateField("years", event.target.value)}
              placeholder="10"
              aria-invalid={Boolean(errors.years)}
              aria-describedby={errors.years ? "years-error" : undefined}
            />
            {errors.years ? (
              <span className="error" id="years-error">
                {errors.years}
              </span>
            ) : null}
          </div>

          <div className="field">
            <label htmlFor="compoundsPerYear">Compounding frequency</label>
            <select
              id="compoundsPerYear"
              name="compoundsPerYear"
              value={formState.compoundsPerYear}
              onChange={(event) => updateField("compoundsPerYear", event.target.value)}
              aria-invalid={Boolean(errors.compoundsPerYear)}
              aria-describedby={errors.compoundsPerYear ? "compound-error" : undefined}
            >
              {compoundOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {errors.compoundsPerYear ? (
              <span className="error" id="compound-error">
                {errors.compoundsPerYear}
              </span>
            ) : null}
          </div>

          <div className="field">
            <label htmlFor="contributionAmount">Contribution amount (optional)</label>
            <input
              id="contributionAmount"
              name="contributionAmount"
              inputMode="decimal"
              value={formState.contributionAmount}
              onChange={(event) => updateField("contributionAmount", event.target.value)}
              placeholder="200"
              aria-invalid={Boolean(errors.contributionAmount)}
              aria-describedby={errors.contributionAmount ? "contrib-error" : undefined}
            />
            {errors.contributionAmount ? (
              <span className="error" id="contrib-error">
                {errors.contributionAmount}
              </span>
            ) : null}
          </div>

          <div className="field">
            <label htmlFor="contributionFrequency">Contribution frequency</label>
            <select
              id="contributionFrequency"
              name="contributionFrequency"
              value={formState.contributionFrequency}
              onChange={(event) =>
                updateField(
                  "contributionFrequency",
                  event.target.value as FormState["contributionFrequency"]
                )
              }
            >
              <option value="monthly">Monthly</option>
              <option value="annual">Annual</option>
            </select>
          </div>

          <button className="btn" type="submit">
            Calculate
          </button>
        </form>

        <section className="results">
          <div className="card summary">
            <h2>Results</h2>
            {result ? (
              <div className="summary-grid">
                <div>
                  <p className="label">Final amount</p>
                  <p className="value">{numberFormatter.format(result.finalAmount)}</p>
                </div>
                <div>
                  <p className="label">Total interest earned</p>
                  <p className="value">{numberFormatter.format(result.totalInterest)}</p>
                </div>
                <div>
                  <p className="label">Total contributions</p>
                  <p className="value">
                    {numberFormatter.format(result.totalContributions)}
                  </p>
                </div>
              </div>
            ) : (
              <p className="placeholder">
                Fill out the form and press Calculate to see results.
              </p>
            )}
          </div>

          <div className="card chart-card">
            <h2>Balance over time</h2>
            {result && result.yearlyRows.length > 0 ? (
              <div className="chart">
                <svg viewBox="0 0 120 80" role="img" aria-label="Balance chart">
                  <defs>
                    <linearGradient id="lineGradient" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor="#3a6ea5" />
                      <stop offset="100%" stopColor="#67b3d6" />
                    </linearGradient>
                  </defs>
                  <line x1="12" y1="10" x2="12" y2="70" stroke="#93a1a8" strokeWidth="1" />
                  <line x1="12" y1="70" x2="110" y2="70" stroke="#93a1a8" strokeWidth="1" />
                  <text x="0" y="14" fontSize="4" fill="#5d6b73">
                    Max
                  </text>
                  <text x="0" y="71" fontSize="4" fill="#5d6b73">
                    0
                  </text>
                  <text x="12" y="78" fontSize="4" fill="#5d6b73">
                    Start
                  </text>
                  <text x="102" y="78" fontSize="4" fill="#5d6b73">
                    End
                  </text>
                  <polyline
                    fill="none"
                    stroke="url(#lineGradient)"
                    strokeWidth="2"
                    points={chartPoints
                      .map((point) => `${12 + point.x * 98},${10 + point.y * 60}`)
                      .join(" ")}
                  />
                </svg>
                <div className="legend">
                  <span className="legend-swatch" />
                  <span>Balance</span>
                </div>
                <div className="chart-labels">
                  <span>{result.yearlyRows[0].yearLabel}</span>
                  <span>{result.yearlyRows[result.yearlyRows.length - 1].yearLabel}</span>
                </div>
              </div>
            ) : (
              <p className="placeholder">No chart data yet.</p>
            )}
          </div>
        </section>
      </div>

      <section className="card table-card">
        <h2>Year-by-year growth</h2>
        {result && result.yearlyRows.length > 0 ? (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Year</th>
                  <th>Yearly contributions</th>
                  <th>Yearly interest</th>
                  <th>Total contributions</th>
                  <th>Total interest</th>
                  <th>End balance</th>
                </tr>
              </thead>
              <tbody>
                {result.yearlyRows.map((row) => (
                  <tr key={row.yearLabel}>
                    <td>{row.yearLabel}</td>
                    <td>{numberFormatter.format(row.yearlyContributions)}</td>
                    <td>{numberFormatter.format(row.yearlyInterest)}</td>
                    <td>{numberFormatter.format(row.totalContributions)}</td>
                    <td>{numberFormatter.format(row.totalInterest)}</td>
                    <td className="end-balance">
                      {numberFormatter.format(row.endBalance)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="placeholder">Your yearly results will appear here.</p>
        )}
      </section>
    </div>
  );
}
