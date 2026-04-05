<script setup lang="ts">
import { cn } from "@/lib/utils";
import { computed } from "vue";
const props = withDefaults(defineProps<{ class?: string }>(), { class: "" });
const classes = computed(() => cn("flex flex-col space-y-1.5 text-center sm:text-left", props.class));
</script>
<template><div :class="classes"><slot /></div></template>
