import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
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
      unwrap<Project[]>(
        supabase.from("projects").select("*").order("created_at", { ascending: false }),
      ),
  });
}

export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: () =>
      unwrap<Category[]>(
        supabase.from("categories").select("*").order("sort_order", { ascending: true }),
      ),
    staleTime: 5 * 60 * 1000,
  });
}

export function useSuppliers() {
  return useQuery({
    queryKey: ["suppliers"],
    queryFn: () =>
      unwrap<Supplier[]>(supabase.from("suppliers").select("*").order("name")),
  });
}

export function useCompanies() {
  return useQuery({
    queryKey: ["companies"],
    queryFn: () => unwrap<Company[]>(supabase.from("companies").select("*").order("name")),
  });
}

export function useExpenses(projectId: string | null) {
  return useQuery({
    queryKey: ["expenses", projectId],
    enabled: !!projectId,
    queryFn: () =>
      unwrap<Expense[]>(
        supabase
          .from("expenses")
          .select("*")
          .eq("project_id", projectId!)
          .order("expense_date", { ascending: false }),
      ),
  });
}

export function usePayments(projectId: string | null) {
  return useQuery({
    queryKey: ["payments", projectId],
    enabled: !!projectId,
    queryFn: () =>
      unwrap<Payment[]>(
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
      unwrap<Quote[]>(
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
      unwrap<BudgetLine[]>(
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
      unwrap<SiteLog[]>(
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

type TableName =
  | "projects"
  | "suppliers"
  | "companies"
  | "expenses"
  | "payments"
  | "quotes"
  | "budget_lines"
  | "categories"
  | "site_logs";

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
};


export function useSaveRow(table: TableName, successMessage = "Enregistré") {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, values }: { id?: string; values: Record<string, unknown> }) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const client = supabase.from(table) as any;
      const query = id ? client.update(values).eq("id", id) : client.insert(values);
      const { error } = await query;
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      RELATED[table].forEach((key) => qc.invalidateQueries({ queryKey: [key] }));
      toast.success(successMessage);
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useDeleteRow(table: TableName) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from(table).delete().eq("id", id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      RELATED[table].forEach((key) => qc.invalidateQueries({ queryKey: [key] }));
      toast.success("Supprimé");
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
