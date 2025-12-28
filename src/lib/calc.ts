export type CalculationInput = {
  principal: number;
  annualRatePercent: number;
  years: number;
  compoundsPerYear: number;
  contributionAmount: number;
  contributionFrequency: "monthly" | "annual";
};

export type YearlyRow = {
  yearNumber: number;
  isPartial: boolean;
  endBalance: number;
  yearlyContributions: number;
  yearlyInterest: number;
  totalContributions: number;
  totalInterest: number;
};

export type CalculationResult = {
  finalAmount: number;
  totalContributions: number;
  totalInterest: number;
  yearlyRows: YearlyRow[];
};

export function calculateCompoundInterest(
  input: CalculationInput
): CalculationResult {
  const {
    principal,
    annualRatePercent,
    years,
    compoundsPerYear,
    contributionAmount,
    contributionFrequency,
  } =
    input;

  const annualRate = annualRatePercent / 100;
  const months = Math.max(1, Math.round(years * 12));
  const monthlyRate = Math.pow(1 + annualRate / compoundsPerYear, compoundsPerYear / 12) - 1;

  let balance = principal;
  let totalContributions = principal;
  const yearlyRows: YearlyRow[] = [];

  // Formula reference:
  // Effective monthly rate = (1 + r / n)^(n/12) - 1
  // Periodic update: B_m = B_{m-1} * (1 + r_m) + C
  for (let month = 1; month <= months; month += 1) {
    const isYearEnd = month % 12 === 0;
    const contributionThisMonth =
      contributionFrequency === "monthly"
        ? contributionAmount
        : isYearEnd
          ? contributionAmount
          : 0;

    balance = balance * (1 + monthlyRate) + contributionThisMonth;
    totalContributions += contributionThisMonth;

    const isFinalMonth = month === months;
    if (isYearEnd || isFinalMonth) {
      const yearNumber = Math.ceil(month / 12);
      const isPartial = month % 12 !== 0;
      const totalInterest = balance - totalContributions;
      const previousRow = yearlyRows[yearlyRows.length - 1];
      const previousBalance = previousRow ? previousRow.endBalance : principal;
      const previousTotalContributions = previousRow
        ? previousRow.totalContributions
        : principal;
      const yearlyContributions = totalContributions - previousTotalContributions;
      const yearlyInterest = balance - previousBalance - yearlyContributions;
      yearlyRows.push({
        yearNumber,
        isPartial,
        endBalance: balance,
        yearlyContributions,
        yearlyInterest,
        totalContributions,
        totalInterest,
      });
    }
  }

  const totalInterest = balance - totalContributions;

  return {
    finalAmount: balance,
    totalContributions,
    totalInterest,
    yearlyRows,
  };
}
