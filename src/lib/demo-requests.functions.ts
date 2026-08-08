import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export const demoRequestSchema = z.object({
  full_name: z.string().trim().min(2, "Nom trop court").max(100),
  company: z.string().trim().max(120).optional().or(z.literal("")),
  email: z.string().trim().email("Email invalide").max(255),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  message: z.string().trim().max(1000).optional().or(z.literal("")),
});

export type DemoRequestInput = z.infer<typeof demoRequestSchema>;

export const submitDemoRequest = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => demoRequestSchema.parse(input))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("demo_requests").insert({
      full_name: data.full_name,
      company: data.company || null,
      email: data.email,
      phone: data.phone || null,
      message: data.message || null,
    });
    if (error) throw new Error("Enregistrement impossible");

    // Email de confirmation (edge function). Ne bloque jamais la soumission.
    try {
      await supabaseAdmin.functions.invoke("send-demo-confirmation", {
        body: {
          email: data.email,
          full_name: data.full_name,
          company: data.company || null,
          message: data.message || null,
        },
      });
    } catch (e) {
      console.error("[demo-request] Email de confirmation non envoyé", e);
    }

    return { ok: true };
  });
