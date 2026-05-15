import {
  demoAnalysisResult,
  isAnalysisRequest,
  normalizeAnalysisResult,
  type AnalysisRequest,
} from "@/lib/jjipjjip-analysis";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const WARM_TALENT_CHAT_URL = "https://ai.warmtalentschool.com/api/v1/chat/completions";
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

  const apiKey = process.env.WARM_TALENT_API_KEY;
  if (!apiKey) {
    return NextResponse.json({
      result: { ...demoAnalysisResult, source: "demo" },
      meta: { source: "demo", reason: "WARM_TALENT_API_KEY is not configured" },
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
  const response = await fetch(process.env.WARM_TALENT_API_URL || WARM_TALENT_CHAT_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.WARM_TALENT_MODEL || DEFAULT_MODEL,
      max_tokens: 1024,
      temperature: 0.4,
      top_p: 0.9,
      messages: [
        {
          role: "system",
          content: [
            "너는 '찝찝함 번역기'의 관계 커뮤니케이션 보조 AI다.",
            "상대의 속마음을 맞힌다고 말하지 말고, 사용자의 감정과 확인 가능한 사실, 가능한 해석을 분리한다.",
            "치료, 진단, 법률 자문처럼 보이는 표현을 피한다.",
            "사용자의 편만 들지 말고 과해석 가능성을 함께 제시한다.",
            "폭력, 자해, 스토킹, 중대 괴롭힘 가능성이 있으면 답장보다 공식 도움 요청을 우선 제안한다.",
            "한국어로 간결하고 실제로 복사 가능한 문장을 만든다.",
            "응답은 반드시 설명 없이 순수 JSON 객체만 반환한다. 마크다운 코드블록을 쓰지 않는다.",
            "JSON 키는 summary, separation, possibleMeanings, responseLevel, toneRisk, replies, avoid, nextAction, safetyNote만 사용한다.",
            "separation은 label이 감정, 사실, 해석인 객체 3개다.",
            "possibleMeanings, replies, avoid는 각각 문자열 3개 배열이다.",
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
            "",
            "출력 예시 형태:",
            JSON.stringify({
              summary: "상황 요약",
              separation: [
                { label: "감정", body: "사용자가 느낀 감정" },
                { label: "사실", body: "확인 가능한 사실" },
                { label: "해석", body: "가능한 해석" },
              ],
              possibleMeanings: ["가능성 1", "가능성 2", "가능성 3"],
              responseLevel: "낮게 시작 | 확인 필요 | 공식 대응",
              toneRisk: "말투 리스크 라벨",
              replies: ["보내도 되는 문장 1", "보내도 되는 문장 2", "보내도 되는 문장 3"],
              avoid: ["피해야 할 표현 1", "피해야 할 표현 2", "피해야 할 표현 3"],
              nextAction: "다음 행동 제안",
              safetyNote: "진단이나 법률 자문이 아니라는 안전 고지",
            }),
          ].join("\n"),
        },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error(`WarmTalent API error: ${response.status}`);
  }

  const data = await response.json();
  const outputText = extractOutputText(data);
  return normalizeAnalysisResult(parseJsonObject(outputText), "ai");
}

function extractOutputText(data: unknown) {
  const response = data as {
    choices?: Array<{ message?: { content?: string }; delta?: { content?: string } }>;
  };

  const text = response.choices
    ?.map((choice) => choice.message?.content || choice.delta?.content)
    .filter(Boolean)
    .join("");

  if (!text) throw new Error("WarmTalent response did not include text output");
  return text;
}

function parseJsonObject(text: string) {
  const trimmed = text.trim().replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```$/i, "").trim();

  try {
    return JSON.parse(trimmed);
  } catch {
    const firstBrace = trimmed.indexOf("{");
    const lastBrace = trimmed.lastIndexOf("}");
    if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
      throw new Error("Model output was not JSON");
    }
    return JSON.parse(trimmed.slice(firstBrace, lastBrace + 1));
  }
}
