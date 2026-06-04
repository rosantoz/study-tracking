import { z } from "zod";

export const subjectSchema = z.object({
  id: z.string(),
  name: z.string(),
});
export type SubjectDTO = z.infer<typeof subjectSchema>;

export const createSubjectSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(80),
});
export type CreateSubjectInput = z.infer<typeof createSubjectSchema>;
export type UpdateSubjectInput = CreateSubjectInput;

export const subjectUsageSchema = subjectSchema.extend({
  sessionCount: z.number().int(),
  goalCount: z.number().int(),
  taskCount: z.number().int(),
});
export type SubjectUsageDTO = z.infer<typeof subjectUsageSchema>;

export const sessionSchema = z.object({
  id: z.string(),
  date: z.string(),
  minutes: z.number().int(),
  notes: z.string().nullable(),
  subject: subjectSchema,
});
export type SessionDTO = z.infer<typeof sessionSchema>;

export const createSessionSchema = z.object({
  subjectId: z.string().min(1, "Subject is required"),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD"),
  minutes: z
    .number({ message: "Minutes must be a number" })
    .int()
    .positive("Minutes must be positive")
    .max(24 * 60, "Minutes cannot exceed 1440"),
  notes: z.string().max(5000).optional().nullable(),
});
export type CreateSessionInput = z.infer<typeof createSessionSchema>;

export const sessionsQuerySchema = z.object({
  subjectId: z.string().optional(),
  from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});
export type SessionsQuery = z.infer<typeof sessionsQuerySchema>;

export const goalPeriodSchema = z.enum(["WEEKLY", "MONTHLY"]);
export type GoalPeriod = z.infer<typeof goalPeriodSchema>;

export const upsertGoalSchema = z.object({
  subjectId: z.string().min(1, "Subject is required"),
  targetMinutes: z
    .number({ message: "Target must be a number" })
    .int()
    .positive("Target must be positive")
    .max(100000),
  period: goalPeriodSchema,
});
export type UpsertGoalInput = z.infer<typeof upsertGoalSchema>;

export const goalSchema = z.object({
  id: z.string(),
  subject: subjectSchema,
  targetMinutes: z.number().int(),
  period: goalPeriodSchema,
});
export type GoalDTO = z.infer<typeof goalSchema>;

export const goalProgressSchema = z.object({
  goalId: z.string(),
  subjectId: z.string(),
  subjectName: z.string(),
  period: goalPeriodSchema,
  targetMinutes: z.number().int(),
  actualMinutes: z.number().int(),
  percent: z.number().int(),
});
export type GoalProgressDTO = z.infer<typeof goalProgressSchema>;

export const taskStatusSchema = z.enum(["PENDING", "COMPLETED"]);
export type TaskStatus = z.infer<typeof taskStatusSchema>;

export const plannedTaskSchema = z.object({
  id: z.string(),
  date: z.string(),
  startTime: z.string(),
  endTime: z.string(),
  objective: z.string(),
  status: taskStatusSchema,
  subject: subjectSchema,
});
export type PlannedTaskDTO = z.infer<typeof plannedTaskSchema>;

export const createPlannedTaskSchema = z
  .object({
    subjectId: z.string().min(1, "Subject is required"),
    date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD"),
    startTime: z
      .string()
      .regex(/^\d{2}:\d{2}$/, "Start time must be HH:MM"),
    endTime: z
      .string()
      .regex(/^\d{2}:\d{2}$/, "End time must be HH:MM"),
    objective: z
      .string()
      .trim()
      .min(1, "Objective is required")
      .max(200, "Objective is too long"),
  })
  .refine((d) => d.startTime < d.endTime, {
    message: "End time must be after start time",
    path: ["endTime"],
  });
export type CreatePlannedTaskInput = z.infer<typeof createPlannedTaskSchema>;

export const updatePlannedTaskSchema = z.object({
  status: taskStatusSchema,
});
export type UpdatePlannedTaskInput = z.infer<typeof updatePlannedTaskSchema>;

export const plannedTasksQuerySchema = z.object({
  subjectId: z.string().optional(),
  from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  status: taskStatusSchema.optional(),
});
export type PlannedTasksQuery = z.infer<typeof plannedTasksQuerySchema>;

export const dashboardSchema = z.object({
  todayMinutes: z.number().int(),
  weekMinutes: z.number().int(),
  perSubjectThisWeek: z.array(
    z.object({
      subjectId: z.string(),
      subjectName: z.string(),
      minutes: z.number().int(),
    }),
  ),
  goalsProgress: z.array(goalProgressSchema),
});
export type DashboardDTO = z.infer<typeof dashboardSchema>;
