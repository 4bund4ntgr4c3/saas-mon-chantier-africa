import { useState } from "react";
import { Mail, Shield, Trash2, UserPlus, Users } from "lucide-react";
import { toast } from "sonner";
import {
  useAddProjectMember,
  useProjectMembers,
  useRemoveProjectMember,
  useUpdateProjectMember,
} from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const ROLE_LABELS: Record<string, string> = {
  owner: "Propriétaire",
  editor: "Éditeur",
  viewer: "Lecture seule",
};

export function ProjectMembersButton({ projectId }: { projectId: string }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="sm" variant="ghost">
          <Users className="size-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Membres du chantier</DialogTitle>
          <DialogDescription>
            Invitez des collaborateurs à suivre et gérer ce chantier. L'invitation se fait par
            e-mail (compte BâtiBénin existant).
          </DialogDescription>
        </DialogHeader>
        <ProjectMembersBody projectId={projectId} />
      </DialogContent>
    </Dialog>
  );
}

function ProjectMembersBody({ projectId }: { projectId: string }) {
  const { data: members = [] } = useProjectMembers(projectId);
  const addMember = useAddProjectMember();
  const updateMember = useUpdateProjectMember();
  const removeMember = useRemoveProjectMember();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"editor" | "viewer">("editor");

  async function submitInvite(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) {
      toast.error("Renseignez l'e-mail du membre à inviter");
      return;
    }
    await addMember.mutateAsync({ projectId, email, role });
    setEmail("");
  }

  return (
    <div className="space-y-4">
      <form className="space-y-3 rounded-lg border border-border p-3" onSubmit={submitInvite}>
        <div>
          <Label htmlFor="member_email" className="mb-1.5 block text-xs text-muted-foreground">
            E-mail du membre
          </Label>
          <div className="flex gap-2">
            <Input
              id="member_email"
              type="email"
              placeholder="collaborateur@exemple.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Button type="submit" disabled={addMember.isPending} aria-label="Inviter">
              <UserPlus className="size-4" />
            </Button>
          </div>
        </div>
        <div>
          <Label className="mb-1.5 block text-xs text-muted-foreground">Rôle</Label>
          <Select value={role} onValueChange={(v) => setRole(v as "editor" | "viewer")}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="editor">Éditeur — peut modifier</SelectItem>
              <SelectItem value="viewer">Lecture seule — peut consulter</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </form>

      <ul className="divide-y divide-border rounded-lg border border-border">
        {members.length === 0 && (
          <li className="p-4 text-sm text-muted-foreground">
            Aucun membre invité pour l'instant. Seul vous avez accès à ce chantier.
          </li>
        )}
        {members.map((m) => (
          <li key={m.id} className="flex items-center gap-3 px-4 py-3">
            <span className="grid size-8 shrink-0 place-items-center rounded-md bg-secondary text-muted-foreground">
              {m.user_id ? <Shield className="size-4" /> : <Mail className="size-4" />}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">
                {m.user_id ? (m.profile_full_name ?? "Membre") : m.email}
              </p>
              <Badge variant="secondary" className="mt-0.5">
                {m.user_id ? (ROLE_LABELS[m.role] ?? m.role) : "Invitation en attente"}
              </Badge>
            </div>
            {m.user_id ? (
              <div className="flex items-center gap-1">
                <Select
                  value={m.role}
                  onValueChange={(v) =>
                    updateMember.mutate({
                      id: m.id,
                      projectId,
                      role: v as "owner" | "editor" | "viewer",
                    })
                  }
                >
                  <SelectTrigger className="h-8 w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="owner">Propriétaire</SelectItem>
                    <SelectItem value="editor">Éditeur</SelectItem>
                    <SelectItem value="viewer">Lecture seule</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  size="icon"
                  variant="ghost"
                  className="text-destructive"
                  aria-label="Retirer ce membre"
                  onClick={() => removeMember.mutate({ id: m.id, projectId })}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            ) : (
              <Button
                size="icon"
                variant="ghost"
                className="text-destructive"
                aria-label="Annuler cette invitation"
                onClick={() => removeMember.mutate({ id: m.id, projectId })}
              >
                <Trash2 className="size-4" />
              </Button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
