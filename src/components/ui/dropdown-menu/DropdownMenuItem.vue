<script setup lang="ts">
import { cn } from "@/lib/utils";
import { computed } from "vue";

const props = withDefaults(
  defineProps<{ destructive?: boolean; class?: string }>(),
  { destructive: false, class: "" },
);

const classes = computed(() =>
  cn(
    "relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
    props.destructive && "text-destructive hover:text-destructive",
    props.class,
  ),
);
</script>

<template>
  <div role="menuitem" :class="classes"><slot /></div>
</template>
