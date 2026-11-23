import { CITIES, CATEGORIES, type CategoryKey, type City } from "./costs";

/** What the Budget checker saves under "np.budget". The trip planner reads the same values. */
export type BudgetMode = "total" | "split";
export type BudgetSaved = {
  fromId: string;
  toId: string;
  mode: BudgetMode;
  total: string;
  split: Partial<Record<CategoryKey, string>>;
  /** Adjust estimates with live exchange rates. Undefined means on. */
  live?: boolean;
};

const lisbon = CITIES.find((c) => c.name === "Lisbon") as City;
const bangkok = CITIES.find((c) => c.name === "Bangkok") as City;
export const DEFAULT_BUDGET: BudgetSaved = { fromId: lisbon.id, toId: bangkok.id, mode: "total", total: "", split: {} };

/** A typed amount as a positive number, or 0. */
export const parseAmount = (s: string | undefined) => {
  const n = parseFloat((s ?? "").replace(/,/g, ""));
  return Number.isFinite(n) && n > 0 ? n : 0;
};

/** The saved spending as an input for `convertBudget`, in USD. `unitsPerUsd` is the rate of the display currency. */
export function budgetInput(saved: BudgetSaved, unitsPerUsd: number) {
  const toUsd = (amount: number) => amount / unitsPerUsd;
  const spend = Object.fromEntries(CATEGORIES.map((c) => [c.key, toUsd(parseAmount(saved.split[c.key]))])) as Record<
    CategoryKey,
    number
  >;
  const splitTotal = Object.values(spend).reduce((a, b) => a + b, 0);
  const totalUsd = saved.mode === "total" ? toUsd(parseAmount(saved.total)) : splitTotal;
  const input =
    saved.mode === "total" ? ({ mode: "total", total: totalUsd } as const) : ({ mode: "split", spend } as const);
  return { totalUsd, input };
}
