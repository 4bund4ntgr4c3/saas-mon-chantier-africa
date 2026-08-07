import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useProjects, type Project } from "@/lib/data";

type Ctx = {
  projects: Project[];
  project: Project | null;
  projectId: string | null;
  setProjectId: (id: string) => void;
  isLoading: boolean;
};

const ProjectContext = createContext<Ctx | null>(null);
const STORAGE_KEY = "batibenin.projectId";

export function ProjectProvider({ children }: { children: ReactNode }) {
  const { data: projects = [], isLoading } = useProjects();
  const [projectId, setProjectIdState] = useState<string | null>(null);

  useEffect(() => {
    if (projects.length === 0) {
      setProjectIdState(null);
      return;
    }
    const stored = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
    setProjectIdState((current) => {
      if (current && projects.some((p) => p.id === current)) return current;
      if (stored && projects.some((p) => p.id === stored)) return stored;
      return projects[0]!.id;
    });
  }, [projects]);

  const value = useMemo<Ctx>(
    () => ({
      projects,
      projectId,
      project: projects.find((p) => p.id === projectId) ?? null,
      isLoading,
      setProjectId: (id: string) => {
        localStorage.setItem(STORAGE_KEY, id);
        setProjectIdState(id);
      },
    }),
    [projects, projectId, isLoading],
  );

  return <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>;
}

export function useCurrentProject() {
  const ctx = useContext(ProjectContext);
  if (!ctx) throw new Error("useCurrentProject must be used inside ProjectProvider");
  return ctx;
}
