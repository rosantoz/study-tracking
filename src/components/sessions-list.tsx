"use client";

import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { useToast } from "@/components/ui/toast";
import { formatMinutes } from "@/lib/utils";
import type { SessionDTO, SubjectDTO } from "@/types/api";

export function SessionsList() {
  const [subjects, setSubjects] = useState<SubjectDTO[]>([]);
  const [subjectId, setSubjectId] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [sessions, setSessions] = useState<SessionDTO[] | null>(null);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  const load = useCallback(
    async (params: { subjectId?: string; from?: string; to?: string }) => {
      setLoading(true);
      try {
        const { sessions } = await api.sessions.list(params);
        setSessions(sessions);
      } catch (err) {
        toast.show((err as Error).message, "error");
      } finally {
        setLoading(false);
      }
    },
    [toast],
  );

  useEffect(() => {
    api.subjects
      .list()
      .then(({ subjects }) => setSubjects(subjects))
      .catch((e) => toast.show((e as Error).message, "error"));
    load({});
  }, [toast, load]);

  function onApply(e: React.FormEvent) {
    e.preventDefault();
    load({
      subjectId: subjectId || undefined,
      from: from || undefined,
      to: to || undefined,
    });
  }

  function onClear() {
    setSubjectId("");
    setFrom("");
    setTo("");
    load({});
  }

  const hasFilters = Boolean(subjectId || from || to);
  const totalMinutes = sessions?.reduce((acc, s) => acc + s.minutes, 0) ?? 0;

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardContent>
          <form onSubmit={onApply} className="grid gap-3 pt-2 sm:grid-cols-4 sm:items-end">
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <Label htmlFor="sessions-subject">Subject</Label>
              <Select
                id="sessions-subject"
                value={subjectId}
                onChange={(e) => setSubjectId(e.target.value)}
              >
                <option value="">All subjects</option>
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="sessions-from">From</Label>
              <Input
                id="sessions-from"
                type="date"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="sessions-to">To</Label>
              <Input
                id="sessions-to"
                type="date"
                value={to}
                onChange={(e) => setTo(e.target.value)}
              />
            </div>
            <div className="sm:col-span-4 flex justify-end gap-2">
              {hasFilters && (
                <Button type="button" variant="ghost" onClick={onClear} disabled={loading}>
                  Clear
                </Button>
              )}
              <Button type="submit" disabled={loading}>
                {loading ? "Loading…" : "Apply filters"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {sessions === null ? (
        <p className="text-sm text-muted">Loading sessions…</p>
      ) : sessions.length === 0 ? (
        <p className="text-sm text-muted">
          {hasFilters
            ? "No sessions found for those filters."
            : "No sessions yet. Log your first one above."}
        </p>
      ) : (
        <>
          <div className="flex items-center justify-between text-sm text-muted">
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
                        <div className="text-sm font-medium text-foreground">
                          {s.subject.name}
                        </div>
                        <div className="text-xs text-muted">
                          {s.date} · {formatMinutes(s.minutes)}
                        </div>
                      </div>
                    </div>
                    {s.notes ? (
                      <p className="mt-3 whitespace-pre-wrap text-sm text-foreground">
                        {s.notes}
                      </p>
                    ) : (
                      <p className="mt-3 text-sm italic text-placeholder">
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
