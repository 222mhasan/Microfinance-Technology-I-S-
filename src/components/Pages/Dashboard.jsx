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
  BriefcaseBusiness,
  Users,
  PauseCircle,
  XCircle,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

/* =========================================================
   HELPERS
========================================================= */

function normalize(value) {
  return String(value || "")
    .trim()
    .toLowerCase();
}

/* =========================================================
   STATUS NORMALIZATION
========================================================= */

function getStatus(value) {
  const status = normalize(value);

  if (
    status === "completed" ||
    status === "complete" ||
    status === "done"
  ) {
    return "Completed";
  }

  if (
    status === "ongoing" ||
    status === "on going" ||
    status === "in progress" ||
    status === "in-progress"
  ) {
    return "Ongoing";
  }

  if (
    status === "on hold" ||
    status === "hold" ||
    status === "on-hold"
  ) {
    return "On Hold";
  }

  if (
    status === "close" ||
    status === "closed"
  ) {
    return "Close";
  }

  return value || "N/A";
}

/* =========================================================
   DYNAMIC RADIAL GRAPH
========================================================= */

function RadialProgress({
  percentage = 0,
  value = 0,
  label = "Total",
  size = 112,
  color = "#db2777",
  trackColor = "#fce7f3",
}) {
  const safePercentage = Math.min(
    100,
    Math.max(0, Number(percentage) || 0)
  );

  const radius = 40;
  const circumference = 2 * Math.PI * radius;

  const progressLength =
    (safePercentage / 100) * circumference;

  return (
    <div
      className="relative flex shrink-0 items-center justify-center"
      style={{
        width: size,
        height: size,
      }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        className="-rotate-90"
      >
        {/* Track */}
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke={trackColor}
          strokeWidth="8"
        />

        {/* Dynamic progress */}
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={`${progressLength} ${circumference}`}
          className="transition-all duration-700 ease-out"
        />
      </svg>

      {/* Center */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-xl font-bold text-gray-900">
          {value}
        </span>

        <span className="text-[10px] font-medium text-gray-500">
          {label}
        </span>
      </div>
    </div>
  );
}

/* =========================================================
   STATUS ITEM
========================================================= */

function StatusItem({
  icon: Icon,
  label,
  value,
  iconClass,
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex min-w-0 items-center gap-2">
        <Icon
          className={`h-4 w-4 shrink-0 ${iconClass}`}
        />

        <span className="truncate text-sm text-gray-600">
          {label}
        </span>
      </div>

      <span className="ml-3 text-sm font-bold text-gray-900">
        {value}
      </span>
    </div>
  );
}

/* =========================================================
   CARD HEADER
========================================================= */

function CardHeader({
  icon: Icon,
  title,
  subtitle,
  onClick,
  theme,
}) {
  return (
    <div className="mb-5 flex items-start justify-between gap-3">
      <div className="flex min-w-0 items-center gap-3">
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${theme.iconBg}`}
        >
          <Icon
            className={`h-5 w-5 ${theme.iconColor}`}
          />
        </div>

        <div className="min-w-0">
          <h2 className="truncate text-base font-bold text-gray-900 sm:text-lg">
            {title}
          </h2>

          <p className="mt-0.5 truncate text-xs text-gray-500 sm:text-sm">
            {subtitle}
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={onClick}
        className={`flex shrink-0 items-center gap-1 text-xs font-semibold transition sm:text-sm ${theme.linkColor}`}
      >
        View All

        <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
      </button>
    </div>
  );
}

/* =========================================================
   PROJECTS CARD
========================================================= */

function ProjectsCard({
  statistics,
  loading,
  onView,
}) {
  const completion =
    statistics.total > 0
      ? Math.round(
          (statistics.completed /
            statistics.total) *
            100
        )
      : 0;

  const theme = {
    iconBg: "bg-blue-50",
    iconColor: "text-blue-600",
    linkColor:
      "text-blue-600 hover:text-blue-700",
    radial: "#2563eb",
    track: "#dbeafe",
    footerBg: "bg-blue-50/60",
  };

  return (
    <div className="group flex h-full flex-col rounded-2xl border border-blue-100 bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md sm:p-6">
      <CardHeader
        icon={FolderKanban}
        title="Projects"
        subtitle="Project portfolio overview"
        onClick={onView}
        theme={theme}
      />

      <div className="flex items-center gap-6">
        <RadialProgress
          percentage={completion}
          value={
            loading
              ? "..."
              : statistics.total
          }
          label="Projects"
          color={theme.radial}
          trackColor={theme.track}
        />

        <div className="min-w-0 flex-1 space-y-3">
          <StatusItem
            icon={CheckCircle2}
            label="Completed"
            value={
              loading
                ? "..."
                : statistics.completed
            }
            iconClass="text-emerald-500"
          />

          <StatusItem
            icon={Clock3}
            label="Ongoing"
            value={
              loading
                ? "..."
                : statistics.ongoing
            }
            iconClass="text-blue-500"
          />

          <StatusItem
            icon={CirclePause}
            label="On Hold"
            value={
              loading
                ? "..."
                : statistics.onHold
            }
            iconClass="text-amber-500"
          />
        </div>
      </div>

      {/* Small footer metric */}
      <div
        className={`mt-5 flex items-center justify-between rounded-xl px-3.5 py-2.5 ${theme.footerBg}`}
      >
        <span className="text-xs font-medium text-gray-500">
          Completion
        </span>

        <span className="text-sm font-bold text-blue-600">
          {loading
            ? "..."
            : `${completion}%`}
        </span>
      </div>
    </div>
  );
}

/* =========================================================
   INDIVIDUAL TASK CARD
========================================================= */

function IndividualTaskCard({
  statistics,
  loading,
  onView,
}) {
  const completion =
    statistics.total > 0
      ? Math.round(
          (statistics.completed /
            statistics.total) *
            100
        )
      : 0;

  const theme = {
    iconBg: "bg-violet-50",
    iconColor: "text-violet-600",
    linkColor:
      "text-violet-600 hover:text-violet-700",
    radial: "#7c3aed",
    track: "#ede9fe",
    footerBg: "bg-violet-50/60",
  };

  return (
    <div className="group flex h-full flex-col rounded-2xl border border-violet-100 bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:border-violet-200 hover:shadow-md sm:p-6">
      <CardHeader
        icon={ListTodo}
        title="Individual Tasks"
        subtitle="Task progress overview"
        onClick={onView}
        theme={theme}
      />

      <div className="flex items-center gap-6">
        <RadialProgress
          percentage={completion}
          value={
            loading
              ? "..."
              : statistics.total
          }
          label="Tasks"
          color={theme.radial}
          trackColor={theme.track}
        />

        <div className="min-w-0 flex-1 space-y-3">
          <StatusItem
            icon={CheckCircle2}
            label="Completed"
            value={
              loading
                ? "..."
                : statistics.completed
            }
            iconClass="text-emerald-500"
          />

          <StatusItem
            icon={Clock3}
            label="Ongoing"
            value={
              loading
                ? "..."
                : statistics.ongoing
            }
            iconClass="text-violet-500"
          />

          <StatusItem
            icon={CirclePause}
            label="On Hold"
            value={
              loading
                ? "..."
                : statistics.onHold
            }
            iconClass="text-amber-500"
          />
        </div>
      </div>

      <div
        className={`mt-5 flex items-center justify-between rounded-xl px-3.5 py-2.5 ${theme.footerBg}`}
      >
        <span className="text-xs font-medium text-gray-500">
          Completion
        </span>

        <span className="text-sm font-bold text-violet-600">
          {loading
            ? "..."
            : `${completion}%`}
        </span>
      </div>
    </div>
  );
}

/* =========================================================
   AGENDA CARD
========================================================= */

function AgendaCard({
  statistics,
  loading,
  onView,
}) {
  const completion =
    statistics.total > 0
      ? Math.round(
          (statistics.completed /
            statistics.total) *
            100
        )
      : 0;

  const theme = {
    iconBg: "bg-emerald-50",
    iconColor: "text-emerald-600",
    linkColor:
      "text-emerald-600 hover:text-emerald-700",
    radial: "#059669",
    track: "#d1fae5",
    footerBg: "bg-emerald-50/60",
  };

  return (
    <div className="group flex h-full flex-col rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-md sm:p-6">
      <CardHeader
        icon={CalendarDays}
        title="Agenda"
        subtitle="Current agenda overview"
        onClick={onView}
        theme={theme}
      />

      <div className="flex items-center gap-6">
        <RadialProgress
          percentage={completion}
          value={
            loading
              ? "..."
              : statistics.total
          }
          label="Agenda"
          color={theme.radial}
          trackColor={theme.track}
        />

        <div className="min-w-0 flex-1 space-y-3">
          <StatusItem
            icon={CheckCircle2}
            label="Completed"
            value={
              loading
                ? "..."
                : statistics.completed
            }
            iconClass="text-emerald-500"
          />

          <StatusItem
            icon={Clock3}
            label="Ongoing"
            value={
              loading
                ? "..."
                : statistics.ongoing
            }
            iconClass="text-blue-500"
          />

          <StatusItem
            icon={CirclePause}
            label="On Hold"
            value={
              loading
                ? "..."
                : statistics.onHold
            }
            iconClass="text-amber-500"
          />
        </div>
      </div>

      <div
        className={`mt-5 flex items-center justify-between rounded-xl px-3.5 py-2.5 ${theme.footerBg}`}
      >
        <span className="text-xs font-medium text-gray-500">
          Completion
        </span>

        <span className="text-sm font-bold text-emerald-600">
          {loading
            ? "..."
            : `${completion}%`}
        </span>
      </div>
    </div>
  );
}

/* =========================================================
   IS PROJECT & DRIVE CARD
========================================================= */

function ISProjectDriveCard({
  statistics,
  loading,
  onView,
}) {
  const completion =
    statistics.total > 0
      ? Math.round(
          (statistics.done /
            statistics.total) *
            100
        )
      : 0;

  const theme = {
    iconBg: "bg-pink-50",
    iconColor: "text-pink-600",
    linkColor:
      "text-pink-600 hover:text-pink-700",
    radial: "#db2777",
    track: "#fce7f3",
    footerBg: "bg-pink-50/60",
  };

  return (
    <div className="group flex h-full flex-col rounded-2xl border border-pink-100 bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:border-pink-200 hover:shadow-md sm:p-6">
      <CardHeader
        icon={BriefcaseBusiness}
        title="IS Project & Drive"
        subtitle="Project and focal overview"
        onClick={onView}
        theme={theme}
      />

      <div className="flex items-center gap-6">
        <RadialProgress
          percentage={completion}
          value={
            loading
              ? "..."
              : statistics.total
          }
          label="Projects"
          color={theme.radial}
          trackColor={theme.track}
        />

        <div className="min-w-0 flex-1 space-y-3">
          <StatusItem
            icon={CheckCircle2}
            label="Done"
            value={
              loading
                ? "..."
                : statistics.done
            }
            iconClass="text-emerald-500"
          />

          <StatusItem
            icon={Clock3}
            label="Ongoing"
            value={
              loading
                ? "..."
                : statistics.ongoing
            }
            iconClass="text-blue-500"
          />

          <StatusItem
            icon={Users}
            label="Focal-1"
            value={
              loading
                ? "..."
                : statistics.focalCount
            }
            iconClass="text-purple-500"
          />
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <div
          className={`rounded-xl px-3.5 py-2.5 ${theme.footerBg}`}
        >
          <div className="flex items-center gap-2">
            <PauseCircle className="h-4 w-4 text-amber-500" />

            <span className="text-xs font-medium text-gray-500">
              On Hold
            </span>
          </div>

          <p className="mt-1 text-lg font-bold text-gray-900">
            {loading
              ? "..."
              : statistics.onHold}
          </p>
        </div>

        <div className="rounded-xl bg-slate-50 px-3.5 py-2.5">
          <div className="flex items-center gap-2">
            <XCircle className="h-4 w-4 text-slate-500" />

            <span className="text-xs font-medium text-gray-500">
              Close
            </span>
          </div>

          <p className="mt-1 text-lg font-bold text-gray-900">
            {loading
              ? "..."
              : statistics.close}
          </p>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   DASHBOARD
========================================================= */

export default function Dashboard() {
  const navigate = useNavigate();

  const [projects, setProjects] = useState([]);
  const [individualTasks, setIndividualTasks] =
    useState([]);
  const [agenda, setAgenda] = useState([]);
  const [isProjects, setIsProjects] =
    useState([]);

  const [loading, setLoading] = useState(true);
  const [taskLoading, setTaskLoading] =
    useState(true);
  const [agendaLoading, setAgendaLoading] =
    useState(true);
  const [isProjectLoading, setIsProjectLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] = useState("");

  /* =======================================================
     LOAD DASHBOARD DATA
  ======================================================= */

  const loadDashboard = useCallback(
    async (forceRefresh = false) => {
      try {
        setError("");

        if (forceRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        const results =
          await Promise.allSettled([
            fetchProjects(forceRefresh),
            fetchIndividualTasks(forceRefresh),
            fetchAgenda(forceRefresh),
            fetchISProjectDrive(forceRefresh),
          ]);

        /* PROJECTS */

        if (
          results[0].status ===
            "fulfilled" &&
          Array.isArray(
            results[0].value
          )
        ) {
          setProjects(
            results[0].value
          );
        } else if (
          results[0].status ===
          "rejected"
        ) {
          console.error(
            "Project Error:",
            results[0].reason
          );
        }

        /* INDIVIDUAL TASKS */

        if (
          results[1].status ===
            "fulfilled" &&
          Array.isArray(
            results[1].value
          )
        ) {
          setIndividualTasks(
            results[1].value
          );
        } else if (
          results[1].status ===
          "rejected"
        ) {
          console.error(
            "Individual Task Error:",
            results[1].reason
          );
        }

        /* AGENDA */

        if (
          results[2].status ===
            "fulfilled" &&
          Array.isArray(
            results[2].value
          )
        ) {
          setAgenda(
            results[2].value
          );
        } else if (
          results[2].status ===
          "rejected"
        ) {
          console.error(
            "Agenda Error:",
            results[2].reason
          );
        }

        /* IS PROJECT & DRIVE */

        if (
          results[3].status ===
            "fulfilled" &&
          Array.isArray(
            results[3].value
          )
        ) {
          setIsProjects(
            results[3].value
          );
        } else if (
          results[3].status ===
          "rejected"
        ) {
          console.error(
            "IS Project & Drive Error:",
            results[3].reason
          );
        }

        const allFailed =
          results.every(
            (result) =>
              result.status ===
              "rejected"
          );

        if (allFailed) {
          setError(
            "Unable to load dashboard data."
          );
        }
      } catch (err) {
        console.error(
          "Dashboard Error:",
          err
        );

        setError(
          err?.message ||
            "Unable to load dashboard."
        );
      } finally {
        setLoading(false);
        setTaskLoading(false);
        setAgendaLoading(false);
        setIsProjectLoading(false);
        setRefreshing(false);
      }
    },
    []
  );

  /* =======================================================
     INITIAL LOAD
  ======================================================= */

  useEffect(() => {
    loadDashboard(false);
  }, [loadDashboard]);

  /* =======================================================
     PROJECT STATISTICS
  ======================================================= */

  const projectStatistics =
    useMemo(() => {
      let completed = 0;
      let ongoing = 0;
      let onHold = 0;

      for (const project of projects) {
        const status = normalize(
          project.Status
        );

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

        if (
          status === "on hold" ||
          status === "hold" ||
          status === "on-hold"
        ) {
          onHold++;
        }
      }

      return {
        total: projects.length,
        completed,
        ongoing,
        onHold,
      };
    }, [projects]);

  /* =======================================================
     TASK STATISTICS
  ======================================================= */

  const taskStatistics =
    useMemo(() => {
      let completed = 0;
      let ongoing = 0;
      let onHold = 0;

      for (const task of individualTasks) {
        const status = normalize(
          task.Status
        );

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

        if (
          status === "on hold" ||
          status === "hold" ||
          status === "on-hold"
        ) {
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

  const agendaStatistics =
    useMemo(() => {
      let completed = 0;
      let ongoing = 0;
      let onHold = 0;

      for (const item of agenda) {
        const status = normalize(
          item.Status
        );

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

        if (
          status === "on hold" ||
          status === "hold" ||
          status === "on-hold"
        ) {
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

  const isProjectStatistics =
    useMemo(() => {
      const statusCounts = {
        Completed: 0,
        Ongoing: 0,
        "On Hold": 0,
        Close: 0,
      };

      const focalMap = new Map();

      for (const project of isProjects) {
        const status = getStatus(
          project.Status
        );

        if (
          Object.prototype.hasOwnProperty.call(
            statusCounts,
            status
          )
        ) {
          statusCounts[status]++;
        }

        const focal =
          String(
            project["Focal-1"] ?? ""
          ).trim() ||
          "Not Assigned";

        focalMap.set(
          focal,
          (focalMap.get(focal) ||
            0) + 1
        );
      }

      const focalSummary =
        Array.from(
          focalMap.entries()
        )
          .map(([name, count]) => ({
            name,
            count,
          }))
          .sort((a, b) => {
            if (
              b.count !== a.count
            ) {
              return (
                b.count - a.count
              );
            }

            return a.name.localeCompare(
              b.name
            );
          });

      return {
        total: isProjects.length,
        done: statusCounts.Completed,
        ongoing: statusCounts.Ongoing,
        onHold:
          statusCounts["On Hold"],
        close: statusCounts.Close,
        focalCount:
          focalSummary.length,
        focalSummary,
      };
    }, [isProjects]);

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="min-h-full bg-gray-50 p-4 sm:p-6 lg:p-8">
      {/* ===================================================
          HEADER
      =================================================== */}

      <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
            Dashboard Overview
          </h1>

          <p className="mt-1 text-sm text-gray-500 sm:text-base">
            Monitor projects, tasks, agenda and IS activities.
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            loadDashboard(true)
          }
          disabled={refreshing}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-pink-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-pink-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <RefreshCw
            className={`h-4 w-4 ${
              refreshing
                ? "animate-spin"
                : ""
            }`}
          />

          {refreshing
            ? "Refreshing..."
            : "Refresh"}
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
          DASHBOARD CARDS

          1. IS Project & Drive
          2. Projects
          3. Individual Tasks
          4. Agenda
      =================================================== */}

      <div className="grid items-stretch gap-5 xl:grid-cols-2">
        {/* 1. IS PROJECT & DRIVE */}

        <ISProjectDriveCard
          statistics={
            isProjectStatistics
          }
          loading={
            isProjectLoading
          }
          onView={() =>
            navigate(
              "/is-project-drive"
            )
          }
        />

        {/* 2. PROJECTS */}

        <ProjectsCard
          statistics={
            projectStatistics
          }
          loading={loading}
          onView={() =>
            navigate("/projects")
          }
        />

        {/* 3. INDIVIDUAL TASKS */}

        <IndividualTaskCard
          statistics={
            taskStatistics
          }
          loading={
            taskLoading
          }
          onView={() =>
            navigate(
              "/individual-task"
            )
          }
        />

        {/* 4. AGENDA */}

        <AgendaCard
          statistics={
            agendaStatistics
          }
          loading={
            agendaLoading
          }
          onView={() =>
            navigate("/agenda")
          }
        />
      </div>
    </div>
  );
}