import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { isGuestMode } from "@/lib/guest-mode";
import {
  DEFAULT_BUDGET_SPLIT,
  DEMO_USER,
  demoDelete,
  demoDuplicateProject,
  demoInsert,
  demoRows,
  demoSeedBudgetLines,
  demoUpdate,
  type DemoTableName,
} from "@/lib/demo-store";
import type { Database, Json } from "@/integrations/supabase/types";
import { haversineKm } from "@/lib/geo";

type Tables = Database["public"]["Tables"];
export type Project = Tables["projects"]["Row"];
export type Category = Tables["categories"]["Row"];
export type Supplier = Tables["suppliers"]["Row"];
export type Company = Tables["companies"]["Row"];
export type Expense = Tables["expenses"]["Row"];
export type Payment = Tables["payments"]["Row"];
export type Quote = Tables["quotes"]["Row"];
export type QuoteItem = Tables["quote_items"]["Row"];
export type QuoteRequest = Tables["quote_requests"]["Row"];
export type QuoteBid = Tables["quote_bids"]["Row"];
export type Dispute = Tables["disputes"]["Row"];
export type DisputeEvidence = Tables["dispute_evidences"]["Row"];
export type Refund = Tables["refunds"]["Row"];

export function useQuoteItems(quoteId: string | null) {
  return useQuery({
    queryKey: ["quote_items", quoteId],
    enabled: !!quoteId,
    queryFn: () =>
      isGuestMode()
        ? demoRows<QuoteItem>("quote_items").filter((i) => i.quote_id === quoteId!)
        : unwrap<QuoteItem[]>(
            supabase.from("quote_items").select("*").eq("quote_id", quoteId!).order("created_at"),
          ),
  });
}

/** Toutes les demandes de devis (le marketplace permet de répondre à celles des autres). */
export function useQuoteRequests() {
  return useQuery({
    queryKey: ["quote_requests"],
    queryFn: () =>
      isGuestMode()
        ? demoRows<QuoteRequest>("quote_requests")
        : unwrap<QuoteRequest[]>(
            supabase.from("quote_requests").select("*").order("created_at", { ascending: false }),
          ),
  });
}

/** Demandes de devis publiées par l'utilisateur courant (pour le suivi des offres reçues). */
export function useMyQuoteRequests() {
  const { data: profile } = useProfile();
  const uid = profile?.id ?? null;
  return useQuery({
    queryKey: ["quote_requests", "mine", uid],
    enabled: !!uid,
    queryFn: () =>
      isGuestMode()
        ? demoRows<QuoteRequest>("quote_requests").filter((r) => r.user_id === uid)
        : unwrap<QuoteRequest[]>(
            supabase
              .from("quote_requests")
              .select("*")
              .eq("user_id", uid!)
              .order("created_at", { ascending: false }),
          ),
  });
}

/** Offres reçues sur une demande de devis. */
export function useQuoteBids(requestId: string | null) {
  return useQuery({
    queryKey: ["quote_bids", requestId],
    enabled: !!requestId,
    queryFn: () =>
      isGuestMode()
        ? demoRows<QuoteBid>("quote_bids").filter((b) => b.request_id === requestId!)
        : unwrap<QuoteBid[]>(
            supabase
              .from("quote_bids")
              .select("*")
              .eq("request_id", requestId!)
              .order("created_at"),
          ),
  });
}

/** Mes offres déposées sur les demandes de devis des autres. */
export function useMyQuoteBids() {
  const { data: profile } = useProfile();
  const uid = profile?.id ?? null;
  return useQuery({
    queryKey: ["quote_bids", "mine", uid],
    enabled: !!uid,
    queryFn: () =>
      isGuestMode()
        ? demoRows<QuoteBid>("quote_bids").filter((b) => b.user_id === uid)
        : unwrap<QuoteBid[]>(
            supabase.from("quote_bids").select("*").eq("user_id", uid!).order("created_at"),
          ),
  });
}

/** Attribue le devis gagnant d'une demande (réservé au propriétaire de la demande). */
export function useAwardQuoteBid() {
  return useSaveRow("quote_requests", "Devis attribué");
}

/** Tous les litiges (médiation transparente, lisible par toute personne connectée). */
export function useDisputes() {
  return useQuery({
    queryKey: ["disputes"],
    queryFn: () =>
      isGuestMode()
        ? demoRows<Dispute>("disputes")
        : unwrap<Dispute[]>(
            supabase.from("disputes").select("*").order("created_at", { ascending: false }),
          ),
  });
}

/** Mes litiges (ceux que j'ai ouverts). */
export function useMyDisputes() {
  const { data: profile } = useProfile();
  const uid = profile?.id ?? null;
  return useQuery({
    queryKey: ["disputes", "mine", uid],
    enabled: !!uid,
    queryFn: () =>
      isGuestMode()
        ? demoRows<Dispute>("disputes").filter((d) => d.user_id === uid)
        : unwrap<Dispute[]>(
            supabase
              .from("disputes")
              .select("*")
              .eq("user_id", uid!)
              .order("created_at", { ascending: false }),
          ),
  });
}

/** Preuves déposées sur un litige. */
export function useDisputeEvidences(disputeId: string | null) {
  return useQuery({
    queryKey: ["dispute_evidences", disputeId],
    enabled: !!disputeId,
    queryFn: () =>
      isGuestMode()
        ? demoRows<DisputeEvidence>("dispute_evidences").filter((e) => e.dispute_id === disputeId!)
        : unwrap<DisputeEvidence[]>(
            supabase
              .from("dispute_evidences")
              .select("*")
              .eq("dispute_id", disputeId!)
              .order("created_at"),
          ),
  });
}

/** Remboursements émis sur un litige. */
export function useRefunds(disputeId: string | null) {
  return useQuery({
    queryKey: ["refunds", disputeId],
    enabled: !!disputeId,
    queryFn: () =>
      isGuestMode()
        ? demoRows<Refund>("refunds").filter((r) => r.dispute_id === disputeId!)
        : unwrap<Refund[]>(
            supabase.from("refunds").select("*").eq("dispute_id", disputeId!).order("created_at"),
          ),
  });
}

/** Rendu d'une décision de médiation (réservé aux administrateurs). */
export function useDecideDispute() {
  return useSaveRow("disputes", "Décision enregistrée");
}

/** Génère la référence d'un litige (ex. LIT-2026-00001). */
export function disputeRef() {
  const n = String(Math.floor(Math.random() * 90000) + 10000);
  return `LIT-${new Date().getFullYear()}-${n}`;
}
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
      if (isGuestMode()) return {} as Record<string, string>;
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
  | "quote_items"
  | "budget_lines"
  | "categories"
  | "site_logs"
  | "documents"
  | "profiles"
  | "invoices"
  | "invoice_items"
  | "invoice_payments"
  | "materials"
  | "material_requirements"
  | "material_deliveries"
  | "payment_transactions"
  | "tasks"
  | "photos"
  | "providers"
  | "provider_reviews"
  | "stores"
  | "product_categories"
  | "product_prices"
  | "product_inventory"
  | "products"
  | "carts"
  | "cart_items"
  | "orders"
  | "order_items"
  | "deliveries"
  | "drivers"
  | "vehicles"
  | "reserves"
  | "plans"
  | "messages"
  | "quote_requests"
  | "quote_bids"
  | "disputes"
  | "dispute_evidences"
  | "refunds"
  | "profile_verifications"
  | "verification_documents"
  | "market_reviews"
  | "ai_conversations"
  | "ai_actions"
  | "organizations"
  | "organization_members"
  | "project_members";

