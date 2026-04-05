<script setup lang="ts">
import { ref } from "vue";
import PageHeader from "@/components/PageHeader.vue";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

// Dummy activity data for demonstration
const activities = ref([
  { id: "1", user: "Admin", action: "Updated role", target: "moderator", time: "2 minutes ago", type: "update" },
  { id: "2", user: "Admin", action: "Created permission", target: "view-reports", time: "15 minutes ago", type: "create" },
  { id: "3", user: "System", action: "User signed up", target: "jane@example.com", time: "1 hour ago", type: "create" },
  { id: "4", user: "Admin", action: "Deleted role", target: "legacy-viewer", time: "2 hours ago", type: "delete" },
  { id: "5", user: "Admin", action: "Assigned role", target: "john@example.com → moderator", time: "3 hours ago", type: "update" },
  { id: "6", user: "System", action: "User signed in", target: "admin@example.com", time: "4 hours ago", type: "info" },
  { id: "7", user: "Admin", action: "Uploaded asset", target: "logo.png → admin role", time: "5 hours ago", type: "create" },
  { id: "8", user: "System", action: "Database migration", target: "0006_create_asset_table", time: "1 day ago", type: "info" },
  { id: "9", user: "Admin", action: "Updated permissions", target: "admin role — added 3 permissions", time: "1 day ago", type: "update" },
  { id: "10", user: "System", action: "Application started", target: "v1.0.0", time: "2 days ago", type: "info" },
]);

function typeVariant(type: string) {
  if (type === "create") return "success" as const;
  if (type === "delete") return "destructive" as const;
  if (type === "update") return "default" as const;
  return "secondary" as const;
}

function typeIcon(type: string) {
  if (type === "create") return "M12 5v14 M5 12h14";
  if (type === "delete") return "M3 6h18 M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6 M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2";
  if (type === "update") return "M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z";
  return "M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z M12 16v-4 M12 8h.01";
}

const filter = ref<string | null>(null);

const filteredActivities = ref(activities.value);

function setFilter(type: string | null) {
  filter.value = type;
  if (type === null) {
    filteredActivities.value = activities.value;
  } else {
    filteredActivities.value = activities.value.filter((a) => a.type === type);
  }
}
</script>

<template>
  <div class="space-y-6">
    <PageHeader title="Activity" description="Recent system activity and audit log" />

    <!-- Filters -->
    <div class="flex gap-2">
      <Button
        v-for="f in [{ label: 'All', value: null }, { label: 'Created', value: 'create' }, { label: 'Updated', value: 'update' }, { label: 'Deleted', value: 'delete' }, { label: 'System', value: 'info' }]"
        :key="f.label"
        :variant="filter === f.value ? 'default' : 'outline'"
        size="sm"
        class="h-8"
        @click="setFilter(f.value)"
      >
        {{ f.label }}
      </Button>
    </div>

    <Card>
      <CardContent class="p-0">
        <div class="divide-y">
          <div
            v-for="activity in filteredActivities"
            :key="activity.id"
            class="flex items-start gap-4 px-5 py-4 hover:bg-muted/30 transition-colors"
          >
            <!-- Icon -->
            <div
              class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full mt-0.5"
              :class="{
                'bg-success/10': activity.type === 'create',
                'bg-destructive/10': activity.type === 'delete',
                'bg-primary/10': activity.type === 'update',
                'bg-muted': activity.type === 'info',
              }"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                :class="{
                  'text-success': activity.type === 'create',
                  'text-destructive': activity.type === 'delete',
                  'text-primary': activity.type === 'update',
                  'text-muted-foreground': activity.type === 'info',
                }"
              >
                <path :d="typeIcon(activity.type)" />
              </svg>
            </div>

            <!-- Content -->
            <div class="flex-1 min-w-0">
              <p class="text-sm">
                <span class="font-medium">{{ activity.user }}</span>
                <span class="text-muted-foreground"> {{ activity.action }} </span>
                <span class="font-medium font-mono text-xs">{{ activity.target }}</span>
              </p>
              <p class="text-xs text-muted-foreground mt-0.5">{{ activity.time }}</p>
            </div>

            <!-- Badge -->
            <Badge :variant="typeVariant(activity.type)" class="shrink-0 text-[10px]">
              {{ activity.type }}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>

    <p class="text-center text-xs text-muted-foreground">
      Showing {{ filteredActivities.length }} of {{ activities.length }} activities. This is a demo view — connect to a real audit log for production.
    </p>
  </div>
</template>
