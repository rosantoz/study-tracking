"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/toast";
import { SubjectSelect } from "@/components/subject-select";
import type { SubjectDTO } from "@/types/api";

function todayISO() {
  const d = new Date();
  const offset = d.getTimezoneOffset();
  const local = new Date(d.getTime() - offset * 60 * 1000);
  return local.toISOString().slice(0, 10);
}

export function SessionForm() {
  const router = useRouter();
  const toast = useToast();
  const [subjects, setSubjects] = useState<SubjectDTO[]>([]);
  const [subjectId, setSubjectId] = useState("");
  const [date, setDate] = useState(todayISO());
  const [minutes, setMinutes] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.subjects
      .list()
      .then(({ subjects }) => setSubjects(subjects))
      .catch((e) => toast.show((e as Error).message, "error"))
      .finally(() => setLoading(false));
  }, [toast]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const minutesNum = Number(minutes);
    if (!subjectId) {
      toast.show("Please select a subject", "error");
      return;
    }
    if (!Number.isInteger(minutesNum) || minutesNum <= 0) {
      toast.show("Minutes must be a positive integer", "error");
      return;
    }
    setSubmitting(true);
    try {
      await api.sessions.create({
        subjectId,
        date,
        minutes: minutesNum,
        notes: notes.trim() ? notes : null,
      });
      toast.show("Session saved", "success");
      setMinutes("");
      setNotes("");
      router.push("/");
      router.refresh();
    } catch (err) {
      toast.show((err as Error).message, "error");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Log a study session</CardTitle>
        <CardDescription>Track time spent, subject, and any notes for later review.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="minutes">Minutes</Label>
              <Input
                id="minutes"
                type="number"
                min={1}
                max={1440}
                step={1}
                value={minutes}
                onChange={(e) => setMinutes(e.target.value)}
                placeholder="e.g. 45"
                required
              />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="subject">Subject</Label>
            <SubjectSelect
              id="subject"
              subjects={subjects}
              value={subjectId}
              onChange={setSubjectId}
              onSubjectsChanged={setSubjects}
              required
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="What did you cover? Any questions to revisit?"
              maxLength={5000}
            />
          </div>
          <div className="flex justify-end">
            <Button type="submit" disabled={submitting || loading}>
              {submitting ? "Saving…" : "Save session"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
