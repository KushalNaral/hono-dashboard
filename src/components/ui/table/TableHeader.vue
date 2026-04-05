<script setup lang="ts">
import { cn } from "@/lib/utils";
import { computed } from "vue";
const props = withDefaults(defineProps<{ class?: string }>(), { class: "" });
const classes = computed(() => cn("[&_tr]:border-b", props.class));
</script>
<template><thead :class="classes"><slot /></thead></template>
