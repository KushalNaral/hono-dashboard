<script setup lang="ts">
import { ref, computed } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import Skeleton from "@/components/Skeleton.vue";

const auth = useAuthStore();
const router = useRouter();
const route = useRoute();
const collapsed = ref(false);

interface NavSection {
  title: string;
  items: NavItem[];
}

interface NavItem {
  label: string;
  to: string;
  icon: string;
  permission?: string;
  badge?: string;
}

const navSections = computed<NavSection[]>(() => {
  const sections: NavSection[] = [
    {
      title: "Overview",
      items: [
        { label: "Dashboard", to: "/", icon: "dashboard" },
        { label: "Activity", to: "/activity", icon: "activity" },
      ],
    },
    {
      title: "Access Control",
      items: [
        { label: "Users", to: "/users", icon: "users", permission: "list-users" },
        { label: "Roles", to: "/roles", icon: "shield", permission: "list-roles" },
        { label: "Permissions", to: "/permissions", icon: "key", permission: "view-permissions" },
      ],
    },
    {
      title: "System",
      items: [
        { label: "Settings", to: "/settings", icon: "settings" },
      ],
    },
  ];

  return sections
    .map((s) => ({
      ...s,
      items: s.items.filter((i) => !i.permission || auth.hasPermission(i.permission)),
    }))
    .filter((s) => s.items.length > 0);
});

function isActive(path: string) {
  if (path === "/") return route.path === "/";
  return route.path.startsWith(path);
}

async function logout() {
  await auth.signOut();
  router.push("/login");
}

const icons: Record<string, string> = {
  dashboard: "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10",
  activity: "M22 12h-4l-3 9L9 3l-3 9H2",
  users: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2 M12 3a4 4 0 1 1-8 0 4 4 0 0 1 8 0 M22 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75",
  shield: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
  key: "M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4",
  settings: "M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z",
  logout: "M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4 M16 17l5-5-5-5 M21 12H9",
  collapse: "M11 19l-7-7 7-7 M18 19l-7-7 7-7",
  expand: "M13 5l7 7-7 7 M6 5l7 7-7 7",
};
</script>

<template>
  <!-- Loading state -->
  <div v-if="auth.loading" class="flex h-screen items-center justify-center bg-background">
    <div class="flex flex-col items-center gap-4">
      <div class="flex h-12 w-12 items-center justify-center rounded-xl bg-primary">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-primary-foreground"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/></svg>
      </div>
      <div class="space-y-2">
        <Skeleton class="h-4 w-32" />
        <Skeleton class="h-3 w-24 mx-auto" />
      </div>
    </div>
  </div>

  <!-- App shell -->
  <div v-else class="flex h-screen overflow-hidden bg-background">
    <!-- Sidebar -->
    <aside
      class="flex flex-col border-r bg-sidebar-background transition-all duration-200"
      :class="collapsed ? 'w-[68px]' : 'w-60'"
    >
      <!-- Logo -->
      <div class="flex h-14 items-center border-b px-4" :class="collapsed ? 'justify-center' : 'gap-3'">
        <div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="text-primary-foreground"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/></svg>
        </div>
        <span v-if="!collapsed" class="font-semibold text-sm text-sidebar-foreground truncate">
          Hono Dashboard
        </span>
      </div>

      <!-- Nav -->
      <nav class="flex-1 overflow-y-auto p-3 space-y-6">
        <div v-for="section in navSections" :key="section.title">
          <p
            v-if="!collapsed"
            class="mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-sidebar-muted"
          >
            {{ section.title }}
          </p>
          <Separator v-else class="mb-2" />
          <div class="space-y-0.5">
            <RouterLink
              v-for="item in section.items"
              :key="item.to"
              :to="item.to"
              class="group flex items-center rounded-lg text-[13px] font-medium transition-all duration-150"
              :class="[
                collapsed ? 'justify-center px-0 py-2.5' : 'gap-3 px-3 py-2',
                isActive(item.to)
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground shadow-sm'
                  : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
              ]"
              :title="collapsed ? item.label : undefined"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="shrink-0" :class="isActive(item.to) ? 'text-sidebar-primary' : 'text-sidebar-foreground/50 group-hover:text-sidebar-foreground/70'">
                <path :d="icons[item.icon]" />
              </svg>
              <span v-if="!collapsed" class="truncate">{{ item.label }}</span>
            </RouterLink>
          </div>
        </div>
      </nav>

      <!-- Footer -->
      <div class="border-t p-3 space-y-2">
        <!-- Collapse toggle -->
        <button
          class="flex w-full items-center rounded-lg px-3 py-2 text-[13px] font-medium text-sidebar-foreground/60 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground transition-colors cursor-pointer"
          :class="collapsed ? 'justify-center px-0' : 'gap-3'"
          @click="collapsed = !collapsed"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="shrink-0">
            <path :d="icons[collapsed ? 'expand' : 'collapse']" />
          </svg>
          <span v-if="!collapsed">Collapse</span>
        </button>

        <Separator />

        <!-- User -->
        <div
          class="flex items-center rounded-lg p-2 transition-colors"
          :class="collapsed ? 'justify-center' : 'gap-3'"
        >
          <div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary/80 to-primary text-[11px] font-semibold text-primary-foreground">
            {{ auth.user?.name?.charAt(0)?.toUpperCase() ?? "?" }}
          </div>
          <div v-if="!collapsed" class="flex-1 min-w-0">
            <p class="text-sm font-medium truncate leading-tight">{{ auth.user?.name }}</p>
            <p class="text-[11px] text-sidebar-muted truncate">{{ auth.user?.email }}</p>
          </div>
        </div>

        <Button
          variant="ghost"
          :size="collapsed ? 'icon' : 'sm'"
          :class="collapsed ? '' : 'w-full justify-start gap-3'"
          class="text-sidebar-foreground/60 hover:text-destructive"
          @click="logout"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="shrink-0"><path :d="icons.logout" /></svg>
          <span v-if="!collapsed">Sign out</span>
        </Button>
      </div>
    </aside>

    <!-- Main -->
    <main class="flex-1 overflow-y-auto">
      <div class="mx-auto max-w-6xl px-6 py-6 animate-in">
        <RouterView />
      </div>
    </main>
  </div>
</template>
