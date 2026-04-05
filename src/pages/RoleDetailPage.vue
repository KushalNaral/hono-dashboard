<script setup lang="ts">
import { ref, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/vue-query";
import { api } from "@/lib/api";
import { useToast } from "@/composables/useToast";
import { useAuthStore } from "@/stores/auth";
import Breadcrumb from "@/components/Breadcrumb.vue";
import Skeleton from "@/components/Skeleton.vue";
import EmptyState from "@/components/EmptyState.vue";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";

const route = useRoute();
const router = useRouter();
const auth = useAuthStore();
const queryClient = useQueryClient();
const { toast } = useToast();

const roleId = computed(() => route.params.id as string);

const { data: roleData, isLoading } = useQuery({
  queryKey: ["role", roleId],
  queryFn: () => api.getRole(roleId.value),
});

const { data: allPermissions } = useQuery({
  queryKey: ["all-permissions"],
  queryFn: () => api.listAllPermissions(),
  enabled: auth.hasPermission("view-permissions"),
});

const role = computed(() => roleData.value?.data);

// Edit
const editOpen = ref(false);
const editName = ref("");
const editDescription = ref("");
const editPermissions = ref<string[]>([]);

function openEdit() {
  if (!role.value) return;
  editName.value = role.value.name;
  editDescription.value = role.value.description ?? "";
  editPermissions.value = [...role.value.permissions];
  editOpen.value = true;
}

function togglePermission(name: string) {
  const idx = editPermissions.value.indexOf(name);
  if (idx >= 0) editPermissions.value.splice(idx, 1);
  else editPermissions.value.push(name);
}

const updateMutation = useMutation({
  mutationFn: (d: { name: string; description?: string; permissions: string[] }) =>
    api.updateRole(roleId.value, d),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["role", roleId.value] });
    queryClient.invalidateQueries({ queryKey: ["roles"] });
    toast({ title: "Role updated", variant: "success" });
    editOpen.value = false;
  },
  onError: (err) => {
    toast({ title: "Update failed", description: String(err), variant: "destructive" });
  },
});

function saveEdit() {
  updateMutation.mutate({
    name: editName.value.trim(),
    description: editDescription.value.trim() || undefined,
    permissions: editPermissions.value,
  });
}

// Assets
const fileInput = ref<HTMLInputElement | null>(null);

const uploadMutation = useMutation({
  mutationFn: (file: File) => api.uploadAsset("roles", roleId.value, file),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["role", roleId.value] });
    toast({ title: "File uploaded", variant: "success" });
  },
  onError: (err) => {
    toast({ title: "Upload failed", description: String(err), variant: "destructive" });
  },
});

function onFileSelect(event: Event) {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (file) uploadMutation.mutate(file);
  target.value = "";
}

const deleteAssetMutation = useMutation({
  mutationFn: (assetId: string) => api.deleteAsset("roles", roleId.value, assetId),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["role", roleId.value] });
    toast({ title: "Asset deleted", variant: "success" });
  },
  onError: (err) => {
    toast({ title: "Delete failed", description: String(err), variant: "destructive" });
  },
});

// Delete role
const deleteOpen = ref(false);

const deleteMutation = useMutation({
  mutationFn: () => api.deleteRole(roleId.value),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["roles"] });
    toast({ title: "Role deleted", variant: "success" });
    router.push("/roles");
  },
  onError: (err) => {
    toast({ title: "Delete failed", description: String(err), variant: "destructive" });
  },
});

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric", month: "short", day: "numeric",
  });
}

const groupedPermissions = computed(() => {
  const perms = allPermissions.value?.data ?? [];
  const groups: Record<string, typeof perms> = {};
  for (const p of perms) {
    const group = p.groupName ?? "other";
    if (!groups[group]) groups[group] = [];
    groups[group].push(p);
  }
  return groups;
});

function mimeIcon(mime: string) {
  if (mime.startsWith("image/")) return "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4 M18 8l-6-6-6 6 M12 2v13";
  return "M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z M13 2v7h7";
}
</script>

