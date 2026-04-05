<script setup lang="ts">
import { z } from "zod";
import { useCrud } from "@/composables/useCrud";
import CrudLayoutStandard from "@/layouts/CrudLayoutStandard.vue";
import type { ColumnDef, DataTableAction } from "@/components/DataTable.vue";
import { Badge } from "@/components/ui/badge";

// 1. Define the schema
const schema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  status: z.enum(["active", "inactive"]).default("active"),
});

// 2. Initialize CRUD composable
const crud = useCrud({
  resource: "test_resource",
  defaultSortBy: "createdAt",
  defaultSortDir: "desc",
});

// 3. Define Table Columns
const columns: ColumnDef<any>[] = [
  { key: "name", label: "Name", sortable: true },
  { key: "description", label: "Description" },
  { key: "status", label: "Status", sortable: true },
  { key: "createdAt", label: "Created At", sortable: true },
];

// 4. Define Table Actions
const actions: DataTableAction<any>[] = [
  {
    key: "delete",
    label: "Delete",
    variant: "destructive",
    onClick: (row) => {
      if (confirm(`Are you sure you want to delete ${row.name}?`)) {
        crud.mutations.delete.mutate(row.id);
      }
    }
  }
];

// Optional: Formatting Helpers
const formatDate = (dateString: string) => {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleDateString();
};
</script>

<template>
  <CrudLayoutStandard
    title="Test_resource"
    description="Manage your test_resource"
    :crud="crud"
    :columns="columns"
    :actions="actions"
    :schema="schema"
  >
    <!-- Example of Custom Filters in Toolbar -->
    <template #filters="{ crud }">
      <select 
        class="h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        v-model="crud.state.customFilters.value.status"
        @change="crud.actions.setFilter('status', ($event.target as HTMLSelectElement).value)"
      >
        <option value="">All Statuses</option>
        <option value="active">Active</option>
        <option value="inactive">Inactive</option>
      </select>
    </template>

    <!-- Example of Custom Cell Rendering via Slot -->
    <template #cell-status="{ value }">
      <Badge :variant="value === 'active' ? 'default' : 'secondary'">
        {{ value }}
      </Badge>
    </template>
    
    <template #cell-createdAt="{ value }">
      <span class="text-xs text-muted-foreground">{{ formatDate(value) }}</span>
    </template>
  </CrudLayoutStandard>
</template>