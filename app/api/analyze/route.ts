import {
  analysisJsonSchema,
  demoAnalysisResult,
  isAnalysisRequest,
  normalizeAnalysisResult,
  type AnalysisRequest,
} from "@/lib/jjipjjip-analysis";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const OPENAI_RESPONSES_URL = "https://api.openai.com/v1/responses";
const DEFAULT_MODEL = "gpt-5.4-mini";

export async function POST(request: Request) {
  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "요청 형식이 올바르지 않습니다." }, { status: 400 });
  }

  if (!isAnalysisRequest(payload)) {
    return NextResponse.json({ error: "상황, 관계, 도움, 톤을 확인해주세요." }, { status: 400 });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({
      result: { ...demoAnalysisResult, source: "demo" },
      meta: { source: "demo", reason: "OPENAI_API_KEY is not configured" },
    });
  }

  try {
    const result = await createAnalysis(payload, apiKey);
    return NextResponse.json({ result, meta: { source: result.source } });
  } catch (error) {
    console.error("jjipjjip analysis failed", error);
    return NextResponse.json(
      { error: "분석 생성 중 문제가 생겼습니다. 잠시 후 다시 시도해주세요." },
      { status: 502 },
    );
  }
}

async function createAnalysis(input: AnalysisRequest, apiKey: string) {
  const response = await fetch(OPENAI_RESPONSES_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || DEFAULT_MODEL,
      store: false,
      max_output_tokens: 1400,
      input: [
        {
          role: "system",
          content: [
            "너는 '찝찝함 번역기'의 관계 커뮤니케이션 보조 AI다.",
            "상대의 속마음을 맞힌다고 말하지 말고, 사용자의 감정과 확인 가능한 사실, 가능한 해석을 분리한다.",
            "치료, 진단, 법률 자문처럼 보이는 표현을 피한다.",
            "사용자의 편만 들지 말고 과해석 가능성을 함께 제시한다.",
            "폭력, 자해, 스토킹, 중대 괴롭힘 가능성이 있으면 답장보다 공식 도움 요청을 우선 제안한다.",
            "한국어로 간결하고 실제로 복사 가능한 문장을 만든다.",
          ].join("\n"),
        },
        {
          role: "user",
          content: [
            `분석 모드: ${input.mode}`,
            `관계 유형: ${input.relationship}`,
            `원하는 도움: ${input.helpType}`,
            `원하는 톤: ${input.tone}`,
            `상황 또는 보내려는 문장: ${input.situation}`,
          ].join("\n"),
        },
      ],
      text: {
        format: {
          type: "json_schema",
          name: "jjipjjip_analysis",
          strict: true,
          schema: analysisJsonSchema,
        },
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.status}`);
  }

  const data = await response.json();
  const outputText = extractOutputText(data);
  return normalizeAnalysisResult(JSON.parse(outputText), "ai");
}

function extractOutputText(data: unknown) {
  const response = data as {
    output_text?: string;
    output?: Array<{ content?: Array<{ text?: string; type?: string }> }>;
  };

  if (response.output_text) return response.output_text;

  const text = response.output
    ?.flatMap((item) => item.content || [])
    .map((content) => content.text)
    .filter(Boolean)
    .join("");

  if (!text) throw new Error("OpenAI response did not include text output");
  return text;
}
