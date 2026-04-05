# Generic CRUD Architecture Guide

This guide covers the implementation and usage of the generic CRUD (Create, Read, Update, Delete) system built into the Hono Dashboard. It significantly accelerates development by providing standard conventions for APIs, UI components, and layouts.

---

## 1. Using the Code Generator (Fastest Way)

You can instantly scaffold a fully working CRUD page via the CLI script:

```bash
bun run generate:crud ResourceName
```

Options:
- `--layout sidebar`: Uses the `CrudLayoutSidebar` model where forms open in a side panel rather than a modal.

This generates a file in `src/pages/` (e.g., `ResourceNamePage.vue`) pre-populated with:
- The schema definition.
- A configured `useCrud` instance.
- Column mappings for the `DataTable`.
- Basic delete action mappings.

---

## 2. Architecture Overview

### API Wrapper (`src/lib/api.ts`)

Instead of writing specific fetch functions for every resource (e.g., `api.listRoles`, `api.listPermissions`), `api.ts` exposes heavily typed generic methods:
- `api.listResource<T>(resource, params)`
- `api.createResource<T>(resource, data)`
- `api.updateResource<T>(resource, id, data)`
- `api.deleteResource<T>(resource, id)`
- `api.bulkDeleteResource(resource, ids)`
- And more (Status updates, reordering)...

### `useCrud` Composable

`src/composables/useCrud.ts` acts as the bridge between the UI and your backend. Under the hood, it utilizes `@tanstack/vue-query`.

```ts
const crud = useCrud({
  resource: "products",         // Important: Matches your backend path (/api/products)
  defaultSortBy: "createdAt",
  defaultSortDir: "desc",
});
```

It returns:
- `state`: Search queries, active filters, current page logic.
- `actions`: Methods to mutate state (e.g., `setFilter('status', 'active')`, `toggleSort('name')`).
- `queries`: `isLoading`, `data`, and pagination metadata.
- `mutations`: Functions to fire create, update, delete requests confidently.

### `DataTable.vue`

The `DataTable` automatically respects the state passed to it by `useCrud`. It renders loading skeletons, empty states if no data is found, and pagination.

```vue
<DataTable
  :crud="crud"
  :columns="columns"
  :actions="actions"
  rowClickable
  @row-click="handleRowClick"
>
```

#### Custom Cell Rendering
Instead of relying on clunky callback functions for cell formatting, you can use Vue Slots targeting `cell-<key>`:

```vue
<template #cell-status="{ value }">
  <span :class="value === 'active' ? 'text-green-500' : 'text-red-500'">
    {{ value }}
  </span>
</template>
```

### `AutoForm.vue`

Stop manually writing generic inputs! The `AutoForm` component parses a standard Zod schema, generates the reactive payload shape, loops through the schema objects to render inputs natively, and parses validation outputs onto the form automatically.

```vue
<AutoForm
  :schema="myZodSchema"
  @submit="handleSubmission"
/>
```

---

## 3. Layout Variations

There are two primary layouts mapping this entire system in `src/layouts/`:

1. **`CrudLayoutStandard.vue`**: 
   - Full width table layout.
   - Searching and Toolbar capabilities.
   - Clicking `New` opens an `AutoForm` via a traditional modal / Dialog window.
2. **`CrudLayoutSidebar.vue`**:
   - Split-screen mapping.
   - Selecting a row, or clicking "New" drops an Inspector Pane on the right side. Great for dense text or multi-step views.

---

## 4. Custom Filters

If you need a filter beyond the standard "Search" field, use the `#filters` slot inside any CrudLayout component. 

Updating state via `crud.actions.setFilter` automatically resets the page to `1` and debounces the refetch!

```vue
<template #filters="{ crud }">
  <select 
    v-model="crud.state.customFilters.value.category"
    @change="crud.actions.setFilter('category', $event.target.value)"
  >
    <option value="hardware">Hardware</option>
    <option value="software">Software</option>
  </select>
</template>
```
