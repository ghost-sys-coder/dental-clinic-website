"use client";

import { useState } from "react";
import AppointmentBlock from "./AppointmentBlock";

// Calendar bounds: 8am – 6pm
const DAY_START_MIN = 8 * 60;       // 480
const DAY_TOTAL_MIN = 10 * 60;      // 600
const SLOT_HEIGHT   = 40;           // px per 30-min slot
const TOTAL_HEIGHT  = (DAY_TOTAL_MIN / 30) * SLOT_HEIGHT; // 800px

const HOURS = Array.from({ length: 11 }, (_, i) => i + 8); // 8..18

type Appointment = {
  id: string;
  submissionId: string;
  teamMemberId: string;
  scheduledAt: string;
  apptStatus: string;
  duration: string;
  treatmentType: string | null;
  roomOrChair: string | null;
  doctorName: string;
  patientName: string;
  service: string | null;
};

type Block = {
  id: string;
  teamMemberId: string;
  startsAt: string;
  endsAt: string;
  reason: string | null;
  doctorName: string;
};

type Doctor = { id: string; name: string };

interface Props {
  appointments: Appointment[];
  blocks: Block[];
  doctors: Doctor[];
  weekStart: string; // ISO date string "YYYY-MM-DD"
}

function minutesSinceMidnight(isoStr: string): number {
  const d = new Date(isoStr);
  return d.getHours() * 60 + d.getMinutes();
}

function minutesToPx(minutes: number): number {
  const offsetFromDayStart = minutes - DAY_START_MIN;
  return (offsetFromDayStart / 30) * SLOT_HEIGHT;
}

function durationToPx(durationMin: number): number {
  return (durationMin / 30) * SLOT_HEIGHT;
}

function isoDateKey(isoStr: string): string {
  return isoStr.slice(0, 10);
}

function weekDays(weekStart: string): string[] {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart + "T00:00:00");
    d.setDate(d.getDate() + i);
    return d.toISOString().slice(0, 10);
  });
}

