<script setup lang="ts">
import { computed } from "vue";
import { useAuthStore } from "@/stores/auth";
import { useQuery } from "@tanstack/vue-query";
import { api } from "@/lib/api";
import PageHeader from "@/components/PageHeader.vue";
import StatCard from "@/components/StatCard.vue";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const auth = useAuthStore();

const { data: rolesData, isLoading: rolesLoading } = useQuery({
  queryKey: ["roles-count"],
  queryFn: () => api.listRoles({ page: 1, pageSize: 1 }),
  enabled: auth.hasPermission("list-roles"),
});

const { data: permissionsData, isLoading: permissionsLoading } = useQuery({
  queryKey: ["permissions-count"],
  queryFn: () => api.listPermissions({ page: 1, pageSize: 1 }),
  enabled: auth.hasPermission("view-permissions"),
});

const { data: usersData, isLoading: usersLoading } = useQuery({
  queryKey: ["users-count"],
  queryFn: () => api.listUsers(),
  enabled: auth.hasPermission("list-users"),
});

const greeting = computed(() => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
});

// Group permissions by category
const groupedPermissions = computed(() => {
  const groups: Record<string, string[]> = {};
  for (const perm of auth.userPermissions) {
    const parts = perm.split("-");
    const group = parts.length > 1 ? parts[parts.length - 1] : "general";
    if (!groups[group]) groups[group] = [];
    groups[group].push(perm);
  }
  return groups;
});

const quickLinks = [
  { label: "Manage Users", to: "/users", icon: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2", permission: "list-users" },
  { label: "Manage Roles", to: "/roles", icon: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z", permission: "list-roles" },
  { label: "View Activity", to: "/activity", icon: "M22 12h-4l-3 9L9 3l-3 9H2" },
  { label: "Settings", to: "/settings", icon: "M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" },
];

const visibleLinks = computed(() =>
  quickLinks.filter((l) => !l.permission || auth.hasPermission(l.permission)),
);
</script>

<template>
  <div class="space-y-8">
    <!-- Greeting -->
    <PageHeader
      :title="`${greeting}, ${auth.user?.name?.split(' ')[0] ?? 'there'}`"
      description="Here's an overview of your system."
    />

    <!-- Stats -->
    <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        v-if="auth.hasPermission('list-users')"
        title="Total Users"
        :value="usersData?.users?.length"
        :loading="usersLoading"
        icon="users"
        subtitle="Registered accounts"
      />
      <StatCard
        v-if="auth.hasPermission('list-roles')"
        title="Roles"
        :value="rolesData?.pagination?.total"
        :loading="rolesLoading"
        icon="shield"
        subtitle="Active roles"
      />
      <StatCard
        v-if="auth.hasPermission('view-permissions')"
        title="Permissions"
        :value="permissionsData?.pagination?.total"
        :loading="permissionsLoading"
        icon="key"
        subtitle="Defined permissions"
      />
      <StatCard
        title="Your Permissions"
        :value="auth.userPermissions.length"
        icon="activity"
        :subtitle="`As ${auth.userRole}`"
      />
    </div>

    <div class="grid gap-6 lg:grid-cols-3">
      <!-- Quick actions -->
      <Card class="lg:col-span-1">
        <CardHeader>
          <CardTitle class="text-base">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent class="grid gap-2">
          <RouterLink
            v-for="link in visibleLinks"
            :key="link.to"
            :to="link.to"
            class="flex items-center gap-3 rounded-lg border p-3 text-sm font-medium transition-all hover:bg-accent hover:shadow-sm"
          >
            <div class="flex h-9 w-9 items-center justify-center rounded-md bg-primary/10">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-primary"><path :d="link.icon" /></svg>
            </div>
            {{ link.label }}
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="ml-auto text-muted-foreground"><path d="m9 18 6-6-6-6"/></svg>
          </RouterLink>
        </CardContent>
      </Card>

      <!-- Profile card -->
      <Card class="lg:col-span-2">
        <CardHeader>
          <CardTitle class="text-base">Your Profile</CardTitle>
        </CardHeader>
        <CardContent class="space-y-6">
          <div class="flex items-center gap-4">
            <div class="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-primary/80 to-primary text-lg font-semibold text-primary-foreground">
              {{ auth.user?.name?.charAt(0)?.toUpperCase() ?? "?" }}
            </div>
            <div>
              <p class="font-semibold">{{ auth.user?.name }}</p>
              <p class="text-sm text-muted-foreground">{{ auth.user?.email }}</p>
            </div>
            <Badge class="ml-auto">{{ auth.userRole }}</Badge>
          </div>

          <!-- Permissions grouped -->
          <div v-if="auth.userPermissions.length > 0" class="space-y-3">
            <p class="text-sm font-medium text-muted-foreground">Your permissions</p>
            <div v-for="(perms, group) in groupedPermissions" :key="group" class="space-y-1.5">
              <p class="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/60">{{ group }}</p>
              <div class="flex flex-wrap gap-1.5">
                <Badge v-for="perm in perms" :key="perm" variant="secondary" class="text-[11px]">
                  {{ perm }}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
</template>
