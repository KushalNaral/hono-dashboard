<script setup lang="ts">
interface BreadcrumbItem {
  label: string;
  to?: string;
}

defineProps<{ items: BreadcrumbItem[] }>();
</script>

<template>
  <nav class="flex items-center gap-1.5 text-sm text-muted-foreground mb-4">
    <template v-for="(item, i) in items" :key="i">
      <svg v-if="i > 0" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="opacity-40"><path d="m9 18 6-6-6-6"/></svg>
      <RouterLink v-if="item.to" :to="item.to" class="hover:text-foreground transition-colors">
        {{ item.label }}
      </RouterLink>
      <span v-else class="text-foreground font-medium">{{ item.label }}</span>
    </template>
  </nav>
</template>
