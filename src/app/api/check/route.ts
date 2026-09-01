import { NextResponse } from "next/server";
import { scoreCheck, type CheckAnswer } from "@/lib/scoring";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      profileId?: string;
      answers?: Record<string, CheckAnswer>;
    };

    if (!body.profileId || !body.answers) {
      return NextResponse.json(
        { error: "profileId and answers are required" },
        { status: 400 },
      );
    }

    const result = scoreCheck(body.profileId, body.answers);
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
