<script setup lang="ts">
import { ref } from "vue";
import { useAuthStore } from "@/stores/auth";
import { useToast } from "@/composables/useToast";
import PageHeader from "@/components/PageHeader.vue";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

const auth = useAuthStore();
const { toast } = useToast();

// Profile form (demo)
const profileName = ref(auth.user?.name ?? "");
const profileEmail = ref(auth.user?.email ?? "");

function saveProfile() {
  toast({ title: "Profile updated", description: "Your changes have been saved.", variant: "success" });
}

// Password form (demo)
const currentPassword = ref("");
const newPassword = ref("");
const confirmPassword = ref("");

function changePassword() {
  if (newPassword.value !== confirmPassword.value) {
    toast({ title: "Passwords don't match", variant: "destructive" });
    return;
  }
  toast({ title: "Password changed", description: "Your password has been updated.", variant: "success" });
  currentPassword.value = "";
  newPassword.value = "";
  confirmPassword.value = "";
}

// App info
const appInfo = [
  { label: "API Version", value: "1.0.0" },
  { label: "Runtime", value: "Bun" },
  { label: "Framework", value: "Hono" },
  { label: "Database", value: "PostgreSQL 16" },
  { label: "Auth", value: "Better Auth" },
  { label: "ORM", value: "Drizzle" },
];

const dangerActions = [
  { label: "Export Data", description: "Download all your data as JSON", buttonText: "Export", variant: "outline" as const },
  { label: "Delete Account", description: "Permanently delete your account and all data", buttonText: "Delete Account", variant: "destructive" as const },
];
</script>

<template>
  <div class="space-y-6">
    <PageHeader title="Settings" description="Manage your account and application preferences" />

    <div class="grid gap-6 lg:grid-cols-3">
      <!-- Left column -->
      <div class="lg:col-span-2 space-y-6">
        <!-- Profile -->
        <Card>
          <CardHeader>
            <CardTitle class="text-base">Profile</CardTitle>
            <CardDescription>Update your personal information</CardDescription>
          </CardHeader>
          <CardContent>
            <form class="space-y-4" @submit.prevent="saveProfile">
              <div class="flex items-center gap-4 mb-6">
                <div class="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-primary/80 to-primary text-xl font-semibold text-primary-foreground">
                  {{ auth.user?.name?.charAt(0)?.toUpperCase() ?? "?" }}
                </div>
                <div>
                  <p class="font-medium">{{ auth.user?.name }}</p>
                  <p class="text-sm text-muted-foreground">{{ auth.user?.email }}</p>
                  <Badge class="mt-1">{{ auth.userRole }}</Badge>
                </div>
              </div>
              <div class="grid gap-4 sm:grid-cols-2">
                <div class="space-y-2">
                  <Label for="profile-name">Full name</Label>
                  <Input id="profile-name" v-model="profileName" />
                </div>
                <div class="space-y-2">
                  <Label for="profile-email">Email</Label>
                  <Input id="profile-email" v-model="profileEmail" type="email" disabled />
                </div>
              </div>
              <div class="flex justify-end">
                <Button type="submit" size="sm">Save Changes</Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <!-- Password -->
        <Card>
          <CardHeader>
            <CardTitle class="text-base">Change Password</CardTitle>
            <CardDescription>Update your password regularly for security</CardDescription>
          </CardHeader>
          <CardContent>
            <form class="space-y-4" @submit.prevent="changePassword">
              <div class="space-y-2">
                <Label for="current-pw">Current password</Label>
                <Input id="current-pw" v-model="currentPassword" type="password" />
              </div>
              <div class="grid gap-4 sm:grid-cols-2">
                <div class="space-y-2">
                  <Label for="new-pw">New password</Label>
                  <Input id="new-pw" v-model="newPassword" type="password" />
                </div>
                <div class="space-y-2">
                  <Label for="confirm-pw">Confirm password</Label>
                  <Input id="confirm-pw" v-model="confirmPassword" type="password" />
                </div>
              </div>
              <div class="flex justify-end">
                <Button type="submit" size="sm" variant="outline">Update Password</Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <!-- Danger zone -->
        <Card class="border-destructive/30">
          <CardHeader>
            <CardTitle class="text-base text-destructive">Danger Zone</CardTitle>
            <CardDescription>Irreversible actions — proceed with caution</CardDescription>
          </CardHeader>
          <CardContent class="space-y-4">
            <div v-for="action in dangerActions" :key="action.label">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm font-medium">{{ action.label }}</p>
                  <p class="text-xs text-muted-foreground">{{ action.description }}</p>
                </div>
                <Button
                  :variant="action.variant"
                  size="sm"
                  @click="toast({ title: 'Demo only', description: 'This action is not available in the demo.', variant: 'default' })"
                >
                  {{ action.buttonText }}
                </Button>
              </div>
              <Separator v-if="action !== dangerActions[dangerActions.length - 1]" class="mt-4" />
            </div>
          </CardContent>
        </Card>
      </div>

      <!-- Right column -->
      <div class="space-y-6">
        <!-- App info -->
        <Card>
          <CardHeader>
            <CardTitle class="text-base">Application</CardTitle>
          </CardHeader>
          <CardContent class="space-y-3">
            <div v-for="info in appInfo" :key="info.label" class="flex justify-between text-sm">
              <span class="text-muted-foreground">{{ info.label }}</span>
              <span class="font-medium font-mono text-xs">{{ info.value }}</span>
            </div>
          </CardContent>
        </Card>

        <!-- Session info -->
        <Card>
          <CardHeader>
            <CardTitle class="text-base">Session</CardTitle>
          </CardHeader>
          <CardContent class="space-y-3 text-sm">
            <div class="flex justify-between">
              <span class="text-muted-foreground">Status</span>
              <div class="flex items-center gap-1.5">
                <span class="h-1.5 w-1.5 rounded-full bg-success" />
                <span class="text-xs font-medium">Active</span>
              </div>
            </div>
            <div class="flex justify-between">
              <span class="text-muted-foreground">Role</span>
              <Badge variant="secondary" class="text-[10px]">{{ auth.userRole }}</Badge>
            </div>
            <div class="flex justify-between">
              <span class="text-muted-foreground">Permissions</span>
              <span class="font-medium">{{ auth.userPermissions.length }}</span>
            </div>
            <Separator />
            <div class="flex justify-between">
              <span class="text-muted-foreground">2FA</span>
              <Badge variant="outline" class="text-[10px]">Not enabled</Badge>
            </div>
          </CardContent>
        </Card>

        <!-- Keyboard shortcuts -->
        <Card>
          <CardHeader>
            <CardTitle class="text-base">Quick Reference</CardTitle>
          </CardHeader>
          <CardContent class="space-y-2 text-sm">
            <div class="flex justify-between items-center">
              <span class="text-muted-foreground">API Docs</span>
              <Badge variant="outline" class="text-[10px] font-mono">/doc</Badge>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-muted-foreground">OpenAPI Spec</span>
              <Badge variant="outline" class="text-[10px] font-mono">/openapi.json</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  </div>
</template>
