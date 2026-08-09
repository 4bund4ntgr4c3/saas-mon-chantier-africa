import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { CheckCircle2, Receipt, Smartphone } from "lucide-react";
import { MobileMoneyDialog } from "@/components/mobile-money-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { usePublicOrderByReference } from "@/lib/data";
import { fcfa, labelOf, ORDER_STATUSES, PAYMENT_METHODS } from "@/lib/format";

export const Route = createFileRoute("/paiement/$reference")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Lien de paiement — BâtiBénin" },
      { name: "description", content: "Paiement d'une commande par mobile money." },
      { property: "og:title", content: "Paiement — BâtiBénin" },
    ],
  }),
  component: PaymentLinkPage,
});

function PaymentLinkPage() {
  const { reference } = Route.useParams();
  const { data, isPending, isError } = usePublicOrderByReference(reference);
  const [mmOpen, setMmOpen] = useState(false);

  if (isPending)
    return (
      <div className="grid min-h-screen place-items-center bg-background p-6 text-sm text-muted-foreground">
        Chargement du paiement…
      </div>
    );

  if (isError || !data?.order)
    return (
      <div className="grid min-h-screen place-items-center bg-background p-6">
        <div className="max-w-md text-center">
          <Receipt className="mx-auto mb-3 size-8 text-muted-foreground" />
          <h1 className="font-display text-lg font-semibold">Lien invalide</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Ce lien de paiement n'existe plus ou a été révoqué.
          </p>
          <Link
            to="/"
            className="mt-5 inline-flex rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
          >
            Découvrir BâtiBénin
          </Link>
        </div>
      </div>
    );

  const { order, items, store } = data;
  const paid = order.status === "payee" || order.status === "livree";
  const cod = order.payment_method === "a_la_livraison" || order.payment_method === "especes";

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-secondary/30 px-4 py-5">
        <div className="mx-auto flex max-w-2xl items-center justify-between gap-3">
          <div>
            <h1 className="font-display text-lg font-semibold">Lien de paiement</h1>
            <p className="text-xs text-muted-foreground">
              {store?.name ?? "Boutique"} · {order.reference}
            </p>
          </div>
          <Badge
            variant="outline"
            className={
              paid
                ? "border-emerald-400 bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                : "border-amber-400 bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300"
            }
          >
            {paid ? "Payée" : labelOf(ORDER_STATUSES, order.status)}
          </Badge>
        </div>
      </header>

      <main className="mx-auto max-w-2xl space-y-5 p-4 md:p-6">
        <div className="panel overflow-hidden">
          <div className="border-b border-border p-4">
            <h2 className="flex items-center gap-2 font-display text-sm font-semibold">
              <Receipt className="size-4 text-primary" /> Commande à régler
            </h2>
          </div>
          <ul className="divide-y divide-border">
            {items.length === 0 && (
              <li className="p-4 text-sm text-muted-foreground">
                Aucun article renseigné pour cette commande.
              </li>
            )}
            {items.map((it) => (
              <li key={it.id} className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
                <div className="min-w-0">
                  <p className="truncate font-medium">{it.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {it.quantity} × {fcfa(Number(it.unit_price))}
                    {it.unit ? ` / ${it.unit}` : ""}
                  </p>
                </div>
                <span className="num font-semibold">
                  {fcfa(Number(it.quantity) * Number(it.unit_price))}
                </span>
              </li>
            ))}
          </ul>
          <dl className="grid gap-1.5 border-t border-border p-4 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Livraison</dt>
              <dd className="num">{fcfa(order.delivery_fee)}</dd>
            </div>
            <div className="flex justify-between text-base">
              <dt className="font-semibold">Total</dt>
              <dd className="num font-semibold text-primary">{fcfa(order.total)}</dd>
            </div>
          </dl>
        </div>

        <div className="panel p-5">
          <h2 className="flex items-center gap-2 font-display text-sm font-semibold">
            <Smartphone className="size-4 text-primary" /> Payer
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {cod
              ? "Cette commande sera réglée à la livraison. Merci de prévoir le montant."
              : "Réglez cette commande par MTN MoMo, Moov Money ou une autre passerelle mobile money (sandbox de démonstration)."}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {!paid && !cod && (
              <Button onClick={() => setMmOpen(true)}>
                <Smartphone className="size-4" /> Payer par mobile money
              </Button>
            )}
            {(paid || cod) && (
              <Button variant="outline" disabled>
                <CheckCircle2 className="size-4" />
                {paid ? "Commande déjà payée" : "Paiement à la livraison"}
              </Button>
            )}
            <Button asChild variant="ghost">
              <Link to="/">Découvrir BâtiBénin</Link>
            </Button>
          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground">
          Paiement : {labelOf(PAYMENT_METHODS, order.payment_method ?? "mtn_momo")}
          {order.city ? ` · Livraison à ${order.city}` : ""}
          {order.phone ? ` · ${order.phone}` : ""}
        </p>
      </main>

      <MobileMoneyDialog
        projectId={null}
        orderId={order.id}
        amount={order.total}
        open={mmOpen}
        onOpenChange={setMmOpen}
      />
    </div>
  );
}
