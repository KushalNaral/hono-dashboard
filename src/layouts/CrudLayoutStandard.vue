<script setup lang="ts">
import PageHeader from "@/components/PageHeader.vue";
import DataTable, { type ColumnDef, type DataTableAction } from "@/components/DataTable.vue";
import AutoForm from "@/components/AutoForm.vue";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { z } from "zod";
import { ref } from "vue";
import { Button } from "@/components/ui/button";

const props = defineProps<{
  title: string;
  description?: string;
  crud: any; // Return type from useCrud
  columns: ColumnDef<any>[];
  actions?: DataTableAction<any>[];
  rowClickable?: boolean;
  
  // Create / Edit configurations
  schema?: z.ZodObject<any>;
  disableCreate?: boolean;
}>();

const emit = defineEmits<{
  "row-click": [row: any];
}>();

const { mutations } = props.crud;

// Dialog state
const isFormOpen = ref(false);
const editingData = ref<Record<string, any> | null>(null);

function handleCreateClick() {
  editingData.value = null;
  isFormOpen.value = true;
}

function handleEdit(row: any) {
  editingData.value = { ...row };
  isFormOpen.value = true;
}

function handleFormSubmit(data: Record<string, any>) {
  if (editingData.value && editingData.value.id) {
    // Edit
    mutations.update.mutate(
      { id: editingData.value.id, data },
      { onSuccess: () => { isFormOpen.value = false; } }
    );
  } else {
    // Create
    mutations.create.mutate(data, { onSuccess: () => { isFormOpen.value = false; } });
  }
}
</script>

<template>
  <div class="space-y-6">
    <PageHeader :title="title" :description="description">
      <template #actions>
        <slot name="header-actions" />
        <Button 
          v-if="!disableCreate && schema" 
          @click="handleCreateClick"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-1.5"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
          New {{ title }}
        </Button>
      </template>
    </PageHeader>

    <DataTable
      :crud="crud"
      :columns="columns"
      :actions="actions"
      :rowClickable="rowClickable"
      @row-click="emit('row-click', $event)"
    >
      <!-- Forward the filters slot -->
      <template #filters="{ crud }">
        <slot name="filters" :crud="crud" />
      </template>
      
      <!-- Forward custom cell slots using dynamic slot forwarding -->
      <template v-for="(_slot, name) in $slots" #[name]="slotProps">
        <slot :name="name" v-bind="slotProps || {}" />
      </template>
    </DataTable>

    <!-- Generic Create / Edit Dialog -->
    <Dialog v-if="schema" v-model:open="isFormOpen">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{{ editingData ? `Edit ${title}` : `Create ${title}` }}</DialogTitle>
          <DialogDescription v-if="!editingData">Add a new {{ title.toLowerCase() }} to the system.</DialogDescription>
        </DialogHeader>
        <div class="pt-2">
          <AutoForm
            :schema="schema"
            :initial-data="editingData || undefined"
            :is-pending="mutations.create.isPending.value || mutations.update.isPending.value"
            @submit="handleFormSubmit"
            @cancel="isFormOpen = false"
          />
        </div>
      </DialogContent>
    </Dialog>
    
    <slot name="additional-dialogs" />
  </div>
</template>
