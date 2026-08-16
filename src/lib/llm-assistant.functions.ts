import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const askLlmSchema = z.object({
  question: z.string().trim().min(1).max(2000),
  system: z.string().min(1).max(8000),
  history: z
    .array(z.object({ role: z.enum(["user", "assistant"]), text: z.string().max(4000) }))
    .max(10),
});

export type AskLlmInput = z.infer<typeof askLlmSchema>;

export type AskLlmResult = {
  /** false quand aucune clé LLM_API_KEY n'est configurée (repli sur le moteur de règles). */
  configured: boolean;
  text: string | null;
};

/**
 * Appel LLM côté serveur — endpoint compatible OpenAI (OpenAI, Groq, OpenRouter,
 * DeepSeek…). La clé API ne quitte jamais le serveur :
 *   LLM_API_KEY   (obligatoire pour activer)
 *   LLM_BASE_URL  (défaut https://api.openai.com/v1)
 *   LLM_MODEL     (défaut gpt-4o-mini)
 * Toute erreur réseau répond { configured: true, text: null } pour un repli silencieux.
 */
export const askLlm = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => askLlmSchema.parse(input))
  .handler(async ({ data }): Promise<AskLlmResult> => {
    const apiKey = process.env["LLM_API_KEY"];
    if (!apiKey) return { configured: false, text: null };

    const baseUrl = (process.env["LLM_BASE_URL"] ?? "https://api.openai.com/v1").replace(/\/$/, "");
    const model = process.env["LLM_MODEL"] ?? "gpt-4o-mini";

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 25_000);
    try {
      const res = await fetch(`${baseUrl}/chat/completions`, {
        method: "POST",
        headers: { "content-type": "application/json", authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({
          model,
          max_tokens: 500,
          temperature: 0.4,
          messages: [
            { role: "system", content: data.system },
            ...data.history.map((h) => ({ role: h.role, content: h.text })),
            { role: "user", content: data.question },
          ],
        }),
        signal: controller.signal,
      });
      if (!res.ok) return { configured: true, text: null };
      const json = (await res.json()) as { choices?: { message?: { content?: string } }[] };
      const text = json.choices?.[0]?.message?.content?.trim();
      return { configured: true, text: text ? text : null };
    } catch {
      return { configured: true, text: null };
    } finally {
      clearTimeout(timer);
    }
  });
