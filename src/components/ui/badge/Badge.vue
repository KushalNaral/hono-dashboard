<script setup lang="ts">
import { cn } from "@/lib/utils";
import { computed } from "vue";

type BadgeVariant = "default" | "secondary" | "destructive" | "outline" | "success" | "warning";

const props = withDefaults(
  defineProps<{ variant?: BadgeVariant; class?: string }>(),
  { variant: "default", class: "" },
);

const variantClasses: Record<BadgeVariant, string> = {
  default: "border-transparent bg-primary text-primary-foreground shadow",
  secondary: "border-transparent bg-secondary text-secondary-foreground",
  destructive: "border-transparent bg-destructive text-white shadow",
  outline: "text-foreground",
  success: "border-transparent bg-success text-white shadow",
  warning: "border-transparent bg-warning text-white shadow",
};

const classes = computed(() =>
  cn(
    "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
    variantClasses[props.variant],
    props.class,
  ),
);
</script>

<template>
  <div :class="classes"><slot /></div>
</template>
