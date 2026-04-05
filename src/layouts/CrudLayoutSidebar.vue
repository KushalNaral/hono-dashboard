<script setup lang="ts">
import PageHeader from "@/components/PageHeader.vue";
import DataTable, { type ColumnDef, type DataTableAction } from "@/components/DataTable.vue";
import AutoForm from "@/components/AutoForm.vue";
import {
  Dialog, // We can use Dialog as a sliding sheet/sidebar if configured, or just reuse it for now
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { z } from "zod";
import { ref } from "vue";
import { Button } from "@/components/ui/button";

// A sidebar layout often implies a split view: Left list, Right detail/edit form.
// We'll mimic a split-view where clicking a row opens an inline editing pane on the side instead of a modal!

const props = defineProps<{
  title: string;
  description?: string;
  crud: any; 
  columns: ColumnDef<any>[];
  actions?: DataTableAction<any>[];
  
  schema?: z.ZodObject<any>;
  disableCreate?: boolean;
}>();

const emit = defineEmits<{
  "row-click": [row: any];
}>();

const { mutations } = props.crud;

const editingData = ref<Record<string, any> | null>(null);
const isCreateMode = ref(false);

function handleCreateClick() {
  editingData.value = null;
  isCreateMode.value = true;
}

function handleRowClick(row: any) {
  emit("row-click", row);
  if (props.schema) {
    editingData.value = { ...row };
    isCreateMode.value = false;
  }
}

function closeSidebar() {
  editingData.value = null;
  isCreateMode.value = false;
}

function handleFormSubmit(data: Record<string, any>) {
  if (editingData.value && !isCreateMode.value) {
    mutations.update.mutate(
      { id: editingData.value.id, data },
      { onSuccess: () => { closeSidebar(); } }
    );
  } else {
    mutations.create.mutate(data, { onSuccess: () => { closeSidebar(); } });
  }
}
</script>

<template>
  <div class="h-full flex flex-col space-y-6">
    <PageHeader :title="title" :description="description">
      <template #actions>
        <slot name="header-actions" />
        <Button 
          v-if="!disableCreate && schema" 
          @click="handleCreateClick"
          :disabled="isCreateMode"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-1.5"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
          New {{ title }}
        </Button>
      </template>
    </PageHeader>

    <div class="flex-1 flex gap-6 overflow-hidden">
      <!-- Data Table Pane -->
      <div class="flex-1 overflow-auto bg-card rounded-lg border shadow-sm p-4 transition-all duration-300">
        <DataTable
          :crud="crud"
          :columns="columns"
          :actions="actions"
          rowClickable
          @row-click="handleRowClick"
        >
          <template #filters="{ crud }">
            <slot name="filters" :crud="crud" />
          </template>
          <template v-for="(_slot, name) in $slots" #[name]="slotProps">
            <slot :name="name" v-bind="slotProps || {}" />
          </template>
        </DataTable>
      </div>

      <!-- Side Pane (Inspector / Editor) -->
      <transition enter-active-class="transition-all duration-300 ease-out" enter-from-class="opacity-0 translate-x-4 w-0" enter-to-class="opacity-100 translate-x-0 w-[400px]" leave-active-class="transition-all duration-200 ease-in" leave-from-class="opacity-100 translate-x-0 w-[400px]" leave-to-class="opacity-0 translate-x-4 w-0">
        <div v-if="(editingData || isCreateMode) && schema" class="w-[400px] shrink-0 border rounded-lg bg-card shadow-sm h-full flex flex-col overflow-hidden">
          <div class="flex items-center justify-between p-4 border-b">
            <div>
              <h3 class="text-lg font-semibold">{{ isCreateMode ? `Create ${title}` : `Edit ${title}` }}</h3>
              <p class="text-sm text-muted-foreground">{{ isCreateMode ? 'Fill out the details below' : 'Update the record details' }}</p>
            </div>
            <Button variant="ghost" size="icon" @click="closeSidebar">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            </Button>
          </div>
          
          <div class="p-4 overflow-y-auto flex-1">
            <AutoForm
              :schema="schema"
              :initial-data="editingData || undefined"
              :is-pending="mutations.create.isPending.value || mutations.update.isPending.value"
              @submit="handleFormSubmit"
              @cancel="closeSidebar"
            />
          </div>
        </div>
      </transition>
    </div>
    
    <slot name="additional-dialogs" />
  </div>
</template>

<style scoped>
/* Scoped styles mainly using Tailwind via utility classes, no extra CSS needed */
</style>
