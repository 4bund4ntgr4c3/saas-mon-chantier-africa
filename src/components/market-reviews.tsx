import { useState } from "react";
import { BadgeCheck, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { frDate } from "@/lib/format";
import { useAddMarketReview, useMarketReviews, useProfile, type ReviewTarget } from "@/lib/data";

function Stars({ value }: { value: number }) {
  return (
    <span className="inline-flex items-center gap-0.5" title={`${value.toLocaleString("fr-FR")}/5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={cn(
            "size-3.5",
            i <= Math.round(value) ? "fill-primary text-primary" : "text-muted-foreground/40",
          )}
        />
      ))}
    </span>
  );
}

/**
 * Avis sur une cible du marketplace (boutique, produit ou transporteur).
 * Affiche la note moyenne, la liste des avis (badge "achat vérifié") et un
 * formulaire de dépôt — l'utilisateur ne peut publier qu'un seul avis par cible.
 */
export function MarketReviewsBlock({
  targetType,
  targetId,
  average,
  count,
}: {
  targetType: ReviewTarget;
  targetId: string | null;
  average: number;
  count: number;
}) {
  const { data: reviews = [] } = useMarketReviews(targetType, targetId);
  const addReview = useAddMarketReview();
  const { data: profile } = useProfile();
  const [rating, setRating] = useState("5");
  const [comment, setComment] = useState("");
  const [saving, setSaving] = useState(false);
  const alreadyReviewed = !!profile?.id && reviews.some((r) => r.user_id === profile.id);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!targetId) return;
    setSaving(true);
    try {
      await addReview.mutateAsync({
        targetType,
        targetId,
        rating: Number(rating),
        comment: comment.trim() || null,
        verified: true,
      });
      setComment("");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <div className="flex items-center gap-2">
        <Stars value={Number(average)} />
        <span className="text-xs text-muted-foreground">{count} avis</span>
      </div>

      {reviews.length > 0 && (
        <ul className="mt-3 space-y-3">
          {reviews.map((r) => (
            <li key={r.id} className="rounded-md border border-border bg-secondary/30 p-3">
              <div className="flex items-center justify-between">
                <Stars value={Number(r.rating)} />
                <span className="text-[10px] text-muted-foreground">{frDate(r.created_at)}</span>
              </div>
              {r.comment && <p className="mt-1.5 text-sm">{r.comment}</p>}
              {r.verified && (
                <p className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-medium text-success">
                  <BadgeCheck className="size-3.5" /> Achat vérifié
                </p>
              )}
            </li>
          ))}
        </ul>
      )}

      {alreadyReviewed ? (
        <p className="mt-3 text-xs text-muted-foreground">
          Vous avez déjà publié un avis sur cette cible.
        </p>
      ) : (
        <form onSubmit={submit} className="mt-4 space-y-3 rounded-md border border-border p-3">
          <div className="flex flex-wrap items-end gap-3">
            <div>
              <Label className="mb-1.5 block text-xs text-muted-foreground">Note</Label>
              <Select value={rating} onValueChange={setRating}>
                <SelectTrigger className="w-28">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[5, 4, 3, 2, 1].map((n) => (
                    <SelectItem key={n} value={String(n)}>
                      {n} / 5
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <Textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={2}
            placeholder="Votre expérience…"
          />
          <Button type="submit" disabled={saving || !targetId}>
            {saving ? "Publication…" : "Publier mon avis"}
          </Button>
        </form>
      )}
    </div>
  );
}
