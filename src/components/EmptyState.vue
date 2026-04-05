<script setup lang="ts">
defineProps<{
  title: string;
  description?: string;
  icon?: string;
}>();

const iconPaths: Record<string, string> = {
  inbox: "M22 12h-6l-2 3h-4l-2-3H2M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z",
  search: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z",
  file: "M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z M13 2v7h7",
};
</script>

<template>
  <div class="flex flex-col items-center justify-center py-16 text-center">
    <div class="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted/60 mb-4">
      <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="text-muted-foreground">
        <path :d="iconPaths[icon ?? 'inbox'] ?? iconPaths.inbox" />
      </svg>
    </div>
    <h3 class="text-sm font-medium">{{ title }}</h3>
    <p v-if="description" class="text-sm text-muted-foreground mt-1 max-w-sm">{{ description }}</p>
    <div class="mt-4">
      <slot />
    </div>
  </div>
</template>
