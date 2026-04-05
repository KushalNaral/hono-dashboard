<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { useQuery, useMutation, useQueryClient } from "@tanstack/vue-query";
import { api } from "@/lib/api";
import { useToast } from "@/composables/useToast";
import { useAuthStore } from "@/stores/auth";
import type { Permission, ListParams } from "@/types/api";
import PageHeader from "@/components/PageHeader.vue";
import DataToolbar from "@/components/DataToolbar.vue";
import EmptyState from "@/components/EmptyState.vue";
import Pagination from "@/components/Pagination.vue";
import Skeleton from "@/components/Skeleton.vue";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

const auth = useAuthStore();
const queryClient = useQueryClient();
const { toast } = useToast();

const page = ref(1);
const pageSize = ref(20);
const search = ref("");
const sortBy = ref("name");
const sortDir = ref<"asc" | "desc">("asc");

const params = computed<ListParams>(() => ({
  page: page.value,
  pageSize: pageSize.value,
  sortBy: sortBy.value,
  sortDir: sortDir.value,
  ...(search.value ? { name_like: search.value } : {}),
}));

const { data, isLoading } = useQuery({
  queryKey: ["permissions", params],
  queryFn: () => api.listPermissions(params.value),
});

const createOpen = ref(false);
const newName = ref("");
const newDescription = ref("");
const newGroup = ref("");

const createMutation = useMutation({
  mutationFn: (d: { name: string; description?: string; groupName?: string }) =>
    api.createPermission(d),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["permissions"] });
    toast({ title: "Permission created", variant: "success" });
    createOpen.value = false;
    newName.value = "";
    newDescription.value = "";
    newGroup.value = "";
  },
  onError: (err) => {
    toast({ title: "Failed to create", description: String(err), variant: "destructive" });
  },
});

function handleCreate() {
  if (!newName.value.trim()) return;
  createMutation.mutate({
    name: newName.value.trim(),
    description: newDescription.value.trim() || undefined,
    groupName: newGroup.value.trim() || undefined,
  });
}

const deleteTarget = ref<Permission | null>(null);
const deleteOpen = ref(false);

const deleteMutation = useMutation({
  mutationFn: (id: string) => api.deletePermission(id),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["permissions"] });
    toast({ title: "Permission deleted", variant: "success" });
    deleteOpen.value = false;
  },
  onError: (err) => {
    toast({ title: "Failed to delete", description: String(err), variant: "destructive" });
  },
});

function confirmDelete(perm: Permission) {
  deleteTarget.value = perm;
  deleteOpen.value = true;
}

function toggleSort(col: string) {
  if (sortBy.value === col) {
    sortDir.value = sortDir.value === "asc" ? "desc" : "asc";
  } else {
    sortBy.value = col;
    sortDir.value = "asc";
  }
}

function sortIndicator(col: string) {
  if (sortBy.value !== col) return "";
  return sortDir.value === "asc" ? " \u2191" : " \u2193";
}

watch(search, () => { page.value = 1; });

const groupVariantMap: Record<string, "default" | "secondary" | "outline" | "success"> = {
  users: "default",
  roles: "secondary",
  permissions: "outline",
  general: "success",
};

function groupVariant(group: string | null) {
  return groupVariantMap[group ?? ""] ?? "outline";
}
</script>