const RELATED: Record<TableName, string[]> = {
  projects: ["projects"],
  suppliers: ["suppliers"],
  companies: ["companies"],
  expenses: ["expenses"],
  payments: ["payments", "expenses"],
  payment_transactions: ["payment_transactions", "orders", "payments"],
  quotes: ["quotes", "quote_items"],
  quote_items: ["quote_items", "quotes"],
  budget_lines: ["budget_lines"],
  categories: ["categories"],
  site_logs: ["site_logs"],
  documents: ["documents"],
  profiles: ["profile"],
  invoices: ["invoices", "invoice_payments", "invoice_items"],
  invoice_items: ["invoice_items", "invoices"],
  invoice_payments: ["invoice_payments", "invoices"],
  materials: ["materials"],
  material_requirements: ["material_requirements", "materials"],
  material_deliveries: ["material_deliveries", "material_requirements", "materials"],
  tasks: ["tasks"],
  photos: ["photos"],
  providers: ["providers", "provider_reviews"],
  provider_reviews: ["provider_reviews", "providers"],
  stores: ["stores", "products"],
  product_categories: ["product_categories"],
  product_prices: ["product_prices", "products"],
  product_inventory: ["product_inventory", "products"],
  products: ["products"],
  carts: ["carts", "cart_items"],
  cart_items: ["cart_items", "carts"],
  orders: ["orders", "order_items", "deliveries"],
  order_items: ["order_items", "orders"],
  deliveries: ["deliveries", "orders"],
  drivers: ["drivers", "vehicles"],
  vehicles: ["vehicles", "drivers"],
  reserves: ["reserves"],
  plans: ["plans"],
  messages: ["messages"],
  quote_requests: ["quote_requests", "quote_bids"],
  quote_bids: ["quote_bids", "quote_requests"],
  disputes: ["disputes", "dispute_evidences", "refunds"],
  dispute_evidences: ["dispute_evidences", "disputes"],
  refunds: ["refunds", "disputes"],
  profile_verifications: ["profile_verifications", "verification_documents"],
  verification_documents: ["verification_documents", "profile_verifications"],
  market_reviews: ["market_reviews"],
  ai_conversations: ["ai_conversations", "ai_actions"],
  ai_actions: ["ai_actions", "ai_conversations"],
  organizations: ["organizations", "organization_members"],
  organization_members: ["organization_members", "organizations"],
  project_members: ["project_members"],
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

/** Résout le nom d'un utilisateur par son id (pour les messages). */
export function useProfileById(userId: string | null) {
  return useQuery({
    queryKey: ["profile", userId],
    enabled: !!userId,
    queryFn: async () => {
      if (isGuestMode()) {
        return demoRows<Profile>("profiles").find((p) => p.id === userId) ?? null;
      }
      const { data, error } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", userId!)
        .maybeSingle();
      if (error) throw new Error(error.message);
      return data as Pick<Profile, "full_name"> | null;
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

/* ---------- Duplication & budget automatique ---------- */

/** Duplique un projet (infos + postes + dépenses + paiements + devis + journal + documents). */
export function useDuplicateProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (projectId: string) => {
      if (isGuestMode()) return demoDuplicateProject(projectId);
      const tables: TableName[] = [
        "projects",
        "budget_lines",
        "expenses",
        "payments",
        "quotes",
        "site_logs",
        "documents",
      ];
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) throw new Error("Session expirée");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const client = supabase as any;
      const byTable = async (t: TableName) => {
        const col = t === "projects" ? "id" : "project_id";
        const { data, error } = await client.from(t).select("*").eq(col, projectId);
        if (error) throw new Error(error.message);
        return (data ?? []) as Record<string, unknown>[];
      };
      const projects = await byTable("projects");
      const source = projects.find((p) => p["id"] === projectId);
      if (!source) throw new Error("Projet introuvable");

      const newId = crypto.randomUUID();
      const idMap = new Map<string, string>();
      const clone = <T extends Record<string, unknown>>(row: T, table: TableName) => {
        const copy = { ...row } as Record<string, unknown>;
        const oldId = copy["id"] as string;
        copy["id"] = crypto.randomUUID();
        copy["created_at"] = new Date().toISOString();
        copy["updated_at"] = new Date().toISOString();
        idMap.set(oldId, copy["id"] as string);
        if (table === "projects") {
          copy["name"] = `${copy["name"]} — copie`;
          copy["status"] = "planifie";
        }
        return copy;
      };

      const insert = async (t: TableName, rows: Record<string, unknown>[]) => {
        if (rows.length === 0) return;
        const { error } = await client.from(t).insert(rows);
        if (error) throw new Error(error.message);
      };

      const newProject = clone(source, "projects");
      newProject["id"] = newId;
      newProject["project_id"] = newId;
      await insert("projects", [newProject]);

      for (const t of ["budget_lines", "expenses", "quotes", "site_logs", "documents"] as const) {
        const rows = await byTable(t);
        await insert(
          t,
          rows.map((r) => clone(r, t)),
        );
      }

      const payments = await byTable("payments");
      await insert(
        "payments",
        payments.map((p) => {
          const c = clone(p, "payments");
          if (c["expense_id"])
            c["expense_id"] = idMap.get(c["expense_id"] as string) ?? c["expense_id"];
          return c;
        }),
      );

      return newId;
    },
    onSuccess: () => {
      RELATED["projects"].forEach((key) => qc.invalidateQueries({ queryKey: [key] }));
      qc.invalidateQueries({ queryKey: ["audit_logs"] });
      toast.success("Projet dupliqué");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

/** Crée les postes de budget d'un projet depuis l'enveloppe globale (répartition Bénin). */
export function useGenerateProjectBudget() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ projectId, budget }: { projectId: string; budget: number }) => {
      if (budget <= 0) throw new Error("Renseignez d'abord un budget global");
      if (isGuestMode()) {
        demoSeedBudgetLines(projectId, budget);
        return;
      }
      const { data: categories } = await supabase.from("categories").select("id, slug");
      if (categories && categories.length > 0) {
        const existing = await supabase
          .from("budget_lines")
          .select("id")
          .eq("project_id", projectId);
        if (existing.error) throw new Error(existing.error.message);
        if ((existing.data ?? []).length > 0) return;
        const rows = DEFAULT_BUDGET_SPLIT.map(({ slug, pct }) => {
          const cat = categories.find((c) => c.slug === slug);
          if (!cat) return null;
          return {
            project_id: projectId,
            category_id: cat.id,
            planned_amount: Math.round((budget * pct) / 100),
          };
        }).filter(
          (r): r is { project_id: string; category_id: string; planned_amount: number } => !!r,
        );
        if (rows.length > 0) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const { error } = await (supabase.from("budget_lines") as any).insert(rows);
          if (error) throw new Error(error.message);
        }
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["budget_lines"] });
      toast.success("Postes de budget générés depuis l'enveloppe globale");
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

/* ---------- Back-office : utilisateurs & rôles ---------- */

export type AdminUser = Profile & { email: string | null; is_admin: boolean };

/** Liste les comptes utilisateurs pour l'administration. */
export function useAdminUsers() {
  return useQuery({
    queryKey: ["admin_users"],
    queryFn: async () => {
      if (isGuestMode()) {
        const p = demoRows<Profile & { email: string | null }>("profiles") ?? [];
        return p.map((u) => ({ ...u, is_admin: false }));
      }
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) throw new Error("Session expirée");
      const { data: profiles, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw new Error(error.message);
      const { data: roles, error: rolesErr } = await supabase
        .from("user_roles")
        .select("user_id, role");
      if (rolesErr) throw new Error(rolesErr.message);
      const adminIds = new Set(
        (roles ?? []).filter((r) => r.role === "admin").map((r) => r.user_id),
      );
      return (profiles ?? []).map((u) => ({
        ...u,
        email: u.id === auth.user?.id ? (auth.user.email ?? null) : null,
        is_admin: adminIds.has(u.id),
      }));
    },
  });
}

/** Compteurs globaux pour le tableau de bord d'administration. */
export function useAdminStats() {
  return useQuery({
    queryKey: ["admin_stats"],
    queryFn: async () => {
      if (isGuestMode())
        return { users: 1, projects: 1, stores: 2, orders: 0, reserves: 3, verifications: 1 };
      const count = async (table: TableName) => {
        const { count, error } = await supabase
          .from(table)
          .select("*", { count: "exact", head: true });
        if (error) return 0;
        return count ?? 0;
      };
      const [users, projects, stores, orders, providers, reserves, verifications] =
        await Promise.all([
          count("profiles"),
          count("projects"),
          count("stores"),
          count("orders"),
          count("providers"),
          count("reserves"),
          count("verification_documents"),
        ]);
      return { users, projects, stores, orders, providers, reserves, verifications };
    },
  });
}

/** Modifie le type de compte d'un utilisateur (back-office). */
export function useSetAccountType() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ userId, accountType }: { userId: string; accountType: string }) => {
      if (isGuestMode()) {
        demoUpdate("profiles", userId, { account_type: accountType });
        return;
      }
      const { error } = await supabase
        .from("profiles")
        .update({ account_type: accountType as Profile["account_type"] })
        .eq("id", userId);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin_users"] });
      toast.success("Type de compte mis à jour");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

/** Ajoute ou retire le rôle administrateur à un utilisateur. */
export function useToggleAdmin() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ userId, makeAdmin }: { userId: string; makeAdmin: boolean }) => {
      if (isGuestMode()) return;
      if (makeAdmin) {
        const { error } = await supabase.from("user_roles").insert({
          user_id: userId,
          role: "admin",
        });
        if (error) throw new Error(error.message);
      } else {
        const { error } = await supabase
          .from("user_roles")
          .delete()
          .eq("user_id", userId)
          .eq("role", "admin");
        if (error) throw new Error(error.message);
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin_users"] });
      qc.invalidateQueries({ queryKey: ["is_admin"] });
      toast.success("Rôle administrateur mis à jour");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

/* ---------- Notifications e-mail ---------- */

export type NotificationPreferences = Tables["notification_preferences"]["Row"];
export type NotificationPreferencesUpdate = Tables["notification_preferences"]["Update"];

const DEFAULT_NOTIFICATION_PREFS: Omit<Tables["notification_preferences"]["Insert"], "user_id"> = {
  email: null,
  alerts_enabled: true,
  alert_due_payments: true,
  alert_late_payments: true,
  alert_budget: true,
  alert_documents: true,
  alert_projects: true,
  weekly_digest: true,
};

export function useNotificationPreferences() {
  return useQuery({
    queryKey: ["notification_preferences"],
    queryFn: async () => {
      if (isGuestMode()) return null;
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) return null;
      const { data, error } = await supabase
        .from("notification_preferences")
        .select("*")
        .eq("user_id", auth.user.id)
        .maybeSingle();
      if (error) throw new Error(error.message);
      if (data) return data as NotificationPreferences;
      const { data: inserted, error: iErr } = await supabase
        .from("notification_preferences")
        .insert({
          ...DEFAULT_NOTIFICATION_PREFS,
          user_id: auth.user.id,
          email: auth.user.email ?? null,
        })
        .select()
        .single();
      if (iErr) throw new Error(iErr.message);
      return inserted as NotificationPreferences;
    },
  });
}

export function useUpdateNotificationPreferences() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      userId,
      values,
    }: {
      userId: string;
      values: NotificationPreferencesUpdate;
    }) => {
      const { error } = await supabase
        .from("notification_preferences")
        .upsert({ user_id: userId, ...values }, { onConflict: "user_id" });
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["notification_preferences"] });
      toast.success("Préférences de notifications enregistrées");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

type SendEmailResult = {
  ok: boolean;
  sent?: boolean;
  skipped?: boolean;
  reason?: string;
};

