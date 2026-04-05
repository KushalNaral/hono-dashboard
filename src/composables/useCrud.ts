import { ref, computed, type Ref } from "vue";
import { useQuery, useMutation, useQueryClient } from "@tanstack/vue-query";
import { api } from "@/lib/api";
import { useToast } from "@/composables/useToast";
import type { ListParams } from "@/types/api";

export interface UseCrudOptions<T> {
  resource: string;
  queryKey?: string[];
  defaultPageSize?: number;
  defaultSortBy?: string;
  defaultSortDir?: "asc" | "desc";
  onSuccess?: (action: "create" | "update" | "delete" | "bulkCreate" | "bulkUpdate" | "bulkDelete", result: any) => void;
  onError?: (action: "create" | "update" | "delete" | "bulkCreate" | "bulkUpdate" | "bulkDelete", error: any) => void;
}

export function useCrud<TSelect, TInsert = Partial<TSelect>, TUpdate = Partial<TInsert>>(
  options: UseCrudOptions<TSelect>
) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const resource = options.resource;
  const key = options.queryKey || [resource];

  // List State
  const page = ref(1);
  const pageSize = ref(options.defaultPageSize ?? 20);
  const search = ref("");
  const sortBy = ref(options.defaultSortBy ?? "");
  const sortDir = ref<"asc" | "desc">(options.defaultSortDir ?? "asc");
  const customFilters = ref<Record<string, any>>({});

  // Computed Params
  const params = computed<ListParams>(() => {
    const p: ListParams = {
      page: page.value,
      pageSize: pageSize.value,
      ...(sortBy.value ? { sortBy: sortBy.value } : {}),
      ...(sortBy.value ? { sortDir: sortDir.value } : {}),
      ...(search.value ? { search: search.value } : {}),
    };

    // Add custom filters
    for (const [k, v] of Object.entries(customFilters.value)) {
      if (v !== undefined && v !== null && v !== "") {
        p[k] = v;
      }
    }
    return p;
  });

  // Query - List
  const listQuery = useQuery({
    queryKey: [...key, params],
    queryFn: () => api.listResource<TSelect>(resource, params.value),
  });

  // Query - All
  const listAllQuery = useQuery({
    queryKey: [...key, "all"],
    queryFn: () => api.listAllResource<TSelect>(resource),
    enabled: false, // Call refetch manually if needed
  });

  // Centralized success/error handling
  const handleSuccess = (action: string, result: any, title: string) => {
    queryClient.invalidateQueries({ queryKey: key });
    toast({ title, variant: "success" });
    if (options.onSuccess) options.onSuccess(action as any, result);
  };

  const handleError = (action: string, err: any, defaultTitle: string) => {
    toast({ title: defaultTitle, description: String(err), variant: "destructive" });
    if (options.onError) options.onError(action as any, err);
  };

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data: TInsert) => api.createResource<TSelect, TInsert>(resource, data),
    onSuccess: (res) => handleSuccess("create", res, "Created successfully"),
    onError: (err) => handleError("create", err, "Failed to create"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: TUpdate }) => api.updateResource<TSelect, TUpdate>(resource, id, data),
    onSuccess: (res) => handleSuccess("update", res, "Updated successfully"),
    onError: (err) => handleError("update", err, "Failed to update"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.deleteResource<TSelect>(resource, id),
    onSuccess: (res) => handleSuccess("delete", res, "Deleted successfully"),
    onError: (err) => handleError("delete", err, "Failed to delete"),
  });

  const bulkCreateMutation = useMutation({
    mutationFn: (data: TInsert[]) => api.bulkCreateResource<TSelect, TInsert>(resource, data),
    onSuccess: (res) => handleSuccess("bulkCreate", res, "Bulk created successfully"),
    onError: (err) => handleError("bulkCreate", err, "Failed to bulk create"),
  });

  const bulkUpdateMutation = useMutation({
    mutationFn: (data: { id: string; data: TUpdate }[]) => api.bulkUpdateResource<TSelect, TUpdate>(resource, data),
    onSuccess: (res) => handleSuccess("bulkUpdate", res, "Bulk updated successfully"),
    onError: (err) => handleError("bulkUpdate", err, "Failed to bulk update"),
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: (ids: string[]) => api.bulkDeleteResource(resource, ids),
    onSuccess: (res) => handleSuccess("bulkDelete", res, `Deleted ${res.deletedCount} items`),
    onError: (err) => handleError("bulkDelete", err, "Failed to bulk delete"),
  });

  // Helpers
  const toggleSort = (col: string) => {
    if (sortBy.value === col) {
      sortDir.value = sortDir.value === "asc" ? "desc" : "asc";
    } else {
      sortBy.value = col;
      sortDir.value = "asc";
    }
  };

  const resetFilters = () => {
    search.value = "";
    customFilters.value = {};
    page.value = 1;
  };

  // Reset page when search or filters change
  const setFilter = (key: string, value: any) => {
    customFilters.value[key] = value;
    page.value = 1;
  };

  const setSearch = (val: string) => {
    search.value = val;
    page.value = 1;
  };

  return {
    state: {
      page,
      pageSize,
      search,
      sortBy,
      sortDir,
      customFilters,
      params,
    },
    actions: {
      toggleSort,
      resetFilters,
      setFilter,
      setSearch,
    },
    queries: {
      list: listQuery,
      all: listAllQuery,
    },
    mutations: {
      create: createMutation,
      update: updateMutation,
      delete: deleteMutation,
      bulkCreate: bulkCreateMutation,
      bulkUpdate: bulkUpdateMutation,
      bulkDelete: bulkDeleteMutation,
    },
  };
}
