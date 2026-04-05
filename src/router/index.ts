import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "@/stores/auth";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: "/login",
      name: "login",
      component: () => import("@/pages/LoginPage.vue"),
      meta: { public: true },
    },
    {
      path: "/",
      component: () => import("@/layouts/DashboardLayout.vue"),
      children: [
        {
          path: "",
          name: "dashboard",
          component: () => import("@/pages/DashboardPage.vue"),
        },
        {
          path: "users",
          name: "users",
          component: () => import("@/pages/UsersPage.vue"),
          meta: { permission: "list-users" },
        },
        {
          path: "roles",
          name: "roles",
          component: () => import("@/pages/RolesPage.vue"),
          meta: { permission: "list-roles" },
        },
        {
          path: "roles/:id",
          name: "role-detail",
          component: () => import("@/pages/RoleDetailPage.vue"),
          meta: { permission: "view-roles" },
        },
        {
          path: "permissions",
          name: "permissions",
          component: () => import("@/pages/PermissionsPage.vue"),
          meta: { permission: "view-permissions" },
        },
        {
          path: "activity",
          name: "activity",
          component: () => import("@/pages/ActivityPage.vue"),
        },
        {
          path: "settings",
          name: "settings",
          component: () => import("@/pages/SettingsPage.vue"),
        },
      ],
    },
    {
      path: "/:pathMatch(.*)*",
      name: "not-found",
      component: () => import("@/pages/NotFoundPage.vue"),
      meta: { public: true },
    },
  ],
});

router.beforeEach(async (to) => {
  const auth = useAuthStore();

  if (auth.loading) {
    await auth.fetchSession();
  }

  if (to.meta.public) return true;

  if (!auth.isAuthenticated) {
    return { name: "login", query: { redirect: to.fullPath } };
  }

  if (to.meta.permission && !auth.hasPermission(to.meta.permission as string)) {
    return { name: "dashboard" };
  }

  return true;
});

export default router;
