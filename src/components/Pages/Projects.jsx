
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock3,
  FolderKanban,
  RefreshCw,
  Search,
  X,
} from "lucide-react";

import { fetchProjects } from "../../services/api";

// ============================================================
// PROJECT THEMES
// ============================================================

const projectThemes = [
  {
    bg: "from-pink-500 to-rose-500",
    light: "bg-pink-50",
    text: "text-pink-600",
  },
  {
    bg: "from-blue-500 to-indigo-500",
    light: "bg-blue-50",
    text: "text-blue-600",
  },
  {
    bg: "from-emerald-500 to-green-500",
    light: "bg-emerald-50",
    text: "text-emerald-600",
  },
  {
    bg: "from-purple-500 to-violet-500",
    light: "bg-purple-50",
    text: "text-purple-600",
  },
  {
    bg: "from-orange-500 to-amber-500",
    light: "bg-orange-50",
    text: "text-orange-600",
  },
];

// ============================================================
// HELPERS
// ============================================================

const normalize = (value) =>
  String(value ?? "").trim().toLowerCase();

const getProgress = (project) =>
  Math.min(100, Math.max(0, Number(project.Progress) || 0));

const isCompleted = (project) =>
  getProgress(project) >= 100 ||
  normalize(project.Status) === "completed";

const isOnHold = (project) =>
  normalize(project.Status) === "on hold";

const isOngoing = (project) =>
  ["in progress", "ongoing"].includes(normalize(project.Status));

const isNotStarted = (project) =>
  ["not started", ""].includes(normalize(project.Status)) ||
  getProgress(project) === 0;

// ============================================================
// OVERVIEW CARD
// ============================================================

