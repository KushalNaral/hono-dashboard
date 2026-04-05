<script setup lang="ts">
import { cn } from "@/lib/utils";
import { computed } from "vue";

const props = withDefaults(
  defineProps<{ for?: string; class?: string }>(),
  { for: undefined, class: "" },
);

const classes = computed(() =>
  cn("text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70", props.class),
);
</script>

<template>
  <label :for="props.for" :class="classes"><slot /></label>
</template>
