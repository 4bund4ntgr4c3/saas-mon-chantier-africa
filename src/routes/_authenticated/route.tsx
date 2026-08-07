import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { isGuestMode } from "@/lib/guest-mode";
import { AppShell } from "@/components/app-shell";
import { OnboardingTour } from "@/components/onboarding-tour";
import { ProjectProvider } from "@/context/project-context";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    if (isGuestMode()) return { user: null };
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: "/auth" });
    return { user: data.user };
  },
  component: () => (
    <ProjectProvider>
      <AppShell>
        <OnboardingTour />
        <Outlet />
      </AppShell>
    </ProjectProvider>
  ),
});