<template>
  <div class="space-y-6">
    <Breadcrumb :items="[
      { label: 'Roles', to: '/roles' },
      { label: role?.name ?? 'Loading...' },
    ]" />

    <!-- Loading -->
    <div v-if="isLoading" class="space-y-6">
      <div class="flex items-center justify-between">
        <div class="space-y-2">
          <Skeleton class="h-7 w-40" />
          <Skeleton class="h-4 w-64" />
        </div>
        <div class="flex gap-2">
          <Skeleton class="h-9 w-16 rounded-md" />
          <Skeleton class="h-9 w-20 rounded-md" />
        </div>
      </div>
      <Card>
        <CardContent class="p-6 space-y-3">
          <Skeleton class="h-4 w-24" />
          <div class="flex flex-wrap gap-2">
            <Skeleton v-for="i in 6" :key="i" class="h-6 w-20 rounded-full" />
          </div>
        </CardContent>
      </Card>
    </div>

    <template v-else-if="role">
      <!-- Header -->
      <div class="flex items-start justify-between">
        <div class="space-y-1">
          <div class="flex items-center gap-3">
            <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-primary"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            </div>
            <h1 class="text-2xl font-semibold tracking-tight">{{ role.name }}</h1>
          </div>
          <p v-if="role.description" class="text-sm text-muted-foreground ml-[52px]">{{ role.description }}</p>
        </div>
        <div class="flex gap-2">
          <Button v-if="auth.hasPermission('update-roles')" variant="outline" size="sm" @click="openEdit">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-1.5"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>
            Edit
          </Button>
          <Button v-if="auth.hasPermission('delete-roles')" variant="destructive" size="sm" @click="deleteOpen = true">
            Delete
          </Button>
        </div>
      </div>

      <div class="grid gap-6 lg:grid-cols-5">
        <!-- Permissions -->
        <Card class="lg:col-span-3">
          <CardHeader>
            <div class="flex items-center justify-between">
              <div>
                <CardTitle class="text-base">Permissions</CardTitle>
                <CardDescription>{{ role.permissions.length }} assigned</CardDescription>
              </div>
              <Badge variant="secondary">{{ role.permissions.length }}</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div v-if="role.permissions.length > 0" class="flex flex-wrap gap-1.5">
              <Badge v-for="perm in role.permissions" :key="perm" variant="secondary" class="text-[11px] font-mono">
                {{ perm }}
              </Badge>
            </div>
            <p v-else class="text-sm text-muted-foreground">No permissions assigned</p>
          </CardContent>
        </Card>

        <!-- Metadata -->
        <Card class="lg:col-span-2">
          <CardHeader>
            <CardTitle class="text-base">Details</CardTitle>
          </CardHeader>
          <CardContent class="space-y-4 text-sm">
            <div class="flex justify-between">
              <span class="text-muted-foreground">ID</span>
              <span class="font-mono text-xs truncate max-w-[180px]">{{ role.id }}</span>
            </div>
            <Separator />
            <div class="flex justify-between">
              <span class="text-muted-foreground">Created</span>
              <span>{{ formatDate(role.createdAt) }}</span>
            </div>
            <Separator />
            <div class="flex justify-between">
              <span class="text-muted-foreground">Updated</span>
              <span>{{ formatDate(role.updatedAt) }}</span>
            </div>
            <Separator />
            <div class="flex justify-between">
              <span class="text-muted-foreground">Assets</span>
              <span>{{ role.assets?.length ?? 0 }} files</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <!-- Assets -->
      <Card>
        <CardHeader class="flex flex-row items-center justify-between">
          <div>
            <CardTitle class="text-base">Assets</CardTitle>
            <CardDescription>Attached files and resources</CardDescription>
          </div>
          <div v-if="auth.hasPermission('update-roles')">
            <input ref="fileInput" type="file" class="hidden" @change="onFileSelect" />
            <Button
              variant="outline"
              size="sm"
              :disabled="uploadMutation.isPending.value"
              @click="fileInput?.click()"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-1.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
              {{ uploadMutation.isPending.value ? "Uploading..." : "Upload" }}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div v-if="role.assets?.length" class="rounded-lg border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow class="hover:bg-transparent">
                  <TableHead class="pl-4">File</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Uploaded</TableHead>
                  <TableHead v-if="auth.hasPermission('update-roles')" class="text-right pr-4" />
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow v-for="asset in role.assets" :key="asset.id" class="group">
                  <TableCell class="pl-4">
                    <div class="flex items-center gap-3">
                      <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-muted-foreground"><path :d="mimeIcon(asset.mimeType)" /></svg>
                      </div>
                      <span class="font-medium text-sm">{{ asset.originalName }}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" class="text-[10px] font-mono">{{ asset.mimeType }}</Badge>
                  </TableCell>
                  <TableCell class="text-muted-foreground text-xs">{{ formatSize(asset.size) }}</TableCell>
                  <TableCell class="text-muted-foreground text-xs">{{ formatDate(asset.createdAt) }}</TableCell>
                  <TableCell v-if="auth.hasPermission('update-roles')" class="text-right pr-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      class="h-7 text-xs text-destructive hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                      :disabled="deleteAssetMutation.isPending.value"
                      @click="deleteAssetMutation.mutate(asset.id)"
                    >
                      Remove
                    </Button>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
          <EmptyState v-else title="No assets" description="Upload files to attach them to this role." icon="file" />
        </CardContent>
      </Card>
    </template>

    <!-- Edit dialog -->
    <Dialog v-model:open="editOpen">
      <DialogHeader>
        <DialogTitle>Edit Role</DialogTitle>
        <DialogDescription>Update role details and permissions</DialogDescription>
      </DialogHeader>
      <form class="space-y-4 py-4 max-h-[60vh] overflow-y-auto" @submit.prevent="saveEdit">
        <div class="space-y-2">
          <Label for="edit-name">Name</Label>
          <Input id="edit-name" v-model="editName" />
        </div>
        <div class="space-y-2">
          <Label for="edit-desc">Description</Label>
          <Textarea id="edit-desc" v-model="editDescription" />
        </div>
        <Separator />
        <div class="space-y-3">
          <Label>Permissions</Label>
          <div v-for="(perms, group) in groupedPermissions" :key="group" class="space-y-2">
            <p class="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">{{ group }}</p>
            <div class="flex flex-wrap gap-1.5">
              <button
                v-for="p in perms"
                :key="p.id"
                type="button"
                class="inline-flex items-center rounded-md border px-2.5 py-1 text-xs font-medium transition-all cursor-pointer"
                :class="editPermissions.includes(p.name)
                  ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                  : 'bg-background text-muted-foreground border-input hover:bg-accent hover:text-accent-foreground'"
                @click="togglePermission(p.name)"
              >
                {{ p.name }}
              </button>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" type="button" @click="editOpen = false">Cancel</Button>
          <Button type="submit" :disabled="updateMutation.isPending.value">
            {{ updateMutation.isPending.value ? "Saving..." : "Save Changes" }}
          </Button>
        </DialogFooter>
      </form>
    </Dialog>

    <!-- Delete dialog -->
    <Dialog v-model:open="deleteOpen">
      <DialogHeader>
        <DialogTitle>Delete Role</DialogTitle>
        <DialogDescription>
          This will permanently delete <span class="font-medium text-foreground">"{{ role?.name }}"</span> and all attached assets.
        </DialogDescription>
      </DialogHeader>
      <DialogFooter class="pt-4">
        <Button variant="outline" @click="deleteOpen = false">Cancel</Button>
        <Button variant="destructive" :disabled="deleteMutation.isPending.value" @click="deleteMutation.mutate()">
          {{ deleteMutation.isPending.value ? "Deleting..." : "Delete Role" }}
        </Button>
      </DialogFooter>
    </Dialog>
  </div>
</template>
