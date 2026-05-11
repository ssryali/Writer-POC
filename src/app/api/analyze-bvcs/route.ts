import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const WRITER_API_KEY = "wr-2b8489F2Kg6lWSqKjF0USw";
const WRITER_APP_ID = "21de3fc2-ba83-48b1-a923-ef77232ab291";

type AnalyzeRequest = {
  strategicInput?: unknown;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as AnalyzeRequest;
    const strategicInput = typeof body.strategicInput === "string" ? body.strategicInput.trim() : "";

    if (!strategicInput) {
      return NextResponse.json({ error: "Strategic Input is required." }, { status: 400 });
    }

    const response = await fetch(`https://api.writer.com/v1/applications/${WRITER_APP_ID}`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${WRITER_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inputs: [{ id: "Strategic Input", value: [strategicInput] }],
      }),
    });

    const raw = await response.json() as Record<string, unknown>;

    if (!response.ok) {
      const errMsg =
        typeof raw?.error === "object" && raw.error !== null && "message" in raw.error
          ? String((raw.error as Record<string, unknown>).message)
          : String(raw?.error || raw?.detail || raw?.message || `Writer API failed with status ${response.status}`);
      throw new Error(errMsg);
    }

    const suggestion =
      typeof raw?.suggestion === "string" ? raw.suggestion :
      typeof raw?.output === "string" ? raw.output :
      typeof raw?.result === "string" ? raw.result :
      JSON.stringify(raw);

    return NextResponse.json({
      creativeNudge: suggestion,
      agentId: "US-CORE-BVCS",
      agentName: "Business vs Communications Objective Separation",
    });
  } catch (error) {
    console.error("[ANALYZE-BVCS] Error:", error instanceof Error ? error.message : error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to analyze Strategic Input." },
      { status: 500 },
    );
  }
}
