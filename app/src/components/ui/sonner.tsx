import { CheckCircle2, TriangleAlert, XCircle } from "lucide-react";
import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

function Toaster({ ...props }: ToasterProps) {
  return (
    <Sonner
      position="bottom-right"
      toastOptions={{
        classNames: {
          toast:
            "font-sans text-sm rounded-lg shadow-lg border flex items-start gap-3 px-4 py-3",
          title: "font-semibold leading-tight",
          description: "text-sm leading-snug mt-0.5",
          icon: "mt-0.5 shrink-0",
          closeButton:
            "opacity-60 hover:opacity-100 transition-opacity cursor-pointer",
          success:
            "bg-kfk-muted-green border-kfk-green text-foreground [&>[data-icon]]:text-kfk-green",
          error:
            "bg-kfk-muted-red border-kfk-red text-foreground [&>[data-icon]]:text-kfk-red",
          warning:
            "bg-kfk-muted-yellow border-kfk-yellow text-foreground [&>[data-icon]]:text-kfk-brown",
        },
      }}
      icons={{
        success: <CheckCircle2 className="size-5 text-kfk-green" />,
        error: <XCircle className="size-5 text-kfk-red" />,
        warning: <TriangleAlert className="size-5 text-kfk-brown" />,
      }}
      {...props}
    />
  );
}

export { Toaster };
