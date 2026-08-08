import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { isGuestMode } from "@/lib/guest-mode";
import { demoDelete, demoInsert, demoRows, demoUpdate, type DemoTableName } from "@/lib/demo-store";
import type { Database } from "@/integrations/supabase/types";

type Tables = Database["public"]["Tables"];
export type Project = Tables["projects"]["Row"];
export type Category = Tables["categories"]["Row"];
export type Supplier = Tables["suppliers"]["Row"];
export type Company = Tables["companies"]["Row"];
export type Expense = Tables["expenses"]["Row"];
export type Payment = Tables["payments"]["Row"];
export type Quote = Tables["quotes"]["Row"];
export type BudgetLine = Tables["budget_lines"]["Row"];

async function unwrap<T>(p: PromiseLike<{ data: T | null; error: { message: string } | null }>) {
  const { data, error } = await p;
  if (error) throw new Error(error.message);
  return (data ?? []) as T;
}

export function useProjects() {
  return useQuery({
    queryKey: ["projects"],
    queryFn: () =>
      isGuestMode()
        ? demoRows<Project>("projects")
        : unwrap<Project[]>(
            supabase.from("projects").select("*").order("created_at", { ascending: false }),
          ),
  });
}

export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: () =>
      isGuestMode()
        ? demoRows<Category>("categories")
        : unwrap<Category[]>(
            supabase.from("categories").select("*").order("sort_order", { ascending: true }),
          ),
    staleTime: 5 * 60 * 1000,
  });
}

export function useSuppliers() {
  return useQuery({
    queryKey: ["suppliers"],
    queryFn: () =>
      isGuestMode()
        ? demoRows<Supplier>("suppliers")
        : unwrap<Supplier[]>(supabase.from("suppliers").select("*").order("name")),
  });
}

export function useCompanies() {
  return useQuery({
    queryKey: ["companies"],
    queryFn: () =>
      isGuestMode()
        ? demoRows<Company>("companies")
        : unwrap<Company[]>(supabase.from("companies").select("*").order("name")),
  });
}

export function useExpenses(projectId: string | null) {
  return useQuery({
    queryKey: ["expenses", projectId],
    enabled: !!projectId,
    queryFn: () =>
      isGuestMode()
        ? demoRows<Expense>("expenses").filter(
            (r) => (r as { project_id: string }).project_id === projectId,
          )
        : unwrap<Expense[]>(
            supabase
              .from("expenses")
              .select("*")
              .eq("project_id", projectId!)
              .order("expense_date", { ascending: false }),
          ),
  });
}

/** Toutes les dépenses de l'utilisateur, tous chantiers confondus (pour la recherche globale). */
export function useAllExpenses() {
  return useQuery({
    queryKey: ["expenses", "all"],
    queryFn: () =>
      isGuestMode()
        ? demoRows<Expense>("expenses")
        : unwrap<Expense[]>(
            supabase.from("expenses").select("*").order("expense_date", { ascending: false }),
          ),
  });
}

export function usePayments(projectId: string | null) {
  return useQuery({
    queryKey: ["payments", projectId],
    enabled: !!projectId,
    queryFn: () =>
      isGuestMode()
        ? demoRows<Payment>("payments").filter(
            (r) => (r as { project_id: string }).project_id === projectId,
          )
        : unwrap<Payment[]>(
            supabase
              .from("payments")
              .select("*")
              .eq("project_id", projectId!)
              .order("payment_date", { ascending: false }),
          ),
  });
}

export function useQuotes(projectId: string | null) {
  return useQuery({
    queryKey: ["quotes", projectId],
    enabled: !!projectId,
    queryFn: () =>
      isGuestMode()
        ? demoRows<Quote>("quotes").filter(
            (r) => (r as { project_id: string }).project_id === projectId,
          )
        : unwrap<Quote[]>(
            supabase
              .from("quotes")
              .select("*")
              .eq("project_id", projectId!)
              .order("quote_date", { ascending: false }),
          ),
  });
}

export function useBudgetLines(projectId: string | null) {
  return useQuery({
    queryKey: ["budget_lines", projectId],
    enabled: !!projectId,
    queryFn: () =>
      isGuestMode()
        ? demoRows<BudgetLine>("budget_lines").filter(
            (r) => (r as { project_id: string }).project_id === projectId,
          )
        : unwrap<BudgetLine[]>(
            supabase.from("budget_lines").select("*").eq("project_id", projectId!),
          ),
  });
}

export type SiteLog = Tables["site_logs"]["Row"];

