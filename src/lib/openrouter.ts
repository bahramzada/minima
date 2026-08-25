import { z } from "zod";

import type { AiTaskPayload } from "@/components/app/types";
import { openRouterModel } from "@/lib/config";

const aiTaskSchema = z.object({
  task: z.string().min(4).max(180),
  emoji: z.string().min(1).max(8),
  minutes: z.number().int().min(1).max(10),
  category: z.string().min(2).max(32),
});

const moodFallbacks: Record<string, AiTaskPayload> = {
  Yorğun: {
    task: "Gözlərini yum və 5 dəfə dərin nəfəs al. Heç nə etmə — sadəcə nəfəs.",
    emoji: "🌬️",
    minutes: 2,
    category: "Sakitlik",
  },
  Stresli: {
    task: "Telefonu yerə qoy və otaqda yavaşca 10 addım at.",
    emoji: "🚶",
    minutes: 2,
    category: "Rahatlıq",
  },
  Həvəssiz: {
    task: "Sevdiyin bir mahnını qoy və ilk iki dəqiqəsini diqqətlə dinlə.",
    emoji: "🎧",
    minutes: 2,
    category: "Enerji",
  },
  Yaxşı: {
    task: "Bu gün minnətdar olduğun 3 kiçik şeyi bir yerə yaz.",
    emoji: "✍️",
    minutes: 3,
    category: "Diqqət",
  },
  Əla: {
    task: "Bir stəkan su iç, pəncərəni aç və enerjini bir an hiss et.",
    emoji: "💧",
    minutes: 2,
    category: "Enerji",
  },
};

const dailyFallbacks: AiTaskPayload[] = [
  {
    task: "3 dəqiqə pəncərədən bayıra bax və dərin nəfəs al",
    emoji: "🌿",
    minutes: 3,
    category: "Sakitlik",
  },
  {
    task: "Masandakı yalnız bir kiçik sahəni səliqəyə sal",
    emoji: "✨",
    minutes: 5,
    category: "Fokus",
  },
  {
    task: "Bir stəkan suyu tələsmədən iç və çiyinlərini boşalt",
    emoji: "💧",
    minutes: 3,
    category: "Enerji",
  },
];

export function getFallbackTask(mood?: string) {
  const moodKey = mood
    ? Object.keys(moodFallbacks).find((key) => mood.includes(key))
    : undefined;
  if (moodKey) return moodFallbacks[moodKey];
  return dailyFallbacks[new Date().getUTCDate() % dailyFallbacks.length];
}

export async function generateMicroTask({
  mood,
  message,
  allowRemote,
}: {
  mood?: string;
  message?: string;
  allowRemote: boolean;
}): Promise<{ task: AiTaskPayload; source: "openrouter" | "fallback" }> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey || !allowRemote) {
    return { task: getFallbackTask(mood), source: "fallback" };
  }

  const isMoodRequest = Boolean(mood || message);
  const userPrompt = isMoodRequest
    ? `İstifadəçi özünü belə təsvir edir: "${mood || message}". Ona alət tələb etməyən, maksimum 2-5 dəqiqəlik bir mikro-tapşırıq ver.`
    : "İstifadəçiyə bu gün üçün fərqli, alət tələb etməyən və maksimum 5-10 dəqiqə çəkən bir minimal fəaliyyət təklif et.";

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer":
          process.env.OPENROUTER_SITE_URL || "http://localhost:3000",
        "X-OpenRouter-Title": "Minima",
      },
      body: JSON.stringify({
        model: openRouterModel,
        messages: [
          {
            role: "system",
            content:
              "Sən Minima tətbiqinin Azərbaycan dilində danışan köməkçisisən. Tapşırıq isti, konkret, təhlükəsiz və bir cümlə olmalıdır. Tibbi məsləhət vermə.",
          },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.75,
        max_tokens: 160,
        provider: { require_parameters: true },
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "minima_task",
            strict: true,
            schema: {
              type: "object",
              properties: {
                task: { type: "string" },
                emoji: { type: "string" },
                minutes: { type: "integer", minimum: 1, maximum: 10 },
                category: { type: "string" },
              },
              required: ["task", "emoji", "minutes", "category"],
              additionalProperties: false,
            },
          },
        },
      }),
      cache: "no-store",
    });

    if (!response.ok) throw new Error(`OpenRouter ${response.status}`);
    const json = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const content = json.choices?.[0]?.message?.content;
    if (!content) throw new Error("OpenRouter boş cavab qaytardı");

    return {
      task: aiTaskSchema.parse(JSON.parse(content)),
      source: "openrouter",
    };
  } catch (error) {
    console.error("Minima OpenRouter fallback:", error);
    return { task: getFallbackTask(mood), source: "fallback" };
  }
}
