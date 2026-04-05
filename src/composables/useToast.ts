import { ref } from "vue";

export interface Toast {
  id: string;
  title: string;
  description?: string;
  variant?: "default" | "destructive" | "success";
  duration?: number;
}

const toasts = ref<Toast[]>([]);
let counter = 0;

export function useToast() {
  function toast(options: Omit<Toast, "id">) {
    const id = String(++counter);
    const t: Toast = { id, duration: 4000, variant: "default", ...options };
    toasts.value.push(t);

    setTimeout(() => {
      dismiss(id);
    }, t.duration);

    return id;
  }

  function dismiss(id: string) {
    toasts.value = toasts.value.filter((t) => t.id !== id);
  }

  return { toasts, toast, dismiss };
}
