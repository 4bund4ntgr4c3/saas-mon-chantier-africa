import { useState } from "react";
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
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, DollarSign, HardHat, Plus, Users, UserCheck } from "lucide-react";
import {
  AttendanceRecord,
  AttendanceStatus,
  calculateTotalPayroll,
  Worker,
  WORKER_ROLES,
} from "@/lib/labor";
import { fcfa } from "@/lib/format";
import { toast } from "sonner";

export function LaborManagementDialog() {
  const [open, setOpen] = useState(false);
  const [workers, setWorkers] = useState<Worker[]>([
    {
      id: "w1",
      name: "Saliou Dossou",
      role: "macon",
      roleLabel: "Chef Maçon",
      dailyRate: 7000,
      phoneNumber: "+229 97 00 11 22",
    },
    {
      id: "w2",
      name: "Femi Adebayo",
      role: "ferrailleur",
      roleLabel: "Ferrailleur",
      dailyRate: 6500,
      phoneNumber: "+229 96 11 22 33",
    },
    {
      id: "w3",
      name: "Koffi Mensah",
      role: "manoeuvre",
      roleLabel: "Manœuvre",
      dailyRate: 3500,
      phoneNumber: "+229 95 22 33 44",
    },
    {
      id: "w4",
      name: "Jean-Baptiste Houndé",
      role: "coffreur",
      roleLabel: "Coffreur",
      dailyRate: 6000,
      phoneNumber: "+229 94 33 44 55",
    },
  ]);

  const [attendances, setAttendances] = useState<AttendanceRecord[]>([
    { workerId: "w1", date: "today", status: "present" },
    { workerId: "w2", date: "today", status: "present" },
    { workerId: "w3", date: "today", status: "present" },
    { workerId: "w4", date: "today", status: "half_day" },
  ]);

  // Nouveau formulaire ouvrier
  const [newName, setNewName] = useState("");
  const [newRole, setNewRole] = useState<Worker["role"]>("macon");
  const [newRate, setNewRate] = useState("6000");

  const setStatus = (workerId: string, status: AttendanceStatus) => {
    setAttendances((prev) => {
      const exists = prev.find((a) => a.workerId === workerId);
      if (exists) {
        return prev.map((a) => (a.workerId === workerId ? { ...a, status } : a));
      }
      return [...prev, { workerId, date: "today", status }];
    });
  };

  const handleAddWorker = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    const roleMeta = WORKER_ROLES.find((r) => r.value === newRole);
    const newW: Worker = {
      id: `w_${Date.now()}`,
      name: newName.trim(),
      role: newRole,
      roleLabel: roleMeta?.label ?? "Ouvrier",
      dailyRate: Number(newRate) || 5000,
    };
    setWorkers((prev) => [...prev, newW]);
    setAttendances((prev) => [...prev, { workerId: newW.id, date: "today", status: "present" }]);
    setNewName("");
    toast.success("Ouvrier ajouté à l'équipe !");
  };

  const { summaries, totalGlobalDue } = calculateTotalPayroll(workers, attendances);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5 border-primary/30">
          <Users className="h-4 w-4 text-primary" />
          Pointage & Main-d'œuvre
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-bold">
            <HardHat className="h-5 w-5 text-amber-600" />
            Pointage quotidien & Paie des ouvriers
          </DialogTitle>
          <DialogDescription>
            Pointez les présences journalières des maçons, ferrailleurs et manœuvres, et préparez
            les paiements Mobile Money.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-900 p-3 rounded-lg border border-primary/20">
            <div>
              <span className="text-xs text-muted-foreground">Effectif présent aujourd'hui</span>
              <p className="text-base font-bold text-slate-800 dark:text-slate-100">
                {
                  attendances.filter((a) => a.status === "present" || a.status === "overtime")
                    .length
                }{" "}
                / {workers.length} ouvriers
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs text-muted-foreground">Total paie du jour</span>
              <p className="text-xl font-extrabold text-primary">{fcfa(totalGlobalDue)}</p>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Appel des ouvriers
            </h4>
            <div className="space-y-2">
              {workers.map((w) => {
                const att = attendances.find((a) => a.workerId === w.id);
                const currentStatus = att?.status ?? "present";
                const summary = summaries.find((s) => s.workerId === w.id);

                return (
                  <Card key={w.id} className="border p-2.5">
                    <CardContent className="p-0 flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm">{w.name}</span>
                          <Badge variant="outline" className="text-[10px]">
                            {w.roleLabel}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Tarif : {fcfa(w.dailyRate)}/jour · À payer :{" "}
                          <strong className="text-foreground">
                            {fcfa(summary?.totalDue ?? w.dailyRate)}
                          </strong>
                        </p>
                      </div>

                      <div className="flex items-center gap-1">
                        <Button
                          type="button"
                          size="sm"
                          variant={currentStatus === "present" ? "default" : "outline"}
                          className="h-7 text-xs px-2"
                          onClick={() => setStatus(w.id, "present")}
                        >
                          Présent (100%)
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant={currentStatus === "half_day" ? "secondary" : "outline"}
                          className="h-7 text-xs px-2"
                          onClick={() => setStatus(w.id, "half_day")}
                        >
                          ½ Jour
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant={currentStatus === "absent" ? "destructive" : "outline"}
                          className="h-7 text-xs px-2"
                          onClick={() => setStatus(w.id, "absent")}
                        >
                          Absent
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          <form onSubmit={handleAddWorker} className="border-t pt-3 space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Ajouter un ouvrier à l'équipe
            </h4>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <Label htmlFor="w-name" className="text-xs">
                  Nom complet
                </Label>
                <Input
                  id="w-name"
                  placeholder="Ex: Kodjo Paul"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="h-8 text-xs"
                />
              </div>
              <div>
                <Label htmlFor="w-role" className="text-xs">
                  Corps d'état
                </Label>
                <Select
                  value={newRole}
                  onValueChange={(v) => {
                    setNewRole(v as Worker["role"]);
                    const r = WORKER_ROLES.find((rk) => rk.value === v);
                    if (r) setNewRate(String(r.defaultDailyRate));
                  }}
                >
                  <SelectTrigger id="w-role" className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {WORKER_ROLES.map((r) => (
                      <SelectItem key={r.value} value={r.value} className="text-xs">
                        {r.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="w-rate" className="text-xs">
                  Tarif/j (FCFA)
                </Label>
                <Input
                  id="w-rate"
                  type="number"
                  value={newRate}
                  onChange={(e) => setNewRate(e.target.value)}
                  className="h-8 text-xs"
                />
              </div>
            </div>
            <Button
              type="submit"
              size="sm"
              variant="outline"
              className="w-full h-8 text-xs gap-1.5"
            >
              <Plus className="h-3.5 w-3.5" /> Enregistrer l'ouvrier
            </Button>
          </form>

          <Button
            className="w-full gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
            onClick={() => {
              toast.success(
                `Ordre de paiement groupé Mobile Money de ${fcfa(totalGlobalDue)} initié avec succès !`,
              );
              setOpen(false);
            }}
          >
            <DollarSign className="h-4 w-4" /> Payer l'équipe par Mobile Money (
            {fcfa(totalGlobalDue)})
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