export function useSendNotificationEmail() {
  return useMutation({
    mutationFn: async (mode: "now" | "test") => {
      if (isGuestMode()) throw new Error("Connectez-vous pour recevoir les notifications");
      const { data, error } = await supabase.functions.invoke("email-notifications", {
        body: { mode, force: true },
      });
      if (error) throw new Error(error.message);
      return data as SendEmailResult;
    },
    onSuccess: (res) => {
      if (res.skipped) {
        toast.info(
          res.reason === "no_resend_key"
            ? "La clé d'envoi (Resend) n'est pas configurée côté serveur"
            : res.reason === "no_alerts"
              ? "Aucune alerte en cours pour l'instant"
              : "Aucun e-mail envoyé",
        );
      } else {
        toast.success("E-mail envoyé");
      }
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

/* ---------- Facturation client ---------- */

export type Invoice = Tables["invoices"]["Row"];

export type InvoiceItem = Tables["invoice_items"]["Row"];

export function useInvoiceItems(invoiceId: string) {
  return useQuery({
    queryKey: ["invoice_items", invoiceId],
    enabled: !!invoiceId,
    queryFn: () =>
      isGuestMode()
        ? demoRows<InvoiceItem>("invoice_items").filter(
            (r) => (r as { invoice_id: string }).invoice_id === invoiceId,
          )
        : unwrap<InvoiceItem[]>(
            supabase.from("invoice_items").select("*").eq("invoice_id", invoiceId),
          ),
  });
}
export type InvoicePayment = Tables["invoice_payments"]["Row"];
export type InvoiceStatus = Database["public"]["Enums"]["invoice_status"];

export function useInvoices(projectId: string | null) {
  return useQuery({
    queryKey: ["invoices", projectId],
    enabled: !!projectId,
    queryFn: () =>
      isGuestMode()
        ? demoRows<Invoice>("invoices").filter(
            (r) => (r as { project_id: string }).project_id === projectId,
          )
        : unwrap<Invoice[]>(
            supabase
              .from("invoices")
              .select("*")
              .eq("project_id", projectId!)
              .order("invoice_date", { ascending: false }),
          ),
  });
}

export function useInvoicePayments(projectId: string | null) {
  return useQuery({
    queryKey: ["invoice_payments", projectId],
    enabled: !!projectId,
    queryFn: () =>
      isGuestMode()
        ? demoRows<InvoicePayment>("invoice_payments").filter(
            (r) => (r as { project_id: string }).project_id === projectId,
          )
        : unwrap<InvoicePayment[]>(
            supabase
              .from("invoice_payments")
              .select("*")
              .eq("project_id", projectId!)
              .order("payment_date", { ascending: false }),
          ),
  });
}

export function useAddInvoicePayment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (values: Tables["invoice_payments"]["Insert"]) => {
      if (isGuestMode()) {
        demoInsert("invoice_payments", values);
        return;
      }
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) throw new Error("Session expirée");
      const { error } = await supabase
        .from("invoice_payments")
        .insert({ ...values, user_id: auth.user.id });
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["invoice_payments"] });
      qc.invalidateQueries({ queryKey: ["invoices"] });
      toast.success("Encaissement enregistré");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

/* ---------- Stock / matériaux ---------- */

export type Material = Tables["materials"]["Row"];
export type MaterialRequirement = Tables["material_requirements"]["Row"];
export type MaterialDelivery = Tables["material_deliveries"]["Row"];

export function useMaterials(projectId: string | null) {
  return useQuery({
    queryKey: ["materials", projectId],
    enabled: !!projectId,
    queryFn: () =>
      isGuestMode()
        ? demoRows<Material>("materials").filter(
            (r) => (r as { project_id: string }).project_id === projectId,
          )
        : unwrap<Material[]>(
            supabase.from("materials").select("*").eq("project_id", projectId!).order("name"),
          ),
  });
}

/** Besoins en matériaux d'un chantier (prévu / commandé / livré / consommé). */
export function useMaterialRequirements(projectId: string | null) {
  return useQuery({
    queryKey: ["material_requirements", projectId],
    enabled: !!projectId,
    queryFn: () =>
      isGuestMode()
        ? demoRows<MaterialRequirement>("material_requirements").filter(
            (r) => (r as { project_id: string }).project_id === projectId,
          )
        : unwrap<MaterialRequirement[]>(
            supabase
              .from("material_requirements")
              .select("*")
              .eq("project_id", projectId!)
              .order("name"),
          ),
  });
}

/** Livraisons de matériaux d'un chantier. */
export function useMaterialDeliveries(projectId: string | null) {
  return useQuery({
    queryKey: ["material_deliveries", projectId],
    enabled: !!projectId,
    queryFn: () =>
      isGuestMode()
        ? demoRows<MaterialDelivery>("material_deliveries").filter(
            (r) => (r as { project_id: string }).project_id === projectId,
          )
        : unwrap<MaterialDelivery[]>(
            supabase
              .from("material_deliveries")
              .select("*")
              .eq("project_id", projectId!)
              .order("delivered_at", { ascending: false }),
          ),
  });
}

/** Crée une livraison et met à jour les quantités du besoin associé. */
export function useAddMaterialDelivery() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (values: {
      project_id: string;
      requirement_id?: string | null;
      supplier_id?: string | null;
      quantity: number;
      unit_price?: number;
      delivered_at?: string | null;
      status?: string;
      notes?: string | null;
    }) => {
      if (isGuestMode()) {
        const id = demoInsert("material_deliveries", {
          ...values,
          status: values.status ?? "livree",
        });
        if (values.requirement_id) {
          const req = demoRows<MaterialRequirement>("material_requirements").find(
            (r) => r.id === values.requirement_id,
          );
          if (req) {
            const delivered = Number(req.quantity_delivered) + Number(values.quantity);
            demoUpdate("material_requirements", req.id, {
              quantity_delivered: delivered,
              status: delivered >= Number(req.quantity_needed) ? "livre" : "partiel",
            });
          }
        }
        return id;
      }
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) throw new Error("Session expirée");
      const { data, error } = await supabase
        .from("material_deliveries")
        .insert({ ...values, user_id: auth.user.id })
        .select("id")
        .single();
      if (error) throw new Error(error.message);
      if (values.requirement_id) {
        const req = await unwrap<MaterialRequirement | null>(
          supabase
            .from("material_requirements")
            .select("*")
            .eq("id", values.requirement_id)
            .maybeSingle(),
        );
        if (req) {
          const delivered = Number(req.quantity_delivered) + Number(values.quantity);
          const { error: upErr } = await supabase
            .from("material_requirements")
            .update({
              quantity_delivered: delivered,
              status: delivered >= Number(req.quantity_needed) ? "livre" : "partiel",
            })
            .eq("id", req.id);
          if (upErr) throw new Error(upErr.message);
        }
      }
      return data?.id;
    },
    onSuccess: (_d, v) => {
      qc.invalidateQueries({ queryKey: ["material_deliveries", v.project_id] });
      qc.invalidateQueries({ queryKey: ["material_requirements", v.project_id] });
      toast.success("Livraison enregistrée");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

/** Met à jour un besoin en matériaux (quantités, statut, fournisseur…). */
export function useUpdateMaterialRequirement() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (values: {
      id: string;
      projectId: string;
      patch: Record<string, unknown>;
    }) => {
      if (isGuestMode()) {
        demoUpdate("material_requirements", values.id, values.patch);
        return;
      }
      const { error } = await supabase
        .from("material_requirements")
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .update(values.patch as any)
        .eq("id", values.id);
      if (error) throw new Error(error.message);
    },
    onSuccess: (_d, v) => {
      qc.invalidateQueries({ queryKey: ["material_requirements", v.projectId] });
      qc.invalidateQueries({ queryKey: ["materials"] });
      toast.success("Besoin mis à jour");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

/** Crée un besoin en matériaux pour un chantier. */
export function useAddMaterialRequirement() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (values: {
      project_id: string;
      name: string;
      category?: string | null;
      unit?: string | null;
      quantity_needed?: number;
      unit_price?: number;
      supplier_id?: string | null;
      notes?: string | null;
    }) => {
      if (isGuestMode()) {
        return demoInsert("material_requirements", {
          ...values,
          quantity_ordered: 0,
          quantity_delivered: 0,
          quantity_consumed: 0,
          status: "besoin",
        });
      }
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) throw new Error("Session expirée");
      const { data, error } = await supabase
        .from("material_requirements")
        .insert({
          ...values,
          quantity_ordered: 0,
          quantity_delivered: 0,
          quantity_consumed: 0,
          status: "besoin",
          user_id: auth.user.id,
        })
        .select("id")
        .single();
      if (error) throw new Error(error.message);
      return data?.id;
    },
    onSuccess: (_d, v) => {
      qc.invalidateQueries({ queryKey: ["material_requirements", v.project_id] });
      qc.invalidateQueries({ queryKey: ["materials"] });
      toast.success("Besoin en matériaux ajouté");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

/* ---------- Paiement mobile money ---------- */

export type PaymentTransaction = Tables["payment_transactions"]["Row"];
export type PaymentProvider = Database["public"]["Enums"]["payment_provider"];
export type PaymentTransactionStatus = Database["public"]["Enums"]["payment_transaction_status"];

export const MOBILE_MONEY_PROVIDERS: PaymentProvider[] = [
  "mtn_momo",
  "moov_money",
  "paydunya",
  "bankly",
  "cmi",
  "paystack",
];

/** Transactions de paiement mobile money de l'utilisateur (chantier ou commande). */
export function usePaymentTransactions(projectId: string | null) {
  return useQuery({
    queryKey: ["payment_transactions", projectId],
    enabled: !projectId || !!projectId,
    queryFn: () =>
      isGuestMode()
        ? projectId
          ? demoRows<PaymentTransaction>("payment_transactions").filter(
              (r) => (r as { project_id: string | null }).project_id === projectId,
            )
          : demoRows<PaymentTransaction>("payment_transactions")
        : unwrap<PaymentTransaction[]>(
            projectId
              ? supabase
                  .from("payment_transactions")
                  .select("*")
                  .eq("project_id", projectId)
                  .order("created_at", { ascending: false })
              : supabase
                  .from("payment_transactions")
                  .select("*")
                  .order("created_at", { ascending: false }),
          ),
  });
}

type InitiateInput = {
  project_id?: string;
  order_id?: string;
  amount: number;
  provider: PaymentProvider;
  phone: string;
  currency?: string;
  reference?: string;
};

/** Initie un paiement mobile money (sandbox) : crée une transaction `initiee`. */
export function useInitiateMobileMoney() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (values: InitiateInput) => {
      const txn: Partial<PaymentTransaction> = {
        project_id: values.project_id ?? null,
        order_id: values.order_id ?? null,
        provider: values.provider,
        amount: values.amount,
        currency: values.currency ?? "XOF",
        phone: values.phone,
        status: "initiee",
        reference: values.reference ?? `MM-${Date.now().toString(36).toUpperCase()}`,
      };
      if (isGuestMode()) {
        const id = demoInsert("payment_transactions", {
          ...txn,
          status: "confirmee",
          transaction_id: `TX-${Date.now().toString(36).toUpperCase()}`,
        });
        if (values.order_id) {
          demoUpdate("orders", values.order_id, {
            payment_status: "payee",
            status: "payee",
          });
        }
        return id;
      }
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) throw new Error("Session expirée");
      const { data, error } = await supabase
        .from("payment_transactions")
        .insert({ ...txn, user_id: auth.user.id })
        .select("id")
        .single();
      if (error) throw new Error(error.message);
      return data?.id;
    },
    onSuccess: () => {
      ["payment_transactions", "orders"].forEach((k) => qc.invalidateQueries({ queryKey: [k] }));
      toast.success("Paiement initié");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

type ConfirmInput = {
  transactionId: string;
  order_id?: string;
  project_id?: string;
  provider: PaymentProvider;
  amount: number;
  phone?: string;
  payment_date?: string;
  reference?: string;
};

/** Confirme un paiement mobile money (simule le retour de la passerelle). */
export function useConfirmMobileMoney() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (values: ConfirmInput) => {
      const transactionId = values.transactionId;
      if (isGuestMode()) {
        demoUpdate("payment_transactions", transactionId, {
          status: "confirmee",
          transaction_id: `TX-${Date.now().toString(36).toUpperCase()}`,
        });
        if (values.order_id) {
          demoUpdate("orders", values.order_id, {
            payment_status: "payee",
            status: "payee",
          });
        }
        if (values.project_id) {
          demoInsert("payments", {
            project_id: values.project_id,
            amount: values.amount,
            payment_date: values.payment_date ?? new Date().toISOString().slice(0, 10),
            kind: "comptant",
            method: values.provider === "mtn_momo" ? "mtn_momo" : "moov_money",
            provider: values.provider,
            phone: values.phone ?? null,
            transaction_id: transactionId,
            status: "confirmee",
            reference: values.reference ?? null,
          });
        }
        return;
      }
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) throw new Error("Session expirée");
      const { error: txnErr } = await supabase
        .from("payment_transactions")
        .update({
          status: "confirmee",
          transaction_id: `TX-${Date.now().toString(36).toUpperCase()}`,
        })
        .eq("id", transactionId);
      if (txnErr) throw new Error(txnErr.message);
      if (values.order_id) {
        const { error: orderErr } = await supabase
          .from("orders")
          .update({ payment_status: "payee", status: "payee" })
          .eq("id", values.order_id);
        if (orderErr) throw new Error(orderErr.message);
      }
      if (values.project_id) {
        const { error: payErr } = await supabase.from("payments").insert({
          user_id: auth.user.id,
          project_id: values.project_id,
          amount: values.amount,
          payment_date: values.payment_date ?? new Date().toISOString().slice(0, 10),
          kind: "comptant",
          method: values.provider === "mtn_momo" ? "mtn_momo" : "moov_money",
          provider: values.provider,
          phone: values.phone ?? null,
          transaction_id: transactionId,
          reference: values.reference ?? null,
        });
        if (payErr) throw new Error(payErr.message);
      }
    },
    onSuccess: (_d, v) => {
      ["payment_transactions", "orders", "payments"].forEach((k) =>
        qc.invalidateQueries({ queryKey: [k] }),
      );
      toast.success("Paiement confirmé");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

/** Annule un paiement initié (non confirmé). */
export function useCancelMobileMoney() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (transactionId: string) => {
      if (isGuestMode()) {
        demoUpdate("payment_transactions", transactionId, { status: "annulee" });
        return;
      }
      const { error } = await supabase
        .from("payment_transactions")
        .update({ status: "annulee" as PaymentTransactionStatus })
        .eq("id", transactionId);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["payment_transactions"] });
      toast.success("Paiement annulé");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

/* ---------- Lien de paiement public ---------- */

export type PaymentLinkOrder = {
  order: {
    id: string;
    reference: string | null;
    status: string;
    payment_method: string | null;
    total: number;
    delivery_fee: number;
    store_id: string;
    city: string | null;
    phone: string | null;
    notes: string | null;
  } | null;
  items: {
    id: string;
    name: string;
    quantity: number;
    unit_price: number;
    unit: string | null;
  }[];
  store: { id: string; name: string } | null;
};

/** Lit une commande publiquement par référence (lien de paiement partageable). */
export function usePublicOrderByReference(reference: string | null) {
  return useQuery({
    queryKey: ["payment_link", reference],
    enabled: !!reference,
    queryFn: async () => {
      if (!reference) return null;
      if (isGuestMode()) {
        const order = demoRows<Order & { reference: string | null }>("orders").find(
          (o) => o.reference === reference,
        );
        if (!order) return null;
        const items = demoRows<{
          id: string;
          order_id: string;
          name: string;
          quantity: number;
          unit_price: number;
          unit: string | null;
        }>("order_items").filter((i) => i.order_id === order.id);
        const store = demoRows<{ id: string; name: string }>("stores").find(
          (s) => s.id === order.store_id,
        );
        return {
          order: {
            id: order.id,
            reference: order.reference,
            status: order.status,
            payment_method: order.payment_method,
            total: Number(order.total),
            delivery_fee: Number(order.delivery_fee),
            store_id: order.store_id,
            city: order.city,
            phone: order.phone,
            notes: order.notes ?? "",
          },
          items,
          store: store ?? null,
        } as PaymentLinkOrder;
      }
      const { data, error } = await supabase.rpc("get_payment_link_order", {
        p_reference: reference,
      });
      if (error) throw new Error(error.message);
      return (data as unknown as PaymentLinkOrder | null) ?? null;
    },
    retry: false,
  });
}

/* ---------- Tâches & planning ---------- */

export type Task = Tables["tasks"]["Row"];

export function useTasks(projectId: string | null) {
  return useQuery({
    queryKey: ["tasks", projectId],
    enabled: !!projectId,
    queryFn: () =>
      isGuestMode()
        ? demoRows<Task>("tasks").filter(
            (r) => (r as { project_id: string }).project_id === projectId,
          )
        : unwrap<Task[]>(
            supabase
              .from("tasks")
              .select("*")
              .eq("project_id", projectId!)
              .order("due_date", { ascending: true, nullsFirst: false }),
          ),
  });
}

/* ---------- Photos de chantier ---------- */

export type Photo = Tables["photos"]["Row"];
export const PHOTOS_BUCKET = "photos";

export function usePhotos(projectId: string | null) {
  return useQuery({
    queryKey: ["photos", projectId],
    enabled: !!projectId,
    queryFn: () =>
      isGuestMode()
        ? demoRows<Photo>("photos").filter(
            (r) => (r as { project_id: string }).project_id === projectId,
          )
        : unwrap<Photo[]>(
            supabase
              .from("photos")
              .select("*")
              .eq("project_id", projectId!)
              .order("created_at", { ascending: false }),
          ),
  });
}

export async function uploadPhotoFiles(files: File[], projectId: string) {
  if (isGuestMode()) return [];
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) throw new Error("Session expirée");
  const paths: string[] = [];
  for (const file of files) {
    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const path = `${auth.user.id}/${projectId}/${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage
      .from(PHOTOS_BUCKET)
      .upload(path, file, { contentType: file.type || "image/jpeg" });
    if (error) throw new Error(error.message);
    paths.push(path);
  }
  return paths;
}

/** URLs signées pour afficher les photos de chantier. */
export function usePhotoUrls(paths: string[]) {
  const key = paths.join("|");
  return useQuery({
    queryKey: ["photo_urls", key],
    enabled: paths.length > 0,
    staleTime: 30 * 60_000,
    queryFn: async () => {
      if (isGuestMode()) return {} as Record<string, string>;
      const { data, error } = await supabase.storage
        .from(PHOTOS_BUCKET)
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

export function useDeletePhoto() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, file_path }: { id: string; file_path: string }) => {
      if (isGuestMode()) {
        demoDelete("photos", id);
        return;
      }
      await supabase.storage.from(PHOTOS_BUCKET).remove([file_path]);
      const { error } = await supabase.from("photos").delete().eq("id", id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["photos"] });
      toast.success("Photo supprimée");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export type NewPhoto = {
  project_id: string;
  file_path: string;
  phase?: string | null;
  caption?: string | null;
};

export function useAddPhotos() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (photos: NewPhoto[]) => {
      if (photos.length === 0) return;
      if (isGuestMode()) {
        photos.forEach((p) => demoInsert("photos", p));
        return;
      }
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) throw new Error("Session expirée");
      const { error } = await supabase
        .from("photos")
        .insert(photos.map((p) => ({ ...p, user_id: auth.user!.id })));
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["photos"] });
      toast.success("Photos ajoutées");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

/* ---------- Partage lecture seule ---------- */

export function useCreateShareLink() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (projectId: string): Promise<string> => {
      if (isGuestMode()) return "demo-share-token";
      const token = crypto.randomUUID();
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) throw new Error("Session expirée");
      const { error } = await supabase
        .from("projects")
        .update({ share_token: token })
        .eq("id", projectId)
        .eq("user_id", auth.user.id);
      if (error) throw new Error(error.message);
      return token;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["projects"] }),
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useRevokeShareLink() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (projectId: string) => {
      if (isGuestMode()) return;
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) throw new Error("Session expirée");
      const { error } = await supabase
        .from("projects")
        .update({ share_token: null })
        .eq("id", projectId)
        .eq("user_id", auth.user.id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["projects"] });
      toast.success("Lien de partage révoqué");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

/* ---------- Marketplace de prestataires ---------- */

export type Provider = Tables["providers"]["Row"];
export type ProviderReview = Tables["provider_reviews"]["Row"];

export function useProviders() {
  return useQuery({
    queryKey: ["providers"],
    queryFn: () =>
      isGuestMode()
        ? demoRows<Provider>("providers")
        : unwrap<Provider[]>(
            supabase
              .from("providers")
              .select("*")
              .eq("active", true)
              .order("verified", { ascending: false })
              .order("rating", { ascending: false }),
          ),
  });
}

/** Crée/modifie un prestataire du marketplace (le user_id est ajouté à la création). */
export function useSaveProvider(successMessage = "Prestataire enregistré") {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, values }: { id?: string; values: Record<string, unknown> }) => {
      if (isGuestMode()) {
        if (id) demoUpdate("providers", id, values);
        else demoInsert("providers", values);
        return;
      }
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) throw new Error("Session expirée");
      if (id) {
        const { error } = await supabase
          .from("providers")
          .update(values as Tables["providers"]["Update"])
          .eq("id", id)
          .eq("user_id", auth.user.id);
        if (error) throw new Error(error.message);
      } else {
        const { error } = await supabase
          .from("providers")
          .insert({ ...values, user_id: auth.user.id } as Tables["providers"]["Insert"]);
        if (error) throw new Error(error.message);
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["providers"] });
      toast.success(successMessage);
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useProviderReviews(providerId: string | null) {
  return useQuery({
    queryKey: ["provider_reviews", providerId],
    enabled: !!providerId,
    queryFn: () =>
      isGuestMode()
        ? demoRows<ProviderReview>("provider_reviews").filter(
            (r) => (r as { provider_id: string }).provider_id === providerId,
          )
        : unwrap<ProviderReview[]>(
            supabase
              .from("provider_reviews")
              .select("*")
              .eq("provider_id", providerId!)
              .order("created_at", { ascending: false }),
          ),
  });
}

/** Ajoute un avis puis met à jour la note moyenne du prestataire. */
export function useAddProviderReview() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (values: {
      providerId: string;
      rating: number;
      comment?: string | null;
      verified?: boolean;
    }) => {
      if (isGuestMode()) {
        demoInsert("provider_reviews", {
          provider_id: values.providerId,
          rating: values.rating,
          comment: values.comment ?? null,
          verified: values.verified ?? false,
        });
        const providers = demoRows<Provider>("providers");
        const p = providers.find((r) => r.id === values.providerId);
        if (p) {
          const reviews = demoRows<ProviderReview>("provider_reviews").filter(
            (r) => r.provider_id === values.providerId,
          );
          const avg =
            reviews.reduce((s, r) => s + Number(r.rating), 0) / Math.max(1, reviews.length);
          demoUpdate("providers", p.id, {
            rating: Math.round(avg * 100) / 100,
            review_count: reviews.length,
          });
        }
        return;
      }
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) throw new Error("Session expirée");
      const { error: revErr } = await supabase.from("provider_reviews").insert({
        provider_id: values.providerId,
        rating: values.rating,
        comment: values.comment ?? null,
        verified: values.verified ?? false,
        user_id: auth.user.id,
      });
      if (revErr) throw new Error(revErr.message);

      const { data: rows, error: listErr } = await supabase
        .from("provider_reviews")
        .select("rating")
        .eq("provider_id", values.providerId);
      if (listErr) throw new Error(listErr.message);
      const all = (rows ?? []).map((r) => Number(r.rating));
      const avg = all.reduce((s, r) => s + r, 0) / Math.max(1, all.length);
      const { error: updErr } = await supabase
        .from("providers")
        .update({ rating: Math.round(avg * 100) / 100, review_count: all.length })
        .eq("id", values.providerId);
      if (updErr) throw new Error(updErr.message);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["provider_reviews"] });
      qc.invalidateQueries({ queryKey: ["providers"] });
      toast.success("Avis publié, merci !");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

/* ---------- Confiance & vérification ---------- */

/** Niveau de vérification du profil courant (badges identité / entreprise / documents). */
export function useProfileVerification() {
  const { data: profile } = useProfile();
  const userId = profile?.id ?? null;
  return useQuery({
    queryKey: ["profile_verifications", userId],
    enabled: !!userId,
    queryFn: async () => {
      if (isGuestMode()) {
        return (
          demoRows<ProfileVerification>("profile_verifications").find(
            (v) => v.user_id === (userId ?? DEMO_USER),
          ) ?? null
        );
      }
      const { data, error } = await supabase
        .from("profile_verifications")
        .select("*")
        .eq("user_id", userId!)
        .maybeSingle();
      if (error) throw new Error(error.message);
      return (data as ProfileVerification | null) ?? null;
    },
  });
}

/** Documents de vérification soumis par l'utilisateur courant. */
export function useMyVerificationDocuments() {
  const { data: profile } = useProfile();
  const userId = profile?.id ?? null;
  return useQuery({
    queryKey: ["verification_documents", "mine", userId],
    enabled: !!userId,
    queryFn: () =>
      isGuestMode()
        ? demoRows<VerificationDocument>("verification_documents").filter(
            (d) => d.user_id === (userId ?? DEMO_USER),
          )
        : unwrap<VerificationDocument[]>(
            supabase
              .from("verification_documents")
              .select("*")
              .eq("user_id", userId!)
              .order("created_at", { ascending: false }),
          ),
  });
}

/** Tous les documents de vérification, pour la validation admin. */
export function useAllVerificationDocuments() {
  return useQuery({
    queryKey: ["verification_documents", "all"],
    queryFn: () =>
      isGuestMode()
        ? demoRows<VerificationDocument>("verification_documents")
        : unwrap<VerificationDocument[]>(
            supabase.from("verification_documents").select("*").order("created_at", {
              ascending: false,
            }),
          ),
  });
}

/** Soumet un document de vérification (workflow confiance). */
export function useSubmitVerificationDocument() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (values: { docType: string; note?: string | null }) => {
      if (isGuestMode()) {
        demoInsert("verification_documents", {
          doc_type: values.docType,
          note: values.note ?? null,
          status: "en_attente",
          file_path: null,
          admin_note: null,
          reviewed_by: null,
          reviewed_at: null,
        });
        return { ok: true };
      }
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) throw new Error("Session expirée");
      const { error } = await supabase.from("verification_documents").insert({
        user_id: auth.user.id,
        doc_type: values.docType,
        note: values.note ?? null,
        status: "en_attente",
      });
      if (error) throw new Error(error.message);
      return { ok: true };
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["verification_documents"] });
      toast.success("Document soumis, en attente de validation");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

/** Décision admin : approuve ou rejette un document et met à jour le niveau de confiance. */
export function useReviewVerificationDocument() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (values: {
      documentId: string;
      userId: string;
      approve: boolean;
      note?: string | null;
    }) => {
      if (isGuestMode()) {
        demoUpdate("verification_documents", values.documentId, {
          status: values.approve ? "approuve" : "rejete",
          admin_note: values.note ?? null,
          reviewed_at: new Date().toISOString(),
        });
        const verified = demoRows<VerificationDocument>("verification_documents").some(
          (d) => d.user_id === values.userId && d.status === "approuve",
        );
        demoUpdate("profile_verifications", values.userId, {
          verified_documents: verified,
          verified_identity: verified,
          level: verified ? "professionnel" : "non_verifie",
          verified_at: verified ? new Date().toISOString() : null,
        });
        return { ok: true };
      }
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) throw new Error("Session expirée");
      const { error } = await supabase
        .from("verification_documents")
        .update({
          status: values.approve ? "approuve" : "rejete",
          admin_note: values.note ?? null,
          reviewed_by: auth.user.id,
          reviewed_at: new Date().toISOString(),
        })
        .eq("id", values.documentId);
      if (error) throw new Error(error.message);
      const { data: docs } = await supabase
        .from("verification_documents")
        .select("status")
        .eq("user_id", values.userId)
        .eq("status", "approuve");
      if (docs) {
        await supabase
          .from("profile_verifications")
          .update({
            verified_documents: docs.length > 0,
            verified_identity: docs.length > 0,
            level: docs.length > 0 ? "professionnel" : "non_verifie",
            verified_at: docs.length > 0 ? new Date().toISOString() : null,
          })
          .eq("user_id", values.userId);
      }
      return { ok: true };
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["verification_documents"] });
      qc.invalidateQueries({ queryKey: ["profile_verifications"] });
      toast.success("Décision enregistrée");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

/** Avis sur une cible du marketplace (boutique, produit ou transporteur). */
export function useMarketReviews(targetType: ReviewTarget, targetId: string | null) {
  return useQuery({
    queryKey: ["market_reviews", targetType, targetId],
    enabled: !!targetId,
    queryFn: () =>
      isGuestMode()
        ? demoRows<MarketReview>("market_reviews").filter(
            (r) => r.target_type === targetType && r.target_id === targetId!,
          )
        : unwrap<MarketReview[]>(
            supabase
              .from("market_reviews")
              .select("*")
              .eq("target_type", targetType)
              .eq("target_id", targetId!)
              .order("created_at", { ascending: false }),
          ),
  });
}

/** Ajoute un avis sur le marketplace puis recalcule la note moyenne de la cible. */
export function useAddMarketReview() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (values: {
      targetType: ReviewTarget;
      targetId: string;
      rating: number;
      comment?: string | null;
      verified?: boolean;
    }) => {
      if (isGuestMode()) {
        demoInsert("market_reviews", {
          target_type: values.targetType,
          target_id: values.targetId,
          rating: values.rating,
          comment: values.comment ?? null,
          verified: values.verified ?? false,
        });
        recomputeDemoRating(values.targetType, values.targetId);
        return;
      }
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) throw new Error("Session expirée");
      const { error: revErr } = await supabase.from("market_reviews").insert({
        user_id: auth.user.id,
        target_type: values.targetType,
        target_id: values.targetId,
        rating: values.rating,
        comment: values.comment ?? null,
        verified: values.verified ?? false,
      });
      if (revErr) throw new Error(revErr.message);
      const { data: rows, error: listErr } = await supabase
        .from("market_reviews")
        .select("rating")
        .eq("target_type", values.targetType)
        .eq("target_id", values.targetId);
      if (listErr) throw new Error(listErr.message);
      const all = (rows ?? []).map((r) => Number(r.rating));
      const avg = all.reduce((s, r) => s + r, 0) / Math.max(1, all.length);
      const table = values.targetType === "store" ? "stores" : "products";
      const { error: updErr } = await supabase
        .from(table)
        .update({ rating: Math.round(avg * 100) / 100, review_count: all.length })
        .eq("id", values.targetId);
      if (updErr) throw new Error(updErr.message);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["market_reviews"] });
      qc.invalidateQueries({ queryKey: ["stores"] });
      qc.invalidateQueries({ queryKey: ["products"] });
      qc.invalidateQueries({ queryKey: ["drivers"] });
      toast.success("Avis publié, merci !");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

/* ---------- Vague 7 — Assistant conversationnel (fils & actions) ---------- */

/** Conversations IA de l'utilisateur courant, les plus récentes d'abord. */
export function useAiConversations() {
  return useQuery({
    queryKey: ["ai_conversations"],
    queryFn: () =>
      isGuestMode()
        ? demoRows<AiConversation>("ai_conversations").sort(
            (a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime(),
          )
        : unwrap<AiConversation[]>(
            supabase.from("ai_conversations").select("*").order("updated_at", { ascending: false }),
          ),
  });
}

/** Actions d'une conversation donnée (décisions/recommandations proposées). */
export function useAiActions(conversationId: string | null) {
  return useQuery({
    queryKey: ["ai_actions", conversationId],
    enabled: !!conversationId,
    queryFn: () =>
      isGuestMode()
        ? demoRows<AiAction>("ai_actions")
            .filter((a) => a.conversation_id === conversationId)
            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        : unwrap<AiAction[]>(
            supabase
              .from("ai_actions")
              .select("*")
              .eq("conversation_id", conversationId!)
              .order("created_at", { ascending: false }),
          ),
  });
}

/** Crée (ou met à jour le titre) d'une conversation IA. */
export function useUpsertAiConversation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (values: {
      title: string;
      projectId?: string | null;
      role?: string | null;
      existingId?: string | null;
    }) => {
      if (isGuestMode()) {
        if (values.existingId) {
          demoUpdate("ai_conversations", values.existingId, { title: values.title });
          return values.existingId;
        }
        const id = crypto.randomUUID();
        demoInsert("ai_conversations", {
          id,
          title: values.title,
          project_id: values.projectId ?? null,
          role: values.role ?? null,
        });
        return id;
      }
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) throw new Error("Session expirée");
      if (values.existingId) {
        const { error } = await supabase
          .from("ai_conversations")
          .update({ title: values.title })
          .eq("id", values.existingId);
        if (error) throw new Error(error.message);
        return values.existingId;
      }
      const { data, error } = await supabase
        .from("ai_conversations")
        .insert({
          user_id: auth.user.id,
          title: values.title,
          project_id: values.projectId ?? null,
          role: values.role ?? null,
        })
        .select("id")
        .single();
      if (error) throw new Error(error.message);
      return data!.id;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["ai_conversations"] }),
    onError: (e: Error) => toast.error(e.message),
  });
}

/** Ajoute une action proposée par l'assistant dans une conversation. */
export function useAddAiAction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (values: {
      conversationId: string;
      actionType: AiActionType;
      title: string;
      payload?: Record<string, unknown>;
    }) => {
      if (isGuestMode()) {
        demoInsert("ai_actions", {
          conversation_id: values.conversationId,
          action_type: values.actionType,
          title: values.title,
          payload: (values.payload ?? {}) as Json,
        });
        return;
      }
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) throw new Error("Session expirée");
      const { error } = await supabase.from("ai_actions").insert({
        conversation_id: values.conversationId,
        user_id: auth.user.id,
        action_type: values.actionType,
        title: values.title,
        payload: (values.payload ?? {}) as Json,
      });
      if (error) throw new Error(error.message);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["ai_actions"] }),
    onError: (e: Error) => toast.error(e.message),
  });
}

function recomputeDemoRating(targetType: ReviewTarget, targetId: string) {
  const reviews = demoRows<MarketReview>("market_reviews").filter(
    (r) => r.target_type === targetType && r.target_id === targetId,
  );
  const avg = reviews.reduce((s, r) => s + Number(r.rating), 0) / Math.max(1, reviews.length);
  const table =
    targetType === "store" ? "stores" : targetType === "product" ? "products" : "drivers";
  demoUpdate(table, targetId, {
    rating: Math.round(avg * 100) / 100,
    review_count: reviews.length,
  });
}

/* ---------- Marketplace e-commerce ---------- */

export type Store = Tables["stores"]["Row"];
export type ProductCategory = Tables["product_categories"]["Row"];
export type Product = Tables["products"]["Row"];
export type Cart = Tables["carts"]["Row"];
export type CartItem = Tables["cart_items"]["Row"];
export type Order = Tables["orders"]["Row"];
export type OrderItem = Tables["order_items"]["Row"];
export type Delivery = Tables["deliveries"]["Row"];
export type Driver = Tables["drivers"]["Row"];
export type Vehicle = Tables["vehicles"]["Row"];
export type MarketReview = Tables["market_reviews"]["Row"];
export type VerificationDocument = Tables["verification_documents"]["Row"];
export type ProfileVerification = Tables["profile_verifications"]["Row"];
export type ReviewTarget = "store" | "product" | "driver";
export type AiConversation = Tables["ai_conversations"]["Row"];
export type AiAction = Tables["ai_actions"]["Row"];
export type AiActionType =
  "achat" | "finance" | "planning" | "document" | "recommandation" | "autre";

export function useStores() {
  return useQuery({
    queryKey: ["stores"],
    queryFn: () =>
      isGuestMode()
        ? demoRows<Store>("stores")
        : unwrap<Store[]>(supabase.from("stores").select("*").eq("active", true).order("name")),
  });
}

export function useProductCategories() {
  return useQuery({
    queryKey: ["product_categories"],
    queryFn: () =>
      isGuestMode()
        ? demoRows<ProductCategory>("product_categories")
        : unwrap<ProductCategory[]>(
            supabase.from("product_categories").select("*").order("sort_order"),
          ),
  });
}

/** Produits du catalogue, avec catégorie et boutique associées. */
export function useProducts() {
  return useQuery({
    queryKey: ["products"],
    queryFn: () =>
      isGuestMode()
        ? demoRows<Product>("products")
        : unwrap<Product[]>(supabase.from("products").select("*").eq("active", true).order("name")),
  });
}

export function useProductsByStore(storeId: string | null) {
  return useQuery({
    queryKey: ["products", storeId],
    enabled: !!storeId,
    queryFn: () =>
      isGuestMode()
        ? demoRows<Product>("products").filter(
            (p) => (p as { store_id: string }).store_id === storeId,
          )
        : unwrap<Product[]>(
            supabase
              .from("products")
              .select("*")
              .eq("store_id", storeId!)
              .eq("active", true)
              .order("name"),
          ),
  });
}

export function useMyCart() {
  return useQuery({
    queryKey: ["cart"],
    queryFn: async () => {
      if (isGuestMode()) {
        return {
          cart: demoRows<Cart>("carts")[0] ?? null,
          items: demoRows<CartItem>("cart_items"),
        };
      }
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) return { cart: null, items: [] as CartItem[] };
      const { data: cart, error: cartErr } = await supabase
        .from("carts")
        .select("*")
        .eq("user_id", auth.user.id)
        .maybeSingle();
      if (cartErr) throw new Error(cartErr.message);
      if (!cart) return { cart: null, items: [] as CartItem[] };
      const { data: items, error: itemsErr } = await supabase
        .from("cart_items")
        .select("*")
        .eq("cart_id", cart.id);
      if (itemsErr) throw new Error(itemsErr.message);
      return { cart, items: (items ?? []) as CartItem[] };
    },
  });
}

export function useOrders() {
  return useQuery({
    queryKey: ["orders"],
    queryFn: () =>
      isGuestMode()
        ? demoRows<Order>("orders")
        : unwrap<Order[]>(
            supabase.from("orders").select("*").order("ordered_at", { ascending: false }),
          ),
  });
}

export function useDeliveries() {
  return useQuery({
    queryKey: ["deliveries"],
    queryFn: () =>
      isGuestMode()
        ? demoRows<Delivery>("deliveries")
        : unwrap<Delivery[]>(
            supabase.from("deliveries").select("*").order("created_at", { ascending: false }),
          ),
  });
}

export function useOrderItems(orderId: string | null) {
  return useQuery({
    queryKey: ["order_items", orderId],
    enabled: !!orderId,
    queryFn: () =>
      isGuestMode()
        ? demoRows<OrderItem>("order_items").filter(
            (i) => (i as { order_id: string }).order_id === orderId,
          )
        : unwrap<OrderItem[]>(
            supabase.from("order_items").select("*").eq("order_id", orderId!).order("created_at"),
          ),
  });
}

export function useDrivers() {
  return useQuery({
    queryKey: ["drivers"],
    queryFn: () =>
      isGuestMode()
        ? demoRows<Driver>("drivers")
        : unwrap<Driver[]>(
            supabase
              .from("drivers")
              .select("*")
              .eq("available", true)
              .order("rating", { ascending: false }),
          ),
  });
}

/* ---------- E-commerce avancé : prix, inventaire, comparateur, analytics ---------- */

export type ProductPrice = Tables["product_prices"]["Row"];
export type ProductInventory = Tables["product_inventory"]["Row"];

/** Historique des prix d'un produit (via trigger sur products.price). */
export function useProductPrices(productId: string | null) {
  return useQuery({
    queryKey: ["product_prices", productId],
    enabled: !!productId,
    queryFn: () =>
      isGuestMode()
        ? demoRows<ProductPrice>("product_prices").filter(
            (p) => (p as { product_id: string }).product_id === productId,
          )
        : unwrap<ProductPrice[]>(
            supabase
              .from("product_prices")
              .select("*")
              .eq("product_id", productId!)
              .order("changed_at", { ascending: false }),
          ),
  });
}

/** Mouvements de stock d'un produit. */
export function useProductInventory(productId: string | null) {
  return useQuery({
    queryKey: ["product_inventory", productId],
    enabled: !!productId,
    queryFn: () =>
      isGuestMode()
        ? demoRows<ProductInventory>("product_inventory").filter(
            (p) => (p as { product_id: string }).product_id === productId,
          )
        : unwrap<ProductInventory[]>(
            supabase
              .from("product_inventory")
              .select("*")
              .eq("product_id", productId!)
              .order("created_at", { ascending: false }),
          ),
  });
}

/** Ajoute un mouvement de stock (restock/adjustment/return…). */
export function useAddInventoryMovement() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (values: {
      product_id: string;
      quantity_delta: number;
      reason: string;
      note?: string | null;
    }) => {
      if (isGuestMode()) {
        demoInsert("product_inventory", values);
        const product = demoRows<Product>("products").find((p) => p.id === values.product_id);
        if (product) {
          demoUpdate("products", product.id, {
            stock: Number(product.stock) + values.quantity_delta,
          });
        }
        return;
      }
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) throw new Error("Session expirée");
      const { error } = await supabase.from("product_inventory").insert({
        ...values,
        user_id: auth.user.id,
      });
      if (error) throw new Error(error.message);
    },
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ["product_inventory", vars.product_id] });
      qc.invalidateQueries({ queryKey: ["products"] });
      qc.invalidateQueries({ queryKey: ["stores"] });
      toast.success("Stock mis à jour");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

/** Offre d'une boutique pour le comparateur. */
export type CompareOffer = {
  product: Product;
  store: Store | null;
  distanceKm: number | null;
  savings: number;
  inStock: boolean;
};

/**
 * Comparateur de prix : regroupe les produits de la même catégorie portant le
 * même nom (normalisé) vendus par d'autres boutiques. `position` = lat/lng de
 * l'utilisateur pour calculer la distance (null si inconnue).
 */
export function useCompareOffers(
  productId: string | null,
  position?: { lat: number; lng: number },
) {
  return useQuery({
    queryKey: ["compare_offers", productId, position?.lat, position?.lng],
    enabled: !!productId,
    queryFn: async () => {
      if (!productId) return [] as CompareOffer[];
      let ref: Product | null;
      if (isGuestMode()) {
        ref = demoRows<Product>("products").find((p) => p.id === productId) ?? null;
      } else {
        const { data, error } = await supabase
          .from("products")
          .select("*")
          .eq("id", productId)
          .maybeSingle();
        if (error) throw new Error(error.message);
        ref = (data ?? null) as Product | null;
      }
      if (!ref) return [] as CompareOffer[];
      const norm = (s: string) =>
        s
          .toLowerCase()
          .replace(/[^\p{L}\p{N}]+/gu, "")
          .trim();
      const candidates = isGuestMode()
        ? demoRows<Product>("products")
        : await unwrap<Product[]>(supabase.from("products").select("*").eq("active", true));
      const stores = isGuestMode()
        ? demoRows<Store>("stores")
        : await unwrap<Store[]>(supabase.from("stores").select("*"));
      const storeById = new Map(stores.map((s) => [s.id, s]));
      return candidates
        .filter(
          (p) =>
            p.id !== ref.id &&
            p.active &&
            p.category_id === ref.category_id &&
            norm(p.name) === norm(ref.name),
        )
        .map((p) => {
          const store = storeById.get(p.store_id) ?? null;
          const distanceKm =
            position && store?.lat != null && store.lng != null
              ? haversineKm(position.lat, position.lng, store.lat, store.lng)
              : null;
          return {
            product: p,
            store,
            distanceKm,
            savings: Number(ref.price) - Number(p.price),
            inStock: Number(p.stock) > 0,
          } satisfies CompareOffer;
        })
        .sort((a, b) => Number(a.product.price) - Number(b.product.price));
    },
  });
}

/** KPIs du vendeur : commandes, CA, panier moyen, produits les plus vendus. */
export type StoreAnalytics = {
  orderCount: number;
  revenue: number;
  avgOrderValue: number;
  productCount: number;
  outOfStockCount: number;
  topProducts: { name: string; unit: string | null; quantity: number; revenue: number }[];
  recentOrders: Order[];
};

export function useStoreAnalytics(storeId: string | null) {
  return useQuery({
    queryKey: ["store_analytics", storeId],
    enabled: !!storeId,
    queryFn: async () => {
      if (!storeId) return null as StoreAnalytics | null;
      if (isGuestMode()) {
        const orders = demoRows<Order>("orders").filter((o) => o.store_id === storeId);
        const items = demoRows<OrderItem>("order_items");
        const products = demoRows<Product>("products").filter(
          (p) => p.store_id === storeId && p.active,
        );
        return computeStoreAnalytics(storeId, orders, items, products);
      }
      const { data: orders, error: oErr } = await supabase
        .from("orders")
        .select("*")
        .eq("store_id", storeId)
        .order("ordered_at", { ascending: false });
      if (oErr) throw new Error(oErr.message);
      const { data: items, error: iErr } = await supabase.from("order_items").select("*");
      if (iErr) throw new Error(iErr.message);
      const { data: products, error: pErr } = await supabase
        .from("products")
        .select("*")
        .eq("store_id", storeId)
        .eq("active", true);
      if (pErr) throw new Error(pErr.message);
      return computeStoreAnalytics(
        storeId,
        (orders ?? []) as Order[],
        (items ?? []) as OrderItem[],
        (products ?? []) as Product[],
      );
    },
  });
}

function computeStoreAnalytics(
  storeId: string,
  orders: Order[],
  items: OrderItem[],
  products: Product[],
): StoreAnalytics {
  const orderIds = new Set(orders.map((o) => o.id));
  const validOrders = orders.filter((o) => orderIds.has(o.id));
  const revenue = validOrders.reduce((sum, o) => sum + Number(o.total ?? 0), 0);
  const qtyById = new Map<string, { qty: number; rev: number }>();
  for (const it of items) {
    if (!orderIds.has(it.order_id)) continue;
    const acc = qtyById.get(it.product_id ?? it.name) ?? { qty: 0, rev: 0 };
    acc.qty += Number(it.quantity ?? 0);
    acc.rev += Number(it.quantity ?? 0) * Number(it.unit_price ?? 0);
    qtyById.set(it.product_id ?? it.name, acc);
  }
  const productName = (key: string) => products.find((p) => p.id === key)?.name ?? key;
  const topProducts = [...qtyById.entries()]
    .map(([key, v]) => ({
      name: productName(key),
      unit: products.find((p) => p.id === key)?.unit ?? null,
      quantity: v.qty,
      revenue: v.rev,
    }))
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5);
  return {
    orderCount: validOrders.length,
    revenue,
    avgOrderValue: validOrders.length ? revenue / validOrders.length : 0,
    productCount: products.length,
    outOfStockCount: products.filter((p) => Number(p.stock) <= 0).length,
    topProducts,
    recentOrders: validOrders.slice(0, 5),
  };
}

/* ---------- Chantier avancé : réserves, plans, messages ---------- */

export type Reserve = Tables["reserves"]["Row"];
export type Plan = Tables["plans"]["Row"];
export type Message = Tables["messages"]["Row"];

export function useReserves(projectId: string | null) {
  return useQuery({
    queryKey: ["reserves", projectId],
    enabled: !!projectId,
    queryFn: () =>
      isGuestMode()
        ? demoRows<Reserve>("reserves").filter(
            (r) => (r as { project_id: string }).project_id === projectId,
          )
        : unwrap<Reserve[]>(
            supabase
              .from("reserves")
              .select("*")
              .eq("project_id", projectId!)
              .order("created_at", { ascending: false }),
          ),
  });
}

export function usePlans(projectId: string | null) {
  return useQuery({
    queryKey: ["plans", projectId],
    enabled: !!projectId,
    queryFn: () =>
      isGuestMode()
        ? demoRows<Plan>("plans").filter(
            (p) => (p as { project_id: string }).project_id === projectId,
          )
        : unwrap<Plan[]>(
            supabase
              .from("plans")
              .select("*")
              .eq("project_id", projectId!)
              .order("created_at", { ascending: false }),
          ),
  });
}

export function usePlanUrls(paths: string[]) {
  return useQuery({
    queryKey: ["plans-urls", paths],
    enabled: paths.length > 0,
    queryFn: async () => {
      if (isGuestMode()) return {};
      const urls: Record<string, string> = {};
      for (const p of paths) {
        const { data, error } = await supabase.storage.from("documents").createSignedUrl(p, 3600);
        if (!error) urls[p] = data.signedUrl;
      }
      return urls;
    },
  });
}

export function useMessages(projectId: string | null) {
  return useQuery({
    queryKey: ["messages", projectId],
    enabled: !!projectId,
    queryFn: () =>
      isGuestMode()
        ? demoRows<Message>("messages").filter(
            (m) => (m as { project_id: string }).project_id === projectId,
          )
        : unwrap<Message[]>(
            supabase
              .from("messages")
              .select("*")
              .eq("project_id", projectId!)
              .order("created_at", { ascending: true }),
          ),
  });
}

/** Envoie un message dans un projet de chantier. */
export function useSendMessage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (values: {
      project_id: string;
      recipient_id?: string | null;
      body: string;
    }) => {
      if (isGuestMode()) {
        demoInsert("messages", { ...values, sender_id: DEMO_USER, is_read: false });
        return;
      }
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) throw new Error("Session expirée");
      const { error } = await supabase.from("messages").insert({
        ...values,
        user_id: auth.user.id,
        sender_id: auth.user.id,
        is_read: false,
      });
      if (error) throw new Error(error.message);
    },
    onSuccess: (_d, v) => {
      qc.invalidateQueries({ queryKey: ["messages", v.project_id] });
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

/* ---------- Panier & commandes ---------- */

export function useProductImageUrls(paths: string[]) {
  return useQuery({
    queryKey: ["product-images", paths],
    enabled: paths.length > 0,
    queryFn: async () => {
      if (isGuestMode()) return {};
      const urls: Record<string, string> = {};
      for (const p of paths) {
        const { data, error } = await supabase.storage.from(PHOTOS_BUCKET).createSignedUrl(p, 3600);
        if (!error) urls[p] = data.signedUrl;
      }
      return urls;
    },
  });
}

/** Récupère (ou crée) le panier de l'utilisateur et renvoie son id. */
async function ensureCartId(): Promise<string> {
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) throw new Error("Session expirée");
  const { data: existing } = await supabase
    .from("carts")
    .select("id")
    .eq("user_id", auth.user.id)
    .maybeSingle();
  if (existing) return existing.id;
  const { data, error } = await supabase
    .from("carts")
    .insert({ user_id: auth.user.id })
    .select("id")
    .single();
  if (error) throw new Error(error.message);
  return data!.id;
}

/** Ajoute un produit au panier (incrémente la quantité si déjà présent). */
export function useAddToCart() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (values: { productId: string; quantity?: number; unitPrice: number }) => {
      const qty = values.quantity ?? 1;
      if (isGuestMode()) {
        const existing = demoRows<CartItem>("cart_items").find(
          (i) => i.product_id === values.productId,
        );
        if (existing) {
          demoUpdate("cart_items", existing.id, { quantity: Number(existing.quantity) + qty });
        } else {
          demoInsert("cart_items", {
            product_id: values.productId,
            quantity: qty,
            unit_price: values.unitPrice,
            cart_id: "demo-cart",
          });
        }
        return;
      }
      const cartId = await ensureCartId();
      const { data: existing } = await supabase
        .from("cart_items")
        .select("id, quantity")
        .eq("cart_id", cartId)
        .eq("product_id", values.productId)
        .maybeSingle();
      if (existing) {
        const { error } = await supabase
          .from("cart_items")
          .update({ quantity: Number(existing.quantity) + qty })
          .eq("id", existing.id);
        if (error) throw new Error(error.message);
      } else {
        const { error } = await supabase.from("cart_items").insert({
          cart_id: cartId,
          product_id: values.productId,
          quantity: qty,
          unit_price: values.unitPrice,
        });
        if (error) throw new Error(error.message);
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["cart"] });
      toast.success("Ajouté au panier");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

/** Met à jour la quantité d'une ligne du panier. */
export function useUpdateCartItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (values: { id: string; quantity: number }) => {
      if (isGuestMode()) {
        demoUpdate("cart_items", values.id, { quantity: values.quantity });
        return;
      }
      const { error } = await supabase
        .from("cart_items")
        .update({ quantity: values.quantity })
        .eq("id", values.id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cart"] }),
    onError: (e: Error) => toast.error(e.message),
  });
}

/** Retire une ligne du panier. */
export function useRemoveCartItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      if (isGuestMode()) {
        demoDelete("cart_items", id);
        return;
      }
      const { error } = await supabase.from("cart_items").delete().eq("id", id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cart"] }),
    onError: (e: Error) => toast.error(e.message),
  });
}

export type OrderPayload = {
  storeId: string;
  projectId: string | null;
  items: {
    productId: string;
    name: string;
    unit: string | null;
    quantity: number;
    unitPrice: number;
  }[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  paymentMethod: string | null;
  deliveryAddress?: string | null;
  city?: string | null;
  phone?: string | null;
  notes?: string | null;
  delivery?: {
    driverId: string | null;
    scheduledAt?: string | null;
    fee: number;
  } | null;
};

/** Crée une commande + ses lignes + une éventuelle livraison, puis vide le panier. */
export function useCreateOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: OrderPayload) => {
      if (isGuestMode()) {
        const orderId = crypto.randomUUID();
        demoInsert("orders", {
          id: orderId,
          store_id: payload.storeId,
          project_id: payload.projectId,
          status: "creee",
          subtotal: payload.subtotal,
          delivery_fee: payload.deliveryFee,
          total: payload.total,
          payment_method: payload.paymentMethod,
          delivery_address: payload.deliveryAddress ?? null,
          city: payload.city ?? null,
          phone: payload.phone ?? null,
          notes: payload.notes ?? null,
          ordered_at: new Date().toISOString(),
        });
        payload.items.forEach((it) =>
          demoInsert("order_items", {
            order_id: orderId,
            product_id: it.productId,
            name: it.name,
            unit: it.unit,
            quantity: it.quantity,
            unit_price: it.unitPrice,
          }),
        );
        if (payload.delivery) {
          demoInsert("deliveries", {
            order_id: orderId,
            driver_id: payload.delivery.driverId,
            status: "planifiee",
            scheduled_at: payload.delivery.scheduledAt ?? null,
            fee: payload.delivery.fee,
            to_address: payload.deliveryAddress ?? null,
            phone: payload.phone ?? null,
          });
        }
        demoRows<CartItem>("cart_items").forEach((i) => demoDelete("cart_items", i.id));
        return orderId;
      }
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) throw new Error("Session expirée");

      const reference = `CMD-${Date.now().toString(36).toUpperCase()}`;
      const { data: order, error: orderErr } = await supabase
        .from("orders")
        .insert({
          user_id: auth.user.id,
          store_id: payload.storeId,
          project_id: payload.projectId,
          status: "creee",
          reference,
          subtotal: payload.subtotal,
          delivery_fee: payload.deliveryFee,
          total: payload.total,
          payment_method: payload.paymentMethod,
          delivery_address: payload.deliveryAddress ?? null,
          city: payload.city ?? null,
          phone: payload.phone ?? null,
          notes: payload.notes ?? null,
        })
        .select("id")
        .single();
      if (orderErr) throw new Error(orderErr.message);

      for (const it of payload.items) {
        const { error: itemErr } = await supabase.from("order_items").insert({
          order_id: order.id!,
          product_id: it.productId,
          name: it.name,
          unit: it.unit,
          quantity: it.quantity,
          unit_price: it.unitPrice,
        });
        if (itemErr) throw new Error(itemErr.message);
      }

      if (payload.delivery) {
        const { error: delErr } = await supabase.from("deliveries").insert({
          order_id: order.id!,
          driver_id: payload.delivery.driverId,
          user_id: auth.user.id,
          status: "planifiee",
          scheduled_at: payload.delivery.scheduledAt ?? null,
          fee: payload.delivery.fee,
          to_address: payload.deliveryAddress ?? null,
          phone: payload.phone ?? null,
        });
        if (delErr) throw new Error(delErr.message);
      }

      // vide le panier
      const { data: cart } = await supabase
        .from("carts")
        .select("id")
        .eq("user_id", auth.user.id)
        .maybeSingle();
      if (cart) {
        await supabase.from("cart_items").delete().eq("cart_id", cart.id);
        await supabase.from("carts").delete().eq("id", cart.id);
      }

      return order.id!;
    },
    onSuccess: () => {
      ["orders", "cart", "deliveries", "order_items", "products"].forEach((k) =>
        qc.invalidateQueries({ queryKey: [k] }),
      );
      toast.success("Commande passée !");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

/** Met à jour le statut d'une commande (côté vendeur : préparation, prête, en livraison, livrée…). */
export function useUpdateOrderStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (values: { id: string; status: string }) => {
      if (isGuestMode()) {
        demoUpdate("orders", values.id, { status: values.status });
        return;
      }
      const { error } = await supabase
        .from("orders")
        .update({ status: values.status })
        .eq("id", values.id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["orders"] });
      toast.success("Statut mis à jour");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

/** Met à jour le statut d'une livraison (transporteur ou vendeur). */
export function useUpdateDeliveryStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (values: { id: string; status: string }) => {
      if (isGuestMode()) {
        demoUpdate("deliveries", values.id, { status: values.status });
        return;
      }
      const { error } = await supabase
        .from("deliveries")
        .update({ status: values.status })
        .eq("id", values.id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["deliveries"] });
      toast.success("Livraison mise à jour");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

/* ---------- Plans de chantier ---------- */

/** Téléverse des plans dans le dossier documents et renvoie leurs chemins. */
export async function uploadPlanFiles(files: File[], projectId: string) {
  if (isGuestMode()) return [];
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) throw new Error("Session expirée");
  const paths: string[] = [];
  for (const file of files) {
    const ext = file.name.split(".").pop()?.toLowerCase() || "pdf";
    const path = `plans/${auth.user.id}/${projectId}/${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage
      .from(DOCUMENTS_BUCKET)
      .upload(path, file, { contentType: file.type || "application/octet-stream" });
    if (error) throw new Error(error.message);
    paths.push(path);
  }
  return paths;
}

export type NewPlan = {
  project_id: string;
  name: string;
  file_path: string;
  size_bytes?: number | null;
  mime_type?: string | null;
  annotations?: Json;
};

/** Ajoute un ou plusieurs plans. */
export function useAddPlans() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (plans: NewPlan[]) => {
      if (isGuestMode()) {
        plans.forEach((p) => demoInsert("plans", p));
        return;
      }
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) throw new Error("Session expirée");
      const { error } = await supabase.from("plans").insert(
        plans.map((p) => ({
          ...p,
          user_id: auth.user!.id,
          annotations: p.annotations ?? {},
        })),
      );
      if (error) throw new Error(error.message);
    },
    onSuccess: (_d, plans) => {
      const pids = plans.map((p) => p.project_id);
      pids.forEach((pid) => qc.invalidateQueries({ queryKey: ["plans", pid] }));
      toast.success("Plan(s) ajouté(s)");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

/** Supprime un plan (+ fichier stockage). */
export function useDeletePlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, file_path }: { id: string; file_path: string }) => {
      if (isGuestMode()) {
        demoDelete("plans", id);
        return;
      }
      await supabase.storage.from(DOCUMENTS_BUCKET).remove([file_path]);
      const { error } = await supabase.from("plans").delete().eq("id", id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["plans"] });
      toast.success("Plan supprimé");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

