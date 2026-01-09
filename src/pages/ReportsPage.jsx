import React, { useState, useMemo } from "react";
import { motion as Motion, AnimatePresence } from "framer-motion";
import { useStore } from "../providers/StoreProvider";
import { classNames, computeFinalAverage, exportXLSX } from "../utils/helpers";
import {
  BarChart3,
  PieChart,
  TrendingUp,
  Users,
  GraduationCap,
  Briefcase,
  Download,
  Filter,
  Calendar,
  ChevronDown,
  RefreshCw,
  FileSpreadsheet,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Printer,
} from "lucide-react";

// ==================== CONSTANTS ====================
const EMIRATES = ["Abu Dhabi", "Dubai", "Sharjah", "Ajman", "Umm Al Quwain", "Ras Al Khaimah", "Fujairah"];
const TRACKS = [
  { id: "stem", name: "STEM Core" },
  { id: "lang", name: "Languages" },
  { id: "ict", name: "ICT" },
];

const STATUS_PIPELINE = [
  "Imported",
  "Eligible",
  "Assigned",
  "In Training",
  "Courses Completed",
  "Assessed",
  "Graduated",
  "Ready for Hiring",
  "Hired/Closed",
];

const HIRING_STAGES = [
  "Graduated",
  "Ready for Hiring",
  "Interview Scheduled",
  "Interview Completed",
  "Offer Extended",
  "Offer Accepted",
  "Assigned School",
  "On Hold",
  "Rejected/Closed",
];

// ==================== CHART COMPONENTS ====================

function DonutChart({ data, size = 180, thickness = 35, showLegend = true }) {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  if (total === 0) return <div className="text-slate-400 text-sm">No data</div>;

  let cumulative = 0;
  const segments = data.map((d, i) => {
    const startAngle = (cumulative / total) * 360;
    cumulative += d.value;
    const endAngle = (cumulative / total) * 360;
    return { ...d, startAngle, endAngle };
  });

  const radius = size / 2;
  const innerRadius = radius - thickness;

  function polarToCartesian(cx, cy, r, angle) {
    const rad = ((angle - 90) * Math.PI) / 180;
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
  }

  function describeArc(cx, cy, r, startAngle, endAngle) {
    const start = polarToCartesian(cx, cy, r, endAngle);
    const end = polarToCartesian(cx, cy, r, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
    return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`;
  }

  const [hovered, setHovered] = useState(null);

  return (
    <div className="flex items-center gap-6">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size}>
          {segments.map((seg, i) => (
            <g key={i}>
              <path
                d={describeArc(radius, radius, radius - 2, seg.startAngle, seg.endAngle)}
                fill="none"
                stroke={seg.color}
                strokeWidth={thickness}
                className="transition-all duration-200"
                style={{
                  opacity: hovered === null || hovered === i ? 1 : 0.4,
                  transform: hovered === i ? "scale(1.02)" : "scale(1)",
                  transformOrigin: "center",
                }}
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
              />
            </g>
          ))}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-2xl font-bold">{total}</div>
          <div className="text-xs text-slate-500">Total</div>
        </div>
      </div>
      {showLegend && (
        <div className="space-y-2">
          {data.map((d, i) => (
            <div
              key={i}
              className={classNames(
                "flex items-center gap-2 text-sm transition-opacity",
                hovered !== null && hovered !== i ? "opacity-40" : ""
              )}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
            >
              <div className="h-3 w-3 rounded-full" style={{ backgroundColor: d.color }} />
              <span className="text-slate-600">{d.label}</span>
              <span className="font-semibold">{d.value}</span>
              <span className="text-slate-400 text-xs">({((d.value / total) * 100).toFixed(0)}%)</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function BarChart({ data, height = 200, barColor = "#6366f1", showValues = true, horizontal = false }) {
  const maxValue = Math.max(...data.map((d) => d.value), 1);
  const [hovered, setHovered] = useState(null);

  if (horizontal) {
    return (
      <div className="space-y-2">
        {data.map((d, i) => (
          <div
            key={i}
            className={classNames("transition-opacity", hovered !== null && hovered !== i ? "opacity-40" : "")}
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
          >
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-slate-600 truncate max-w-[150px]">{d.label}</span>
              <span className="font-semibold">{d.value}</span>
            </div>
            <div className="h-6 bg-slate-100 rounded-lg overflow-hidden">
              <Motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(d.value / maxValue) * 100}%` }}
                transition={{ duration: 0.5, delay: i * 0.05 }}
                className="h-full rounded-lg"
                style={{ backgroundColor: d.color || barColor }}
              />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex items-end gap-2" style={{ height }}>
      {data.map((d, i) => (
        <div
          key={i}
          className={classNames(
            "flex-1 flex flex-col items-center transition-opacity",
            hovered !== null && hovered !== i ? "opacity-40" : ""
          )}
          onMouseEnter={() => setHovered(i)}
          onMouseLeave={() => setHovered(null)}
        >
          {showValues && (
            <span className="text-xs font-semibold text-slate-600 mb-1">{d.value}</span>
          )}
          <Motion.div
            initial={{ height: 0 }}
            animate={{ height: `${(d.value / maxValue) * (height - 40)}px` }}
            transition={{ duration: 0.5, delay: i * 0.05 }}
            className="w-full rounded-t-lg min-h-[4px]"
            style={{ backgroundColor: d.color || barColor }}
          />
          <span className="text-xs text-slate-500 mt-2 text-center truncate w-full">{d.label}</span>
        </div>
      ))}
    </div>
  );
}