export function useSiteLogs(projectId: string | null) {
  return useQuery({
    queryKey: ["site_logs", projectId],
    enabled: !!projectId,
    queryFn: () =>
      isGuestMode()
        ? demoRows<SiteLog>("site_logs").filter(
            (r) => (r as { project_id: string }).project_id === projectId,
          )
        : unwrap<SiteLog[]>(
            supabase
              .from("site_logs")
              .select("*")
              .eq("project_id", projectId!)
              .order("log_date", { ascending: false })
              .order("created_at", { ascending: false }),
          ),
  });
}

export const JOURNAL_BUCKET = "journal-photos";

/** Téléverse des photos dans le dossier privé de l'utilisateur et renvoie leurs chemins. */
export async function uploadJournalPhotos(files: File[], projectId: string) {
  if (isGuestMode()) return [];
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) throw new Error("Session expirée");
  const paths: string[] = [];
  for (const file of files) {
    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const path = `${auth.user.id}/${projectId}/${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage
      .from(JOURNAL_BUCKET)
      .upload(path, file, { contentType: file.type || "image/jpeg" });
    if (error) throw new Error(error.message);
    paths.push(path);
  }
  return paths;
}

/** URLs signées pour afficher les photos du journal. */
export function useSignedPhotos(paths: string[]) {
  const key = paths.join("|");
  return useQuery({
    queryKey: ["journal_photo_urls", key],
    enabled: paths.length > 0,
    staleTime: 30 * 60_000,
    queryFn: async () => {
      const { data, error } = await supabase.storage
        .from(JOURNAL_BUCKET)
        .createSignedUrls(paths, 60 * 60);
      if (error) throw new Error(error.message);
      const map: Record<string, string> = {};
      (data ?? []).forEach((d) => {
        if (d.path && d.signedUrl) map[d.path] = d.signedUrl;
      });
      return map;
    },
  });
}

/* ---------- Gestion documentaire ---------- */

export type Document = Tables["documents"]["Row"];
export type DocumentCategory = Database["public"]["Enums"]["document_category"];
export const DOCUMENTS_BUCKET = "documents";

export function useDocuments(projectId: string | null) {
  return useQuery({
    queryKey: ["documents", projectId],
    enabled: !!projectId,
    queryFn: () =>
      isGuestMode()
        ? demoRows<Document>("documents").filter(
            (r) => (r as { project_id: string }).project_id === projectId,
          )
        : unwrap<Document[]>(
            supabase
              .from("documents")
              .select("*")
              .eq("project_id", projectId!)
              .order("created_at", { ascending: false }),
          ),
  });
}

/** Téléverse des pièces dans le dossier privé de l'utilisateur et renvoie leurs chemins. */
export async function uploadDocumentFiles(files: File[], projectId: string) {
  if (isGuestMode()) return [];
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) throw new Error("Session expirée");
  const paths: string[] = [];
  for (const file of files) {
    const ext = file.name.split(".").pop()?.toLowerCase() || "pdf";
    const path = `${auth.user.id}/${projectId}/${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage
      .from(DOCUMENTS_BUCKET)
      .upload(path, file, { contentType: file.type || "application/octet-stream" });
    if (error) throw new Error(error.message);
    paths.push(path);
  }
  return paths;
}

/** URLs signées pour télécharger les pièces. */
export function useDocumentUrls(paths: string[]) {
  const key = paths.join("|");
  return useQuery({
    queryKey: ["document_urls", key],
    enabled: paths.length > 0,
    staleTime: 30 * 60_000,
    queryFn: async () => {
      const { data, error } = await supabase.storage
        .from(DOCUMENTS_BUCKET)
        .createSignedUrls(paths, 60 * 60);
      if (error) throw new Error(error.message);
      const map: Record<string, string> = {};
      (data ?? []).forEach((d) => {
        if (d.path && d.signedUrl) map[d.path] = d.signedUrl;
      });
      return map;
    },
  });
}

export function useDeleteDocument() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, file_path }: { id: string; file_path?: string | null }) => {
      if (isGuestMode()) {
        demoDelete("documents", id);
        return;
      }
      if (file_path) {
        await supabase.storage.from(DOCUMENTS_BUCKET).remove([file_path]);
      }
      const { error } = await supabase.from("documents").delete().eq("id", id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["documents"] });
      qc.invalidateQueries({ queryKey: ["audit_logs"] });
      toast.success("Document supprimé");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export type NewDocument = {
  project_id: string;
  name: string;
  category: DocumentCategory;
  file_path?: string | null;
  size_bytes?: number | null;
  mime_type?: string | null;
  expiry_date?: string | null;
  notes?: string | null;
};

export function useAddDocuments() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (docs: NewDocument[]) => {
      if (isGuestMode()) {
        docs.forEach((d) => demoInsert("documents", d));
        return;
      }
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) throw new Error("Session expirée");
      const { error } = await supabase
        .from("documents")
        .insert(docs.map((d) => ({ ...d, user_id: auth.user!.id })));
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["documents"] });
      toast.success("Document(s) ajouté(s)");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