/* ---------- Collaboration & multi-tenant ---------- */

export type ProjectMember = Tables["project_members"]["Row"];
export type Organization = Tables["organizations"]["Row"];
export type OrganizationMember = Tables["organization_members"]["Row"];

/** Membre d'un chantier, avec le nom du profil associé (pour l'affichage). */
export type ProjectMemberWithProfile = ProjectMember & { profile_full_name: string | null };

/** Membres d'un chantier (avec noms). Invitation par email → lookup via profiles. */
export function useProjectMembers(projectId: string | null) {
  return useQuery({
    queryKey: ["project_members", projectId],
    enabled: !!projectId,
    queryFn: async () => {
      if (isGuestMode()) return [] as ProjectMemberWithProfile[];
      const { data, error } = await supabase
        .from("project_members")
        .select("*, profiles(full_name)")
        .eq("project_id", projectId!);
      if (error) throw new Error(error.message);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (data ?? []).map((r: any) => ({
        ...r,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        profile_full_name: (r.profiles as any)?.full_name ?? null,
      })) as ProjectMemberWithProfile[];
    },
  });
}

/** Invitations reçues par l'utilisateur courant (par email, pas encore acceptées). */
export function useMyProjectInvites() {
  return useQuery({
    queryKey: ["my_project_invites"],
    queryFn: async () => {
      if (isGuestMode()) return [] as ProjectMemberWithProfile[];
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user?.email) return [] as ProjectMemberWithProfile[];
      const { data, error } = await supabase
        .from("project_members")
        .select("*, projects(name)")
        .is("user_id", null)
        .eq("email", auth.user.email);
      if (error) throw new Error(error.message);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (data ?? []).map((r: any) => ({
        ...r,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        profile_full_name: (r.projects as any)?.name ?? null,
      })) as ProjectMemberWithProfile[];
    },
  });
}

