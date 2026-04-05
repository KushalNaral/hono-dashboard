<script setup lang="ts">
import { Button } from "@/components/ui/button";
</script>

<template>
  <div class="flex min-h-screen flex-col items-center justify-center gap-6 px-4">
    <div class="flex h-20 w-20 items-center justify-center rounded-2xl bg-muted">
      <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="text-muted-foreground"><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/></svg>
    </div>
    <div class="text-center space-y-2">
      <h1 class="text-4xl font-bold tracking-tight">404</h1>
      <p class="text-muted-foreground max-w-sm">The page you're looking for doesn't exist or has been moved.</p>
    </div>
    <RouterLink to="/">
      <Button>
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-1.5"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>
        Back to Dashboard
      </Button>
    </RouterLink>
  </div>
</template>
