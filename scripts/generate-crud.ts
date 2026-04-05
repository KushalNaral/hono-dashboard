// @ts-nocheck
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

// Get current directory equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const targetDir = path.resolve(__dirname, "../src/pages");

async function generateCrud(resourceName: string, layout: 'standard' | 'sidebar' = 'standard') {
  // Normalize resource name: e.g., "products" -> "Products", "product"
  const ResourceName = resourceName.charAt(0).toUpperCase() + resourceName.slice(1);
  const resourceKey = resourceName.toLowerCase();
  
  const template = `
<script setup lang="ts">
import { z } from "zod";
import { useCrud } from "@/composables/useCrud";
import CrudLayout${layout === 'standard' ? 'Standard' : 'Sidebar'} from "@/layouts/CrudLayout${layout === 'standard' ? 'Standard' : 'Sidebar'}.vue";
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
  resource: "${resourceKey}",
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
      if (confirm(\`Are you sure you want to delete \${row.name}?\`)) {
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
  <CrudLayout${layout === 'standard' ? 'Standard' : 'Sidebar'}
    title="${ResourceName}"
    description="Manage your ${resourceKey}"
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
  </CrudLayout${layout === 'standard' ? 'Standard' : 'Sidebar'}>
</template>
`;

  const fileName = `${ResourceName}Page.vue`;
  const filePath = path.join(targetDir, fileName);

  try {
    await fs.writeFile(filePath, template.trim(), "utf-8");
    console.log(`✅ Successfully generated ${fileName} at ${filePath}`);
  } catch (error) {
    console.error(`❌ Error generating file: ${error}`);
  }
}

// Simple CLI Argument Parsing
const args = process.argv.slice(2);
if (args.length === 0) {
  console.log("Usage: bun run generate-crud <resourceName> [--layout sidebar]");
  process.exit(1);
}

const resourceName = args[0];
const isSidebar = args.includes("--layout") && args[args.indexOf("--layout") + 1] === "sidebar";

generateCrud(resourceName, isSidebar ? "sidebar" : "standard");
