<script setup lang="ts">
import { Card, CardContent } from "@/components/ui/card";
import Skeleton from "./Skeleton.vue";

defineProps<{
  title: string;
  value: string | number | undefined;
  loading?: boolean;
  subtitle?: string;
  icon: string;
  trend?: { value: number; label: string };
}>();

const iconPaths: Record<string, string> = {
  users: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M12 3a4 4 0 1 1-8 0 4 4 0 0 1 8 0M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75",
  shield: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
  key: "M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4",
  activity: "M22 12h-4l-3 9L9 3l-3 9H2",
  file: "M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z M13 2v7h7",
  settings: "M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z",
};
</script>

<template>
  <Card class="overflow-hidden transition-all hover:shadow-md">
    <CardContent class="p-5">
      <div class="flex items-start justify-between">
        <div class="space-y-2">
          <p class="text-xs font-medium uppercase tracking-wider text-muted-foreground">{{ title }}</p>
          <Skeleton v-if="loading" class="h-8 w-20" />
          <p v-else class="text-3xl font-bold tracking-tight">{{ value ?? 0 }}</p>
          <p v-if="subtitle && !loading" class="text-xs text-muted-foreground">{{ subtitle }}</p>
        </div>
        <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-primary">
            <path :d="iconPaths[icon] ?? iconPaths.activity" />
          </svg>
        </div>
      </div>
      <div v-if="trend" class="mt-3 flex items-center gap-1 text-xs">
        <span :class="trend.value >= 0 ? 'text-success' : 'text-destructive'" class="font-medium">
          {{ trend.value >= 0 ? "+" : "" }}{{ trend.value }}%
        </span>
        <span class="text-muted-foreground">{{ trend.label }}</span>
      </div>
    </CardContent>
  </Card>
</template>
