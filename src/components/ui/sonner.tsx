import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-muted-foreground",
          actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
          // Teintes par type, lisibles en clair comme en sombre.
          success:
            "group-[.toaster]:border-success/40 group-[.toaster]:bg-success/10 group-[.toaster]:dark:bg-success/15",
          warning:
            "group-[.toaster]:border-warning/40 group-[.toaster]:bg-warning/10 group-[.toaster]:dark:bg-warning/15",
          error:
            "group-[.toaster]:border-destructive/40 group-[.toaster]:bg-destructive/10 group-[.toaster]:dark:bg-destructive/15",
          info: "group-[.toaster]:border-accent/40 group-[.toaster]:bg-accent/10 group-[.toaster]:dark:bg-accent/15",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