<template>
  <div class="space-y-6">
    <PageHeader title="Permissions" description="View and manage system permissions">
      <template #actions>
        <Button v-if="auth.hasPermission('create-roles')" @click="createOpen = true">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-1.5"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
          New Permission
        </Button>
      </template>
    </PageHeader>

    <DataToolbar
      v-model="search"
      placeholder="Search permissions..."
      :count="data?.pagination?.total"
    />

    <Card v-if="isLoading">
      <CardContent class="p-0">
        <div v-for="i in 5" :key="i" class="flex items-center gap-4 border-b px-4 py-3.5 last:border-0">
          <div class="flex-1 space-y-1.5">
            <Skeleton class="h-3.5 w-28" />
            <Skeleton class="h-3 w-40" />
          </div>
          <Skeleton class="h-5 w-14 rounded-full" />
        </div>
      </CardContent>
    </Card>

    <template v-else>
      <Card v-if="!data?.data?.length">
        <EmptyState
          title="No permissions found"
          :description="search ? 'Try adjusting your search.' : 'Create your first permission.'"
          icon="inbox"
        >
          <Button v-if="!search && auth.hasPermission('create-roles')" size="sm" @click="createOpen = true">
            Create Permission
          </Button>
        </EmptyState>
      </Card>

      <Card v-else>
        <CardContent class="p-0">
          <Table>
            <TableHeader>
              <TableRow class="hover:bg-transparent">
                <TableHead class="pl-4 cursor-pointer select-none" @click="toggleSort('name')">
                  Name{{ sortIndicator("name") }}
                </TableHead>
                <TableHead>Description</TableHead>
                <TableHead class="cursor-pointer select-none" @click="toggleSort('groupName')">
                  Group{{ sortIndicator("groupName") }}
                </TableHead>
                <TableHead v-if="auth.hasPermission('delete-roles')" class="text-right pr-4">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow v-for="perm in data?.data" :key="perm.id" class="group">
                <TableCell class="pl-4">
                  <div class="flex items-center gap-3">
                    <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-secondary-foreground/70"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" /></svg>
                    </div>
                    <span class="font-medium text-sm font-mono">{{ perm.name }}</span>
                  </div>
                </TableCell>
                <TableCell class="text-muted-foreground text-sm max-w-xs truncate">
                  {{ perm.description || "No description" }}
                </TableCell>
                <TableCell>
                  <Badge v-if="perm.groupName" :variant="groupVariant(perm.groupName)" class="text-[11px]">
                    {{ perm.groupName }}
                  </Badge>
                  <span v-else class="text-xs text-muted-foreground">—</span>
                </TableCell>
                <TableCell v-if="auth.hasPermission('delete-roles')" class="text-right pr-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    class="h-7 text-xs text-destructive hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                    @click="confirmDelete(perm)"
                  >
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>

        <Pagination
          v-if="data?.pagination && data.pagination.totalPages > 1"
          :page="page"
          :page-size="data.pagination.pageSize"
          :total="data.pagination.total"
          :total-pages="data.pagination.totalPages"
          class="px-4 pb-4"
          @update:page="page = $event"
        />
      </Card>
    </template>

    <!-- Create -->
    <Dialog v-model:open="createOpen">
      <DialogHeader>
        <DialogTitle>Create Permission</DialogTitle>
        <DialogDescription>Add a new permission to the system</DialogDescription>
      </DialogHeader>
      <form class="space-y-4 py-4" @submit.prevent="handleCreate">
        <div class="space-y-2">
          <Label for="perm-name">Name</Label>
          <Input id="perm-name" v-model="newName" placeholder="e.g. view-reports" />
        </div>
        <div class="space-y-2">
          <Label for="perm-desc">Description</Label>
          <Input id="perm-desc" v-model="newDescription" placeholder="Optional description" />
        </div>
        <div class="space-y-2">
          <Label for="perm-group">Group</Label>
          <Input id="perm-group" v-model="newGroup" placeholder="e.g. reports" />
        </div>
        <DialogFooter>
          <Button variant="outline" type="button" @click="createOpen = false">Cancel</Button>
          <Button type="submit" :disabled="createMutation.isPending.value || !newName.trim()">
            {{ createMutation.isPending.value ? "Creating..." : "Create" }}
          </Button>
        </DialogFooter>
      </form>
    </Dialog>

    <!-- Delete -->
    <Dialog v-model:open="deleteOpen">
      <DialogHeader>
        <DialogTitle>Delete Permission</DialogTitle>
        <DialogDescription>
          Are you sure you want to delete <span class="font-medium text-foreground">"{{ deleteTarget?.name }}"</span>? This will remove it from all roles.
        </DialogDescription>
      </DialogHeader>
      <DialogFooter class="pt-4">
        <Button variant="outline" @click="deleteOpen = false">Cancel</Button>
        <Button
          variant="destructive"
          :disabled="deleteMutation.isPending.value"
          @click="deleteTarget && deleteMutation.mutate(deleteTarget.id)"
        >
          {{ deleteMutation.isPending.value ? "Deleting..." : "Delete" }}
        </Button>
      </DialogFooter>
    </Dialog>
  </div>
</template>
