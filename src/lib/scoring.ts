import { getCardProfile } from "@/data/card-profiles";
import { getTelltale, type Telltale } from "@/data/telltales";

export type CheckAnswer = "pass" | "fail" | "unsure" | "skip";

export type Verdict =
  | "likely_authentic"
  | "needs_review"
  | "suspicious"
  | "likely_fake";

export type ScoreResult = {
  profileId: string;
  score: number; // 0–100 authenticity confidence
  riskScore: number; // 0–100 fake risk
  verdict: Verdict;
  summary: string;
  failed: { telltale: Telltale; weight: number }[];
  passed: { telltale: Telltale; weight: number }[];
  unsure: { telltale: Telltale; weight: number }[];
  recommendations: string[];
};

export function scoreCheck(
  profileId: string,
  answers: Record<string, CheckAnswer>,
): ScoreResult {
  const profile = getCardProfile(profileId) ?? getCardProfile("general-unknown")!;
  const items = profile.telltaleIds
    .map((id) => getTelltale(id))
    .filter((t): t is Telltale => Boolean(t));

  let authenticityPoints = 0;
  let maxPoints = 0;
  const failed: ScoreResult["failed"] = [];
  const passed: ScoreResult["passed"] = [];
  const unsure: ScoreResult["unsure"] = [];

  for (const telltale of items) {
    const answer = answers[telltale.id] ?? "skip";
    if (answer === "skip") continue;
    maxPoints += telltale.weight;
    if (answer === "pass") {
      authenticityPoints += telltale.weight;
      passed.push({ telltale, weight: telltale.weight });
    } else if (answer === "fail") {
      failed.push({ telltale, weight: telltale.weight });
    } else {
      // unsure contributes half credit but flags review
      authenticityPoints += telltale.weight * 0.35;
      unsure.push({ telltale, weight: telltale.weight });
    }
  }

  const score =
    maxPoints === 0 ? 50 : Math.round((authenticityPoints / maxPoints) * 100);
  const riskScore = 100 - score;

  let verdict: Verdict;
  if (failed.some((f) => f.weight >= 9) || score < 40) {
    verdict = "likely_fake";
  } else if (score < 60 || failed.length >= 2) {
    verdict = "suspicious";
  } else if (unsure.length >= 3 || score < 78) {
    verdict = "needs_review";
  } else {
    verdict = "likely_authentic";
  }

  const recommendations: string[] = [];
  if (verdict === "likely_fake" || verdict === "suspicious") {
    recommendations.push(
      "Do not buy/sell as authentic. Document photos and report the listing on the marketplace.",
    );
    recommendations.push(
      "Compare against a known authentic copy or official database scan for the failed telltales above.",
    );
  }
  if (verdict === "needs_review" || unsure.length > 0) {
    recommendations.push(
      "Escalate to a researcher community (r/GengarMasterSet megathread, TCGrader) with macros of text, energy icons, and card back.",
    );
  }
  if (profile.riskLevel === "extreme") {
    recommendations.push(
      "For extreme-risk cards, consider PSA/BGS/CGC authentication before paying a premium.",
    );
  }
  if (verdict === "likely_authentic") {
    recommendations.push(
      "Checklist looks clean, but HoloCheck is advisory — keep macros and seller records.",
    );
  }

  const summaryByVerdict: Record<Verdict, string> = {
    likely_authentic:
      "Your answers align with authentic markers in our research database. Still treat this as guidance, not a certificate.",
    needs_review:
      "Mixed or incomplete signals. Get a second opinion from community researchers before committing money.",
    suspicious:
      "Multiple telltales match known counterfeit patterns. High chance this is fake or needs expert rejection.",
    likely_fake:
      "Critical authenticity markers failed. Treat as counterfeit until a professional grader proves otherwise.",
  };

  return {
    profileId: profile.id,
    score,
    riskScore,
    verdict,
    summary: summaryByVerdict[verdict],
    failed,
    passed,
    unsure,
    recommendations,
  };
}
