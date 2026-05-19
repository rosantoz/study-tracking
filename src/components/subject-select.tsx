"use client";

import { useState } from "react";
import { api } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { useToast } from "@/components/ui/toast";
import type { SubjectDTO } from "@/types/api";

type Props = {
  subjects: SubjectDTO[];
  value: string;
  onChange: (id: string) => void;
  onSubjectsChanged: (subjects: SubjectDTO[]) => void;
  required?: boolean;
  id?: string;
};

export function SubjectSelect({
  subjects,
  value,
  onChange,
  onSubjectsChanged,
  required,
  id,
}: Props) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const toast = useToast();

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim()) return;
    setSubmitting(true);
    try {
      const { subject } = await api.subjects.create({ name: newName });
      const next = [...subjects.filter((s) => s.id !== subject.id), subject].sort(
        (a, b) => a.name.localeCompare(b.name),
      );
      onSubjectsChanged(next);
      onChange(subject.id);
      setNewName("");
      setDialogOpen(false);
      toast.show(`Added subject "${subject.name}"`, "success");
    } catch (err) {
      toast.show((err as Error).message, "error");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <div className="flex gap-2">
        <Select
          id={id}
          value={value}
          required={required}
          onChange={(e) => onChange(e.target.value)}
        >
          <option value="">Select a subject…</option>
          {subjects.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </Select>
        <Button
          type="button"
          variant="secondary"
          onClick={() => setDialogOpen(true)}
          className="shrink-0"
        >
          + New
        </Button>
      </div>
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        title="New subject"
        description="Give your subject a short, recognisable name."
      >
        <form onSubmit={onCreate} className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="new-subject-name">Subject name</Label>
            <Input
              id="new-subject-name"
              autoFocus
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="e.g. Algebra"
              maxLength={80}
              required
            />
          </div>
          <div className="mt-2 flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Adding…" : "Add subject"}
            </Button>
          </div>
        </form>
      </Dialog>
    </>
  );
}
