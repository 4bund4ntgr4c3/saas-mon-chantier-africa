// Edge Function : envoi automatique des notifications e-mail (Resend).
//
// Alertes (quotidien) : paiements en retard ou à échéance (7 j), devis expirés
// ou proches de l'expiration, postes de budget dépassés (>80 %), pièces
// réglementaires manquantes, chantiers hors délai.
// Digest hebdomadaire : récapitulatif optionnel envoyé au plus une fois / 7 j.
//
// Variables d'environnement :
//   RESEND_API_KEY        clé API Resend (obligatoire pour envoyer)
//   RESEND_FROM_EMAIL     expéditeur vérifié, ex. "BâtiBénin <noreply@batibenin.bj>"
//   APP_URL               lien vers l'app dans les e-mails (optionnel)
//
// Modes :
//   mode "now"       → envoie immédiatement les alertes de l'utilisateur appelant
//   mode "test"      → e-mail de test sans contenu (bouton « E-mail de test »)
//   mode "scheduled" → parcourt tous les utilisateurs (appelé par le cron)

import { createClient } from "npm:@supabase/supabase-js@2";

const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const supabaseUrl = Deno.env.get("SUPABASE_URL");
const resendKey = Deno.env.get("RESEND_API_KEY");
const resendFrom = Deno.env.get("RESEND_FROM_EMAIL") ?? "BâtiBénin <onboarding@resend.dev>";
const appUrl = Deno.env.get("APP_URL") ?? "http://localhost:8082";

const db = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });

function json(obj: unknown, init?: ResponseInit) {
  return new Response(JSON.stringify(obj), {
    ...init,
    headers: { "Content-Type": "application/json" },
  });
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function frDate(value: string) {
  return new Date(`${value}T00:00:00Z`).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
  });
}

