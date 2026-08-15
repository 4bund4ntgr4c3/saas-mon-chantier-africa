import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Download, IdCard, QrCode, Shield, Sparkles, UserCheck } from "lucide-react";
import { BADGE_ROLES, BadgeRole, generateAccessBadge } from "@/lib/access-badge";
import QRCode from "qrcode";
import { frDate } from "@/lib/format";
import { toast } from "sonner";

interface AccessBadgeDialogProps {
  projectName?: string;
  defaultName?: string;
}

export function AccessBadgeDialog({
  projectName = "Mon Chantier",
  defaultName = "Koffi Mensah",
}: AccessBadgeDialogProps) {
  const [open, setOpen] = useState(false);
  const [fullName, setFullName] = useState(defaultName);
  const [role, setRole] = useState<BadgeRole>("artisan");
  const [phone, setPhone] = useState("+229 97 00 00 00");
  const [qrDataUrl, setQrDataUrl] = useState<string>("");

  const badge = generateAccessBadge(fullName, role, projectName, phone);

  useEffect(() => {
    QRCode.toDataURL(badge.qrPayload, { width: 180, margin: 1 }, (err, url) => {
      if (!err && url) setQrDataUrl(url);
    });
  }, [badge.qrPayload]);

  const handleDownloadPass = () => {
    toast.success("Badge d'accès prêt pour impression ou transfert mobile !");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5 border-purple-500/40 text-purple-700 hover:border-purple-500 font-medium"
        >
          <IdCard className="h-4 w-4 text-purple-600" />
          Badges & QR Pass Chantier
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2 text-lg font-bold text-purple-900 dark:text-purple-300">
              <IdCard className="h-5 w-5 text-purple-600" />
              Badge d'Accès Sécurisé & QR Pass
            </DialogTitle>
            <Badge variant="secondary" className="gap-1 text-xs">
              <Sparkles className="h-3 w-3 text-purple-600" />
              Contrôle d'Accès
            </Badge>
          </div>
          <DialogDescription>
            Générez un laissez-passer avec QR Code d'identification pour vos intervenants et
            visiteurs sur le chantier.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2 text-xs">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-[11px]">Nom & Prénom</Label>
              <Input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="h-7 text-xs mt-1"
              />
            </div>
            <div>
              <Label className="text-[11px]">Téléphone</Label>
              <Input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="h-7 text-xs mt-1"
              />
            </div>
          </div>

          <div>
            <Label className="text-xs">Rôle / Habilitation sur le chantier</Label>
            <Select value={role} onValueChange={(v) => setRole(v as BadgeRole)}>
              <SelectTrigger className="h-8 text-xs mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {BADGE_ROLES.map((r) => (
                  <SelectItem key={r.value} value={r.value} className="text-xs">
                    {r.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* VISUEL DU BADGE DE CHANTIER */}
          <Card className="bg-gradient-to-br from-slate-900 via-slate-800 to-purple-950 text-white border-purple-500/30 overflow-hidden shadow-lg">
            <CardContent className="p-4 space-y-3">
              <div className="flex justify-between items-start border-b border-white/10 pb-2">
                <div>
                  <div className="flex items-center gap-1.5 font-bold tracking-wider text-xs text-amber-400">
                    <Shield className="h-4 w-4" /> BÂTIBÉNIN PASS
                  </div>
                  <p className="text-[10px] text-slate-400 mt-0.5">{badge.projectName}</p>
                </div>
                <Badge className="bg-purple-600 text-[10px] font-mono">{badge.badgeId}</Badge>
              </div>

              <div className="flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <p className="text-base font-bold tracking-wide text-white">{badge.fullName}</p>
                  <p className="text-xs text-purple-300 font-medium">{badge.roleLabel}</p>
                  <p className="text-[10px] text-slate-400 pt-1">
                    Validité : jusqu'au <strong>{frDate(badge.validUntil)}</strong>
                  </p>
                </div>

                {qrDataUrl && (
                  <div className="bg-white p-1 rounded-lg shrink-0">
                    <img src={qrDataUrl} alt="QR Code Badge" className="w-20 h-20" />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* ACTION */}
          <div className="flex justify-end gap-2 border-t pt-3">
            <Button
              size="sm"
              onClick={handleDownloadPass}
              className="gap-1.5 text-xs bg-purple-700 hover:bg-purple-800 text-white"
            >
              <Download className="h-3.5 w-3.5" />
              Exporter le badge d'accès
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
