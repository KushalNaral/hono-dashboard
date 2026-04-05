<script setup lang="ts">
import { computed } from "vue";
import DataToolbar from "@/components/DataToolbar.vue";
import EmptyState from "@/components/EmptyState.vue";
import Pagination from "@/components/Pagination.vue";
import Skeleton from "@/components/Skeleton.vue";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";

export interface ColumnDef<T> {
  key: keyof T | string;
  label: string;
  sortable?: boolean;
  align?: "left" | "center" | "right";
  width?: string;
  // Custom render function isn't easily done with props in SFC setup, 
  // so we'll use named slots based on column key: `<template #cell-name="{ row }">`
}

export interface DataTableAction<T> {
  key: string;
  label: string;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  icon?: string; // Could be SVG path or icon name if using an icon system
  onClick: (row: T) => void;
  show?: (row: T) => boolean;
}

const props = defineProps<{
  crud: any; // Return type of useCrud
  columns: ColumnDef<any>[];
  actions?: DataTableAction<any>[];
  rowClickable?: boolean;
}>();

const emit = defineEmits<{
  "row-click": [row: any];
}>();

const { state, actions: crudActions, queries } = props.crud;

const isLoading = computed(() => queries.list.isLoading.value);
const data = computed(() => queries.list.data.value?.data || []);
const pagination = computed(() => queries.list.data.value?.pagination);

function toggleSort(col: ColumnDef<any>) {
  if (col.sortable) {
    crudActions.toggleSort(col.key as string);
  }
}

function sortIndicator(key: string) {
  if (state.sortBy.value !== key) return "";
  return state.sortDir.value === "asc" ? " \u2191" : " \u2193";
}

function getColumnClass(col: ColumnDef<any>) {
  const classes = [];
  if (col.sortable) classes.push("cursor-pointer select-none");
  if (col.align === "right") classes.push("text-right");
  else if (col.align === "center") classes.push("text-center");
  else classes.push("pl-4");
  return classes.join(" ");
}

function getCellClass(col: ColumnDef<any>) {
  const classes = [];
  if (col.align === "right") classes.push("text-right");
  else if (col.align === "center") classes.push("text-center");
  else classes.push("pl-4");
  return classes.join(" ");
}

function getRowClass(clickable?: boolean) {
  return clickable ? "cursor-pointer group group/row" : "group/row";
}
</script>

<template>
  <div class="space-y-4">
    <!-- Toolbar with Search and custom filters slot -->
    <DataToolbar
      :model-value="state.search.value"
      @update:model-value="crudActions.setSearch"
      placeholder="Search..."
      :count="pagination?.total"
    >
      <slot name="filters" :crud="crud" />
    </DataToolbar>

    <!-- Loading State -->
    <Card v-if="isLoading">
      <CardContent class="p-0">
        <div v-for="i in 5" :key="i" class="flex items-center gap-4 border-b px-4 py-3.5 last:border-0">
          <div class="flex-1 space-y-1.5">
            <Skeleton class="h-3.5 w-28" />
            <Skeleton class="h-3 w-48" />
          </div>
          <Skeleton class="h-3 w-20" />
        </div>
      </CardContent>
    </Card>

    <template v-else>
      <!-- Empty State -->
      <Card v-if="!data.length">
        <EmptyState
          title="No results found"
          :description="state.search.value || Object.keys(state.customFilters.value).length ? 'Try adjusting your search or filters.' : 'There are no records to display.'"
          icon="inbox"
        >
          <slot name="empty-actions" />
        </EmptyState>
      </Card>

      <!-- Data Table -->
      <Card v-else>
        <CardContent class="p-0">
          <Table>
            <TableHeader>
              <TableRow class="hover:bg-transparent">
                <TableHead
                  v-for="col in columns"
                  :key="col.key as string"
                  :class="getColumnClass(col)"
                  :style="{ width: col.width }"
                  @click="toggleSort(col)"
                >
                  {{ col.label }}{{ col.sortable ? sortIndicator(col.key as string) : "" }}
                </TableHead>
                <TableHead v-if="actions?.length" class="text-right pr-4">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow
                v-for="(row, idx) in data"
                :key="row.id || idx"
                :class="getRowClass(rowClickable)"
                @click="rowClickable && emit('row-click', row)"
              >
                <TableCell
                  v-for="col in columns"
                  :key="col.key as string"
                  :class="getCellClass(col)"
                >
                  <slot :name="`cell-${col.key as string}`" :row="row" :value="row[col.key]">
                    {{ row[col.key] }}
                  </slot>
                </TableCell>
                
                <TableCell v-if="actions?.length" class="text-right pr-4" @click.stop>
                  <div class="flex items-center justify-end gap-1 opacity-0 group-hover/row:opacity-100 transition-opacity">
                    <template v-for="action in actions" :key="action.key">
                      <Button
                        v-if="!action.show || action.show(row)"
                        :variant="action.variant || 'ghost'"
                        size="sm"
                        class="h-7 text-xs"
                        :class="action.variant === 'destructive' ? 'text-destructive hover:text-destructive' : ''"
                        @click="action.onClick(row)"
                      >
                        {{ action.label }}
                      </Button>
                    </template>
                  </div>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>

        <!-- Pagination -->
        <Pagination
          v-if="pagination && pagination.totalPages > 1"
          :page="state.page.value"
          :page-size="pagination.pageSize"
          :total="pagination.total"
          :total-pages="pagination.totalPages"
          class="px-4 pb-4"
          @update:page="state.page.value = $event"
        />
      </Card>
    </template>
  </div>
</template>
