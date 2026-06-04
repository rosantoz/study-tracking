"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/toast";
import type { SubjectUsageDTO } from "@/types/api";

function plural(n: number, word: string) {
  return `${n} ${word}${n === 1 ? "" : "s"}`;
}

function usageLine(s: SubjectUsageDTO) {
  return [
    plural(s.sessionCount, "session"),
    plural(s.goalCount, "goal"),
    plural(s.taskCount, "task"),
  ].join(" · ");
}

export function SubjectsManager() {
  const toast = useToast();
  const [subjects, setSubjects] = useState<SubjectUsageDTO[] | null>(null);

  const [newName, setNewName] = useState("");
  const [adding, setAdding] = useState(false);

  const [editing, setEditing] = useState<SubjectUsageDTO | null>(null);
  const [editName, setEditName] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);

  const [pendingDelete, setPendingDelete] = useState<SubjectUsageDTO | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    api.subjects
      .listWithUsage()
      .then(({ subjects }) => setSubjects(subjects))
      .catch((e) => toast.show((e as Error).message, "error"));
  }, [toast]);

  async function onAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim()) return;
    setAdding(true);
    try {
      const { subject } = await api.subjects.create({ name: newName });
      setSubjects((prev) => {
        const base = prev ?? [];
        if (base.some((s) => s.id === subject.id)) return base;
        return [
          ...base,
          { ...subject, sessionCount: 0, goalCount: 0, taskCount: 0 },
        ].sort((a, b) => a.name.localeCompare(b.name));
      });
      setNewName("");
      toast.show(`Added subject "${subject.name}"`, "success");
    } catch (err) {
      toast.show((err as Error).message, "error");
    } finally {
      setAdding(false);
    }
  }

  function startEdit(s: SubjectUsageDTO) {
    setEditing(s);
    setEditName(s.name);
  }

  async function onSaveEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editing || !editName.trim()) return;
    setSavingEdit(true);
    try {
      const { subject } = await api.subjects.update(editing.id, {
        name: editName,
      });
      setSubjects((prev) =>
        (prev ?? [])
          .map((s) => (s.id === subject.id ? { ...s, name: subject.name } : s))
          .sort((a, b) => a.name.localeCompare(b.name)),
      );
      setEditing(null);
      toast.show("Subject renamed", "success");
    } catch (err) {
      toast.show((err as Error).message, "error");
    } finally {
      setSavingEdit(false);
    }
  }

  async function onConfirmDelete() {
    if (!pendingDelete) return;
    const target = pendingDelete;
    const prev = subjects;
    setDeleting(true);
    setSubjects((curr) => curr?.filter((s) => s.id !== target.id) ?? curr);
    try {
      await api.subjects.delete(target.id);
      toast.show(`Deleted "${target.name}"`, "success");
      setPendingDelete(null);
    } catch (err) {
      setSubjects(prev);
      toast.show((err as Error).message, "error");
    } finally {
      setDeleting(false);
    }
  }

  const deleteCascades =
    pendingDelete !== null &&
    pendingDelete.sessionCount +
      pendingDelete.goalCount +
      pendingDelete.taskCount >
      0;

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardContent>
          <form onSubmit={onAdd} className="flex items-end gap-2 pt-2">
            <div className="flex flex-1 flex-col gap-1.5">
              <Label htmlFor="new-subject">Add a subject</Label>
              <Input
                id="new-subject"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="e.g. Algebra"
                maxLength={80}
              />
            </div>
            <Button type="submit" disabled={adding || !newName.trim()}>
              {adding ? "Adding…" : "Add"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {subjects === null ? (
        <p className="text-sm text-muted">Loading subjects…</p>
      ) : subjects.length === 0 ? (
        <p className="text-sm text-muted">
          No subjects yet. Add your first one above.
        </p>
      ) : (
        <Card>
          <CardContent>
            <ul className="flex flex-col divide-y divide-border">
              {subjects.map((s) => (
                <li
                  key={s.id}
                  className="flex items-center justify-between gap-3 py-3"
                >
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium text-foreground">
                      {s.name}
                    </div>
                    <div className="text-xs text-muted">{usageLine(s)}</div>
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => startEdit(s)}
                    >
                      Edit
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setPendingDelete(s)}
                      aria-label={`Delete ${s.name}`}
                    >
                      Delete
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      <Dialog
        open={editing !== null}
        onClose={() => {
          if (!savingEdit) setEditing(null);
        }}
        title="Rename subject"
        description="Update the name shown across your sessions, goals, and planner."
      >
        <form onSubmit={onSaveEdit} className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="edit-subject-name">Subject name</Label>
            <Input
              id="edit-subject-name"
              autoFocus
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              maxLength={80}
              required
            />
          </div>
          <div className="mt-2 flex justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setEditing(null)}
              disabled={savingEdit}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={savingEdit || !editName.trim()}>
              {savingEdit ? "Saving…" : "Save"}
            </Button>
          </div>
        </form>
      </Dialog>

      <Dialog
        open={pendingDelete !== null}
        onClose={() => {
          if (!deleting) setPendingDelete(null);
        }}
        title="Delete subject?"
        description={
          pendingDelete
            ? deleteCascades
              ? `Deleting "${pendingDelete.name}" will also permanently delete ${usageLine(pendingDelete)} linked to it. This cannot be undone.`
              : `"${pendingDelete.name}" has no linked data. This cannot be undone.`
            : undefined
        }
      >
        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="ghost"
            onClick={() => setPendingDelete(null)}
            disabled={deleting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="danger"
            onClick={onConfirmDelete}
            disabled={deleting}
          >
            {deleting ? "Deleting…" : "Delete"}
          </Button>
        </div>
      </Dialog>
    </div>
  );
}
