import type {
  CreatePlannedTaskInput,
  CreateSessionInput,
  CreateSubjectInput,
  DashboardDTO,
  GoalDTO,
  PlannedTaskDTO,
  SessionDTO,
  SubjectDTO,
  TaskStatus,
  UpdatePlannedTaskInput,
  UpsertGoalInput,
} from "@/types/api";

async function request<T>(input: string, init?: RequestInit): Promise<T> {
  const res = await fetch(input, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  });
  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const body = (await res.json()) as { error?: string };
      if (body?.error) message = body.error;
    } catch {
      // ignore
    }
    throw new Error(message);
  }
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

export const api = {
  subjects: {
    list: () => request<{ subjects: SubjectDTO[] }>("/api/subjects"),
    create: (data: CreateSubjectInput) =>
      request<{ subject: SubjectDTO }>("/api/subjects", {
        method: "POST",
        body: JSON.stringify(data),
      }),
  },
  sessions: {
    list: (params: { subjectId?: string; from?: string; to?: string } = {}) => {
      const qs = new URLSearchParams();
      if (params.subjectId) qs.set("subjectId", params.subjectId);
      if (params.from) qs.set("from", params.from);
      if (params.to) qs.set("to", params.to);
      const suffix = qs.toString() ? `?${qs.toString()}` : "";
      return request<{ sessions: SessionDTO[] }>(`/api/sessions${suffix}`);
    },
    create: (data: CreateSessionInput) =>
      request<{ session: SessionDTO }>("/api/sessions", {
        method: "POST",
        body: JSON.stringify(data),
      }),
  },
  goals: {
    list: () => request<{ goals: GoalDTO[] }>("/api/goals"),
    upsert: (data: UpsertGoalInput) =>
      request<{ goal: GoalDTO }>("/api/goals", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    delete: (id: string) =>
      request<{ ok: true }>(`/api/goals/${id}`, { method: "DELETE" }),
  },
  tasks: {
    list: (
      params: {
        subjectId?: string;
        from?: string;
        to?: string;
        status?: TaskStatus;
      } = {},
    ) => {
      const qs = new URLSearchParams();
      if (params.subjectId) qs.set("subjectId", params.subjectId);
      if (params.from) qs.set("from", params.from);
      if (params.to) qs.set("to", params.to);
      if (params.status) qs.set("status", params.status);
      const suffix = qs.toString() ? `?${qs.toString()}` : "";
      return request<{ tasks: PlannedTaskDTO[] }>(`/api/tasks${suffix}`);
    },
    create: (data: CreatePlannedTaskInput) =>
      request<{ task: PlannedTaskDTO }>("/api/tasks", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    update: (id: string, data: UpdatePlannedTaskInput) =>
      request<{ task: PlannedTaskDTO }>(`/api/tasks/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      }),
    delete: (id: string) =>
      request<{ ok: true }>(`/api/tasks/${id}`, { method: "DELETE" }),
  },
  dashboard: {
    get: () => request<DashboardDTO>("/api/dashboard"),
  },
};