function FunnelChart({ data, height = 300 }) {
  const maxValue = Math.max(...data.map((d) => d.value), 1);
  const [hovered, setHovered] = useState(null);

  return (
    <div className="space-y-1" style={{ minHeight: height }}>
      {data.map((d, i) => {
        const widthPct = 40 + (d.value / maxValue) * 60;
        const prevValue = i > 0 ? data[i - 1].value : d.value;
        const conversionRate = prevValue > 0 ? ((d.value / prevValue) * 100).toFixed(0) : 100;

        return (
          <div
            key={i}
            className={classNames(
              "relative transition-opacity",
              hovered !== null && hovered !== i ? "opacity-40" : ""
            )}
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
          >
            <Motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: `${widthPct}%`, opacity: 1 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="mx-auto rounded-lg py-3 px-4 flex items-center justify-between"
              style={{ backgroundColor: d.color }}
            >
              <span className="text-white font-medium text-sm">{d.label}</span>
              <span className="text-white font-bold">{d.value}</span>
            </Motion.div>
            {i > 0 && (
              <div className="absolute -top-1 right-4 text-xs text-slate-500">
                {conversionRate}% →
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function KpiCard({ title, value, subtitle, trend, trendLabel, icon: Icon, color = "indigo" }) {
  const colorClasses = {
    indigo: "bg-indigo-50 text-indigo-600",
    emerald: "bg-emerald-50 text-emerald-600",
    amber: "bg-amber-50 text-amber-600",
    rose: "bg-rose-50 text-rose-600",
    sky: "bg-sky-50 text-sky-600",
    violet: "bg-violet-50 text-violet-600",
  };

  return (
    <div className="rounded-2xl border bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-500">{title}</p>
          <p className="text-3xl font-bold mt-1">{value}</p>
          {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
        </div>
        {Icon && (
          <div className={classNames("h-12 w-12 rounded-xl flex items-center justify-center", colorClasses[color])}>
            <Icon className="h-6 w-6" />
          </div>
        )}
      </div>
      {trend !== undefined && (
        <div className="mt-3 flex items-center gap-1 text-sm">
          {trend > 0 ? (
            <ArrowUpRight className="h-4 w-4 text-emerald-500" />
          ) : trend < 0 ? (
            <ArrowDownRight className="h-4 w-4 text-rose-500" />
          ) : (
            <Minus className="h-4 w-4 text-slate-400" />
          )}
          <span className={trend > 0 ? "text-emerald-600" : trend < 0 ? "text-rose-600" : "text-slate-500"}>
            {Math.abs(trend)}%
          </span>
          {trendLabel && <span className="text-slate-400">{trendLabel}</span>}
        </div>
      )}
    </div>
  );
}

// ==================== FILTER COMPONENT ====================

function ReportFilters({ filters, setFilters, showDateRange = true, showEmirate = true, showTrack = true, showStatus = true }) {
  return (
    <div className="flex flex-wrap items-center gap-3 p-4 bg-slate-50 rounded-xl border">
      <Filter className="h-4 w-4 text-slate-400" />
      
      {showDateRange && (
        <div className="flex items-center gap-2">
          <label className="text-sm text-slate-600">From:</label>
          <input
            type="date"
            className="rounded-lg border px-3 py-1.5 text-sm"
            value={filters.dateFrom}
            onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
          />
          <label className="text-sm text-slate-600">To:</label>
          <input
            type="date"
            className="rounded-lg border px-3 py-1.5 text-sm"
            value={filters.dateTo}
            onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
          />
        </div>
      )}

      {showEmirate && (
        <select
          className="rounded-lg border px-3 py-1.5 text-sm"
          value={filters.emirate}
          onChange={(e) => setFilters({ ...filters, emirate: e.target.value })}
        >
          <option value="">All Emirates</option>
          {EMIRATES.map((em) => (
            <option key={em} value={em}>{em}</option>
          ))}
        </select>
      )}

      {showTrack && (
        <select
          className="rounded-lg border px-3 py-1.5 text-sm"
          value={filters.track}
          onChange={(e) => setFilters({ ...filters, track: e.target.value })}
        >
          <option value="">All Tracks</option>
          {TRACKS.map((t) => (
            <option key={t.id} value={t.id}>{t.name}</option>
          ))}
        </select>
      )}

      {showStatus && (
        <select
          className="rounded-lg border px-3 py-1.5 text-sm"
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
        >
          <option value="">All Statuses</option>
          {STATUS_PIPELINE.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      )}

      <button
        onClick={() => setFilters({ dateFrom: "", dateTo: "", emirate: "", track: "", status: "" })}
        className="ml-auto text-sm text-slate-500 hover:text-slate-700 flex items-center gap-1"
      >
        <RefreshCw className="h-3 w-3" />
        Reset
      </button>
    </div>
  );
}

// ==================== REPORT TABS ====================

const REPORT_TABS = [
  { id: "pipeline", label: "Pipeline Overview", icon: TrendingUp },
  { id: "cohort", label: "Cohort Progress", icon: Users },
  { id: "course", label: "Course Performance", icon: GraduationCap },
  { id: "hiring", label: "Hiring Analytics", icon: Briefcase },
];

// ==================== PIPELINE OVERVIEW REPORT ====================

function PipelineOverviewReport({ candidates, filters }) {
  const filtered = useMemo(() => {
    return candidates.filter((c) => {
      if (filters.emirate && c.emirate !== filters.emirate) return false;
      if (filters.track && c.trackId !== filters.track) return false;
      if (filters.status && c.status !== filters.status) return false;
      return true;
    });
  }, [candidates, filters]);

  // Pipeline stage counts
  const stageCounts = useMemo(() => {
    const counts = {};
    STATUS_PIPELINE.forEach((s) => (counts[s] = 0));
    filtered.forEach((c) => {
      if (counts[c.status] !== undefined) counts[c.status]++;
    });
    return counts;
  }, [filtered]);

  // By emirate
  const byEmirate = useMemo(() => {
    const counts = {};
    EMIRATES.forEach((em) => (counts[em] = 0));
    filtered.forEach((c) => {
      if (counts[c.emirate] !== undefined) counts[c.emirate]++;
    });
    return Object.entries(counts).map(([label, value]) => ({ label, value }));
  }, [filtered]);

  // By track
  const byTrack = useMemo(() => {
    return TRACKS.map((t) => ({
      label: t.name,
      value: filtered.filter((c) => c.trackId === t.id).length,
      color: t.id === "stem" ? "#6366f1" : t.id === "lang" ? "#10b981" : "#f59e0b",
    }));
  }, [filtered]);

  // Funnel data
  const funnelData = useMemo(() => {
    const colors = [
      "#94a3b8", "#64748b", "#6366f1", "#8b5cf6", 
      "#a855f7", "#10b981", "#059669", "#14b8a6", "#0d9488"
    ];
    return STATUS_PIPELINE.map((stage, i) => ({
      label: stage,
      value: stageCounts[stage] || 0,
      color: colors[i % colors.length],
    }));
  }, [stageCounts]);

  // KPIs
  const totalCandidates = filtered.length;
  const inTraining = filtered.filter((c) => c.status === "In Training").length;
  const graduated = filtered.filter((c) => ["Graduated", "Ready for Hiring", "Hired/Closed"].includes(c.status)).length;
  const conversionRate = totalCandidates > 0 ? ((graduated / totalCandidates) * 100).toFixed(1) : 0;

  function exportReport() {
    const rows = filtered.map((c) => ({
      ID: c.id,
      Name: c.name,
      Email: c.email,
      Emirate: c.emirate,
      Subject: c.subject,
      Track: TRACKS.find((t) => t.id === c.trackId)?.name || c.trackId,
      Status: c.status,
      GPA: c.gpa,
    }));
    exportXLSX("Pipeline_Report.xlsx", rows, Object.keys(rows[0] || {}).map((k) => ({ key: k })), "Pipeline");
  }

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard title="Total Candidates" value={totalCandidates} icon={Users} color="indigo" />
        <KpiCard title="In Training" value={inTraining} icon={GraduationCap} color="amber" />
        <KpiCard title="Graduated" value={graduated} icon={TrendingUp} color="emerald" />
        <KpiCard title="Conversion Rate" value={`${conversionRate}%`} subtitle="Import → Graduate" icon={BarChart3} color="violet" />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Funnel */}
        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <h3 className="font-semibold mb-4">Pipeline Funnel</h3>
          <FunnelChart data={funnelData} />
        </div>

        {/* By Track */}
        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <h3 className="font-semibold mb-4">Distribution by Track</h3>
          <DonutChart data={byTrack} />
        </div>
      </div>

      {/* By Emirate */}
      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        <h3 className="font-semibold mb-4">Candidates by Emirate</h3>
        <BarChart data={byEmirate} height={220} />
      </div>

      {/* Data Table */}
      <div className="rounded-2xl border bg-white shadow-sm overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold">Filtered Candidates ({filtered.length})</h3>
          <button onClick={exportReport} className="btn btn-secondary flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export XLSX
          </button>
        </div>
        <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 sticky top-0">
              <tr>
                <th className="text-left px-4 py-3">ID</th>
                <th className="text-left px-4 py-3">Name</th>
                <th className="text-left px-4 py-3">Emirate</th>
                <th className="text-left px-4 py-3">Track</th>
                <th className="text-left px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.slice(0, 50).map((c) => (
                <tr key={c.id} className="border-t hover:bg-slate-50">
                  <td className="px-4 py-2 font-mono text-xs">{c.id}</td>
                  <td className="px-4 py-2">{c.name}</td>
                  <td className="px-4 py-2">{c.emirate}</td>
                  <td className="px-4 py-2">{TRACKS.find((t) => t.id === c.trackId)?.name || "—"}</td>
                  <td className="px-4 py-2">
                    <span className="px-2 py-1 rounded-full text-xs bg-slate-100">{c.status}</span>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                    No candidates match the current filters
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {filtered.length > 50 && (
          <div className="p-3 text-center text-sm text-slate-500 border-t">
            Showing 50 of {filtered.length} candidates. Export for full data.
          </div>
        )}
      </div>
    </div>
  );
}

// ==================== COHORT PROGRESS REPORT ====================

function CohortProgressReport({ candidates, courses }) {
  // Extract unique cohorts from enrollments
  const cohortData = useMemo(() => {
    const cohorts = new Map();

    candidates.forEach((c) => {
      (c.enrollments || []).forEach((e) => {
        const cohortKey = e.cohort || "Unassigned";
        if (!cohorts.has(cohortKey)) {
          cohorts.set(cohortKey, {
            name: cohortKey,
            candidates: new Set(),
            totalEnrollments: 0,
            completedEnrollments: 0,
            startDate: e.startDate || "",
          });
        }
        const cohort = cohorts.get(cohortKey);
        cohort.candidates.add(c.id);
        cohort.totalEnrollments++;
        if (e.status === "Completed") cohort.completedEnrollments++;
      });
    });

    return Array.from(cohorts.values())
      .map((c) => ({
        ...c,
        candidateCount: c.candidates.size,
        completionRate: c.totalEnrollments > 0 ? Math.round((c.completedEnrollments / c.totalEnrollments) * 100) : 0,
      }))
      .sort((a, b) => b.candidateCount - a.candidateCount);
  }, [candidates]);

  // Overall stats
  const totalCohorts = cohortData.length;
  const avgCompletion = cohortData.length > 0
    ? Math.round(cohortData.reduce((sum, c) => sum + c.completionRate, 0) / cohortData.length)
    : 0;
  const totalEnrolled = cohortData.reduce((sum, c) => sum + c.candidateCount, 0);

  // At-risk candidates (in training but low scores)
  const atRiskCount = useMemo(() => {
    return candidates.filter((c) => {
      if (c.status !== "In Training") return false;
      const avg = computeFinalAverage(c, courses);
      return avg !== null && avg < 70;
    }).length;
  }, [candidates, courses]);

  function exportCohortReport() {
    const rows = cohortData.map((c) => ({
      Cohort: c.name,
      Candidates: c.candidateCount,
      "Total Enrollments": c.totalEnrollments,
      "Completed Enrollments": c.completedEnrollments,
      "Completion Rate": `${c.completionRate}%`,
      "Start Date": c.startDate,
    }));
    exportXLSX("Cohort_Progress.xlsx", rows, Object.keys(rows[0] || {}).map((k) => ({ key: k })), "Cohorts");
  }

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard title="Active Cohorts" value={totalCohorts} icon={Users} color="indigo" />
        <KpiCard title="Total Enrolled" value={totalEnrolled} icon={GraduationCap} color="emerald" />
        <KpiCard title="Avg Completion" value={`${avgCompletion}%`} icon={TrendingUp} color="sky" />
        <KpiCard title="At Risk" value={atRiskCount} subtitle="Score < 70" icon={BarChart3} color="rose" />
      </div>

      {/* Cohort Progress Bars */}
      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Cohort Completion Rates</h3>
          <button onClick={exportCohortReport} className="btn btn-secondary flex items-center gap-2 text-sm">
            <Download className="h-4 w-4" />
            Export
          </button>
        </div>
        {cohortData.length === 0 ? (
          <div className="text-center py-8 text-slate-500">No cohort data available</div>
        ) : (
          <div className="space-y-4">
            {cohortData.slice(0, 10).map((cohort, i) => (
              <div key={cohort.name} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{cohort.name}</span>
                  <div className="flex items-center gap-4 text-slate-500">
                    <span>{cohort.candidateCount} candidates</span>
                    <span className="font-semibold text-slate-900">{cohort.completionRate}%</span>
                  </div>
                </div>
                <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                  <Motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${cohort.completionRate}%` }}
                    transition={{ duration: 0.5, delay: i * 0.05 }}
                    className={classNames(
                      "h-full rounded-full",
                      cohort.completionRate >= 80 ? "bg-emerald-500" :
                      cohort.completionRate >= 50 ? "bg-amber-500" : "bg-rose-500"
                    )}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Cohort Table */}
      <div className="rounded-2xl border bg-white shadow-sm overflow-hidden">
        <div className="p-4 border-b">
          <h3 className="font-semibold">All Cohorts</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="text-left px-4 py-3">Cohort</th>
                <th className="text-center px-4 py-3">Candidates</th>
                <th className="text-center px-4 py-3">Enrollments</th>
                <th className="text-center px-4 py-3">Completed</th>
                <th className="text-center px-4 py-3">Completion Rate</th>
                <th className="text-left px-4 py-3">Start Date</th>
              </tr>
            </thead>
            <tbody>
              {cohortData.map((cohort) => (
                <tr key={cohort.name} className="border-t hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium">{cohort.name}</td>
                  <td className="px-4 py-3 text-center">{cohort.candidateCount}</td>
                  <td className="px-4 py-3 text-center">{cohort.totalEnrollments}</td>
                  <td className="px-4 py-3 text-center">{cohort.completedEnrollments}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={classNames(
                      "px-2 py-1 rounded-full text-xs font-medium",
                      cohort.completionRate >= 80 ? "bg-emerald-100 text-emerald-700" :
                      cohort.completionRate >= 50 ? "bg-amber-100 text-amber-700" : "bg-rose-100 text-rose-700"
                    )}>
                      {cohort.completionRate}%
                    </span>
                  </td>
                  <td className="px-4 py-3">{cohort.startDate || "—"}</td>
                </tr>
              ))}
              {cohortData.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                    No cohort data available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ==================== COURSE PERFORMANCE REPORT ====================

function CoursePerformanceReport({ candidates, courses }) {
  const courseStats = useMemo(() => {
    const stats = new Map();

    // Initialize with all courses
    courses.forEach((course) => {
      stats.set(course.code, {
        code: course.code,
        title: course.title,
        passThreshold: course.passThreshold || 70,
        isRequired: course.isRequired,
        tracks: course.tracks || [],
        enrolled: 0,
        completed: 0,
        passed: 0,
        failed: 0,
        totalScore: 0,
        scoreCount: 0,
      });
    });

    // Aggregate data from candidates
    candidates.forEach((c) => {
      // Enrollments
      (c.enrollments || []).forEach((e) => {
        const code = String(e.code || "").toUpperCase();
        if (!stats.has(code)) return;
        const s = stats.get(code);
        s.enrolled++;
        if (e.status === "Completed") s.completed++;
      });

      // Results
      (c.courseResults || []).forEach((r) => {
        const code = String(r.code || "").toUpperCase();
        if (!stats.has(code)) return;
        const s = stats.get(code);
        if (r.score !== undefined && r.score !== null) {
          s.totalScore += Number(r.score);
          s.scoreCount++;
          if (Number(r.score) >= s.passThreshold) {
            s.passed++;
          } else {
            s.failed++;
          }
        }
      });
    });

    return Array.from(stats.values()).map((s) => ({
      ...s,
      avgScore: s.scoreCount > 0 ? Math.round(s.totalScore / s.scoreCount) : null,
      passRate: s.passed + s.failed > 0 ? Math.round((s.passed / (s.passed + s.failed)) * 100) : null,
    }));
  }, [candidates, courses]);

  // Sort by enrollment count
  const sortedStats = useMemo(() => {
    return [...courseStats].sort((a, b) => b.enrolled - a.enrolled);
  }, [courseStats]);

  // Top performers (highest pass rate)
  const topPerformers = useMemo(() => {
    return [...courseStats]
      .filter((c) => c.passRate !== null && c.passed + c.failed >= 5)
      .sort((a, b) => (b.passRate || 0) - (a.passRate || 0))
      .slice(0, 5);
  }, [courseStats]);

  // Struggling courses (lowest pass rate)
  const strugglingCourses = useMemo(() => {
    return [...courseStats]
      .filter((c) => c.passRate !== null && c.passed + c.failed >= 5)
      .sort((a, b) => (a.passRate || 100) - (b.passRate || 100))
      .slice(0, 5);
  }, [courseStats]);

  // KPIs
  const totalCourses = courses.length;
  const avgPassRate = courseStats.filter((c) => c.passRate !== null).length > 0
    ? Math.round(courseStats.filter((c) => c.passRate !== null).reduce((sum, c) => sum + (c.passRate || 0), 0) / courseStats.filter((c) => c.passRate !== null).length)
    : 0;
  const totalEnrollments = courseStats.reduce((sum, c) => sum + c.enrolled, 0);

  function exportCourseReport() {
    const rows = sortedStats.map((c) => ({
      Code: c.code,
      Title: c.title,
      Required: c.isRequired ? "Yes" : "No",
      "Pass Threshold": c.passThreshold,
      Enrolled: c.enrolled,
      Completed: c.completed,
      Passed: c.passed,
      Failed: c.failed,
      "Avg Score": c.avgScore || "—",
      "Pass Rate": c.passRate !== null ? `${c.passRate}%` : "—",
    }));
    exportXLSX("Course_Performance.xlsx", rows, Object.keys(rows[0] || {}).map((k) => ({ key: k })), "Courses");
  }

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard title="Total Courses" value={totalCourses} icon={GraduationCap} color="indigo" />
        <KpiCard title="Total Enrollments" value={totalEnrollments} icon={Users} color="emerald" />
        <KpiCard title="Avg Pass Rate" value={`${avgPassRate}%`} icon={TrendingUp} color="sky" />
        <KpiCard title="Courses Active" value={courseStats.filter((c) => c.enrolled > 0).length} icon={BarChart3} color="violet" />
      </div>

      {/* Top & Struggling */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <h3 className="font-semibold mb-4 text-emerald-600">🏆 Top Performing Courses</h3>
          {topPerformers.length === 0 ? (
            <div className="text-slate-500 text-sm">Not enough data</div>
          ) : (
            <BarChart
              data={topPerformers.map((c) => ({
                label: c.code,
                value: c.passRate || 0,
                color: "#10b981",
              }))}
              height={180}
              horizontal
            />
          )}
        </div>

        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <h3 className="font-semibold mb-4 text-rose-600">⚠️ Courses Needing Attention</h3>
          {strugglingCourses.length === 0 ? (
            <div className="text-slate-500 text-sm">Not enough data</div>
          ) : (
            <BarChart
              data={strugglingCourses.map((c) => ({
                label: c.code,
                value: c.passRate || 0,
                color: "#f43f5e",
              }))}
              height={180}
              horizontal
            />
          )}
        </div>
      </div>

      {/* Course Table */}
      <div className="rounded-2xl border bg-white shadow-sm overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold">All Courses Performance</h3>
          <button onClick={exportCourseReport} className="btn btn-secondary flex items-center gap-2 text-sm">
            <Download className="h-4 w-4" />
            Export
          </button>
        </div>
        <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 sticky top-0">
              <tr>
                <th className="text-left px-4 py-3">Code</th>
                <th className="text-left px-4 py-3">Title</th>
                <th className="text-center px-4 py-3">Required</th>
                <th className="text-center px-4 py-3">Enrolled</th>
                <th className="text-center px-4 py-3">Passed</th>
                <th className="text-center px-4 py-3">Failed</th>
                <th className="text-center px-4 py-3">Avg Score</th>
                <th className="text-center px-4 py-3">Pass Rate</th>
              </tr>
            </thead>
            <tbody>
              {sortedStats.map((course) => (
                <tr key={course.code} className="border-t hover:bg-slate-50">
                  <td className="px-4 py-3 font-mono text-xs">{course.code}</td>
                  <td className="px-4 py-3">{course.title}</td>
                  <td className="px-4 py-3 text-center">
                    {course.isRequired ? (
                      <span className="px-2 py-0.5 rounded-full text-xs bg-indigo-100 text-indigo-700">Yes</span>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">{course.enrolled}</td>
                  <td className="px-4 py-3 text-center text-emerald-600 font-medium">{course.passed}</td>
                  <td className="px-4 py-3 text-center text-rose-600 font-medium">{course.failed}</td>
                  <td className="px-4 py-3 text-center">{course.avgScore || "—"}</td>
                  <td className="px-4 py-3 text-center">
                    {course.passRate !== null ? (
                      <span className={classNames(
                        "px-2 py-1 rounded-full text-xs font-medium",
                        course.passRate >= 80 ? "bg-emerald-100 text-emerald-700" :
                        course.passRate >= 50 ? "bg-amber-100 text-amber-700" : "bg-rose-100 text-rose-700"
                      )}>
                        {course.passRate}%
                      </span>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>
                </tr>
              ))}
              {sortedStats.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-slate-500">
                    No course data available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ==================== HIRING ANALYTICS REPORT ====================

function HiringAnalyticsReport({ candidates }) {
  // Filter to only hiring-eligible candidates
  const hiringCandidates = useMemo(() => {
    const eligibleStatuses = ["Graduated", "Ready for Hiring", "Hired/Closed"];
    return candidates.filter((c) => 
      eligibleStatuses.includes(c.status) || 
      c.hiring?.stage === "Assigned School" || 
      c.hiring?.stage === "Rejected/Closed"
    );
  }, [candidates]);

  // Stage distribution
  const stageDistribution = useMemo(() => {
    const counts = {};
    HIRING_STAGES.forEach((s) => (counts[s] = 0));
    hiringCandidates.forEach((c) => {
      const stage = c.hiring?.stage || "Graduated";
      if (counts[stage] !== undefined) counts[stage]++;
    });
    
    const colors = [
      "#94a3b8", "#6366f1", "#8b5cf6", "#a855f7",
      "#10b981", "#059669", "#14b8a6", "#f59e0b", "#ef4444"
    ];
    
    return HIRING_STAGES.map((stage, i) => ({
      label: stage,
      value: counts[stage] || 0,
      color: colors[i % colors.length],
    }));
  }, [hiringCandidates]);

  // By emirate
  const byEmirate = useMemo(() => {
    const counts = {};
    EMIRATES.forEach((em) => (counts[em] = 0));
    hiringCandidates.forEach((c) => {
      if (counts[c.emirate] !== undefined) counts[c.emirate]++;
    });
    return Object.entries(counts)
      .map(([label, value]) => ({ label, value }))
      .sort((a, b) => b.value - a.value);
  }, [hiringCandidates]);

  // KPIs
  const totalInPipeline = hiringCandidates.length;
  const assignedSchool = hiringCandidates.filter((c) => c.hiring?.stage === "Assigned School").length;
  const offerAccepted = hiringCandidates.filter((c) => c.hiring?.stage === "Offer Accepted").length;
  const rejected = hiringCandidates.filter((c) => c.hiring?.stage === "Rejected/Closed").length;
  const placementRate = totalInPipeline > 0 ? (((assignedSchool + offerAccepted) / totalInPipeline) * 100).toFixed(1) : 0;

  function exportHiringReport() {
    const rows = hiringCandidates.map((c) => ({
      ID: c.id,
      Name: c.name,
      Email: c.email,
      Emirate: c.emirate,
      Subject: c.subject,
      "Training Status": c.status,
      "Hiring Stage": c.hiring?.stage || "Graduated",
      Notes: c.hiring?.notes || "",
      "Last Updated": c.hiring?.updatedAt || "",
    }));
    exportXLSX("Hiring_Analytics.xlsx", rows, Object.keys(rows[0] || {}).map((k) => ({ key: k })), "Hiring");
  }

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard title="In Hiring Pipeline" value={totalInPipeline} icon={Users} color="indigo" />
        <KpiCard title="Assigned to School" value={assignedSchool} icon={Briefcase} color="emerald" />
        <KpiCard title="Offers Accepted" value={offerAccepted} icon={TrendingUp} color="sky" />
        <KpiCard title="Placement Rate" value={`${placementRate}%`} subtitle="of pipeline" icon={BarChart3} color="violet" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <h3 className="font-semibold mb-4">Hiring Stage Distribution</h3>
          <DonutChart data={stageDistribution.filter((d) => d.value > 0)} />
        </div>

        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <h3 className="font-semibold mb-4">Candidates by Emirate (Hiring Pipeline)</h3>
          <BarChart data={byEmirate} height={220} />
        </div>
      </div>

      {/* Funnel */}
      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        <h3 className="font-semibold mb-4">Hiring Funnel</h3>
        <FunnelChart data={stageDistribution.filter((d) => d.value > 0)} />
      </div>

      {/* Data Table */}
      <div className="rounded-2xl border bg-white shadow-sm overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold">Candidates in Hiring Pipeline ({hiringCandidates.length})</h3>
          <button onClick={exportHiringReport} className="btn btn-secondary flex items-center gap-2 text-sm">
            <Download className="h-4 w-4" />
            Export
          </button>
        </div>
        <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 sticky top-0">
              <tr>
                <th className="text-left px-4 py-3">Name</th>
                <th className="text-left px-4 py-3">Email</th>
                <th className="text-left px-4 py-3">Emirate</th>
                <th className="text-left px-4 py-3">Subject</th>
                <th className="text-center px-4 py-3">Hiring Stage</th>
              </tr>
            </thead>
            <tbody>
              {hiringCandidates.slice(0, 50).map((c) => (
                <tr key={c.id} className="border-t hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium">{c.name}</td>
                  <td className="px-4 py-3">{c.email}</td>
                  <td className="px-4 py-3">{c.emirate}</td>
                  <td className="px-4 py-3">{c.subject}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={classNames(
                      "px-2 py-1 rounded-full text-xs font-medium",
                      (c.hiring?.stage === "Assigned School" || c.hiring?.stage === "Offer Accepted") 
                        ? "bg-emerald-100 text-emerald-700" 
                        : c.hiring?.stage === "Rejected/Closed"
                        ? "bg-rose-100 text-rose-700"
                        : "bg-slate-100 text-slate-700"
                    )}>
                      {c.hiring?.stage || "Graduated"}
                    </span>
                  </td>
                </tr>
              ))}
              {hiringCandidates.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                    No candidates in hiring pipeline
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ==================== MAIN REPORTS PAGE ====================

export default function ReportsPage() {
  const { candidates, courses } = useStore();
  const [activeTab, setActiveTab] = useState("pipeline");
  const [filters, setFilters] = useState({
    dateFrom: "",
    dateTo: "",
    emirate: "",
    track: "",
    status: "",
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 print-hide">
        <div>
          <h1 className="text-2xl font-bold">Reports & Analytics</h1>
          <p className="text-sm text-slate-500 mt-1">
            Interactive reports with real-time data visualization
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => window.print()}
            className="btn btn-secondary flex items-center gap-2"
          >
            <Printer className="h-4 w-4" />
            Print Report
          </button>
          <button className="btn btn-secondary flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Schedule Report
          </button>
        </div>
      </div>
      
      {/* Print Header - only visible when printing */}
      <div className="hidden print-only print-header">
        <h1>Talent Tracker - {REPORT_TABS.find(t => t.id === activeTab)?.label || 'Report'}</h1>
        <p className="subtitle">Ministry of Education - Professional Development</p>
        <p className="subtitle">Generated on {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b pb-4 print-hide">
        {REPORT_TABS.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={classNames(
                "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all",
                activeTab === tab.id
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "bg-white border hover:bg-slate-50 text-slate-600"
              )}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Filters (only for Pipeline report) */}
      {activeTab === "pipeline" && (
        <div className="print-hide">
          <ReportFilters filters={filters} setFilters={setFilters} />
        </div>
      )}

      {/* Report Content */}
      <AnimatePresence mode="wait">
        <Motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === "pipeline" && (
            <PipelineOverviewReport candidates={candidates} filters={filters} />
          )}
          {activeTab === "cohort" && (
            <CohortProgressReport candidates={candidates} courses={courses} />
          )}
          {activeTab === "course" && (
            <CoursePerformanceReport candidates={candidates} courses={courses} />
          )}
          {activeTab === "hiring" && (
            <HiringAnalyticsReport candidates={candidates} />
          )}
        </Motion.div>
      </AnimatePresence>
    </div>
  );
}
