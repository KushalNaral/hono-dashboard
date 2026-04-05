<script setup lang="ts">
import { ref } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { useToast } from "@/composables/useToast";
import { ApiError } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

const auth = useAuthStore();
const router = useRouter();
const route = useRoute();
const { toast } = useToast();

const isSignUp = ref(false);
const email = ref("");
const password = ref("");
const name = ref("");
const submitting = ref(false);

async function handleSubmit() {
  if (!email.value || !password.value) return;
  if (isSignUp.value && !name.value) return;

  submitting.value = true;
  try {
    if (isSignUp.value) {
      await auth.signUp(email.value, password.value, name.value);
      toast({ title: "Account created", variant: "success" });
    } else {
      await auth.signIn(email.value, password.value);
    }
    const redirect = (route.query.redirect as string) || "/";
    router.push(redirect);
  } catch (e) {
    const message = e instanceof ApiError ? e.message : "An error occurred";
    toast({ title: "Authentication failed", description: message, variant: "destructive" });
  } finally {
    submitting.value = false;
  }
}
</script>

<template>
  <div class="flex min-h-screen">
    <!-- Left panel - branding -->
    <div class="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary via-primary/90 to-primary/80 text-primary-foreground flex-col justify-between p-12">
      <div class="flex items-center gap-3">
        <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 backdrop-blur-sm">
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/></svg>
        </div>
        <span class="text-lg font-semibold">Hono Dashboard</span>
      </div>
      <div class="space-y-4">
        <h2 class="text-3xl font-bold leading-tight">
          Manage your application<br />with confidence.
        </h2>
        <p class="text-primary-foreground/70 max-w-md leading-relaxed">
          Role-based access control, user management, asset tracking, and comprehensive API documentation — all in one place.
        </p>
      </div>
      <p class="text-sm text-primary-foreground/50">Built with Hono, Vue, and Drizzle ORM</p>
    </div>

    <!-- Right panel - form -->
    <div class="flex flex-1 items-center justify-center px-6 bg-background">
      <div class="w-full max-w-sm space-y-8">
        <!-- Mobile logo -->
        <div class="lg:hidden flex items-center gap-3 justify-center">
          <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="text-primary-foreground"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/></svg>
          </div>
        </div>

        <div class="text-center space-y-2">
          <h1 class="text-2xl font-semibold tracking-tight">
            {{ isSignUp ? "Create your account" : "Welcome back" }}
          </h1>
          <p class="text-sm text-muted-foreground">
            {{ isSignUp ? "Get started with your new account" : "Sign in to continue to your dashboard" }}
          </p>
        </div>

        <form @submit.prevent="handleSubmit" class="space-y-4">
          <div v-if="isSignUp" class="space-y-2">
            <Label for="name">Full name</Label>
            <Input id="name" v-model="name" placeholder="John Doe" class="h-10" />
          </div>
          <div class="space-y-2">
            <Label for="email">Email</Label>
            <Input id="email" v-model="email" type="email" placeholder="you@example.com" class="h-10" />
          </div>
          <div class="space-y-2">
            <div class="flex items-center justify-between">
              <Label for="password">Password</Label>
            </div>
            <Input id="password" v-model="password" type="password" placeholder="Enter your password" class="h-10" />
          </div>
          <Button type="submit" class="w-full h-10" :disabled="submitting">
            <svg v-if="submitting" class="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
            {{ submitting ? "" : isSignUp ? "Create account" : "Sign in" }}
          </Button>
        </form>

        <div class="relative">
          <Separator />
          <span class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-3 text-xs text-muted-foreground">or</span>
        </div>

        <p class="text-center text-sm text-muted-foreground">
          {{ isSignUp ? "Already have an account?" : "Don't have an account?" }}
          <button
            type="button"
            class="font-medium text-primary hover:underline transition-colors ml-1 cursor-pointer"
            @click="isSignUp = !isSignUp"
          >
            {{ isSignUp ? "Sign in" : "Sign up" }}
          </button>
        </p>
      </div>
    </div>
  </div>
</template>
