import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { api, ApiError } from "@/lib/api";
import type { User, MePermissionsResponse } from "@/types/api";

export const useAuthStore = defineStore("auth", () => {
  const user = ref<User | null>(null);
  const permissions = ref<MePermissionsResponse | null>(null);
  const loading = ref(true);

  const isAuthenticated = computed(() => !!user.value);
  const isAdmin = computed(() => user.value?.role === "admin");
  const userRole = computed(() => permissions.value?.role ?? user.value?.role ?? "user");
  const userPermissions = computed(() => permissions.value?.permissions ?? []);

  function hasPermission(permission: string): boolean {
    return userPermissions.value.includes(permission);
  }

  async function fetchSession() {
    loading.value = true;
    try {
      const session = await api.getSession();
      user.value = session.user;
      try {
        permissions.value = await api.getMyPermissions();
      } catch {
        permissions.value = null;
      }
    } catch {
      user.value = null;
      permissions.value = null;
    } finally {
      loading.value = false;
    }
  }

  async function signIn(email: string, password: string) {
    const session = await api.signIn(email, password);
    user.value = session.user;
    try {
      permissions.value = await api.getMyPermissions();
    } catch {
      permissions.value = null;
    }
  }

  async function signUp(email: string, password: string, name: string) {
    await api.signUp(email, password, name);
    await signIn(email, password);
  }

  async function signOut() {
    try {
      await api.signOut();
    } catch (e) {
      if (!(e instanceof ApiError && e.status === 401)) throw e;
    }
    user.value = null;
    permissions.value = null;
  }

  return {
    user,
    permissions,
    loading,
    isAuthenticated,
    isAdmin,
    userRole,
    userPermissions,
    hasPermission,
    fetchSession,
    signIn,
    signUp,
    signOut,
  };
});
