<script setup lang="ts">
import { cn } from "@/lib/utils";
import { computed } from "vue";

const props = withDefaults(defineProps<{ class?: string }>(), { class: "" });

const classes = computed(() =>
  cn("rounded-xl border bg-card text-card-foreground shadow-sm", props.class),
);
</script>

<template>
  <div :class="classes"><slot /></div>
</template>
