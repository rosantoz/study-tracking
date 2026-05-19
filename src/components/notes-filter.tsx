"use client";

import { useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { useToast } from "@/components/ui/toast";
import { formatMinutes } from "@/lib/utils";
import type { SessionDTO, SubjectDTO } from "@/types/api";

function defaultRange() {
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - 30);
  const iso = (d: Date) => {
    const offset = d.getTimezoneOffset();
    const local = new Date(d.getTime() - offset * 60 * 1000);
    return local.toISOString().slice(0, 10);
  };
  return { from: iso(start), to: iso(end) };
}

export function NotesFilter() {
  const [subjects, setSubjects] = useState<SubjectDTO[]>([]);
  const [subjectId, setSubjectId] = useState("");
  const initial = useMemo(() => defaultRange(), []);
  const [from, setFrom] = useState(initial.from);
  const [to, setTo] = useState(initial.to);
  const [sessions, setSessions] = useState<SessionDTO[] | null>(null);
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  useEffect(() => {
    api.subjects
      .list()
      .then(({ subjects }) => setSubjects(subjects))
      .catch((e) => toast.show((e as Error).message, "error"));
  }, [toast]);

  async function onSearch(e?: React.FormEvent) {
    e?.preventDefault();
    if (!subjectId) {
      toast.show("Please select a subject", "error");
      return;
    }
    setLoading(true);
    try {
      const { sessions } = await api.sessions.list({ subjectId, from, to });
      setSessions(sessions);
    } catch (err) {
      toast.show((err as Error).message, "error");
    } finally {
      setLoading(false);
    }
  }

  const totalMinutes = sessions?.reduce((acc, s) => acc + s.minutes, 0) ?? 0;

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardContent>
          <form onSubmit={onSearch} className="grid gap-3 pt-2 sm:grid-cols-4 sm:items-end">
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <Label htmlFor="notes-subject">Subject</Label>
              <Select
                id="notes-subject"
                value={subjectId}
                onChange={(e) => setSubjectId(e.target.value)}
              >
                <option value="">Select subject…</option>
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="notes-from">From</Label>
              <Input
                id="notes-from"
                type="date"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="notes-to">To</Label>
              <Input
                id="notes-to"
                type="date"
                value={to}
                onChange={(e) => setTo(e.target.value)}
              />
            </div>
            <div className="sm:col-span-4 flex justify-end">
              <Button type="submit" disabled={loading}>
                {loading ? "Loading…" : "Show notes"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {sessions === null ? (
        <p className="text-sm text-slate-500">
          Choose a subject and date range, then click <strong>Show notes</strong>.
        </p>
      ) : sessions.length === 0 ? (
        <p className="text-sm text-slate-500">No sessions found in that range.</p>
      ) : (
        <>
          <div className="flex items-center justify-between text-sm text-slate-600">
            <span>
              {sessions.length} session{sessions.length === 1 ? "" : "s"}
            </span>
            <span>Total: {formatMinutes(totalMinutes)}</span>
          </div>
          <ul className="flex flex-col gap-3">
            {sessions.map((s) => (
              <li key={s.id}>
                <Card>
                  <CardContent>
                    <div className="flex items-center justify-between gap-3 pt-1">
                      <div>
                        <div className="text-sm font-medium text-slate-900">
                          {s.subject.name}
                        </div>
                        <div className="text-xs text-slate-500">
                          {s.date} · {formatMinutes(s.minutes)}
                        </div>
                      </div>
                    </div>
                    {s.notes ? (
                      <p className="mt-3 whitespace-pre-wrap text-sm text-slate-700">
                        {s.notes}
                      </p>
                    ) : (
                      <p className="mt-3 text-sm italic text-slate-400">
                        No notes for this session.
                      </p>
                    )}
                  </CardContent>
                </Card>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
