<script setup lang="ts">
import { cn } from "@/lib/utils";
import { computed } from "vue";
const props = withDefaults(defineProps<{ class?: string }>(), { class: "" });
const classes = computed(() => cn("border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted", props.class));
</script>
<template><tr :class="classes"><slot /></tr></template>
