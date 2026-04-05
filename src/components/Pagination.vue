<script setup lang="ts">
import { computed } from "vue";
import { Button } from "@/components/ui/button";

const props = defineProps<{
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}>();

const emit = defineEmits<{
  "update:page": [value: number];
}>();

const from = computed(() => (props.page - 1) * props.pageSize + 1);
const to = computed(() => Math.min(props.page * props.pageSize, props.total));

const pages = computed(() => {
  const result: (number | "...")[] = [];
  const total = props.totalPages;
  const current = props.page;

  if (total <= 7) {
    for (let i = 1; i <= total; i++) result.push(i);
    return result;
  }

  result.push(1);
  if (current > 3) result.push("...");

  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  for (let i = start; i <= end; i++) result.push(i);

  if (current < total - 2) result.push("...");
  result.push(total);
  return result;
});
</script>

<template>
  <div class="flex items-center justify-between border-t pt-4">
    <p class="text-sm text-muted-foreground">
      {{ from }}–{{ to }} of {{ total }}
    </p>
    <div class="flex items-center gap-1">
      <Button
        variant="ghost"
        size="icon"
        :disabled="page <= 1"
        @click="emit('update:page', page - 1)"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
      </Button>
      <template v-for="(p, i) in pages" :key="i">
        <span v-if="p === '...'" class="px-1 text-sm text-muted-foreground">...</span>
        <Button
          v-else
          :variant="p === page ? 'default' : 'ghost'"
          size="icon"
          class="h-8 w-8 text-xs"
          @click="emit('update:page', p)"
        >
          {{ p }}
        </Button>
      </template>
      <Button
        variant="ghost"
        size="icon"
        :disabled="page >= totalPages"
        @click="emit('update:page', page + 1)"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
      </Button>
    </div>
  </div>
</template>
