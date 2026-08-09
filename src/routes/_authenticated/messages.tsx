import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Loader2, MessageSquare, Send } from "lucide-react";
import { EmptyProjectNotice, PageHeader } from "@/components/app-shell";
import { FeatureGate } from "@/components/feature-gate";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useCurrentProject } from "@/context/project-context";
import { useMessages, useProfile, useProfileById, useSendMessage, type Message } from "@/lib/data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/messages")({
  head: () => ({
    meta: [{ title: "Messages — BâtiBénin" }],
  }),
  component: () => (
    <FeatureGate feature="journal">
      <MessagesPage />
    </FeatureGate>
  ),
});

function MessagesPage() {
  const { project, projectId } = useCurrentProject();
  const { data: messages = [] } = useMessages(projectId);
  const { data: me } = useProfile();
  const send = useSendMessage();
  const [draft, setDraft] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  if (!project) return <EmptyProjectNotice />;

  const meId = me?.id ?? "00000000-0000-0000-0000-0000000000de";

  async function submit() {
    const body = draft.trim();
    if (!body) return;
    setDraft("");
    await send.mutateAsync({ project_id: projectId!, body });
  }

  return (
    <>
      <PageHeader
        title="Messages du chantier"
        subtitle={`Conversation partagée · ${project.name}`}
      />

      <div className="panel flex h-[calc(100vh-280px)] min-h-[420px] flex-col">
        {messages.length === 0 ? (
          <div className="grid flex-1 place-items-center px-6 text-center">
            <div>
              <MessageSquare className="mx-auto mb-3 size-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Aucun message. Écrivez à votre équipe et vos prestataires pour coordonner le
                chantier.
              </p>
            </div>
          </div>
        ) : (
          <div className="flex-1 space-y-3 overflow-y-auto p-4">
            {messages.map((m) => (
              <MessageBubble key={m.id} message={m} isMine={m.sender_id === meId} />
            ))}
            <div ref={bottomRef} />
          </div>
        )}

        <div className="border-t border-border p-3">
          <form
            className="flex items-end gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              void submit();
            }}
          >
            <Textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              rows={1}
              placeholder={`Message à propos de ${project.name}…`}
              className="max-h-32 flex-1 resize-none"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  void submit();
                }
              }}
            />
            <Button type="submit" size="icon" disabled={!draft.trim() || send.isPending}>
              {send.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Send className="size-4" />
              )}
            </Button>
          </form>
        </div>
      </div>
    </>
  );
}

function MessageBubble({ message, isMine }: { message: Message; isMine: boolean }) {
  const { data: sender } = useProfileById(isMine ? null : message.sender_id);
  const name = isMine ? "Moi" : (sender?.full_name ?? message.sender_id.slice(0, 8));

  return (
    <div className={cn("flex", isMine ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[80%] rounded-2xl px-4 py-2",
          isMine
            ? "rounded-br-sm bg-primary text-primary-foreground"
            : "rounded-bl-sm bg-secondary text-secondary-foreground",
        )}
      >
        {!isMine && (
          <p className="mb-0.5 text-[10px] font-semibold uppercase tracking-wide opacity-70">
            {name}
          </p>
        )}
        <p className="whitespace-pre-wrap text-sm leading-relaxed">{message.body}</p>
        <p
          className={cn(
            "mt-1 text-right text-[10px]",
            isMine ? "text-primary-foreground/70" : "text-muted-foreground",
          )}
        >
          {new Date(message.created_at).toLocaleTimeString("fr-FR", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      </div>
    </div>
  );
}
