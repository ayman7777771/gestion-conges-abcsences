import React, { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import toast from "react-hot-toast";
import api from "../../api/axios";
import "./Calendar.css";

const days = ["lun.", "mar.", "mer.", "jeu.", "ven.", "sam.", "dim."];
const palette = ["#2f9e44", "#e03131", "#1971c2", "#7048e8", "#f08c00", "#0ca678", "#c2255c", "#0b7285"];

const sameOrAfter = (a, b) => a.setHours(0, 0, 0, 0) >= b.setHours(0, 0, 0, 0);
const sameOrBefore = (a, b) => a.setHours(0, 0, 0, 0) <= b.setHours(0, 0, 0, 0);
const inRange = (date, start, end) => sameOrAfter(new Date(date), new Date(start)) && sameOrBefore(new Date(date), new Date(end));
const leaveType = (leave) => leave.leaveType || leave.leave_type || {};

export default function Calendar() {
  const today = new Date();
  const [month, setMonth] = useState(today.getMonth());
  const [year, setYear] = useState(today.getFullYear());
  const [leaves, setLeaves] = useState([]);
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState(null);

  useEffect(() => {
    const fetchCalendarData = async () => {
      try {
        setLoading(true);
        const [calendarRes, typesRes] = await Promise.all([
          api.get(`/team/calendar?month=${month + 1}&year=${year}`),
          api.get("/leave-types"),
        ]);

        setLeaveTypes(typesRes.data || []);
        setLeaves(calendarRes.data || []);
      } catch {
        toast.error("Erreur lors du chargement du calendrier");
      } finally {
        setLoading(false);
      }
    };

    fetchCalendarData();
  }, [month, year]);

  const weeks = useMemo(() => {
    const first = new Date(year, month, 1);
    const offset = (first.getDay() + 6) % 7;
    const total = new Date(year, month + 1, 0).getDate();
    const cells = Array.from({ length: offset + total }, (_, i) =>
      i < offset ? null : new Date(year, month, i - offset + 1),
    );

    while (cells.length % 7) cells.push(null);
    return Array.from({ length: cells.length / 7 }, (_, i) => cells.slice(i * 7, i * 7 + 7));
  }, [month, year]);

  const colorMap = useMemo(
    () => new Map(leaveTypes.map((type, index) => [String(type.id), palette[index % palette.length]])),
    [leaveTypes],
  );

  const visibleLeaves = useMemo(
    () => leaves.filter((leave) => colorMap.has(String(leaveType(leave).id))),
    [leaves, colorMap],
  );

  const colorFor = (type = {}) => colorMap.get(String(type.id)) || palette[0];
  const moveMonth = (step) => {
    const next = new Date(year, month + step, 1);
    setMonth(next.getMonth());
    setYear(next.getFullYear());
  };

  const monthTitle = new Date(year, month).toLocaleDateString("fr-FR", {
    month: "long",
    year: "numeric",
  });

  if (loading) return <div className="cal-container"><Skeleton height={520} /></div>;

  return (
    <div className="cal-container">
      <div className="cal-toolbar">
        <button className="cal-nav-btn" onClick={() => moveMonth(-1)} type="button">
          <ChevronLeft size={18} />
        </button>
        <h1>{monthTitle}</h1>
        <button className="cal-nav-btn" onClick={() => moveMonth(1)} type="button">
          <ChevronRight size={18} />
        </button>
      </div>

      <div className="cal-legend">
        {leaveTypes.map((type) => (
          <span key={type.id}>
            <i style={{ background: colorFor(type) }} /> {type.name}
          </span>
        ))}
      </div>

      <div className="cal-board">
        <div className="cal-days">{days.map((day) => <div key={day}>{day}</div>)}</div>

        {weeks.map((week, weekIndex) => (
          <div className="cal-week" key={weekIndex}>
            <div className="cal-cells">
              {week.map((date, dayIndex) => (
                <div className={`cal-cell ${dayIndex > 4 ? "is-weekend" : ""}`} key={dayIndex}>
                  {date?.getDate()}
                </div>
              ))}
            </div>

            <div className="cal-events">
              {visibleLeaves.map((leave) => {
                const active = week
                  .map((date, index) => (date && inRange(date, leave.start_date, leave.end_date) ? index : -1))
                  .filter((index) => index >= 0);

                if (!active.length) return null;
                const start = active[0] + 1;
                const span = active.at(-1) - active[0] + 1;

                return (
                  <button
                    key={`${leave.id}-${weekIndex}`}
                    className="cal-event"
                    style={{ gridColumn: `${start} / span ${span}`, background: colorFor(leaveType(leave)) }}
                    title={`${leave.user?.name} - ${leaveType(leave).name}`}
                    onClick={() => setSelectedLeave(leave)}
                    type="button"
                  >
                    {leave.user?.name} · {leaveType(leave).name}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {selectedLeave && (
        <div className="cal-popover" onClick={() => setSelectedLeave(null)}>
          <div className="cal-popover-card" onClick={(event) => event.stopPropagation()}>
            <button type="button" onClick={() => setSelectedLeave(null)}><X size={16} /></button>
            <h3>{selectedLeave.user?.name}</h3>
            <p><strong>{leaveType(selectedLeave).name}</strong></p>
            <p>
              {new Date(selectedLeave.start_date).toLocaleDateString("fr-FR")} →{" "}
              {new Date(selectedLeave.end_date).toLocaleDateString("fr-FR")}
            </p>
            <small>Statut: Approuvée</small>
          </div>
        </div>
      )}
    </div>
  );
}
