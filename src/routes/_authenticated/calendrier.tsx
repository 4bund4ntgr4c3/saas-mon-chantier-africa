import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { CalendarDays, CircleAlert, CircleCheck } from "lucide-react";
import { FeatureGate } from "@/components/feature-gate";
import { PageHeader } from "@/components/app-shell";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { isGuestMode } from "@/lib/guest-mode";
import { demoRows } from "@/lib/demo-store";
import { useProjects } from "@/lib/data";
import { fcfa, frDate, labelOf, monthKey, monthLabel, PAYMENT_METHODS } from "@/lib/format";
import type { Payment, Quote } from "@/lib/data";

export const Route = createFileRoute("/_authenticated/calendrier")({
  head: () => ({
    meta: [
      { title: "Échéances — BâtiBénin" },
      {
        name: "description",
        content:
          "Vue calendrier des échéances de paiements et des factures par chantier, avec détection des retards.",
      },
      { property: "og:title", content: "Échéances — BâtiBénin" },
      {
        property: "og:description",
        content: "Ne ratez plus aucune échéance de paiement ou de facture sur vos chantiers.",
      },
    ],
  }),
  component: () => (
    <FeatureGate feature="calendrier">
      <CalendrierPage />
    </FeatureGate>
  ),
});

type Event = {
  id: string;
  date: string;
  projectId: string;
  projectName: string;
  kind: "paiement" | "devis" | "chantier";
  label: string;
  amount: number;
  overdue: boolean;
  days: number;
};

function daysFrom(date: string) {
  return Math.round((new Date(date).getTime() - Date.now()) / 86400000);
}

function CalendrierPage() {
  const { data: projects = [] } = useProjects();
  const projectName = useMemo(() => new Map(projects.map((p) => [p.id, p.name])), [projects]);

  const { data: payments = [] } = useQuery({
    queryKey: ["calendrier_payments"],
    queryFn: async () => {
      if (isGuestMode()) return demoRows<Payment>("payments");
      const r = await supabase.from("payments").select("*");
      if (r.error) throw new Error(r.error.message);
      return r.data as Payment[];
    },
  });

  const { data: quotes = [] } = useQuery({
    queryKey: ["calendrier_quotes"],
    queryFn: async () => {
      if (isGuestMode()) return demoRows<Quote>("quotes");
      const r = await supabase.from("quotes").select("*");
      if (r.error) throw new Error(r.error.message);
      return r.data as Quote[];
    },
  });

  const events = useMemo<Event[]>(() => {
    const out: Event[] = [];
    const todayKey = new Date().toISOString().slice(0, 10);

    for (const p of payments) {
      if (!p.due_date) continue;
      const overdue = p.due_date < todayKey;
      out.push({
        id: `pay-${p.id}`,
        date: p.due_date,
        projectId: p.project_id,
        projectName: projectName.get(p.project_id) ?? "Chantier",
        kind: "paiement",
        label: `${labelOf(PAYMENT_METHODS, p.method)} — ${p.expense_id ? "rattaché à une dépense" : "paiement"}`,
        amount: Number(p.amount),
        overdue,
        days: daysFrom(p.due_date),
      });
    }

    for (const q of quotes) {
      if (!q.valid_until || q.status !== "en_attente") continue;
      const overdue = q.valid_until < todayKey;
      out.push({
        id: `quote-${q.id}`,
        date: q.valid_until,
        projectId: q.project_id,
        projectName: projectName.get(q.project_id) ?? "Chantier",
        kind: "devis",
        label: `Devis « ${q.label} » (${q.reference ?? "sans réf."})`,
        amount: Number(q.amount),
        overdue,
        days: daysFrom(q.valid_until),
      });
    }

    for (const p of projects) {
      if (!p.end_date) continue;
      const overdue = p.end_date < todayKey && p.status !== "termine";
      out.push({
        id: `proj-${p.id}`,
        date: p.end_date,
        projectId: p.id,
        projectName: p.name,
        kind: "chantier",
        label: overdue ? "Fin de chantier dépassée" : "Fin prévisionnelle du chantier",
        amount: Number(p.budget ?? 0),
        overdue,
        days: daysFrom(p.end_date),
      });
    }

    return out.sort((a, b) => a.date.localeCompare(b.date));
  }, [payments, quotes, projects, projectName]);

  const grouped = useMemo(() => {
    const map = new Map<string, Event[]>();
    for (const e of events) {
      const key = monthKey(e.date);
      const list = map.get(key) ?? [];
      list.push(e);
      map.set(key, list);
    }
    return [...map.entries()];
  }, [events]);

  const overdueCount = events.filter((e) => e.overdue).length;
  const next7 = events.filter((e) => !e.overdue && e.days <= 7).length;

  return (
    <>
      <PageHeader
        title="Calendrier des échéances"
        subtitle={`${events.length} échéance(s) — ${overdueCount} en retard · ${next7} sous 7 jours`}
      />

      {events.length === 0 ? (
        <div className="panel grid place-items-center px-6 py-16 text-center">
          <CalendarDays className="mb-3 size-9 text-primary" />
          <h2 className="font-display text-lg font-semibold">Aucune échéance à venir</h2>
          <p className="mt-1 max-w-md text-sm text-muted-foreground">
            Les dates d'échéance des paiements, la validité des devis et les fins de chantier
            apparaîtront ici.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {grouped.map(([key, list]) => (
            <section key={key}>
              <h2 className="mb-2 font-display text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                {monthLabel(key)}
              </h2>
              <div className="panel divide-y divide-border">
                {list.map((e) => (
                  <div key={e.id} className="flex flex-wrap items-center gap-3 p-4 sm:gap-5">
                    <div className="w-12 shrink-0 text-center">
                      <p
                        className={`num text-lg font-semibold ${e.overdue ? "text-destructive" : "text-primary"}`}
                      >
                        {e.date.slice(8, 10)}
                      </p>
                      <p className="text-[10px] uppercase text-muted-foreground">
                        {new Date(e.date + "T00:00:00").toLocaleDateString("fr-FR", {
                          month: "short",
                        })}
                      </p>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">
                        {e.label} — {e.projectName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {frDate(e.date)}
                        {e.overdue
                          ? ` · en retard de ${Math.abs(e.days)} j`
                          : e.days === 0
                            ? " · aujourd'hui"
                            : ` · dans ${e.days} j`}
                      </p>
                    </div>
                    <span className="num text-sm text-primary">{fcfa(e.amount)}</span>
                    <Badge
                      variant={e.overdue ? "destructive" : e.days <= 7 ? "outline" : "secondary"}
                      className={
                        e.overdue ? "" : e.days <= 7 ? "border-accent/50 text-accent" : undefined
                      }
                    >
                      {e.overdue ? (
                        <CircleAlert className="mr-1 size-3.5" />
                      ) : (
                        <CircleCheck className="mr-1 size-3.5" />
                      )}
                      {e.kind === "paiement"
                        ? "Paiement"
                        : e.kind === "devis"
                          ? "Devis"
                          : "Chantier"}
                    </Badge>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </>
  );
}
