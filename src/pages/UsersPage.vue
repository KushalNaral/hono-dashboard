<script setup lang="ts">
import { ref, computed } from "vue";
import { useQuery, useMutation, useQueryClient } from "@tanstack/vue-query";
import { api } from "@/lib/api";
import { useToast } from "@/composables/useToast";
import { useAuthStore } from "@/stores/auth";
import type { User } from "@/types/api";
import PageHeader from "@/components/PageHeader.vue";
import DataToolbar from "@/components/DataToolbar.vue";
import EmptyState from "@/components/EmptyState.vue";
import Skeleton from "@/components/Skeleton.vue";
import { Button } from "@/components/ui/button";
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
import { Select } from "@/components/ui/select";

const auth = useAuthStore();
const queryClient = useQueryClient();
const { toast } = useToast();
const search = ref("");

const { data, isLoading } = useQuery({
  queryKey: ["users"],
  queryFn: () => api.listUsers(),
});

const filteredUsers = computed(() => {
  if (!data.value?.users) return [];
  if (!search.value) return data.value.users;
  const q = search.value.toLowerCase();
  return data.value.users.filter(
    (u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q),
  );
});

const roleOptions = [
  { label: "Admin", value: "admin" },
  { label: "Moderator", value: "moderator" },
  { label: "User", value: "user" },
];

const editingUser = ref<User | null>(null);
const selectedRole = ref("");
const dialogOpen = ref(false);

function openRoleDialog(user: User) {
  editingUser.value = user;
  selectedRole.value = user.role;
  dialogOpen.value = true;
}

const setRoleMutation = useMutation({
  mutationFn: ({ userId, role }: { userId: string; role: string }) =>
    api.setUserRole(userId, role),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["users"] });
    toast({ title: "Role updated", variant: "success" });
    dialogOpen.value = false;
  },
  onError: (err) => {
    toast({ title: "Failed to update role", description: String(err), variant: "destructive" });
  },
});

function saveRole() {
  if (!editingUser.value) return;
  setRoleMutation.mutate({ userId: editingUser.value.id, role: selectedRole.value });
}

function roleBadgeVariant(role: string) {
  if (role === "admin") return "default" as const;
  if (role === "moderator") return "secondary" as const;
  return "outline" as const;
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
</script>

<template>
  <div class="space-y-6">
    <PageHeader title="Users" description="Manage user accounts and roles" />

    <DataToolbar
      v-model="search"
      placeholder="Search by name or email..."
      :count="filteredUsers.length"
    />

    <!-- Loading skeleton -->
    <Card v-if="isLoading">
      <CardContent class="p-0">
        <div class="space-y-0">
          <div v-for="i in 5" :key="i" class="flex items-center gap-4 border-b px-4 py-3 last:border-0">
            <Skeleton class="h-9 w-9 rounded-full" />
            <div class="flex-1 space-y-1.5">
              <Skeleton class="h-3.5 w-32" />
              <Skeleton class="h-3 w-48" />
            </div>
            <Skeleton class="h-5 w-16 rounded-full" />
          </div>
        </div>
      </CardContent>
    </Card>

    <Card v-else-if="filteredUsers.length === 0">
      <EmptyState
        title="No users found"
        :description="search ? 'Try adjusting your search.' : 'No users registered yet.'"
        icon="search"
      />
    </Card>

    <Card v-else>
      <CardContent class="p-0">
        <Table>
          <TableHeader>
            <TableRow class="hover:bg-transparent">
              <TableHead class="pl-4">User</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead v-if="auth.isAdmin" class="text-right pr-4">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow v-for="user in filteredUsers" :key="user.id">
              <TableCell class="pl-4">
                <div class="flex items-center gap-3">
                  <div class="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-primary/60 to-primary text-[11px] font-semibold text-primary-foreground">
                    {{ user.name?.charAt(0)?.toUpperCase() ?? "?" }}
                  </div>
                  <div>
                    <p class="font-medium text-sm leading-tight">{{ user.name }}</p>
                    <p class="text-xs text-muted-foreground">{{ user.email }}</p>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <Badge :variant="roleBadgeVariant(user.role)">{{ user.role }}</Badge>
              </TableCell>
              <TableCell>
                <div class="flex items-center gap-1.5">
                  <span class="h-1.5 w-1.5 rounded-full" :class="user.banned ? 'bg-destructive' : 'bg-success'" />
                  <span class="text-xs">{{ user.banned ? "Banned" : "Active" }}</span>
                </div>
              </TableCell>
              <TableCell class="text-muted-foreground text-xs">{{ formatDate(user.createdAt) }}</TableCell>
              <TableCell v-if="auth.isAdmin" class="text-right pr-4">
                <Button variant="ghost" size="sm" class="h-7 text-xs" @click="openRoleDialog(user)">
                  Change role
                </Button>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>

    <!-- Change role dialog -->
    <Dialog v-model:open="dialogOpen">
      <DialogHeader>
        <DialogTitle>Change User Role</DialogTitle>
        <DialogDescription>
          Update role for <span class="font-medium text-foreground">{{ editingUser?.name }}</span>
        </DialogDescription>
      </DialogHeader>
      <div class="py-4">
        <Select v-model="selectedRole" :options="roleOptions" placeholder="Select role" />
      </div>
      <DialogFooter>
        <Button variant="outline" @click="dialogOpen = false">Cancel</Button>
        <Button :disabled="setRoleMutation.isPending.value" @click="saveRole">
          {{ setRoleMutation.isPending.value ? "Saving..." : "Save" }}
        </Button>
      </DialogFooter>
    </Dialog>
  </div>
</template>
