import { useEffect, useMemo, useState, type FormEvent } from "react";
import {
  calculateCompoundInterest,
  type CalculationResult,
} from "./lib/calc";
import "./styles.css";

type FormState = {
  principal: string;
  annualRatePercent: string;
  years: string;
  compoundsPerYear: string;
  contributionAmount: string;
  contributionFrequency: "monthly" | "annual";
};

type FieldErrors = Partial<Record<keyof FormState, string>>;

type Language = "en" | "cs";

const defaultState: FormState = {
  principal: "0",
  annualRatePercent: "6",
  years: "10",
  compoundsPerYear: "12",
  contributionAmount: "200",
  contributionFrequency: "monthly",
};

type CompoundOptionKey = "yearly" | "quarterly" | "monthly" | "daily";

const compoundOptions: { key: CompoundOptionKey; value: string }[] = [
  { key: "yearly", value: "1" },
  { key: "quarterly", value: "4" },
  { key: "monthly", value: "12" },
  { key: "daily", value: "365" },
];

const translations = {
  en: {
    languageLabel: "Language",
    title: "Compound Interest Calculator",
    heroTitle: "See how your savings grow.",
    heroSubhead:
      "Enter your starting balance, interest rate, and contributions to estimate year-by-year growth.",
    principalLabel: "Principal (optional)",
    annualRateLabel: "Annual interest rate (%)",
    yearsLabel: "Years",
    compoundingLabel: "Compounding frequency",
    compoundingYearly: "Yearly (1)",
    compoundingQuarterly: "Quarterly (4)",
    compoundingMonthly: "Monthly (12)",
    compoundingDaily: "Daily (365)",
    contributionAmountLabel: "Contribution amount (optional)",
    contributionFrequencyLabel: "Contribution frequency",
    contributionMonthly: "Monthly",
    contributionAnnual: "Annual",
    calculate: "Calculate",
    resultsTitle: "Results",
    finalAmount: "Final amount",
    totalInterest: "Total interest earned",
    totalContributions: "Total contributions",
    resultsPlaceholder: "Fill out the form and press Calculate to see results.",
    chartTitle: "Balance over time",
    chartPlaceholder: "No chart data yet.",
    chartLegend: "Balance",
    chartMax: "Max",
    chartZero: "0",
    chartStart: "Start",
    chartEnd: "End",
    tableTitle: "Year-by-year growth",
    tablePlaceholder: "Your yearly results will appear here.",
    tableYear: "Year",
    tableYearlyContrib: "Yearly contributions",
    tableYearlyInterest: "Yearly interest",
    tableTotalContrib: "Total contributions",
    tableTotalInterest: "Total interest",
    tableEndBalance: "End balance",
    yearLabel: (yearNumber: number, isPartial: boolean) =>
      isPartial ? `Year ${yearNumber} (partial)` : `Year ${yearNumber}`,
    principalError: "Enter a principal of 0 or higher.",
    annualRateError: "Enter an annual rate of 0 or higher.",
    yearsError: "Enter a number of years greater than 0.",
    compoundingError: "Select a compounding frequency.",
    contributionError: "Enter a contribution of 0 or higher.",
  },
  cs: {
    languageLabel: "Jazyk",
    title: "Kalkulačka složeného úročení",
    heroTitle: "Podívejte se, jak roste vaše úspora.",
    heroSubhead:
      "Zadejte počáteční částku, úrok a příspěvky pro odhad růstu po jednotlivých letech.",
    principalLabel: "Počáteční vklad (volitelné)",
    annualRateLabel: "Roční úroková sazba (%)",
    yearsLabel: "Roky",
    compoundingLabel: "Frekvence úročení",
    compoundingYearly: "Ročně (1)",
    compoundingQuarterly: "Čtvrtletně (4)",
    compoundingMonthly: "Měsíčně (12)",
    compoundingDaily: "Denně (365)",
    contributionAmountLabel: "Výše příspěvku (volitelné)",
    contributionFrequencyLabel: "Frekvence příspěvku",
    contributionMonthly: "Měsíčně",
    contributionAnnual: "Ročně",
    calculate: "Spočítat",
    resultsTitle: "Výsledky",
    finalAmount: "Konečná částka",
    totalInterest: "Celkový získaný úrok",
    totalContributions: "Celkové příspěvky",
    resultsPlaceholder: "Vyplňte formulář a klikněte na Spočítat.",
    chartTitle: "Zůstatek v čase",
    chartPlaceholder: "Zatím žádná data pro graf.",
    chartLegend: "Zůstatek",
    chartMax: "Max",
    chartZero: "0",
    chartStart: "Začátek",
    chartEnd: "Konec",
    tableTitle: "Růst po jednotlivých letech",
    tablePlaceholder: "Roční výsledky se zobrazí zde.",
    tableYear: "Rok",
    tableYearlyContrib: "Roční příspěvky",
    tableYearlyInterest: "Roční úrok",
    tableTotalContrib: "Celkové příspěvky",
    tableTotalInterest: "Celkový úrok",
    tableEndBalance: "Konečný zůstatek",
    yearLabel: (yearNumber: number, isPartial: boolean) =>
      isPartial ? `Rok ${yearNumber} (část)` : `Rok ${yearNumber}`,
    principalError: "Zadejte počáteční vklad 0 nebo vyšší.",
    annualRateError: "Zadejte roční sazbu 0 nebo vyšší.",
    yearsError: "Zadejte počet let větší než 0.",
    compoundingError: "Vyberte frekvenci úročení.",
    contributionError: "Zadejte příspěvek 0 nebo vyšší.",
  },
} as const;

