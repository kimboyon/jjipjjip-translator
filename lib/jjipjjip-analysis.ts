export const intents = ["거절", "재촉", "사과", "확인", "부탁", "항의"] as const;
export const modes = intents;
export const relationships = ["상사", "동료", "후배", "친구", "모임", "가족", "기타"] as const;
export const helpTypes = ["바로 보낼 답장", "말투 점검", "감정 정리", "상대 의도 확인", "거리두기", "직장용 표현"] as const;
export const tones = ["직장용", "부드럽게", "단호하게", "가볍게", "거리두기"] as const;

export type ReplyIntent = (typeof intents)[number];
export type AnalysisMode = ReplyIntent;
export type Relationship = (typeof relationships)[number];
export type HelpType = (typeof helpTypes)[number];
export type Tone = (typeof tones)[number];

export type AnalysisRequest = {
  intent: ReplyIntent;
  mode?: AnalysisMode;
  relationship: Relationship;
  helpType?: HelpType;
  tone: Tone;
  situation: string;
};

export type AnalysisResult = {
  summary: string;
  separation: Array<{ label: "감정" | "사실" | "해석"; body: string }>;
  possibleMeanings: string[];
  responseLevel: string;
  toneRisk: string;
  replies: string[];
  avoid: string[];
  nextAction: string;
  safetyNote: string;
  source?: "ai" | "demo";
};

export const demoAnalysisResult: AnalysisResult = {
  summary: "세대나 태도에 대한 일반화가 개인 평가처럼 느껴져 불편함이 남은 상황입니다.",
  separation: [
    { label: "감정", body: "억울함, 경계심, 평가받는 느낌" },
    { label: "사실", body: "상대는 MZ와 책임감에 대한 일반화 표현을 사용했습니다." },
    { label: "해석", body: "나를 겨냥했을 수도 있지만, 특정인을 지목하지 않은 푸념일 수도 있습니다." },
  ],
  possibleMeanings: [
    "조직 안에서 느낀 답답함을 세대 표현으로 뭉뚱그렸을 가능성",
    "특정 업무 상황을 말하려다 표현이 거칠어진 가능성",
    "실제로 반복된다면 세대 프레임으로 평가하는 패턴일 가능성",
  ],
  responseLevel: "낮게 시작",
  toneRisk: "조금 차가움",
  replies: [
    "그렇게 느끼실 수도 있을 것 같아요. 다만 저는 이 건은 책임지고 마무리하려고 일정 정리해두었습니다.",
    "말씀 주신 부분 참고하겠습니다. 저는 이번 건은 업무 기준에 맞춰 진행 상황을 공유드리겠습니다.",
    "세대 이야기보다는 이번 업무에서 필요한 기준을 확인하고 맞춰보겠습니다.",
  ],
  avoid: ["요즘 윗세대도 똑같아요", "그건 편견 아닌가요?", "저한테 하시는 말씀이세요?"],
  nextAction: "감정 반박보다 업무 기준과 일정으로 대화를 되돌리는 편이 안전합니다.",
  safetyNote: "이 결과는 진단이나 법률 자문이 아니라 대화를 정리하기 위한 참고입니다.",
  source: "demo",
};

export const analysisJsonSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    summary: { type: "string" },
    separation: {
      type: "array",
      minItems: 3,
      maxItems: 3,
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          label: { type: "string", enum: ["감정", "사실", "해석"] },
          body: { type: "string" },
        },
        required: ["label", "body"],
      },
    },
    possibleMeanings: { type: "array", minItems: 3, maxItems: 3, items: { type: "string" } },
    responseLevel: { type: "string" },
    toneRisk: { type: "string" },
    replies: { type: "array", minItems: 3, maxItems: 3, items: { type: "string" } },
    avoid: { type: "array", minItems: 3, maxItems: 3, items: { type: "string" } },
    nextAction: { type: "string" },
    safetyNote: { type: "string" },
  },
  required: [
    "summary",
    "separation",
    "possibleMeanings",
    "responseLevel",
    "toneRisk",
    "replies",
    "avoid",
    "nextAction",
    "safetyNote",
  ],
} as const;

export function isAnalysisRequest(value: unknown): value is AnalysisRequest {
  if (!value || typeof value !== "object") return false;
  const input = value as Partial<AnalysisRequest>;

  return (
    typeof input.situation === "string" &&
    input.situation.trim().length > 0 &&
    intents.includes((input.intent || input.mode) as ReplyIntent) &&
    relationships.includes(input.relationship as Relationship) &&
    (input.helpType === undefined || helpTypes.includes(input.helpType as HelpType)) &&
    tones.includes(input.tone as Tone)
  );
}

export function normalizeAnalysisResult(value: unknown, source: "ai" | "demo"): AnalysisResult {
  if (!value || typeof value !== "object") return { ...demoAnalysisResult, source };
  const result = value as Partial<AnalysisResult>;

  return {
    summary: result.summary || demoAnalysisResult.summary,
    separation: result.separation?.length === 3 ? result.separation : demoAnalysisResult.separation,
    possibleMeanings: result.possibleMeanings?.length ? result.possibleMeanings.slice(0, 3) : demoAnalysisResult.possibleMeanings,
    responseLevel: result.responseLevel || demoAnalysisResult.responseLevel,
    toneRisk: result.toneRisk || demoAnalysisResult.toneRisk,
    replies: result.replies?.length ? result.replies.slice(0, 3) : demoAnalysisResult.replies,
    avoid: result.avoid?.length ? result.avoid.slice(0, 3) : demoAnalysisResult.avoid,
    nextAction: result.nextAction || demoAnalysisResult.nextAction,
    safetyNote: result.safetyNote || demoAnalysisResult.safetyNote,
    source,
  };
}
