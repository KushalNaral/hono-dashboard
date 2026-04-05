<script setup lang="ts">
import { cn } from "@/lib/utils";
import { computed } from "vue";

const props = withDefaults(
  defineProps<{ orientation?: "horizontal" | "vertical"; class?: string }>(),
  { orientation: "horizontal", class: "" },
);

const classes = computed(() =>
  cn(
    "shrink-0 bg-border",
    props.orientation === "horizontal" ? "h-[1px] w-full" : "h-full w-[1px]",
    props.class,
  ),
);
</script>

<template>
  <div role="separator" :class="classes" />
</template>