function fcfa(value: number) {
  return `${Math.round(Number(value)).toLocaleString("fr-FR")} FCFA`;
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function inDays(value: string) {
  const t = new Date(`${today()}T00:00:00Z`).getTime();
  const v = new Date(`${value}T00:00:00Z`).getTime();
  return Math.round((v - t) / 86400000);
}

type Item = {
  title: string;
  detail: string;
  danger?: boolean;
};

type Ctx = {
  projects: { id: string; name: string; end_date: string | null; status: string }[];
  categories: { id: string; name: string | null }[];
  expenses: { category_id: string | null; amount: number }[];
  budgetLines: { category_id: string; planned_amount: number }[];
  payments: { amount: number; due_date: string | null; project_id: string }[];
  quotes: {
    label: string;
    amount: number;
    status: string;
    valid_until: string | null;
    reference: string | null;
    project_id: string;
  }[];
  documents: { category: string; project_id: string }[];
};

async function loadCtx(userId: string): Promise<Ctx> {
  const empty = {
    projects: [],
    categories: [],
    expenses: [],
    budgetLines: [],
    payments: [],
    quotes: [],
    documents: [],
  };
  const { data: projects } = await db
    .from("projects")
    .select("id, name, end_date, status")
    .eq("user_id", userId);
  const ids = (projects ?? []).map((p) => p.id);
  if (ids.length === 0) return { ...empty, projects: projects ?? [] };

  const { data: categories } = await db.from("categories").select("id, name");
  const { data: expenses } = await db
    .from("expenses")
    .select("category_id, amount")
    .in("project_id", ids);
  const { data: budgetLines } = await db
    .from("budget_lines")
    .select("category_id, planned_amount")
    .in("project_id", ids);
  const { data: payments } = await db
    .from("payments")
    .select("amount, due_date, project_id")
    .in("project_id", ids);
  const { data: quotes } = await db
    .from("quotes")
    .select("label, amount, status, valid_until, reference, project_id")
    .in("project_id", ids);
  const { data: documents } = await db
    .from("documents")
    .select("category, project_id")
    .in("project_id", ids);

  return {
    projects: projects ?? [],
    categories: categories ?? [],
    expenses: expenses ?? [],
    budgetLines: budgetLines ?? [],
    payments: payments ?? [],
    quotes: quotes ?? [],
    documents: documents ?? [],
  };
}

function collectAlerts(ctx: Ctx, enabled: Set<string>): Item[] {
  const items: Item[] = [];
  const now = today();
  const horizon = new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10);
  const catName = new Map(ctx.categories.map((c) => [c.id, c.name]));
  const projectName = new Map(ctx.projects.map((p) => [p.id, p.name]));
  const pname = (id: string) => projectName.get(id) ?? "Chantier";

  if (enabled.has("alert_due_payments")) {
    for (const p of ctx.payments) {
      if (!p.due_date || p.due_date < now || p.due_date > horizon) continue;
      items.push({
        title: `Paiement à échéance dans ${inDays(p.due_date)} j — ${pname(p.project_id)}`,
        detail: `${fcfa(p.amount)} · échéance ${frDate(p.due_date)}`,
      });
    }
  }

  if (enabled.has("alert_late_payments")) {
    for (const p of ctx.payments) {
      if (!p.due_date || p.due_date >= now) continue;
      items.push({
        title: `Paiement en retard de ${-inDays(p.due_date)} j — ${pname(p.project_id)}`,
        detail: `${fcfa(p.amount)} · échéance ${frDate(p.due_date)}`,
        danger: true,
      });
    }
  }

  if (enabled.has("alert_budget")) {
    const spentByCat = new Map<string, number>();
    for (const e of ctx.expenses) {
      if (!e.category_id) continue;
      spentByCat.set(e.category_id, (spentByCat.get(e.category_id) ?? 0) + Number(e.amount));
    }
    for (const line of ctx.budgetLines) {
      const planned = Number(line.planned_amount);
      if (planned <= 0) continue;
      const spent = spentByCat.get(line.category_id) ?? 0;
      const ratio = (spent / planned) * 100;
      if (ratio >= 80) {
        items.push({
          title: `Poste « ${catName.get(line.category_id) ?? "Sans catégorie"} » à ${Math.round(ratio)} %`,
          detail: `${fcfa(spent)} dépensés sur ${fcfa(planned)} prévus`,
          danger: ratio > 100,
        });
      }
    }
  }

  if (enabled.has("alert_quotes")) {
    for (const q of ctx.quotes) {
      if (!q.valid_until || q.status !== "en_attente") continue;
      if (q.valid_until < now) {
        items.push({
          title: `Devis « ${q.label} » expiré — ${pname(q.project_id)}`,
          detail: `${fcfa(q.amount)} · réf. ${q.reference ?? "—"}`,
        });
      } else if (q.valid_until <= horizon) {
        items.push({
          title: `Devis « ${q.label} » expire le ${frDate(q.valid_until)} — ${pname(q.project_id)}`,
          detail: `${fcfa(q.amount)} · réf. ${q.reference ?? "—"}`,
        });
      }
    }
  }

  if (enabled.has("alert_documents")) {
    const required = ["plan", "permis_construire", "acte_vente", "contrat"];
    const presentByProject = new Map<string, Set<string>>();
    for (const d of ctx.documents) {
      const set = presentByProject.get(d.project_id) ?? new Set<string>();
      set.add(d.category);
      presentByProject.set(d.project_id, set);
    }
    for (const proj of ctx.projects) {
      const missing = required.filter(
        (c) => !(presentByProject.get(proj.id) ?? new Set<string>()).has(c),
      );
      if (missing.length > 0) {
        items.push({
          title: `${missing.length} pièce(s) réglementaire(s) manquante(s) — ${proj.name}`,
          detail: missing.join(", "),
        });
      }
    }
  }

  if (enabled.has("alert_projects")) {
    for (const proj of ctx.projects) {
      if (proj.end_date && proj.end_date < now && proj.status !== "termine") {
        items.push({
          title: `Chantier hors délai de ${-inDays(proj.end_date)} j`,
          detail: `${proj.name} — fin prévue le ${frDate(proj.end_date)}.`,
        });
      }
    }
  }

  return items;
}