/** Accepte une invitation de chantier : rattache le compte à l'invitation. */
export function useAcceptProjectInvite() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, userId }: { id: string; userId: string }) => {
      if (isGuestMode()) return;
      const { error } = await supabase
        .from("project_members")
        .update({ user_id: userId, email: null })
        .eq("id", id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["my_project_invites"] });
      qc.invalidateQueries({ queryKey: ["projects"] });
      toast.success("Invitation acceptée");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

/** Organisations de l'utilisateur courant. */
export function useMyOrganizations() {
  return useQuery({
    queryKey: ["my_organizations"],
    queryFn: async () => {
      if (isGuestMode()) return [] as Organization[];
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) return [] as Organization[];
      const { data, error } = await supabase
        .from("organizations")
        .select("*")
        .or(`created_by.eq.${auth.user.id},organization_members.user_id.eq.${auth.user.id}`);
      if (error) throw new Error(error.message);
      return (data ?? []) as Organization[];
    },
  });
}

/** Ajoute un membre à un chantier (owner du projet uniquement). */
export function useAddProjectMember() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      projectId,
      email,
      role,
    }: {
      projectId: string;
      email: string;
      role: "owner" | "editor" | "viewer";
    }) => {
      if (isGuestMode()) return;
      const { error } = await supabase.from("project_members").insert({
        project_id: projectId,
        email: email.trim().toLowerCase(),
        role,
      });
      if (error) throw new Error(error.message);
    },
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ["project_members", vars.projectId] });
      toast.success("Invitation envoyée par e-mail");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

/** Change le rôle d'un membre ou le retire d'un chantier. */
export function useUpdateProjectMember() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      projectId,
      role,
    }: {
      id: string;
      projectId: string;
      role: "owner" | "editor" | "viewer";
    }) => {
      if (isGuestMode()) return;
      const { error } = await supabase.from("project_members").update({ role }).eq("id", id);
      if (error) throw new Error(error.message);
    },
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ["project_members", vars.projectId] });
      toast.success("Rôle mis à jour");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useRemoveProjectMember() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, projectId }: { id: string; projectId: string }) => {
      if (isGuestMode()) return;
      const { error } = await supabase.from("project_members").delete().eq("id", id);
      if (error) throw new Error(error.message);
    },
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ["project_members", vars.projectId] });
      toast.success("Membre retiré");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}