function dayLabel(isoDate: string): string {
  const d = new Date(isoDate + "T00:00:00");
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

function isToday(isoDate: string): boolean {
  return isoDate === new Date().toISOString().slice(0, 10);
}

function formatHour(h: number): string {
  if (h === 12) return "12pm";
  return h > 12 ? `${h - 12}pm` : `${h}am`;
}

export default function WeekCalendar({ appointments, blocks, doctors, weekStart }: Props) {
  const [filterIds, setFilterIds] = useState<Set<string>>(new Set());
  const days = weekDays(weekStart);

  function toggleDoctor(id: string) {
    setFilterIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  const visibleAppts = filterIds.size === 0
    ? appointments
    : appointments.filter((a) => filterIds.has(a.teamMemberId));

  const visibleBlocks = filterIds.size === 0
    ? blocks
    : blocks.filter((b) => filterIds.has(b.teamMemberId));

  return (
    <div className="flex flex-col gap-3">
      {/* Doctor filter */}
      {doctors.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {doctors.map((d) => {
            const active = filterIds.has(d.id);
            return (
              <button
                key={d.id}
                onClick={() => toggleDoctor(d.id)}
                className={`h-7 px-3 rounded-full text-xs font-medium border transition-colors ${
                  active
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-card text-muted-foreground border-border hover:border-primary/50 hover:text-foreground"
                }`}
              >
                {d.name}
              </button>
            );
          })}
          {filterIds.size > 0 && (
            <button
              onClick={() => setFilterIds(new Set())}
              className="h-7 px-3 rounded-full text-xs font-medium border border-border text-muted-foreground hover:text-foreground transition-colors"
            >
              Clear
            </button>
          )}
        </div>
      )}

      {/* Calendar grid */}
      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        {/* Day headers */}
        <div className="flex border-b border-border">
          <div className="w-14 shrink-0" />
          {days.map((day) => (
            <div
              key={day}
              className={`flex-1 px-1 py-2 text-center text-[11px] font-semibold border-l border-border first:border-l-0 truncate ${
                isToday(day)
                  ? "text-primary bg-primary/5"
                  : "text-muted-foreground"
              }`}
            >
              {dayLabel(day)}
            </div>
          ))}
        </div>

        {/* Body */}
        <div className="overflow-y-auto" style={{ maxHeight: "600px" }}>
          <div className="flex">
            {/* Hour labels */}
            <div className="w-14 shrink-0 border-r border-border select-none">
              {HOURS.map((h) => (
                <div
                  key={h}
                  className="flex items-start pt-0.5 px-1.5"
                  style={{ height: SLOT_HEIGHT * 2 }}
                >
                  <span className="text-[10px] text-muted-foreground">{formatHour(h)}</span>
                </div>
              ))}
            </div>

            {/* Day columns */}
            {days.map((day) => {
              const dayAppts = visibleAppts.filter(
                (a) => isoDateKey(a.scheduledAt) === day
              );
              const dayBlocks = visibleBlocks.filter(
                (b) => isoDateKey(b.startsAt) === day || isoDateKey(b.endsAt) === day
              );

              return (
                <div
                  key={day}
                  className={`flex-1 border-l border-border relative ${isToday(day) ? "bg-primary/[0.02]" : ""}`}
                  style={{ height: TOTAL_HEIGHT }}
                >
                  {/* Hour grid lines */}
                  {HOURS.map((h) => (
                    <div
                      key={h}
                      className="absolute w-full border-t border-border/40"
                      style={{ top: (h - 8) * 2 * SLOT_HEIGHT }}
                    />
                  ))}
                  {/* Half-hour grid lines */}
                  {HOURS.map((h) => (
                    <div
                      key={`h-${h}`}
                      className="absolute w-full border-t border-border/20"
                      style={{ top: ((h - 8) * 2 + 1) * SLOT_HEIGHT }}
                    />
                  ))}

                  {/* Availability blocks (behind appointments) */}
                  {dayBlocks.map((b) => {
                    const startMin = minutesSinceMidnight(b.startsAt);
                    const endMin   = minutesSinceMidnight(b.endsAt);
                    const clampedStart = Math.max(startMin, DAY_START_MIN);
                    const clampedEnd   = Math.min(endMin, DAY_START_MIN + DAY_TOTAL_MIN);
                    if (clampedEnd <= clampedStart) return null;
                    return (
                      <div
                        key={b.id}
                        className="absolute left-0.5 right-0.5 rounded border border-dashed border-muted-foreground/30 bg-muted/40 px-1.5 py-1 z-0 overflow-hidden"
                        style={{
                          top: minutesToPx(clampedStart),
                          height: durationToPx(clampedEnd - clampedStart),
                        }}
                        title={b.reason ?? "Unavailable"}
                      >
                        <p className="text-[9px] text-muted-foreground truncate">{b.reason ?? "Blocked"}</p>
                      </div>
                    );
                  })}

                  {/* Appointment blocks */}
                  {dayAppts.map((a) => {
                    const startMin = minutesSinceMidnight(a.scheduledAt);
                    const durationMin = parseInt(a.duration);
                    if (startMin + durationMin <= DAY_START_MIN) return null;
                    if (startMin >= DAY_START_MIN + DAY_TOTAL_MIN) return null;
                    return (
                      <AppointmentBlock
                        key={a.id}
                        id={a.id}
                        apptStatus={a.apptStatus}
                        patientName={a.patientName}
                        service={a.service}
                        treatmentType={a.treatmentType}
                        scheduledAt={new Date(a.scheduledAt)}
                        durationMinutes={durationMin}
                        top={minutesToPx(Math.max(startMin, DAY_START_MIN))}
                        height={durationToPx(durationMin)}
                        showDoctor={filterIds.size > 0}
                        doctorName={a.doctorName}
                      />
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