function OverviewCard({
  title,
  value,
  icon: Icon,
  iconStyle,
  active,
  onClick,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`group w-full rounded-2xl border bg-white p-5 text-left shadow-sm
        transition duration-200 hover:-translate-y-1 hover:border-pink-200
        hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-pink-400
        ${
          active
            ? "border-pink-400 ring-2 ring-pink-100 shadow-md"
            : "border-slate-100"
        }`}
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-500 transition group-hover:text-pink-600">
            {title}
          </p>

          <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
            {value}
          </p>

          <p className="mt-2 text-xs font-medium text-slate-400 group-hover:text-pink-600">
            {active ? "Currently selected" : "Click to view projects"}
          </p>
        </div>

        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${iconStyle}`}
        >
          <Icon size={23} />
        </div>
      </div>
    </button>
  );
}

// ============================================================
// PROJECTS PAGE
// ============================================================

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  // Load projects from the existing API service.
  const loadProjects = useCallback(async (forceRefresh = false) => {
    setError("");

    if (forceRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const data = await fetchProjects(forceRefresh);
      setProjects(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Projects Error:", err);
      setError(err?.message || "Unable to load projects.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  // Calculate overview counts from all projects.
  const summary = useMemo(() => {
    return {
      total: projects.length,
      ongoing: projects.filter(isOngoing).length,
      completed: projects.filter(isCompleted).length,
      onHold: projects.filter(isOnHold).length,
    };
  }, [projects]);

  // Filter projects using search and the selected overview/status.
  const filteredProjects = useMemo(() => {
    const search = normalize(searchTerm);

    return projects.filter((project) => {
      const matchesSearch =
        !search ||
        normalize(project.Title).includes(search) ||
        normalize(project.Manager).includes(search) ||
        normalize(project.Description).includes(search) ||
        normalize(project.ID).includes(search) ||
        normalize(project.Status).includes(search) ||
        normalize(project.Timeline).includes(search);

      let matchesStatus = true;

      switch (statusFilter) {
        case "Completed":
          matchesStatus = isCompleted(project);
          break;

        case "In Progress":
          matchesStatus = isOngoing(project);
          break;

        case "On Hold":
          matchesStatus = isOnHold(project);
          break;

        case "Not Started":
          matchesStatus = isNotStarted(project);
          break;

        default:
          matchesStatus = true;
      }

      return matchesSearch && matchesStatus;
    });
  }, [projects, searchTerm, statusFilter]);

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("All");
  };

  // ==========================================================
  // LOADING STATE
  // ==========================================================

  if (loading && projects.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-6 h-8 w-64 animate-pulse rounded-lg bg-slate-200" />

          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="h-28 animate-pulse rounded-2xl bg-white shadow-sm"
              />
            ))}
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
              <div
                key={item}
                className="h-72 animate-pulse rounded-2xl bg-white shadow-sm"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ==========================================================
  // MAIN UI
  // ==========================================================

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* HEADER */}

        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Link
            to="/"
            className="group block rounded-xl transition hover:bg-pink-50/70 focus:outline-none focus:ring-2 focus:ring-pink-500"
          >
            <div className="mb-2">
              <span className="inline-flex items-center gap-1 text-sm font-medium text-slate-500 transition group-hover:text-pink-600">
                <ArrowLeft
                  size={16}
                  className="transition-transform group-hover:-translate-x-1"
                />
                Dashboard
              </span>
            </div>

            <h1 className="text-2xl font-bold text-slate-900 transition group-hover:text-pink-700 sm:text-3xl">
              All Projects
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Explore all Microfinance Technology projects
            </p>
          </Link>

          <button
            type="button"
            onClick={() => loadProjects(true)}
            disabled={refreshing}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-pink-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-pink-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            <RefreshCw
              size={16}
              className={refreshing ? "animate-spin" : ""}
            />
            {refreshing ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        {/* ERROR MESSAGE */}

        {error && (
          <div className="mb-5 flex items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <span>{error}</span>

            <button
              type="button"
              onClick={() => loadProjects(true)}
              className="shrink-0 font-semibold underline"
            >
              Retry
            </button>
          </div>
        )}

        {/* CLICKABLE OVERVIEW CARDS */}

        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <OverviewCard
            title="Total Projects"
            value={summary.total}
            icon={FolderKanban}
            iconStyle="bg-pink-100 text-pink-600"
            active={statusFilter === "All"}
            onClick={() => setStatusFilter("All")}
          />

          <OverviewCard
            title="In Progress"
            value={summary.ongoing}
            icon={Clock3}
            iconStyle="bg-blue-100 text-blue-600"
            active={statusFilter === "In Progress"}
            onClick={() => setStatusFilter("In Progress")}
          />

          <OverviewCard
            title="Completed"
            value={summary.completed}
            icon={CheckCircle2}
            iconStyle="bg-green-100 text-green-600"
            active={statusFilter === "Completed"}
            onClick={() => setStatusFilter("Completed")}
          />

          <OverviewCard
            title="On Hold"
            value={summary.onHold}
            icon={Clock3}
            iconStyle="bg-amber-100 text-amber-600"
            active={statusFilter === "On Hold"}
            onClick={() => setStatusFilter("On Hold")}
          />
        </div>

        {/* SEARCH AND STATUS FILTERS */}

        <div className="mb-6 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative w-full lg:max-w-md">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="text"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search projects, focal person, status..."
                aria-label="Search projects"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm text-slate-800 outline-none transition focus:border-pink-400 focus:bg-white focus:ring-2 focus:ring-pink-100"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              {[
                "All",
                "In Progress",
                "Completed",
                "On Hold",
                "Not Started",
              ].map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => setStatusFilter(status)}
                  aria-pressed={statusFilter === status}
                  className={`rounded-lg px-3 py-2 text-xs font-semibold transition ${
                    statusFilter === status
                      ? "bg-pink-600 text-white shadow-sm"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* RESULTS COUNT */}

        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-slate-500">
            Showing{" "}
            <span className="font-semibold text-slate-800">
              {filteredProjects.length}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-slate-800">
              {projects.length}
            </span>{" "}
            projects
            {statusFilter !== "All" && (
              <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-pink-50 px-2.5 py-1 text-xs font-semibold text-pink-700">
                {statusFilter}
                <button
                  type="button"
                  aria-label="Clear status filter"
                  onClick={() => setStatusFilter("All")}
                >
                  <X size={13} />
                </button>
              </span>
            )}
          </p>

          {(searchTerm || statusFilter !== "All") && (
            <button
              type="button"
              onClick={clearFilters}
              className="text-xs font-semibold text-pink-600 transition hover:text-pink-800"
            >
              Clear filters
            </button>
          )}
        </div>

        {/* PROJECT GRID */}

        {filteredProjects.length > 0 ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredProjects.map((project, index) => {
              const progress = getProgress(project);
              const status = String(project.Status || "").trim();
              const normalizedStatus = normalize(status);
              const completed = isCompleted(project);
              const onHold = isOnHold(project);
              const theme = projectThemes[index % projectThemes.length];

              const statusStyle = completed
                ? "bg-green-50 text-green-700"
                : onHold
                  ? "bg-amber-50 text-amber-700"
                  : "bg-blue-50 text-blue-700";

              return (
                <Link
                  key={project.ID || `${project.Title}-${index}`}
                  to={`/projects/${project.ID}`}
                  className="group overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition duration-200 hover:-translate-y-1 hover:border-pink-200 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-pink-400"
                >
                  {/* ACCENT STRIPE */}

                  <div className={`h-1.5 bg-gradient-to-r ${theme.bg}`} />

                  <div className="p-5">
                    {/* PROJECT ICON AND STATUS */}

                    <div className="mb-4 flex items-start justify-between gap-3">
                      <div
                        className={`flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl ${theme.light}`}
                      >
                        {project.Logo ? (
                          <img
                            src={project.Logo}
                            alt=""
                            loading="lazy"
                            decoding="async"
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <FolderKanban
                            size={23}
                            className={theme.text}
                          />
                        )}
                      </div>

                      <span
                        className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${statusStyle}`}
                      >
                        {completed ? "Completed" : status || "Ongoing"}
                      </span>
                    </div>

                    {/* TITLE */}

                    <h2 className="line-clamp-2 min-h-[48px] text-base font-bold text-slate-900 transition group-hover:text-pink-600">
                      {project.Title || "Untitled Project"}
                    </h2>

                    {/* DESCRIPTION */}

                    <p className="mt-2 line-clamp-2 min-h-[40px] text-xs leading-5 text-slate-500">
                      {project.Description || "No description available."}
                    </p>

                    {/* FOCAL PERSON */}

                    <p className="mt-3 line-clamp-1 text-xs text-slate-500">
                      Focal:{" "}
                      <span className="font-medium text-slate-700">
                        {project.Manager || "N/A"}
                      </span>
                    </p>

                    {/* TIMELINE */}

                    <p className="mt-1 line-clamp-1 text-xs text-slate-500">
                      Timeline:{" "}
                      <span className="font-medium text-slate-700">
                        {project.Timeline || "N/A"}
                      </span>
                    </p>

                    {/* PROGRESS */}

                    <div className="mt-5">
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-xs font-medium text-slate-500">
                          Progress
                        </span>

                        <span className="text-xs font-bold text-slate-800">
                          {progress}%
                        </span>
                      </div>

                      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className={`h-full rounded-full bg-gradient-to-r ${theme.bg} transition-all duration-500`}
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>

                    {/* CARD FOOTER */}

                    <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
                      <span className="text-xs font-medium text-slate-400">
                        #{project.ID || "N/A"}
                      </span>

                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-pink-600">
                        View Details
                        <ArrowRight
                          size={14}
                          className="transition-transform group-hover:translate-x-1"
                        />
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="rounded-2xl border border-slate-100 bg-white px-6 py-16 text-center shadow-sm">
            <FolderKanban
              size={42}
              className="mx-auto text-slate-300"
            />

            <h3 className="mt-4 font-semibold text-slate-800">
              No projects found
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Try changing your search or status filter.
            </p>

            <button
              type="button"
              onClick={clearFilters}
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-pink-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-pink-700"
            >
              <X size={15} />
              Clear filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
