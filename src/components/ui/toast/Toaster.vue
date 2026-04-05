<script setup lang="ts">
import { useToast } from "@/composables/useToast";
import { cn } from "@/lib/utils";

const { toasts, dismiss } = useToast();

function variantClass(variant: string) {
  return cn(
    "pointer-events-auto relative flex w-full items-center justify-between space-x-2 overflow-hidden rounded-md border p-4 pr-6 shadow-lg transition-all",
    variant === "destructive" && "border-destructive bg-destructive text-white",
    variant === "success" && "border-success bg-success text-white",
    variant === "default" && "border bg-background text-foreground",
  );
}
</script>

<template>
  <Teleport to="body">
    <div class="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 w-full max-w-sm">
      <TransitionGroup name="toast">
        <div v-for="t in toasts" :key="t.id" :class="variantClass(t.variant ?? 'default')">
          <div class="grid gap-1">
            <div class="text-sm font-semibold">{{ t.title }}</div>
            <div v-if="t.description" class="text-sm opacity-90">{{ t.description }}</div>
          </div>
          <button
            class="absolute right-1 top-1 rounded-md p-1 opacity-70 hover:opacity-100"
            @click="dismiss(t.id)"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<style scoped>
.toast-enter-active { transition: all 0.2s ease-out; }
.toast-leave-active { transition: all 0.15s ease-in; }
.toast-enter-from { opacity: 0; transform: translateX(100%); }
.toast-leave-to { opacity: 0; transform: translateX(100%); }
</style>
