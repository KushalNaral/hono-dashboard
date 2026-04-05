<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { useRouter } from "vue-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/vue-query";
import { api } from "@/lib/api";
import { useToast } from "@/composables/useToast";
import { useAuthStore } from "@/stores/auth";
import type { Role, ListParams } from "@/types/api";
import PageHeader from "@/components/PageHeader.vue";
import DataToolbar from "@/components/DataToolbar.vue";
import EmptyState from "@/components/EmptyState.vue";
import Pagination from "@/components/Pagination.vue";
import Skeleton from "@/components/Skeleton.vue";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
const router = useRouter();
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
  queryKey: ["roles", params],
  queryFn: () => api.listRoles(params.value),
});

const createOpen = ref(false);
const newName = ref("");
const newDescription = ref("");

const createMutation = useMutation({
  mutationFn: (d: { name: string; description?: string }) => api.createRole(d),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["roles"] });
    toast({ title: "Role created", variant: "success" });
    createOpen.value = false;
    newName.value = "";
    newDescription.value = "";
  },
  onError: (err) => {
    toast({ title: "Failed to create role", description: String(err), variant: "destructive" });
  },
});

function handleCreate() {
  if (!newName.value.trim()) return;
  createMutation.mutate({
    name: newName.value.trim(),
    description: newDescription.value.trim() || undefined,
  });
}

const deleteTarget = ref<Role | null>(null);
const deleteOpen = ref(false);

const deleteMutation = useMutation({
  mutationFn: (id: string) => api.deleteRole(id),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["roles"] });
    toast({ title: "Role deleted", variant: "success" });
    deleteOpen.value = false;
  },
  onError: (err) => {
    toast({ title: "Failed to delete", description: String(err), variant: "destructive" });
  },
});

function confirmDelete(role: Role) {
  deleteTarget.value = role;
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

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric", month: "short", day: "numeric",
  });
}
</script>

<template>
  <div class="space-y-6">
    <PageHeader title="Roles" description="Manage roles and their permissions">
      <template #actions>
        <Button v-if="auth.hasPermission('create-roles')" @click="createOpen = true">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-1.5"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
          New Role
        </Button>
      </template>
    </PageHeader>

    <DataToolbar
      v-model="search"
      placeholder="Search roles..."
      :count="data?.pagination?.total"
    />

    <!-- Loading -->
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
      <Card v-if="!data?.data?.length">
        <EmptyState
          title="No roles found"
          :description="search ? 'Try adjusting your search.' : 'Create your first role to get started.'"
          icon="inbox"
        >
          <Button v-if="!search && auth.hasPermission('create-roles')" size="sm" @click="createOpen = true">
            Create Role
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
                <TableHead class="cursor-pointer select-none" @click="toggleSort('createdAt')">
                  Created{{ sortIndicator("createdAt") }}
                </TableHead>
                <TableHead class="text-right pr-4">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow
                v-for="role in data?.data"
                :key="role.id"
                class="cursor-pointer group"
                @click="router.push(`/roles/${role.id}`)"
              >
                <TableCell class="pl-4">
                  <div class="flex items-center gap-3">
                    <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-primary"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                    </div>
                    <span class="font-medium text-sm group-hover:text-primary transition-colors">{{ role.name }}</span>
                  </div>
                </TableCell>
                <TableCell class="text-muted-foreground text-sm max-w-xs truncate">
                  {{ role.description || "No description" }}
                </TableCell>
                <TableCell class="text-muted-foreground text-xs">{{ formatDate(role.createdAt) }}</TableCell>
                <TableCell class="text-right pr-4" @click.stop>
                  <div class="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="sm" class="h-7 text-xs" @click="router.push(`/roles/${role.id}`)">
                      View
                    </Button>
                    <Button
                      v-if="auth.hasPermission('delete-roles')"
                      variant="ghost"
                      size="sm"
                      class="h-7 text-xs text-destructive hover:text-destructive"
                      @click="confirmDelete(role)"
                    >
                      Delete
                    </Button>
                  </div>
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
        <DialogTitle>Create Role</DialogTitle>
        <DialogDescription>Add a new role to the system</DialogDescription>
      </DialogHeader>
      <form class="space-y-4 py-4" @submit.prevent="handleCreate">
        <div class="space-y-2">
          <Label for="role-name">Name</Label>
          <Input id="role-name" v-model="newName" placeholder="e.g. editor" />
        </div>
        <div class="space-y-2">
          <Label for="role-desc">Description</Label>
          <Textarea id="role-desc" v-model="newDescription" placeholder="Optional description" />
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
        <DialogTitle>Delete Role</DialogTitle>
        <DialogDescription>
          Are you sure you want to delete <span class="font-medium text-foreground">"{{ deleteTarget?.name }}"</span>? This action cannot be undone.
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
