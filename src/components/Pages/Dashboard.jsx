import React, { useCallback, useEffect, useMemo, useState } from "react";

import {
  fetchProjects,
  fetchIndividualTasks,
  fetchAgenda,
  fetchISProjectDrive,
} from "../../services/api";

import {
  FolderKanban,
  ListTodo,
  CalendarDays,
  RefreshCw,
  ArrowRight,
  CheckCircle2,
  Clock3,
  CirclePause,
  DollarSign,
  Target,
  ClipboardList,
  XCircle,
  Users,
  BriefcaseBusiness,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

/* =========================================================
   HELPER FUNCTIONS
========================================================= */

function normalize(value) {
  return String(value || "")
    .trim()
    .toLowerCase();
}

function parseBudget(value) {
  if (value === null || value === undefined) {
    return 0;
  }

  const number = parseFloat(String(value).replace(/[^0-9.-]+/g, ""));

  return Number.isNaN(number) ? 0 : number;
}

function parseDate(value) {
  if (!value) return null;

  const text = String(value).trim();

  /* DD/MM/YYYY or DD-MM-YYYY */
  const ddmmyyyy = text.match(/^(\d{1,2})[\/-](\d{1,2})[\/-](\d{4})$/);

  if (ddmmyyyy) {
    const day = Number(ddmmyyyy[1]);
    const month = Number(ddmmyyyy[2]) - 1;
    const year = Number(ddmmyyyy[3]);

    const date = new Date(year, month, day);

    if (!Number.isNaN(date.getTime())) {
      return date;
    }
  }

  /* YYYY-MM-DD */
  const yyyymmdd = text.match(/^(\d{4})[\/-](\d{1,2})[\/-](\d{1,2})$/);

  if (yyyymmdd) {
    const year = Number(yyyymmdd[1]);
    const month = Number(yyyymmdd[2]) - 1;
    const day = Number(yyyymmdd[3]);

    const date = new Date(year, month, day);

    if (!Number.isNaN(date.getTime())) {
      return date;
    }
  }

  const parsed = new Date(text);

  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

/* =========================================================
   STATUS HELPERS
========================================================= */

function getNormalizedStatus(value) {
  const status = normalize(value);

  if (status === "completed" || status === "complete" || status === "done") {
    return "Done";
  }

  if (
    status === "ongoing" ||
    status === "on going" ||
    status === "in progress" ||
    status === "in-progress"
  ) {
    return "Ongoing";
  }

  if (status === "on hold" || status === "hold" || status === "on-hold") {
    return "On Hold";
  }

  if (status === "close" || status === "closed") {
    return "Close";
  }

  return value || "N/A";
}

/* =========================================================
   STATUS BAR
========================================================= */

function StatusBar({ label, count, total, colorClass }) {
  const percentage = total > 0 ? Math.round((count / total) * 100) : 0;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-600">{label}</span>

        <span className="text-sm font-semibold text-gray-800">{count}</span>
      </div>

      <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
        <div
          className={`h-full rounded-full transition-all duration-500 ${colorClass}`}
          style={{
            width: `${percentage}%`,
          }}
        />
      </div>
    </div>
  );
}

/* =========================================================
   DONUT CHART
========================================================= */

function DonutChart({ completed, ongoing, total }) {
  const completedPercentage = total > 0 ? (completed / total) * 100 : 0;

  const ongoingPercentage = total > 0 ? (ongoing / total) * 100 : 0;

  const radius = 42;

  const circumference = 2 * Math.PI * radius;

  const completedLength = (completedPercentage / 100) * circumference;

  const ongoingLength = (ongoingPercentage / 100) * circumference;

  return (
    <div className="relative flex h-32 w-32 shrink-0 items-center justify-center">
      <svg
        width="128"
        height="128"
        viewBox="0 0 128 128"
        className="-rotate-90"
      >
        {/* Background */}
        <circle
          cx="64"
          cy="64"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="12"
          className="text-gray-100"
        />

        {/* Ongoing */}
        <circle
          cx="64"
          cy="64"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="12"
          strokeDasharray={`${ongoingLength} ${circumference}`}
          strokeDashoffset="0"
          strokeLinecap="round"
          className="text-blue-500"
        />

        {/* Completed */}
        <circle
          cx="64"
          cy="64"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="12"
          strokeDasharray={`${completedLength} ${circumference}`}
          strokeDashoffset={`-${ongoingLength}`}
          strokeLinecap="round"
          className="text-emerald-500"
        />
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold text-gray-900">{total}</span>

        <span className="text-xs text-gray-500">Total</span>
      </div>
    </div>
  );
}

/* =========================================================
   STATUS BADGE
========================================================= */

function StatusBadge({ status }) {
  const value = normalize(status);

  let classes = "bg-gray-100 text-gray-600";

  if (value === "completed" || value === "complete" || value === "done") {
    classes = "bg-emerald-50 text-emerald-700";
  }

  if (
    value === "ongoing" ||
    value === "on going" ||
    value === "in progress" ||
    value === "in-progress"
  ) {
    classes = "bg-blue-50 text-blue-700";
  }

  if (value === "on hold" || value === "hold" || value === "on-hold") {
    classes = "bg-amber-50 text-amber-700";
  }

  if (value === "close" || value === "closed") {
    classes = "bg-slate-100 text-slate-700";
  }

  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${classes}`}
    >
      {status || "N/A"}
    </span>
  );
}

/* =========================================================
   IS PROJECT & DRIVE STATUS GRAPH
========================================================= */

function ISStatusGraph({ done, ongoing, onHold, close, total }) {
  const items = [
    {
      label: "Done",
      count: done,
      color: "bg-emerald-500",
      text: "text-emerald-600",
    },
    {
      label: "Ongoing",
      count: ongoing,
      color: "bg-blue-500",
      text: "text-blue-600",
    },
    {
      label: "On Hold",
      count: onHold,
      color: "bg-amber-500",
      text: "text-amber-600",
    },
    {
      label: "Close",
      count: close,
      color: "bg-slate-500",
      text: "text-slate-600",
    },
  ];

  return (
    <div className="space-y-3">
      {items.map((item) => {
        const percentage =
          total > 0 ? Math.round((item.count / total) * 100) : 0;

        return (
          <div key={item.label}>
            <div className="mb-1.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={`h-2.5 w-2.5 rounded-full ${item.color}`} />

                <span className="text-xs font-medium text-gray-600">
                  {item.label}
                </span>
              </div>

              <span className={`text-xs font-bold ${item.text}`}>
                {item.count} ({percentage}%)
              </span>
            </div>

            <div className="h-2 overflow-hidden rounded-full bg-gray-100">
              <div
                className={`h-full rounded-full transition-all duration-500 ${item.color}`}
                style={{
                  width: `${percentage}%`,
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* =========================================================
   FOCAL-WISE GRAPH
========================================================= */

function FocalWiseGraph({ focalSummary }) {
  const topFocals = focalSummary.slice(0, 5);

  const maxCount =
    topFocals.length > 0 ? Math.max(...topFocals.map((item) => item.count)) : 1;

  return (
    <div className="space-y-3">
      {topFocals.length === 0 ? (
        <p className="py-4 text-center text-xs text-gray-400">
          No focal data available
        </p>
      ) : (
        topFocals.map((item) => {
          const percentage = (item.count / maxCount) * 100;

          return (
            <div key={item.name}>
              <div className="mb-1.5 flex items-center justify-between gap-2">
                <span
                  className="max-w-[75%] truncate text-xs font-medium text-gray-600"
                  title={item.name}
                >
                  {item.name}
                </span>

                <span className="shrink-0 text-xs font-bold text-gray-800">
                  {item.count}
                </span>
              </div>

              <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                <div
                  className="h-full rounded-full bg-pink-500 transition-all duration-500"
                  style={{
                    width: `${percentage}%`,
                  }}
                />
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}

/* =========================================================
   DASHBOARD
========================================================= */

export default function Dashboard() {
  const navigate = useNavigate();

  const [projects, setProjects] = useState([]);

  const [individualTasks, setIndividualTasks] = useState([]);

  const [agenda, setAgenda] = useState([]);

  const [isProjects, setIsProjects] = useState([]);

  const [loading, setLoading] = useState(true);

  const [taskLoading, setTaskLoading] = useState(true);

  const [agendaLoading, setAgendaLoading] = useState(true);

  const [isProjectLoading, setIsProjectLoading] = useState(true);

  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState("");

  /* =======================================================
     LOAD ALL DASHBOARD DATA

     All four API calls run in parallel.
     This is faster than loading them one by one.
  ======================================================= */

  const loadDashboard = useCallback(async (forceRefresh = false) => {
    try {
      setError("");

      if (forceRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const results = await Promise.allSettled([
        fetchProjects(forceRefresh),
        fetchIndividualTasks(forceRefresh),
        fetchAgenda(forceRefresh),
        fetchISProjectDrive(forceRefresh),
      ]);

      /* PROJECTS */
      if (
        results[0].status === "fulfilled" &&
        Array.isArray(results[0].value)
      ) {
        setProjects(results[0].value);
      } else if (results[0].status === "rejected") {
        console.error("Project Error:", results[0].reason);
      }

      /* INDIVIDUAL TASKS */
      if (
        results[1].status === "fulfilled" &&
        Array.isArray(results[1].value)
      ) {
        setIndividualTasks(results[1].value);
      } else if (results[1].status === "rejected") {
        console.error("Individual Task Error:", results[1].reason);
      }

      /* AGENDA */
      if (
        results[2].status === "fulfilled" &&
        Array.isArray(results[2].value)
      ) {
        setAgenda(results[2].value);
      } else if (results[2].status === "rejected") {
        console.error("Agenda Error:", results[2].reason);
      }

      /* IS PROJECT & DRIVE */
      if (
        results[3].status === "fulfilled" &&
        Array.isArray(results[3].value)
      ) {
        setIsProjects(results[3].value);
      } else if (results[3].status === "rejected") {
        console.error("IS Project & Drive Error:", results[3].reason);
      }

      /* Check if every request failed */
      const allFailed = results.every((result) => result.status === "rejected");

      if (allFailed) {
        setError("Unable to load dashboard data.");
      }
    } catch (err) {
      console.error("Dashboard Error:", err);

      setError(err?.message || "Unable to load dashboard.");
    } finally {
      setLoading(false);
      setTaskLoading(false);
      setAgendaLoading(false);
      setIsProjectLoading(false);
      setRefreshing(false);
    }
  }, []);

  /* =======================================================
     INITIAL LOAD
  ======================================================= */

  useEffect(() => {
    loadDashboard(false);
  }, [loadDashboard]);

  /* =======================================================
     PROJECT STATISTICS
  ======================================================= */

  const projectStatistics = useMemo(() => {
    let completed = 0;
    let ongoing = 0;
    let onHold = 0;
    let totalBudget = 0;

    for (const project of projects) {
      const status = normalize(project.Status);

      if (
        status === "completed" ||
        status === "complete" ||
        status === "done"
      ) {
        completed++;
      }

      if (
        status === "ongoing" ||
        status === "on going" ||
        status === "in progress" ||
        status === "in-progress"
      ) {
        ongoing++;
      }

      if (status === "on hold" || status === "hold" || status === "on-hold") {
        onHold++;
      }

      totalBudget += parseBudget(project.Budget);
    }

    return {
      total: projects.length,
      completed,
      ongoing,
      onHold,
      totalBudget,
    };
  }, [projects]);

  /* =======================================================
     TASK STATISTICS
  ======================================================= */

  const taskStatistics = useMemo(() => {
    let completed = 0;
    let ongoing = 0;
    let onHold = 0;

    for (const task of individualTasks) {
      const status = normalize(task.Status);

      if (
        status === "completed" ||
        status === "complete" ||
        status === "done"
      ) {
        completed++;
      }

      if (
        status === "ongoing" ||
        status === "on going" ||
        status === "in progress" ||
        status === "in-progress"
      ) {
        ongoing++;
      }

      if (status === "on hold" || status === "hold" || status === "on-hold") {
        onHold++;
      }
    }

    return {
      total: individualTasks.length,
      completed,
      ongoing,
      onHold,
    };
  }, [individualTasks]);

  /* =======================================================
     AGENDA STATISTICS
  ======================================================= */

  const agendaStatistics = useMemo(() => {
    let completed = 0;
    let ongoing = 0;
    let onHold = 0;

    for (const item of agenda) {
      const status = normalize(item.Status);

      if (
        status === "completed" ||
        status === "complete" ||
        status === "done"
      ) {
        completed++;
      }

      if (
        status === "ongoing" ||
        status === "on going" ||
        status === "in progress" ||
        status === "in-progress"
      ) {
        ongoing++;
      }

      if (status === "on hold" || status === "hold" || status === "on-hold") {
        onHold++;
      }
    }

    return {
      total: agenda.length,
      completed,
      ongoing,
      onHold,
    };
  }, [agenda]);

  /* =======================================================
     IS PROJECT & DRIVE STATISTICS
  ======================================================= */

  const isProjectStatistics = useMemo(() => {
    const statusCounts = {
      Done: 0,
      Ongoing: 0,
      "On Hold": 0,
      Close: 0,
    };

    const focalMap = new Map();

    for (const project of isProjects) {
      const status = getNormalizedStatus(project.Status);

      if (Object.prototype.hasOwnProperty.call(statusCounts, status)) {
        statusCounts[status]++;
      }

      const focal = String(project["Focal-1"] ?? "").trim() || "Not Assigned";

      focalMap.set(focal, (focalMap.get(focal) || 0) + 1);
    }

    const focalSummary = Array.from(focalMap.entries())
      .map(([name, count]) => ({
        name,
        count,
      }))
      .sort((a, b) => {
        if (b.count !== a.count) {
          return b.count - a.count;
        }

        return a.name.localeCompare(b.name);
      });

    return {
      total: isProjects.length,
      done: statusCounts.Done,
      ongoing: statusCounts.Ongoing,
      onHold: statusCounts["On Hold"],
      close: statusCounts.Close,
      focalCount: focalSummary.length,
      focalSummary,
    };
  }, [isProjects]);

  /* =======================================================
     PROJECT CARD
  ======================================================= */

  const projectCard = (
    <div className="flex h-full flex-col rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg">
      {/* Header */}
      <div className="mb-6 flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-pink-50">
            <FolderKanban className="h-6 w-6 text-pink-600" />
          </div>

          <div className="min-w-0">
            <h2 className="text-lg font-bold text-gray-900">
              Projects Overview
            </h2>

            <p className="text-sm text-gray-500">Current project status</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => navigate("/projects")}
          className="flex shrink-0 items-center gap-1 text-sm font-semibold text-pink-600 transition hover:text-pink-700"
        >
          View All
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>

      {/* Main Summary */}
      <div className="mb-6 flex items-center gap-6">
        <DonutChart
          completed={projectStatistics.completed}
          ongoing={projectStatistics.ongoing}
          total={projectStatistics.total}
        />

        <div className="flex-1 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              <span className="text-sm text-gray-600">Completed</span>
            </div>

            <span className="font-semibold text-gray-900">
              {projectStatistics.completed}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock3 className="h-4 w-4 text-blue-500" />
              <span className="text-sm text-gray-600">Ongoing</span>
            </div>

            <span className="font-semibold text-gray-900">
              {projectStatistics.ongoing}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CirclePause className="h-4 w-4 text-amber-500" />
              <span className="text-sm text-gray-600">On Hold</span>
            </div>

            <span className="font-semibold text-gray-900">
              {projectStatistics.onHold}
            </span>
          </div>
        </div>
      </div>

      {/* Progress */}
      <div className="mb-6 space-y-4">
        <StatusBar
          label="Completed"
          count={projectStatistics.completed}
          total={projectStatistics.total}
          colorClass="bg-emerald-500"
        />

        <StatusBar
          label="Ongoing"
          count={projectStatistics.ongoing}
          total={projectStatistics.total}
          colorClass="bg-blue-500"
        />

        <StatusBar
          label="On Hold"
          count={projectStatistics.onHold}
          total={projectStatistics.total}
          colorClass="bg-amber-500"
        />
      </div>

      {/* Footer */}
      <div className="mt-auto grid grid-cols-2 gap-4 border-t border-gray-100 pt-5">
        <div className="rounded-xl bg-gray-50 p-4">
          <div className="mb-2 flex items-center gap-2">
            <Target className="h-4 w-4 text-pink-500" />

            <span className="text-xs text-gray-500">Total Projects</span>
          </div>

          <p className="text-xl font-bold text-gray-900">
            {loading ? "..." : projectStatistics.total}
          </p>
        </div>

        <div className="rounded-xl bg-gray-50 p-4">
          <div className="mb-2 flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-emerald-500" />

            <span className="text-xs text-gray-500">Total Budget</span>
          </div>

          <p className="text-xl font-bold text-gray-900">
            {loading
              ? "..."
              : `৳${projectStatistics.totalBudget.toLocaleString()}`}
          </p>
        </div>
      </div>
    </div>
  );

  /* =======================================================
     INDIVIDUAL TASK CARD
  ======================================================= */

  const taskCard = (
    <div className="flex h-full flex-col rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg">
      {/* Header */}
      <div className="mb-6 flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50">
            <ListTodo className="h-6 w-6 text-blue-600" />
          </div>

          <div>
            <h2 className="text-lg font-bold text-gray-900">
              Individual Tasks
            </h2>

            <p className="text-sm text-gray-500">Task progress overview</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => navigate("/individual-task")}
          className="flex shrink-0 items-center gap-1 text-sm font-semibold text-blue-600 transition hover:text-blue-700"
        >
          View Tasks
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>

      {/* Summary */}
      <div className="mb-6 flex items-center gap-6">
        <div className="flex h-32 w-32 shrink-0 flex-col items-center justify-center rounded-full border-[12px] border-blue-50">
          <span className="text-3xl font-bold text-gray-900">
            {taskLoading ? "..." : taskStatistics.total}
          </span>

          <span className="text-xs text-gray-500">Tasks</span>
        </div>

        <div className="flex-1 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />

              <span className="text-sm text-gray-600">Completed</span>
            </div>

            <span className="font-semibold text-gray-900">
              {taskStatistics.completed}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock3 className="h-4 w-4 text-blue-500" />

              <span className="text-sm text-gray-600">Ongoing</span>
            </div>

            <span className="font-semibold text-gray-900">
              {taskStatistics.ongoing}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CirclePause className="h-4 w-4 text-amber-500" />

              <span className="text-sm text-gray-600">On Hold</span>
            </div>

            <span className="font-semibold text-gray-900">
              {taskStatistics.onHold}
            </span>
          </div>
        </div>
      </div>

      {/* Progress */}
      <div className="mb-6 space-y-4">
        <StatusBar
          label="Completed"
          count={taskStatistics.completed}
          total={taskStatistics.total}
          colorClass="bg-emerald-500"
        />

        <StatusBar
          label="Ongoing"
          count={taskStatistics.ongoing}
          total={taskStatistics.total}
          colorClass="bg-blue-500"
        />

        <StatusBar
          label="On Hold"
          count={taskStatistics.onHold}
          total={taskStatistics.total}
          colorClass="bg-amber-500"
        />
      </div>

      {/* Footer */}
      <div className="mt-auto border-t border-gray-100 pt-5">
        <div className="rounded-xl bg-blue-50 p-4">
          <div className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-blue-600" />

            <div>
              <p className="text-xs text-blue-600">Total Individual Tasks</p>

              <p className="text-2xl font-bold text-blue-900">
                {taskLoading ? "..." : taskStatistics.total}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  /* =======================================================
     AGENDA CARD
  ======================================================= */

  const agendaCard = (
    <div className="flex h-full flex-col rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg">
      {/* Header */}
      <div className="mb-6 flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-purple-50">
            <CalendarDays className="h-6 w-6 text-purple-600" />
          </div>

          <div>
            <h2 className="text-lg font-bold text-gray-900">Agenda Overview</h2>

            <p className="text-sm text-gray-500">Current agenda status</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => navigate("/agenda")}
          className="flex shrink-0 items-center gap-1 text-sm font-semibold text-purple-600 transition hover:text-purple-700"
        >
          View All
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>

      {/* Summary */}
      <div className="mb-6 flex items-center gap-6">
        <div className="flex h-32 w-32 shrink-0 flex-col items-center justify-center rounded-full border-[12px] border-purple-50">
          <span className="text-3xl font-bold text-gray-900">
            {agendaLoading ? "..." : agendaStatistics.total}
          </span>

          <span className="text-xs text-gray-500">Agenda</span>
        </div>

        <div className="flex-1 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />

              <span className="text-sm text-gray-600">Completed</span>
            </div>

            <span className="font-semibold text-gray-900">
              {agendaStatistics.completed}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock3 className="h-4 w-4 text-blue-500" />

              <span className="text-sm text-gray-600">Ongoing</span>
            </div>

            <span className="font-semibold text-gray-900">
              {agendaStatistics.ongoing}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CirclePause className="h-4 w-4 text-amber-500" />

              <span className="text-sm text-gray-600">On Hold</span>
            </div>

            <span className="font-semibold text-gray-900">
              {agendaStatistics.onHold}
            </span>
          </div>
        </div>
      </div>

      {/* Progress */}
      <div className="mb-6 space-y-4">
        <StatusBar
          label="Completed"
          count={agendaStatistics.completed}
          total={agendaStatistics.total}
          colorClass="bg-emerald-500"
        />

        <StatusBar
          label="Ongoing"
          count={agendaStatistics.ongoing}
          total={agendaStatistics.total}
          colorClass="bg-blue-500"
        />

        <StatusBar
          label="On Hold"
          count={agendaStatistics.onHold}
          total={agendaStatistics.total}
          colorClass="bg-amber-500"
        />
      </div>

      {/* Footer */}
      <div className="mt-auto border-t border-gray-100 pt-5">
        <div className="rounded-xl bg-purple-50 p-4">
          <div className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-purple-600" />

            <div>
              <p className="text-xs text-purple-600">Total Agenda</p>

              <p className="text-2xl font-bold text-purple-900">
                {agendaLoading ? "..." : agendaStatistics.total}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  /* =======================================================
     IS PROJECT & DRIVE CARD
  ======================================================= */

  const isProjectDriveCard = (
    <div className="flex h-full flex-col rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg">
      {/* Header */}
      <div className="mb-5 flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-pink-50">
            <BriefcaseBusiness className="h-6 w-6 text-pink-600" />
          </div>

          <div className="min-w-0">
            <h2 className="text-lg font-bold text-gray-900">
              IS Project & Drive
            </h2>

            <p className="text-sm text-gray-500">
              Project & focal-wise overview
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => navigate("/is-project-drive")}
          className="flex shrink-0 items-center gap-1 text-sm font-semibold text-pink-600 transition hover:text-pink-700"
        >
          View All
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>

      {/* TOP SUMMARY */}
      <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {/* Total */}
        <div className="rounded-xl bg-pink-50 p-3">
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-pink-600" />

            <span className="text-xs text-pink-600">Total</span>
          </div>

          <p className="mt-1 text-xl font-bold text-pink-900">
            {isProjectLoading ? "..." : isProjectStatistics.total}
          </p>
        </div>

        {/* Done */}
        <div className="rounded-xl bg-emerald-50 p-3">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />

            <span className="text-xs text-emerald-600">Done</span>
          </div>

          <p className="mt-1 text-xl font-bold text-emerald-900">
            {isProjectLoading ? "..." : isProjectStatistics.done}
          </p>
        </div>

        {/* Ongoing */}
        <div className="rounded-xl bg-blue-50 p-3">
          <div className="flex items-center gap-2">
            <Clock3 className="h-4 w-4 text-blue-600" />

            <span className="text-xs text-blue-600">Ongoing</span>
          </div>

          <p className="mt-1 text-xl font-bold text-blue-900">
            {isProjectLoading ? "..." : isProjectStatistics.ongoing}
          </p>
        </div>

        {/* Focal */}
        <div className="rounded-xl bg-purple-50 p-3">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-purple-600" />

            <span className="text-xs text-purple-600">Focal-1</span>
          </div>

          <p className="mt-1 text-xl font-bold text-purple-900">
            {isProjectLoading ? "..." : isProjectStatistics.focalCount}
          </p>
        </div>
      </div>

      {/* GRAPH AREA */}
      <div className="grid gap-5 lg:grid-cols-2">
        {/* STATUS GRAPH */}
        <div className="rounded-xl bg-gray-50 p-4">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-gray-800">
                Status Overview
              </h3>

              <p className="text-xs text-gray-400">Project distribution</p>
            </div>

            <FolderKanban size={18} className="text-gray-400" />
          </div>

          {isProjectLoading ? (
            <div className="space-y-4 py-2">
              <div className="h-3 animate-pulse rounded-full bg-gray-200" />
              <div className="h-3 animate-pulse rounded-full bg-gray-200" />
              <div className="h-3 animate-pulse rounded-full bg-gray-200" />
              <div className="h-3 animate-pulse rounded-full bg-gray-200" />
            </div>
          ) : (
            <ISStatusGraph
              done={isProjectStatistics.done}
              ongoing={isProjectStatistics.ongoing}
              onHold={isProjectStatistics.onHold}
              close={isProjectStatistics.close}
              total={isProjectStatistics.total}
            />
          )}
        </div>

        {/* FOCAL GRAPH */}
        <div className="rounded-xl bg-gray-50 p-4">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-gray-800">Focal-1 Wise</h3>

              <p className="text-xs text-gray-400">Top 5 focal persons</p>
            </div>

            <Users size={18} className="text-gray-400" />
          </div>

          {isProjectLoading ? (
            <div className="space-y-4 py-2">
              <div className="h-3 animate-pulse rounded-full bg-gray-200" />
              <div className="h-3 animate-pulse rounded-full bg-gray-200" />
              <div className="h-3 animate-pulse rounded-full bg-gray-200" />
              <div className="h-3 animate-pulse rounded-full bg-gray-200" />
            </div>
          ) : (
            <FocalWiseGraph focalSummary={isProjectStatistics.focalSummary} />
          )}
        </div>
      </div>

      {/* BOTTOM STATUS SUMMARY */}
      <div className="mt-5 grid grid-cols-3 gap-3 border-t border-gray-100 pt-5">
        <div className="text-center">
          <p className="text-xs text-gray-400">On Hold</p>

          <p className="mt-1 text-lg font-bold text-amber-600">
            {isProjectStatistics.onHold}
          </p>
        </div>

        <div className="border-x border-gray-100 text-center">
          <p className="text-xs text-gray-400">Close</p>

          <p className="mt-1 text-lg font-bold text-slate-600">
            {isProjectStatistics.close}
          </p>
        </div>

        <div className="text-center">
          <p className="text-xs text-gray-400">Focal-1</p>

          <p className="mt-1 text-lg font-bold text-purple-600">
            {isProjectStatistics.focalCount}
          </p>
        </div>
      </div>
    </div>
  );

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="min-h-full bg-gray-50 p-4 sm:p-6 lg:p-8">
      {/* ===================================================
          PAGE HEADER
      =================================================== */}

      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            Dashboard Overview
          </h1>

          <p className="mt-1 text-sm text-gray-500 sm:text-base">
            Monitor projects, individual tasks, agenda activities and IS
            projects.
          </p>
        </div>

        <button
          type="button"
          onClick={() => loadDashboard(true)}
          disabled={refreshing}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-pink-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-pink-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <RefreshCw
            className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
          />

          {refreshing ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {/* ===================================================
          ERROR
      =================================================== */}

      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* ===================================================
          MAIN DASHBOARD CARDS

          4 cards:
          1. Projects
          2. Individual Tasks
          3. Agenda
          4. IS Project & Drive
      =================================================== */}

      <div className="grid items-stretch gap-6 xl:grid-cols-2">
        {/* IS Project & Drive */}
        {isProjectDriveCard}

        {/* Projects */}
        {projectCard}

        {/* Individual Tasks */}
        {taskCard}

        {/* Agenda */}
        {agendaCard}
      </div>
    </div>
  );
}
