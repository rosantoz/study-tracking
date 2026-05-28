"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/toast";
import { SubjectSelect } from "@/components/subject-select";
import type { PlannedTaskDTO, SubjectDTO } from "@/types/api";

type Props = {
  open: boolean;
  onClose: () => void;
  defaultDate: string;
  onCreated: (task: PlannedTaskDTO) => void;
};

export function TaskFormDialog({ open, onClose, defaultDate, onCreated }: Props) {
  const toast = useToast();
  const [subjects, setSubjects] = useState<SubjectDTO[]>([]);
  const [subjectId, setSubjectId] = useState("");
  const [date, setDate] = useState(defaultDate);
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("10:00");
  const [objective, setObjective] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    setDate(defaultDate);
    setSubjectId("");
    setObjective("");
    setStartTime("09:00");
    setEndTime("10:00");
  }, [open, defaultDate]);

  useEffect(() => {
    if (!open) return;
    api.subjects
      .list()
      .then(({ subjects }) => setSubjects(subjects))
      .catch((e) => toast.show((e as Error).message, "error"));
  }, [open, toast]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!subjectId) {
      toast.show("Please select a subject", "error");
      return;
    }
    if (!objective.trim()) {
      toast.show("Please add an objective", "error");
      return;
    }
    if (startTime >= endTime) {
      toast.show("End time must be after start time", "error");
      return;
    }
    setSubmitting(true);
    try {
      const { task } = await api.tasks.create({
        subjectId,
        date,
        startTime,
        endTime,
        objective: objective.trim(),
      });
      onCreated(task);
      toast.show("Task added", "success");
      onClose();
    } catch (err) {
      toast.show((err as Error).message, "error");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="New planned task"
      description="Schedule a study task on your planner."
    >
      <form onSubmit={onSubmit} className="flex flex-col gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="task-subject">Subject</Label>
          <SubjectSelect
            id="task-subject"
            subjects={subjects}
            value={subjectId}
            onChange={setSubjectId}
            onSubjectsChanged={setSubjects}
            required
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="task-date">Date</Label>
          <Input
            id="task-date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="task-start">Start time</Label>
            <Input
              id="task-start"
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              required
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="task-end">End time</Label>
            <Input
              id="task-end"
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              required
            />
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="task-objective">Objective</Label>
          <Input
            id="task-objective"
            value={objective}
            onChange={(e) => setObjective(e.target.value)}
            placeholder="e.g. Complete English essay draft 2"
            maxLength={200}
            required
          />
        </div>
        <div className="mt-2 flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? "Adding…" : "Add to schedule"}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
