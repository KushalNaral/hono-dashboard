<script setup lang="ts">
import { cn } from "@/lib/utils";
import { computed } from "vue";

const props = withDefaults(
  defineProps<{ class?: string }>(),
  { class: "" },
);

const classes = computed(() =>
  cn("rounded-md bg-muted skeleton-pulse", props.class),
);
</script>

<template>
  <div :class="classes" />
</template>
