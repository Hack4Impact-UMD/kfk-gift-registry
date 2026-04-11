import { toast as sonnerToast } from "sonner";

type ToastOptions = Parameters<typeof sonnerToast>[1];

export const toast = {
  success: (message: string, options?: ToastOptions) =>
    sonnerToast.success(message, options),

  warning: (message: string, options?: ToastOptions) =>
    sonnerToast.warning(message, options),

  error: (message: string, options?: ToastOptions) =>
    sonnerToast.error(message, options),
};