function buildHtml(heading: string, intro: string, items: Item[]): string {
  const list = items
    .map(
      (i) => `
        <li style="margin-bottom: 12px; padding-left: 4px; border-left: 3px solid ${i.danger ? "#dc2626" : "#d97706"}; padding-left: 12px;">
          <p style="margin: 0 0 2px; font-weight: 600; color: #111827;">${escapeHtml(i.title)}</p>
          <p style="margin: 0; color: #6b7280; font-size: 13px;">${escapeHtml(i.detail)}</p>
        </li>`,
    )
    .join("");
  return `
    <div style="font-family: -apple-system, Segoe UI, Roboto, Arial, sans-serif; max-width: 540px; margin: 0 auto; padding: 24px;">
      <h2 style="margin: 0 0 8px; color: #0f172a;">${escapeHtml(heading)}</h2>
      <p style="margin: 0 0 20px; color: #4b5563;">${escapeHtml(intro)}</p>
      ${items.length > 0 ? `<ul style="list-style: none; margin: 0; padding: 0;">${list}</ul>` : '<p style="color: #9ca3af;">Aucune alerte en cours.</p>'}
      <p style="margin-top: 24px;">
        <a href="${escapeHtml(appUrl)}" style="display: inline-block; background: #f59e0b; color: #fff; text-decoration: none; padding: 10px 18px; border-radius: 8px; font-weight: 600;">Ouvrir BâtiBénin</a>
      </p>
      <p style="margin-top: 24px; color: #9ca3af; font-size: 12px;">Vous recevez cet e-mail selon vos préférences de notification dans Paramètres &gt; Notifications e-mail.</p>
    </div>
  `;
}

async function sendEmail(to: string, subject: string, html: string): Promise<boolean> {
  if (!resendKey) return false;
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${resendKey}`,
      },
      body: JSON.stringify({ from: resendFrom, to: [to], subject, html }),
    });
    if (!res.ok) {
      console.error("[email-notifications] Resend error", await res.text());
      return false;
    }
    return true;
  } catch (err) {
    console.error("[email-notifications] Exception", err);
    return false;
  }
}

async function maybeAlreadySent(userId: string, kind: "alerts" | "digest"): Promise<boolean> {
  if (kind === "alerts") {
    const { data } = await db
      .from("email_log")
      .select("id")
      .eq("user_id", userId)
      .eq("kind", "alerts")
      .gte("sent_at", new Date().toISOString().slice(0, 10))
      .maybeSingle();
    return !!data;
  }
  const { data } = await db
    .from("notification_preferences")
    .select("last_digest_at")
    .eq("user_id", userId)
    .maybeSingle();
  if (!data?.last_digest_at) return false;
  return Date.now() - new Date(data.last_digest_at).getTime() < 7 * 86400000;
}

async function logSend(userId: string, kind: string, items: number) {
  await db.from("email_log").insert({ user_id: userId, kind, items });
  if (kind === "digest") {
    await db
      .from("notification_preferences")
      .update({ last_digest_at: new Date().toISOString() })
      .eq("user_id", userId);
  }
}

type Prefs = {
  email: string | null;
  alerts_enabled: boolean;
  alert_due_payments: boolean;
  alert_late_payments: boolean;
  alert_budget: boolean;
  alert_documents: boolean;
  alert_projects: boolean;
  weekly_digest: boolean;
};

const DEFAULT_PREFS: Prefs = {
  email: null,
  alerts_enabled: true,
  alert_due_payments: true,
  alert_late_payments: true,
  alert_budget: true,
  alert_documents: true,
  alert_projects: true,
  weekly_digest: true,
};

/** Envoie les alertes d'un utilisateur (dédupliquées quotidiennement). */
async function runAlerts(userId: string, email: string, prefs: Prefs, force: boolean) {
  if (!prefs.alerts_enabled) return { skipped: true, reason: "disabled" };
  if (!force && (await maybeAlreadySent(userId, "alerts")))
    return { skipped: true, reason: "dedupe" };
  const enabled = new Set<string>();
  if (prefs.alert_due_payments) enabled.add("alert_due_payments");
  if (prefs.alert_late_payments) enabled.add("alert_late_payments");
  if (prefs.alert_budget) enabled.add("alert_budget");
  if (prefs.alert_documents) enabled.add("alert_documents");
  if (prefs.alert_projects) enabled.add("alert_projects");
  enabled.add("alert_quotes");
  const ctx = await loadCtx(userId);
  const items = collectAlerts(ctx, enabled);
  if (items.length === 0) return { skipped: true, reason: "no_alerts" };
  const sent = await sendEmail(
    email,
    `BâtiBénin — ${items.length} alerte(s) sur vos chantiers`,
    buildHtml(
      "Alertes sur vos chantiers",
      "Voici ce qui demande votre attention aujourd'hui :",
      items,
    ),
  );
  if (sent) await logSend(userId, "alerts", items.length);
  return { sent, items: items.length };
}

/** Envoie le digest hebdomadaire (au plus une fois / 7 j). */
async function runDigest(userId: string, email: string, prefs: Prefs, force: boolean) {
  if (!prefs.weekly_digest) return { skipped: true, reason: "disabled" };
  if (!force && (await maybeAlreadySent(userId, "digest")))
    return { skipped: true, reason: "dedupe" };
  const ctx = await loadCtx(userId);
  const items = collectAlerts(
    ctx,
    new Set([
      "alert_due_payments",
      "alert_late_payments",
      "alert_budget",
      "alert_documents",
      "alert_projects",
      "alert_quotes",
    ]),
  );
  const sent = await sendEmail(
    email,
    "Votre récapitulatif hebdomadaire BâtiBénin",
    buildHtml(
      "Récapitulatif hebdomadaire",
      `Points d'attention de vos chantiers au ${frDate(today())} :`,
      items,
    ),
  );
  if (sent) await logSend(userId, "digest", items.length);
  return { sent, items: items.length };
}