type TableName =
  | "projects"
  | "suppliers"
  | "companies"
  | "expenses"
  | "payments"
  | "quotes"
  | "budget_lines"
  | "categories"
  | "site_logs"
  | "documents"
  | "profiles";

const RELATED: Record<TableName, string[]> = {
  projects: ["projects"],
  suppliers: ["suppliers"],
  companies: ["companies"],
  expenses: ["expenses"],
  payments: ["payments", "expenses"],
  quotes: ["quotes"],
  budget_lines: ["budget_lines"],
  categories: ["categories"],
  site_logs: ["site_logs"],
  documents: ["documents"],
  profiles: ["profile"],
};

export type Profile = Tables["profiles"]["Row"];

export function useProfile() {
  return useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      if (isGuestMode()) {
        return demoRows<Profile & { email: string | null }>("profiles")[0] ?? null;
      }
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) return null;
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", auth.user.id)
        .maybeSingle();
      if (error) throw new Error(error.message);
      return { ...(data as Profile | null), email: auth.user.email ?? null } as Profile & {
        email: string | null;
      };
    },
  });
}

export type AuditLog = Tables["audit_logs"]["Row"];

/** Journal d'audit : actions sensibles tracées côté base de données. */
export function useAuditLogs(projectId: string | null) {
  return useQuery({
    queryKey: ["audit_logs", projectId],
    queryFn: async () => {
      if (isGuestMode()) return [] as AuditLog[];
      let query = supabase
        .from("audit_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(300);
      if (projectId) query = query.eq("project_id", projectId);
      return unwrap<AuditLog[]>(query);
    },
    refetchInterval: 30000,
    refetchOnWindowFocus: true,
  });
}

export function useSaveRow(table: TableName, successMessage = "Enregistré") {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, values }: { id?: string; values: Record<string, unknown> }) => {
      if (isGuestMode()) {
        if (id) demoUpdate(table as DemoTableName, id, values);
        else demoInsert(table as DemoTableName, values);
        return;
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const client = supabase.from(table) as any;
      const query = id ? client.update(values).eq("id", id) : client.insert(values);
      const { error } = await query;
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      RELATED[table].forEach((key) => qc.invalidateQueries({ queryKey: [key] }));
      qc.invalidateQueries({ queryKey: ["audit_logs"] });
      toast.success(successMessage);
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useDeleteRow(table: TableName) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      if (isGuestMode()) {
        demoDelete(table as DemoTableName, id);
        return;
      }
      const { error } = await supabase.from(table).delete().eq("id", id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      RELATED[table].forEach((key) => qc.invalidateQueries({ queryKey: [key] }));
      qc.invalidateQueries({ queryKey: ["audit_logs"] });
      toast.success("Supprimé");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

/** Import groupé depuis un fichier CSV/XLS. */
export function useImportRows(table: TableName) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (rows: Record<string, unknown>[]) => {
      if (rows.length === 0) return;
      if (isGuestMode()) {
        rows.forEach((r) => demoInsert(table as DemoTableName, r));
        return;
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const client = supabase.from(table) as any;
      const { error } = await client.insert(rows);
      if (error) throw new Error(error.message);
    },
    onSuccess: (_, rows) => {
      RELATED[table].forEach((key) => qc.invalidateQueries({ queryKey: [key] }));
      toast.success(`${rows.length} ligne(s) importée(s)`);
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

/* ---------- Rôles & demandes de démo (admin) ---------- */

export type DemoRequest = Tables["demo_requests"]["Row"];
export type DemoRequestStatus = Database["public"]["Enums"]["demo_request_status"];

export function useIsAdmin() {
  return useQuery({
    queryKey: ["is_admin"],
    staleTime: 5 * 60_000,
    queryFn: async () => {
      if (isGuestMode()) return false;
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) return false;
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", auth.user.id)
        .eq("role", "admin")
        .maybeSingle();
      if (error) return false;
      return !!data;
    },
  });
}

export function useDemoRequests() {
  return useQuery({
    queryKey: ["demo_requests"],
    queryFn: () =>
      unwrap<DemoRequest[]>(
        supabase.from("demo_requests").select("*").order("created_at", { ascending: false }),
      ),
  });
}

export function useUpdateDemoRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      values,
    }: {
      id: string;
      values: Tables["demo_requests"]["Update"];
    }) => {
      const { error } = await supabase.from("demo_requests").update(values).eq("id", id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["demo_requests"] });
      toast.success("Demande mise à jour");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useDeleteDemoRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("demo_requests").delete().eq("id", id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["demo_requests"] });
      toast.success("Demande supprimée");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}
