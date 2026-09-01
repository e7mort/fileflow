const CREDITS_KEY = "holocheck_credits_v1";
const HISTORY_KEY = "holocheck_history_v1";

export type CreditLedger = {
  credits: number;
  purchases: { plan: "single" | "pass"; amountUsd: number; at: string }[];
};

export type CheckHistoryItem = {
  id: string;
  profileId: string;
  verdict: string;
  score: number;
  at: string;
  unlocked: boolean;
};

function emptyLedger(): CreditLedger {
  return { credits: 0, purchases: [] };
}

export function getLedger(): CreditLedger {
  if (typeof window === "undefined") return emptyLedger();
  try {
    const raw = localStorage.getItem(CREDITS_KEY);
    return raw ? (JSON.parse(raw) as CreditLedger) : emptyLedger();
  } catch {
    return emptyLedger();
  }
}

export function saveLedger(ledger: CreditLedger) {
  localStorage.setItem(CREDITS_KEY, JSON.stringify(ledger));
  window.dispatchEvent(new Event("holocheck-credits"));
}

export function purchasePlan(plan: "single" | "pass"): CreditLedger {
  const ledger = getLedger();
  const amountUsd = plan === "single" ? 1 : 5;
  const credits = plan === "single" ? 1 : 10;
  ledger.credits += credits;
  ledger.purchases.unshift({
    plan,
    amountUsd,
    at: new Date().toISOString(),
  });
  saveLedger(ledger);
  return ledger;
}

export function spendCredit(): boolean {
  const ledger = getLedger();
  if (ledger.credits < 1) return false;
  ledger.credits -= 1;
  saveLedger(ledger);
  return true;
}

export function getHistory(): CheckHistoryItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? (JSON.parse(raw) as CheckHistoryItem[]) : [];
  } catch {
    return [];
  }
}

export function pushHistory(item: CheckHistoryItem) {
  const history = getHistory();
  history.unshift(item);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, 50)));
}
