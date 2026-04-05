<script setup lang="ts">
import { ref, watch } from "vue";
import { z } from "zod";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const props = defineProps<{
  schema: z.ZodObject<any, any>;
  initialData?: Record<string, any>;
  submitLabel?: string;
  isPending?: boolean;
}>();

const emit = defineEmits<{
  submit: [data: Record<string, any>];
  cancel: [];
}>();

const formData = ref<Record<string, any>>({});
const errors = ref<Record<string, string>>({});

// Initialize form data
watch(
  () => props.initialData,
  (newData) => {
    if (newData) {
      formData.value = { ...newData };
    } else {
      // Default initialization based on schema
      const shape = props.schema.shape;
      for (const key in shape) {
        if (!(key in formData.value)) {
          formData.value[key] = ""; // Can be refined based on Zod types
        }
      }
    }
    errors.value = {};
  },
  { immediate: true, deep: true }
);

function parseZodDef(def: any): { type: string; optional: boolean; label: string } {
  let isOptional = false;
  let currentDef = def;

  while (currentDef.innerType) {
    if (currentDef.typeName === 'ZodOptional' || currentDef.typeName === 'ZodNullable') {
      isOptional = true;
    }
    currentDef = currentDef.innerType._def;
  }

  // Basic type mapping
  let inputType = "text";
  if (currentDef.typeName === "ZodNumber") inputType = "number";
  if (currentDef.typeName === "ZodBoolean") inputType = "checkbox";

  // Use the description as label if provided, else uppercase first letter
  const label = def.description || "";

  return {
    type: inputType,
    optional: isOptional,
    label: label
  };
}

const fields = Object.entries(props.schema.shape).map(([key, value]) => {
  const zodDef = (value as z.ZodTypeAny)._def;
  const parsed = parseZodDef(zodDef);
  
  return {
    name: key,
    label: parsed.label || key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1').trim(),
    type: parsed.type,
    optional: parsed.optional,
    // Add simple heuristics for textareas
    component: key.toLowerCase().includes('description') || key.toLowerCase().includes('content') ? 'textarea' : 'input'
  };
});

function handleSubmit() {
  errors.value = {};
  
  // Transform number fields before validation if needed
  const dataToValidate = { ...formData.value };
  for (const field of fields) {
    if (field.type === 'number' && dataToValidate[field.name]) {
      dataToValidate[field.name] = Number(dataToValidate[field.name]);
    }
  }

  const result = props.schema.safeParse(dataToValidate);
  if (!result.success) {
    result.error.issues.forEach((err: z.ZodIssue) => {
      const path = err.path.join('.');
      errors.value[path] = err.message;
    });
    return;
  }
  
  emit("submit", result.data);
}
</script>

<template>
  <form @submit.prevent="handleSubmit" class="space-y-4">
    <div v-for="field in fields" :key="field.name" class="space-y-2">
      <Label :for="field.name" class="flex items-center gap-1">
        {{ field.label }}
        <span v-if="!field.optional" class="text-destructive">*</span>
      </Label>
      
      <Textarea
        v-if="field.component === 'textarea'"
        :id="field.name"
        v-model="formData[field.name]"
        :aria-invalid="!!errors[field.name]"
        class="w-full"
      />
      <Input
        v-else
        :id="field.name"
        :type="field.type"
        v-model="formData[field.name]"
        :aria-invalid="!!errors[field.name]"
        class="w-full"
      />
      
      <p v-if="errors[field.name]" class="text-xs text-destructive font-medium">
        {{ errors[field.name] }}
      </p>
    </div>
    
    <div class="flex items-center gap-3 pt-4 border-t mt-6">
      <!-- Slotted actions, typically just buttons -->
      <slot name="actions">
        <!-- Default actions if no slot provided -->
        <button 
          type="button" 
          @click="$emit('cancel')"
          class="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
        >
          Cancel
        </button>
        <button 
          type="submit" 
          :disabled="isPending"
          class="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
        >
          {{ isPending ? "Saving..." : (submitLabel || "Save") }}
        </button>
      </slot>
    </div>
  </form>
</template>
