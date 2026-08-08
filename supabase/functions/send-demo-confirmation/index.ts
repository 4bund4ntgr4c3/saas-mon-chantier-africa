// Edge Function : confirmation par email d'une demande de démo.
// Utilise Resend si RESEND_API_KEY est configurée, sinon ne bloque pas l'insertion.
//
// Variables d'environnement attendues (Dashboard Supabase > Edge Functions) :
//   RESEND_API_KEY   clé API Resend
//   RESEND_FROM_EMAIL (optionnel) expéditeur vérifié, ex. "BâtiBénin <noreply@batibenin.bj>"

const resendKey = Deno.env.get("RESEND_API_KEY");
const resendFrom = Deno.env.get("RESEND_FROM_EMAIL") ?? "BâtiBénin <onboarding@resend.dev>";

function json(obj: unknown, init?: ResponseInit) {
  return new Response(JSON.stringify(obj), {
    ...init,
    headers: { "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return json({ ok: false, error: "method" }, { status: 405 });
  }

  let body: {
    email?: string;
    full_name?: string;
    company?: string | null;
    message?: string | null;
  };
  try {
    body = await req.json();
  } catch {
    return json({ ok: false, error: "bad_json" }, { status: 400 });
  }

  const { email, full_name, company, message } = body ?? {};

  if (!email || !full_name) {
    return json({ ok: false, error: "missing_fields" }, { status: 400 });
  }

  if (!resendKey) {
    console.log("[send-demo-confirmation] RESEND_API_KEY non configurée — email ignoré");
    return json({ ok: true, skipped: true });
  }

  const companyLine = company ? `<p>Entreprise : <strong>${escapeHtml(company)}</strong></p>` : "";
  const messageLine = message ? `<p>Besoin : ${escapeHtml(message)}</p>` : "";

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${resendKey}`,
      },
      body: JSON.stringify({
        from: resendFrom,
        to: [email],
        reply_to: "demo@batibenin.bj",
        subject: "Votre demande de démo BâtiBénin a bien été reçue",
        html: `
          <div style="font-family: -apple-system, Segoe UI, Roboto, Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 24px;">
            <h2 style="margin: 0 0 16px;">Bonjour ${escapeHtml(full_name)},</h2>
            <p>Merci pour votre demande de démonstration BâtiBénin.</p>
            ${companyLine}
            ${messageLine}
            <p>Notre équipe vous recontacte sous <strong>24&nbsp;heures ouvrées</strong> pour planifier votre session de 30 minutes, en ligne ou à Cotonou.</p>
            <p>En attendant, vous pouvez déjà explorer l'outil en mode aperçu sans créer de compte.</p>
            <p style="margin-top: 24px;">— L'équipe BâtiBénin</p>
          </div>
        `,
      }),
    });

    if (!res.ok) {
      console.error("[send-demo-confirmation] Resend error", await res.text());
      return json({ ok: false, error: "send_failed" }, { status: 502 });
    }

    return json({ ok: true });
  } catch (err) {
    console.error("[send-demo-confirmation] Exception", err);
    return json({ ok: false, error: "send_failed" }, { status: 500 });
  }
});

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
