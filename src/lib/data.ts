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

type TableName =
  | "projects"
  | "suppliers"
  | "companies"
  | "expenses"
  | "payments"
  | "quotes"
  | "budget_lines"
  | "categories";

const RELATED: Record<TableName, string[]> = {
  projects: ["projects"],
  suppliers: ["suppliers"],
  companies: ["companies"],
  expenses: ["expenses"],
  payments: ["payments", "expenses"],
  quotes: ["quotes"],
  budget_lines: ["budget_lines"],
  categories: ["categories"],
};

export function useSaveRow(table: TableName, successMessage = "Enregistré") {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, values }: { id?: string; values: Record<string, unknown> }) => {
      const query = id
        ? supabase.from(table).update(values).eq("id", id)
        : supabase.from(table).insert(values);
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
