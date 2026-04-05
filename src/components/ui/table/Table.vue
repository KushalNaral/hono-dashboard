<script setup lang="ts">
import { cn } from "@/lib/utils";
import { computed } from "vue";
const props = withDefaults(defineProps<{ class?: string }>(), { class: "" });
const classes = computed(() => cn("w-full caption-bottom text-sm", props.class));
</script>
<template>
  <div class="relative w-full overflow-auto">
    <table :class="classes"><slot /></table>
  </div>
</template>
