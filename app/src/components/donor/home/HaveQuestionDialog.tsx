import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "@/lib/toast";

const SUPPORT_EMAIL = "info@kissesforkyle.org";

export function HaveQuestionDialog() {
  const [open, setOpen] = useState(false);

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText(SUPPORT_EMAIL);
      toast.success("Email copied");
    } catch {
      toast.error("Failed to copy email");
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-[13px] italic text-[#4B5563] underline underline-offset-4"
      >
        Have a question?
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          showCloseButton={false}
          className="w-[calc(100%-3rem)] max-w-[370px] rounded-[18px] border border-[#D1D5DB] bg-white px-4 py-8 shadow-[0_12px_30px_rgba(0,0,0,0.18)]"
        >
          <div className="text-center">
            <DialogTitle className="text-[24px] font-semibold text-[#1F2937]">
              Have a Question?
            </DialogTitle>
            <DialogDescription className="mx-auto mt-4 max-w-[290px] text-[16px] leading-8 text-[#4B5563]">
              Please email us at{" "}
              <span className="font-semibold text-[#1F2937]">
                {SUPPORT_EMAIL}
              </span>{" "}
              with any questions or concerns you may have.
            </DialogDescription>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-4">
            <Button
              type="button"
              variant="outline"
              className="h-12 rounded-[14px] border-[#1D4ED8] bg-white font-gaegu text-[18px] font-bold text-[#1D4ED8] hover:bg-[#EFF6FF]"
              onClick={() => setOpen(false)}
            >
              Exit
            </Button>
            <Button
              type="button"
              className="h-12 rounded-[14px] bg-[#173FB6] font-gaegu text-[18px] font-bold text-white hover:bg-[#173FB6]/90"
              onClick={handleCopyEmail}
            >
              Copy Email
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
