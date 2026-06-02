import { Quote } from "lucide-react";

export function ThankYouNotePanel({
  note,
  childFirstName,
}: {
  note: string;
  childFirstName: string;
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-kfk-brown bg-kfk-muted-yellow/30 px-5 py-4 shadow-sm">
      <div className="absolute right-4 top-4 rounded-full bg-white p-2 text-kfk-brown shadow-sm">
        <Quote className="size-4" />
      </div>
      <p className="font-gaegu text-2xl font-bold text-kfk-brown">
        A note from {childFirstName}
      </p>
      <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-kfk-brown">
        "{note}"
      </p>
    </div>
  );
}