Deno.serve(async (req) => {
  if (req.method !== "POST") return json({ ok: false, error: "method" }, { status: 405 });

  let body: { mode?: string; userId?: string; force?: boolean };
  try {
    body = (await req.json()) ?? {};
  } catch {
    return json({ ok: false, error: "bad_json" }, { status: 400 });
  }
  const mode = body.mode ?? "now";
  const force = !!body.force;

  if (!supabaseUrl || !serviceKey) {
    return json({ ok: false, error: "missing_env" }, { status: 500 });
  }

  // Identité de l'appelant pour les modes interactifs.
  let caller: string | null = null;
  const authHeader = req.headers.get("Authorization");
  if (authHeader?.startsWith("Bearer ")) {
    const { data } = await db.auth.getUser(authHeader.slice(7));
    caller = data.user?.id ?? null;
  }

  if (mode === "test") {
    if (!caller) return json({ ok: false, error: "unauthorized" }, { status: 401 });
    if (!resendKey) return json({ ok: true, skipped: true, reason: "no_resend_key" });
    const { data: user } = await db.auth.admin.getUserById(caller);
    const email = user?.user?.email;
    if (!email) return json({ ok: false, error: "no_email" }, { status: 400 });
    const sent = await sendEmail(
      email,
      "Test BâtiBénin — Notifications e-mail",
      buildHtml(
        "E-mail de test",
        "Si vous lisez ce message, vos notifications e-mail BâtiBénin fonctionnent.",
        [],
      ),
    );
    return json({ ok: true, sent, skipped: !sent });
  }

  if (mode === "scheduled") {
    if (!resendKey) return json({ ok: true, skipped: true, reason: "no_resend_key" });
    const { data: users, error } = await db.auth.admin.listUsers({ perPage: 1000 });
    if (error) return json({ ok: false, error: error.message }, { status: 500 });
    const summary = { users: users.users.length, alerts_sent: 0, digests_sent: 0, skipped: 0 };
    for (const u of users.users) {
      if (!u.email) continue;
      const { data: prefsRow } = await db
        .from("notification_preferences")
        .select("*")
        .eq("user_id", u.id)
        .maybeSingle();
      const prefs: Prefs = prefsRow ? { ...DEFAULT_PREFS, ...prefsRow } : DEFAULT_PREFS;
      const email = prefs.email || u.email;
      const a = await runAlerts(u.id, email, prefs, false);
      const d = await runDigest(u.id, email, prefs, false);
      if (a.sent) summary.alerts_sent += 1;
      if (d.sent) summary.digests_sent += 1;
      if (a.skipped && d.skipped) summary.skipped += 1;
    }
    return json({ ok: true, ...summary });
  }

  // mode "now"
  const userId = body.userId ?? caller;
  if (!userId) return json({ ok: false, error: "unauthorized" }, { status: 401 });
  if (!resendKey) return json({ ok: true, skipped: true, reason: "no_resend_key" });
  const { data: user } = await db.auth.admin.getUserById(userId);
  const email = user?.user?.email;
  if (!email) return json({ ok: false, error: "no_email" }, { status: 400 });
  const { data: prefsRow } = await db
    .from("notification_preferences")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();
  const prefs: Prefs = prefsRow ? { ...DEFAULT_PREFS, ...prefsRow } : DEFAULT_PREFS;
  const result = await runAlerts(userId, prefs.email || email, prefs, force);
  return json({ ok: true, ...result });
});