function parseNumber(value: string, language: Language): number | null {
  let normalized = value.trim();
  if (language === "cs") {
    normalized = normalized.replace(/\s/g, "").replace(/\./g, "").replace(/,/g, ".");
  } else {
    normalized = normalized.replace(/,/g, "");
  }
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
  const [language, setLanguage] = useState<Language>("en");

  const t = translations[language];
  const numberFormatter = useMemo(
    () =>
      new Intl.NumberFormat(language === "cs" ? "cs-CZ" : "en-US", {
        maximumFractionDigits: 2,
      }),
    [language]
  );

  useEffect(() => {
    const locale = navigator.language.toLowerCase();
    setLanguage(locale.startsWith("cs") ? "cs" : "en");
  }, []);

  useEffect(() => {
    document.documentElement.lang = language;
    document.title = t.title;
  }, [language]);

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
      return { x, y };
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
      principal = parseNumber(formState.principal, language);
      if (principal === null || principal < 0) {
      nextErrors.principal = t.principalError;
    }
    }

    const annualRatePercent = parseNumber(formState.annualRatePercent, language);
    if (annualRatePercent === null || annualRatePercent < 0) {
      nextErrors.annualRatePercent = t.annualRateError;
    }

    const years = parseNumber(formState.years, language);
    if (years === null || years <= 0) {
      nextErrors.years = t.yearsError;
    }

    const compoundsPerYear = parseNumber(formState.compoundsPerYear, language);
    if (compoundsPerYear === null || compoundsPerYear <= 0) {
      nextErrors.compoundsPerYear = t.compoundingError;
    }

    let contributionAmount: number | null = null;
    if (formState.contributionAmount.trim() === "") {
      contributionAmount = 0;
    } else {
      contributionAmount = parseNumber(formState.contributionAmount, language);
      if (contributionAmount === null || contributionAmount < 0) {
        nextErrors.contributionAmount = t.contributionError;
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
          <p className="eyebrow">{t.title}</p>
          <h1>{t.heroTitle}</h1>
          <p className="subhead">{t.heroSubhead}</p>
        </div>
        <div className="locale-select">
          <label htmlFor="language">{t.languageLabel}</label>
          <select
            id="language"
            value={language}
            onChange={(event) => setLanguage(event.target.value as Language)}
          >
            <option value="en">English</option>
            <option value="cs">Čeština</option>
          </select>
        </div>
      </header>

      <div className="content">
        <form className="card form" onSubmit={handleCalculate} noValidate>
          <div className="field">
            <label htmlFor="principal">{t.principalLabel}</label>
            <input
              id="principal"
              name="principal"
              inputMode="decimal"
              value={formState.principal}
              onChange={(event) => updateField("principal", event.target.value)}
              placeholder="0"
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
            <label htmlFor="annualRatePercent">{t.annualRateLabel}</label>
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
            <label htmlFor="years">{t.yearsLabel}</label>
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
            <label htmlFor="compoundsPerYear">{t.compoundingLabel}</label>
            <select
              id="compoundsPerYear"
              name="compoundsPerYear"
              value={formState.compoundsPerYear}
              onChange={(event) => updateField("compoundsPerYear", event.target.value)}
              aria-invalid={Boolean(errors.compoundsPerYear)}
              aria-describedby={errors.compoundsPerYear ? "compound-error" : undefined}
            >
              {compoundOptions.map((option) => {
                const label =
                  option.key === "yearly"
                    ? t.compoundingYearly
                    : option.key === "quarterly"
                      ? t.compoundingQuarterly
                      : option.key === "monthly"
                        ? t.compoundingMonthly
                        : t.compoundingDaily;
                return (
                  <option key={option.value} value={option.value}>
                    {label}
                  </option>
                );
              })}
            </select>
            {errors.compoundsPerYear ? (
              <span className="error" id="compound-error">
                {errors.compoundsPerYear}
              </span>
            ) : null}
          </div>

          <div className="field">
            <label htmlFor="contributionAmount">{t.contributionAmountLabel}</label>
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
            <label htmlFor="contributionFrequency">{t.contributionFrequencyLabel}</label>
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
              <option value="monthly">{t.contributionMonthly}</option>
              <option value="annual">{t.contributionAnnual}</option>
            </select>
          </div>

          <button className="btn" type="submit">
            {t.calculate}
          </button>
        </form>

        <section className="results">
          <div className="card summary">
            <h2>{t.resultsTitle}</h2>
            {result ? (
              <div className="summary-grid">
                <div>
                  <p className="label">{t.finalAmount}</p>
                  <p className="value">{numberFormatter.format(result.finalAmount)}</p>
                </div>
                <div>
                  <p className="label">{t.totalInterest}</p>
                  <p className="value">{numberFormatter.format(result.totalInterest)}</p>
                </div>
                <div>
                  <p className="label">{t.totalContributions}</p>
                  <p className="value">
                    {numberFormatter.format(result.totalContributions)}
                  </p>
                </div>
              </div>
            ) : (
              <p className="placeholder">{t.resultsPlaceholder}</p>
            )}
          </div>

          <div className="card chart-card">
            <h2>{t.chartTitle}</h2>
            {result && result.yearlyRows.length > 0 ? (
              <div className="chart">
                <svg viewBox="0 0 120 80" role="img" aria-label={t.chartTitle}>
                  <defs>
                    <linearGradient id="lineGradient" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor="#3a6ea5" />
                      <stop offset="100%" stopColor="#67b3d6" />
                    </linearGradient>
                  </defs>
                  <line x1="12" y1="10" x2="12" y2="70" stroke="#93a1a8" strokeWidth="1" />
                  <line x1="12" y1="70" x2="110" y2="70" stroke="#93a1a8" strokeWidth="1" />
                  <text x="0" y="14" fontSize="4" fill="#5d6b73">
                    {t.chartMax}
                  </text>
                  <text x="0" y="71" fontSize="4" fill="#5d6b73">
                    {t.chartZero}
                  </text>
                  <text x="12" y="78" fontSize="4" fill="#5d6b73">
                    {t.chartStart}
                  </text>
                  <text x="102" y="78" fontSize="4" fill="#5d6b73">
                    {t.chartEnd}
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
                  <span>{t.chartLegend}</span>
                </div>
                <div className="chart-labels">
                  <span>
                    {t.yearLabel(
                      result.yearlyRows[0].yearNumber,
                      result.yearlyRows[0].isPartial
                    )}
                  </span>
                  <span>
                    {t.yearLabel(
                      result.yearlyRows[result.yearlyRows.length - 1].yearNumber,
                      result.yearlyRows[result.yearlyRows.length - 1].isPartial
                    )}
                  </span>
                </div>
              </div>
            ) : (
              <p className="placeholder">{t.chartPlaceholder}</p>
            )}
          </div>
        </section>
      </div>

      <section className="card table-card">
        <h2>{t.tableTitle}</h2>
        {result && result.yearlyRows.length > 0 ? (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>{t.tableYear}</th>
                  <th>{t.tableYearlyContrib}</th>
                  <th>{t.tableYearlyInterest}</th>
                  <th>{t.tableTotalContrib}</th>
                  <th>{t.tableTotalInterest}</th>
                  <th>{t.tableEndBalance}</th>
                </tr>
              </thead>
              <tbody>
                {result.yearlyRows.map((row) => (
                  <tr
                    key={`${row.yearNumber}-${row.isPartial ? "partial" : "full"}`}
                  >
                    <td>{t.yearLabel(row.yearNumber, row.isPartial)}</td>
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
          <p className="placeholder">{t.tablePlaceholder}</p>
        )}
      </section>
    </div>
  );
}
