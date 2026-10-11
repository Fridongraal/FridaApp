import React, { useState, useMemo } from "react";
import { Flame, Calendar, Sparkles, Award } from "lucide-react";
import type { ReviewLog } from "../types";

interface ConsistencyHeatmapProps {
  reviewLogs: ReviewLog[];
  currentStreak: number;
}

interface DayData {
  dateStr: string; // YYYY-MM-DD
  dateObj: Date;
  count: number;
  dayOfWeek: number; // 0: Mon, ..., 6: Sun
}

export const ConsistencyHeatmap: React.FC<ConsistencyHeatmapProps> = ({
  reviewLogs,
  currentStreak,
}) => {
  const [hoveredDay, setHoveredDay] = useState<DayData | null>(null);

  // Group review logs by local date string YYYY-MM-DD
  const activityMap = useMemo(() => {
    const map = new Map<string, number>();
    for (const log of reviewLogs) {
      const d = new Date(log.timestamp);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
        d.getDate()
      ).padStart(2, "0")}`;
      map.set(key, (map.get(key) || 0) + 1);
    }
    return map;
  }, [reviewLogs]);

  // Generate 52 weeks ending with current week
  const { weeks, monthLabels, totalYearReviews, activeDaysCount, maxDay } = useMemo(() => {
    const today = new Date();
    // Normalise to midnight
    const end = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    
    // Day of week where 0 = Monday, ..., 6 = Sunday
    const endDayOfWeek = (end.getDay() + 6) % 7;

    // Start date is 52 weeks ago aligned to Monday
    // 51 full previous weeks + current week up to endDayOfWeek
    const totalDaysToDisplay = 51 * 7 + (endDayOfWeek + 1);
    const start = new Date(end);
    start.setDate(end.getDate() - (totalDaysToDisplay - 1));

    const allDays: DayData[] = [];
    let cur = new Date(start);
    let totalInYear = 0;
    let activeDays = 0;
    let max = { count: 0, dateStr: "" };

    while (cur <= end) {
      const dateStr = `${cur.getFullYear()}-${String(cur.getMonth() + 1).padStart(
        2,
        "0"
      )}-${String(cur.getDate()).padStart(2, "0")}`;
      const count = activityMap.get(dateStr) || 0;
      const dayOfWeek = (cur.getDay() + 6) % 7;

      if (count > 0) {
        totalInYear += count;
        activeDays += 1;
        if (count > max.count) {
          max = { count, dateStr };
        }
      }

      allDays.push({
        dateStr,
        dateObj: new Date(cur),
        count,
        dayOfWeek,
      });

      cur.setDate(cur.getDate() + 1);
    }

    // Chunk allDays into weeks (columns)
    const generatedWeeks: (DayData | null)[][] = [];
    let currentWeek: (DayData | null)[] = [];

    // Pad first week if it didn't start on Monday (though start was aligned to Monday)
    const firstDay = allDays[0];
    if (firstDay && firstDay.dayOfWeek > 0) {
      for (let i = 0; i < firstDay.dayOfWeek; i++) {
        currentWeek.push(null);
      }
    }

    for (const day of allDays) {
      currentWeek.push(day);
      if (currentWeek.length === 7) {
        generatedWeeks.push(currentWeek);
        currentWeek = [];
      }
    }
    if (currentWeek.length > 0) {
      // Pad end of last week
      while (currentWeek.length < 7) {
        currentWeek.push(null);
      }
      generatedWeeks.push(currentWeek);
    }

    // Month labels: map column index to Month name when month changes
    const months = [
      "Ene",
      "Feb",
      "Mar",
      "Abr",
      "May",
      "Jun",
      "Jul",
      "Ago",
      "Sep",
      "Oct",
      "Nov",
      "Dic",
    ];
    const labels: { colIndex: number; name: string }[] = [];
    let lastMonth = -1;

    generatedWeeks.forEach((week, colIdx) => {
      // Find the first non-null day in week
      const day = week.find((d) => d !== null);
      if (day) {
        const m = day.dateObj.getMonth();
        if (m !== lastMonth) {
          labels.push({ colIndex: colIdx, name: months[m] });
          lastMonth = m;
        }
      }
    });

    return {
      weeks: generatedWeeks,
      monthLabels: labels,
      totalYearReviews: totalInYear,
      activeDaysCount: activeDays,
      maxDay: max,
    };
  }, [activityMap]);

  // Determine intensity color
  const getColorClass = (count: number) => {
    if (count === 0) return "bg-slate-100 hover:ring-1 hover:ring-slate-300";
    if (count <= 4) return "bg-purple-200 hover:ring-1 hover:ring-purple-400";
    if (count <= 11) return "bg-purple-400 hover:ring-1 hover:ring-purple-600";
    if (count <= 24) return "bg-purple-600 hover:ring-1 hover:ring-purple-800";
    return "bg-purple-800 hover:ring-1 hover:ring-purple-950";
  };

  const formatDateLabel = (dateStr: string) => {
    try {
      const [y, m, d] = dateStr.split("-").map(Number);
      const date = new Date(y, m - 1, d);
      return date.toLocaleDateString("es-ES", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-7 border border-purple-100 shadow-sm space-y-5">
      {/* Heatmap Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-purple-600" />
            <span>Calendario de Consistencia</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Cada celda representa tu actividad diaria de repaso durante el último año
          </p>
        </div>

        {/* Quick highlight stats */}
        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 rounded-xl bg-purple-50 border border-purple-100 flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-purple-600" />
            <span className="text-xs font-bold text-purple-900">
              {totalYearReviews} repasos
            </span>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200/70 flex items-center gap-2">
            <Flame className="w-3.5 h-3.5 text-amber-500 fill-current" />
            <span className="text-xs font-bold text-amber-900">
              {activeDaysCount} días activos
            </span>
          </div>
        </div>
      </div>

      {/* Heatmap Grid with horizontal scroll */}
      <div className="overflow-x-auto pb-2 pt-1 select-none">
        <div className="min-w-[760px]">
          {/* Month labels header */}
          <div className="flex text-[11px] font-semibold text-slate-400 pl-7 pb-1.5">
            {monthLabels.map((lbl, idx) => (
              <div
                key={idx}
                style={{
                  width: `${Math.max(
                    38,
                    (monthLabels[idx + 1]?.colIndex
                      ? (monthLabels[idx + 1].colIndex - lbl.colIndex) * 14.5
                      : 45)
                  )}px`,
                }}
                className="truncate"
              >
                {lbl.name}
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            {/* Days of week labels */}
            <div className="flex flex-col justify-between text-[10px] font-bold text-slate-400 pr-1 py-0.5 w-6 shrink-0 leading-none">
              <span>Lun</span>
              <span className="opacity-0">Mar</span>
              <span>Mié</span>
              <span className="opacity-0">Jue</span>
              <span>Vie</span>
              <span className="opacity-0">Sáb</span>
              <span>Dom</span>
            </div>

            {/* Weeks Columns */}
            <div className="flex gap-1">
              {weeks.map((week, colIdx) => (
                <div key={colIdx} className="flex flex-col gap-1">
                  {week.map((day, rowIdx) => {
                    if (!day) {
                      return (
                        <div
                          key={`empty-${rowIdx}`}
                          className="w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-[3px] bg-transparent"
                        />
                      );
                    }
                    return (
                      <div
                        key={day.dateStr}
                        onMouseEnter={() => setHoveredDay(day)}
                        onMouseLeave={() => setHoveredDay(null)}
                        className={`w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-[3px] transition-all cursor-pointer ${getColorClass(
                          day.count
                        )}`}
                        title={`${day.count} ${
                          day.count === 1 ? "repaso" : "repasos"
                        } el ${day.dateStr}`}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Tooltip & Legend Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1 border-t border-purple-50 text-xs">
        {/* Active hover info */}
        <div className="min-h-[22px] flex items-center text-slate-600 font-medium">
          {hoveredDay ? (
            <span className="inline-flex items-center gap-1.5 animate-in fade-in duration-100">
              <span className="font-bold text-purple-700">
                {hoveredDay.count} {hoveredDay.count === 1 ? "repaso" : "repasos"}
              </span>
              <span>el {formatDateLabel(hoveredDay.dateStr)}</span>
            </span>
          ) : (
            <span className="text-slate-400">
              Pasa el cursor sobre un día para ver los repasos
            </span>
          )}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-2 text-[11px] text-slate-400 shrink-0">
          <span>Menos</span>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-[3px] bg-slate-100 border border-slate-200/60" />
            <div className="w-3 h-3 rounded-[3px] bg-purple-200" />
            <div className="w-3 h-3 rounded-[3px] bg-purple-400" />
            <div className="w-3 h-3 rounded-[3px] bg-purple-600" />
            <div className="w-3 h-3 rounded-[3px] bg-purple-800" />
          </div>
          <span>Más</span>
        </div>
      </div>

      {/* Best Day & Consistency Note */}
      {maxDay.count > 0 && (
        <div className="p-3.5 rounded-2xl bg-purple-50/50 border border-purple-100/60 flex items-center justify-between gap-3 text-xs text-purple-900">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-purple-600 shrink-0" />
            <span>
              <strong>Récord personal:</strong> {maxDay.count} tarjetas repasadas en un solo día ({formatDateLabel(maxDay.dateStr)}).
            </span>
          </div>
          {currentStreak > 0 && (
            <span className="font-bold text-amber-700 bg-amber-100/80 px-2 py-0.5 rounded-lg shrink-0">
              🔥 Racha de {currentStreak} {currentStreak === 1 ? "día" : "días"}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
