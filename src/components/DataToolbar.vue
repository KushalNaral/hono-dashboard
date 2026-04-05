<script setup lang="ts">
import { Input } from "@/components/ui/input";

defineProps<{
  modelValue: string;
  placeholder?: string;
  count?: number;
}>();

defineEmits<{
  "update:modelValue": [value: string];
}>();
</script>

<template>
  <div class="flex items-center justify-between gap-4">
    <div class="flex flex-1 items-center gap-3">
      <div class="relative max-w-sm flex-1">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
        <Input
          :model-value="modelValue"
          :placeholder="placeholder ?? 'Search...'"
          class="pl-9"
          @update:model-value="$emit('update:modelValue', $event)"
        />
      </div>
      <span v-if="count !== undefined" class="text-sm text-muted-foreground whitespace-nowrap">
        {{ count }} {{ count === 1 ? 'result' : 'results' }}
      </span>
    </div>
    <div class="flex items-center gap-2">
      <slot />
    </div>
  </div>
</template>
