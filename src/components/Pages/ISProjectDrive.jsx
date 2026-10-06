import React, {
  useCallback,
  useDeferredValue,
  useEffect,
  useMemo,
  useState,
} from "react";

import { fetchISProjectDrive } from "../../services/api";

import {
  FolderKanban,
  Users,
  CheckCircle2,
  Clock3,
  CirclePause,
  XCircle,
  RefreshCw,
  Search,
  ArrowUpDown,
  CalendarDays,
  UserRound,
  BriefcaseBusiness,
  ListChecks,
  X,
  Eye,
  FileText,
  Building2,
  Wallet,
  MessageSquareText,
} from "lucide-react";

/* =========================================================
   HELPERS
========================================================= */

const normalize = (value) =>
  String(value ?? "")
    .trim()
    .toLowerCase();

const parseDate = (value) => {
  if (!value) return null;

  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? null : date;
};

const formatDate = (value) => {
  const date = parseDate(value);

  if (!date) {
    return value || "-";
  }

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const getStatus = (value) => {
  const status = normalize(value);

  if (status === "done" || status === "completed") {
    return "Done";
  }

  if (
    status === "ongoing" ||
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

  return value ? String(value).trim() : "Unknown";
};

const getStatusKey = (value) => normalize(getStatus(value));

const getStatusStyle = (status) => {
  switch (getStatus(status)) {
    case "Done":
      return "bg-emerald-100 text-emerald-700 border-emerald-200";

    case "Ongoing":
      return "bg-blue-100 text-blue-700 border-blue-200";

    case "On Hold":
      return "bg-amber-100 text-amber-700 border-amber-200";

    case "Close":
      return "bg-slate-100 text-slate-700 border-slate-200";

    default:
      return "bg-gray-100 text-gray-700 border-gray-200";
  }
};

/* =========================================================
   STATUS BADGE
========================================================= */

const StatusBadge = ({ status }) => {
  const label = getStatus(status);

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold whitespace-nowrap ${getStatusStyle(
        label
      )}`}
    >
      {label}
    </span>
  );
};

/* =========================================================
   SUMMARY CARD
========================================================= */

const SummaryMetric = ({
  label,
  value,
  icon: Icon,
  iconColor,
  active = false,
  onClick,
}) => {
  const Component = onClick ? "button" : "div";

  return (
    <Component
      type={onClick ? "button" : undefined}
      onClick={onClick}
      aria-pressed={onClick ? active : undefined}
      className={`
        w-full rounded-xl border bg-white p-4 text-left
        transition-all duration-200
        ${
          onClick
            ? "cursor-pointer hover:-translate-y-0.5 hover:shadow-md"
            : ""
        }
        ${
          active
            ? "border-pink-500 ring-2 ring-pink-100 shadow-sm"
            : "border-gray-200 shadow-sm"
        }
      `}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium text-gray-500">{label}</p>

          <p className="mt-1 text-2xl font-bold text-gray-800">
            {value}
          </p>
        </div>

        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${iconColor}`}
        >
          <Icon size={20} />
        </div>
      </div>
    </Component>
  );
};

/* =========================================================
   DETAIL ROW
========================================================= */

const ProjectDetailRow = ({
  label,
  value,
  icon: Icon,
  striped = false,
  multiline = false,
}) => {
  return (
    <div
      className={`grid grid-cols-1 gap-1 px-4 py-3 sm:grid-cols-[180px_minmax(0,1fr)] sm:gap-4 ${
        striped ? "bg-gray-50" : "bg-white"
      }`}
    >
      <div className="flex items-center gap-2 text-sm font-semibold text-gray-600">
        {Icon && <Icon size={16} className="shrink-0 text-pink-500" />}
        <span>{label}</span>
      </div>

      <div
        className={`text-sm text-gray-800 ${
          multiline ? "whitespace-pre-wrap break-words" : "break-words"
        }`}
      >
        {value || "-"}
      </div>
    </div>
  );
};

/* =========================================================
   MAIN COMPONENT
========================================================= */

const ISProjectDrive = () => {
  const [projects, setProjects] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const [selectedFocal, setSelectedFocal] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  const [search, setSearch] = useState("");

  const [sortConfig, setSortConfig] = useState({
    key: "Start Date",
    direction: "desc",
  });

  const [selectedProject, setSelectedProject] = useState(null);

  /* =======================================================
     LOAD DATA
  ======================================================= */

  const loadProjects = useCallback(async (forceRefresh = false) => {
    try {
      setError("");

      if (forceRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const data = await fetchISProjectDrive(forceRefresh);

      setProjects(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("IS Project & Drive loading error:", err);

      setError(
        err?.message ||
          "Unable to load IS Project & Drive data."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadProjects(false);
  }, [loadProjects]);

  /* =======================================================
     ESCAPE KEY FOR MODAL
  ======================================================= */

  useEffect(() => {
    if (!selectedProject) return;

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setSelectedProject(null);
      }
    };

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [selectedProject]);

  /* =======================================================
     DEFER SEARCH
  ======================================================= */

  const deferredSearch = useDeferredValue(search);

  /* =======================================================
     SUMMARY DATA
     
     Everything is calculated in ONE LOOP for better
     performance instead of multiple filter operations.
  ======================================================= */

  const summary = useMemo(() => {
    const counts = {
      Done: 0,
      Ongoing: 0,
      "On Hold": 0,
      Close: 0,
    };

    const focalMap = new Map();

    projects.forEach((project) => {
      const status = getStatus(project.Status);

      if (Object.prototype.hasOwnProperty.call(counts, status)) {
        counts[status]++;
      }

      const focal =
        String(project["Focal-1"] ?? "").trim() ||
        "Not Assigned";

      focalMap.set(
        focal,
        (focalMap.get(focal) || 0) + 1
      );
    });

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
      total: projects.length,
      focalCount: focalSummary.length,
      focalSummary,
      ...counts,
    };
  }, [projects]);

  /* =======================================================
     FILTER + SEARCH + SORT
  ======================================================= */

  const filteredProjects = useMemo(() => {
    const query = deferredSearch.trim().toLowerCase();

    let result = projects;

    /* FOCAL FILTER */
    if (selectedFocal !== "All") {
      const focalQuery = normalize(selectedFocal);

      result = result.filter(
        (project) =>
          normalize(project["Focal-1"] || "Not Assigned") ===
          focalQuery
      );
    }

    /* STATUS FILTER */
    if (statusFilter !== "All") {
      const statusQuery = getStatusKey(statusFilter);

      result = result.filter(
        (project) =>
          getStatusKey(project.Status) === statusQuery
      );
    }

    /* SEARCH */
    if (query) {
      result = result.filter((project) =>
        Object.values(project).some((value) =>
          String(value ?? "")
            .toLowerCase()
            .includes(query)
        )
      );
    }

    /* SORT */
    const sorted = [...result];

    sorted.sort((a, b) => {
      const key = sortConfig.key;

      if (
        key === "Start Date" ||
        key === "End Date"
      ) {
        const dateA = parseDate(a[key])?.getTime() || 0;
        const dateB = parseDate(b[key])?.getTime() || 0;

        return sortConfig.direction === "asc"
          ? dateA - dateB
          : dateB - dateA;
      }

      const valueA = String(a[key] ?? "");
      const valueB = String(b[key] ?? "");

      return sortConfig.direction === "asc"
        ? valueA.localeCompare(valueB, undefined, {
            numeric: true,
            sensitivity: "base",
          })
        : valueB.localeCompare(valueA, undefined, {
            numeric: true,
            sensitivity: "base",
          });
    });

    return sorted;
  }, [
    projects,
    selectedFocal,
    statusFilter,
    deferredSearch,
    sortConfig,
  ]);

  /* =======================================================
     SORT
  ======================================================= */

  const handleSort = (key) => {
    setSortConfig((current) => ({
      key,
      direction:
        current.key === key && current.direction === "asc"
          ? "desc"
          : "asc",
    }));
  };

  /* =======================================================
     FILTER HANDLERS
  ======================================================= */

  const handleStatusCardClick = (status) => {
    setStatusFilter(status);

    /*
      Clicking a status card shows the complete status-wise
      data instead of combining it with the previous focal.
    */
    setSelectedFocal("All");
  };

  const handleTotalClick = () => {
    setSelectedFocal("All");
    setStatusFilter("All");
  };

  const handleFocalClick = (focal) => {
    setSelectedFocal(focal);
  };

  const clearFilters = () => {
    setSelectedFocal("All");
    setStatusFilter("All");
    setSearch("");
  };

  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
        <div className="mx-auto flex min-h-[400px] max-w-[1600px] items-center justify-center">
          <div className="text-center">
            <RefreshCw
              size={32}
              className="mx-auto animate-spin text-pink-600"
            />

            <p className="mt-3 text-sm text-gray-500">
              Loading IS Project & Drive data...
            </p>
          </div>
        </div>
      </div>
    );
  }

  /* =======================================================
     ERROR
  ======================================================= */

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
        <div className="mx-auto max-w-[1600px]">
          <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
            <XCircle
              size={36}
              className="mx-auto text-red-500"
            />

            <h2 className="mt-3 font-semibold text-red-700">
              Unable to load projects
            </h2>

            <p className="mt-1 text-sm text-red-600">
              {error}
            </p>

            <button
              type="button"
              onClick={() => loadProjects(true)}
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-pink-600 px-4 py-2 text-sm font-semibold text-white hover:bg-pink-700"
            >
              <RefreshCw size={16} />
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* =======================================================
     MAIN UI
  ======================================================= */

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-pink-50/30 p-3 sm:p-4 lg:p-6">
      <div className="mx-auto w-full max-w-[1600px]">

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="mb-6 rounded-2xl bg-gradient-to-r from-pink-600 to-pink-500 p-5 text-white shadow-md sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/15">
                  <FolderKanban size={24} />
                </div>

                <div className="min-w-0">
                  <h1 className="text-xl font-bold sm:text-2xl">
                    IS Project & Drive
                  </h1>

                  <p className="mt-1 text-sm text-pink-100">
                    Information System Projects, Activities & Drive
                  </p>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => loadProjects(true)}
              disabled={refreshing}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-pink-600 shadow-sm transition hover:bg-pink-50 disabled:cursor-not-allowed disabled:opacity-70"
            >
              <RefreshCw
                size={16}
                className={refreshing ? "animate-spin" : ""}
              />

              {refreshing ? "Refreshing..." : "Refresh"}
            </button>
          </div>
        </div>

        {/* =================================================
            SUMMARY CARDS
        ================================================= */}

        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
          <SummaryMetric
            label="Total Tasks"
            value={summary.total}
            icon={ListChecks}
            iconColor="bg-pink-100 text-pink-600"
            active={
              statusFilter === "All" &&
              selectedFocal === "All"
            }
            onClick={handleTotalClick}
          />

          <SummaryMetric
            label="Focal-1"
            value={summary.focalCount}
            icon={Users}
            iconColor="bg-purple-100 text-purple-600"
            active={selectedFocal !== "All"}
          />

          <SummaryMetric
            label="Done"
            value={summary.Done}
            icon={CheckCircle2}
            iconColor="bg-emerald-100 text-emerald-600"
            active={statusFilter === "Done"}
            onClick={() => handleStatusCardClick("Done")}
          />

          <SummaryMetric
            label="Ongoing"
            value={summary.Ongoing}
            icon={Clock3}
            iconColor="bg-blue-100 text-blue-600"
            active={statusFilter === "Ongoing"}
            onClick={() =>
              handleStatusCardClick("Ongoing")
            }
          />

          <SummaryMetric
            label="On Hold"
            value={summary["On Hold"]}
            icon={CirclePause}
            iconColor="bg-amber-100 text-amber-600"
            active={statusFilter === "On Hold"}
            onClick={() =>
              handleStatusCardClick("On Hold")
            }
          />

          <SummaryMetric
            label="Close"
            value={summary.Close}
            icon={XCircle}
            iconColor="bg-slate-100 text-slate-600"
            active={statusFilter === "Close"}
            onClick={() =>
              handleStatusCardClick("Close")
            }
          />
        </div>

        {/* =================================================
            MAIN CONTENT
        ================================================= */}

        <div className="grid min-w-0 grid-cols-1 gap-5 lg:grid-cols-[250px_minmax(0,1fr)]">

          {/* =================================================
              FOCAL-WISE DATA
          ================================================= */}

          <aside className="min-w-0 rounded-xl border border-gray-200 bg-white shadow-sm">

            <div className="border-b border-gray-200 p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="font-semibold text-gray-800">
                    Focal-1 Wise
                  </h2>

                  <p className="mt-1 text-xs text-gray-500">
                    Click a focal to filter
                  </p>
                </div>

                <Users
                  size={20}
                  className="shrink-0 text-pink-500"
                />
              </div>
            </div>

            <div className="p-2">

              {/* ALL */}
              <button
                type="button"
                onClick={() =>
                  handleFocalClick("All")
                }
                className={`mb-1 flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm transition ${
                  selectedFocal === "All"
                    ? "bg-pink-50 font-semibold text-pink-700"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <span className="flex min-w-0 items-center gap-2">
                  <FolderKanban
                    size={16}
                    className="shrink-0"
                  />

                  <span className="truncate">
                    All Focal-1
                  </span>
                </span>

                <span className="ml-2 rounded-full bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-700">
                  {summary.total}
                </span>
              </button>

              {/* FOCAL LIST */}
              <div className="max-h-[420px] overflow-y-auto pr-1">
                {summary.focalSummary.length === 0 ? (
                  <div className="px-3 py-6 text-center text-xs text-gray-500">
                    No focal data available
                  </div>
                ) : (
                  summary.focalSummary.map((focal) => (
                    <button
                      key={focal.name}
                      type="button"
                      onClick={() =>
                        handleFocalClick(focal.name)
                      }
                      className={`mb-1 flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2.5 text-left text-sm transition ${
                        selectedFocal === focal.name
                          ? "bg-pink-50 font-semibold text-pink-700 ring-1 ring-pink-200"
                          : "text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      <span className="flex min-w-0 items-center gap-2">
                        <UserRound
                          size={15}
                          className="shrink-0"
                        />

                        <span className="truncate">
                          {focal.name}
                        </span>
                      </span>

                      <span
                        className={`ml-2 shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold ${
                          selectedFocal === focal.name
                            ? "bg-pink-100 text-pink-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {focal.count}
                      </span>
                    </button>
                  ))
                )}
              </div>
            </div>
          </aside>

          {/* =================================================
              PROJECT TABLE
          ================================================= */}

          <section className="min-w-0 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">

            {/* TABLE HEADER */}
            <div className="border-b border-gray-200 p-4">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">

                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-semibold text-gray-800">
                      All IS Projects & Drive
                    </h2>

                    <span className="rounded-full bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-600">
                      {filteredProjects.length} records
                    </span>
                  </div>

                  {(selectedFocal !== "All" ||
                    statusFilter !== "All") && (
                    <div className="mt-2 flex flex-wrap gap-2 text-xs">
                      {selectedFocal !== "All" && (
                        <span className="rounded-full bg-pink-50 px-2.5 py-1 font-medium text-pink-700">
                          Focal: {selectedFocal}
                        </span>
                      )}

                      {statusFilter !== "All" && (
                        <span className="rounded-full bg-blue-50 px-2.5 py-1 font-medium text-blue-700">
                          Status: {statusFilter}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* SEARCH */}
                <div className="relative w-full xl:max-w-xs">
                  <Search
                    size={17}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />

                  <input
                    type="text"
                    value={search}
                    onChange={(event) =>
                      setSearch(event.target.value)
                    }
                    placeholder="Search projects..."
                    className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2.5 pl-9 pr-9 text-sm outline-none transition focus:border-pink-400 focus:bg-white focus:ring-2 focus:ring-pink-100"
                  />

                  {search && (
                    <button
                      type="button"
                      onClick={() => setSearch("")}
                      className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                      aria-label="Clear search"
                    >
                      <X size={15} />
                    </button>
                  )}
                </div>
              </div>

              {/* STATUS FILTERS */}
              <div className="mt-4 flex flex-wrap items-center gap-2">

                {[
                  "All",
                  "Done",
                  "Ongoing",
                  "On Hold",
                  "Close",
                ].map((status) => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => setStatusFilter(status)}
                    className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                      statusFilter === status
                        ? "border-pink-500 bg-pink-600 text-white"
                        : "border-gray-200 bg-white text-gray-600 hover:border-pink-200 hover:bg-pink-50 hover:text-pink-700"
                    }`}
                  >
                    {status}
                  </button>
                ))}

                {(selectedFocal !== "All" ||
                  statusFilter !== "All" ||
                  search) && (
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="ml-auto inline-flex items-center gap-1.5 rounded-full border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-500 hover:bg-gray-50"
                  >
                    <X size={13} />
                    Clear Filters
                  </button>
                )}
              </div>
            </div>

            {/* =================================================
                DESKTOP TABLE
            ================================================= */}

            <div className="hidden md:block">
              <div className="overflow-x-auto">
                <table className="w-full table-fixed">
                  <colgroup>
                    <col className="w-[29%]" />
                    <col className="w-[17%]" />
                    <col className="w-[12%]" />
                    <col className="w-[12%]" />
                    <col className="w-[13%]" />
                    <col className="w-[17%]" />
                  </colgroup>

                  <thead className="border-b border-gray-200 bg-gray-50">
                    <tr>
                      {[
                        "Title",
                        "Focal-1",
                        "Start Date",
                        "End Date",
                        "Status",
                      ].map((heading) => (
                        <th
                          key={heading}
                          className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 lg:px-4"
                        >
                          <button
                            type="button"
                            onClick={() =>
                              handleSort(heading)
                            }
                            className="inline-flex max-w-full items-center gap-1.5 hover:text-pink-600"
                          >
                            <span className="truncate">
                              {heading}
                            </span>

                            <ArrowUpDown
                              size={13}
                              className="shrink-0"
                            />
                          </button>
                        </th>
                      ))}

                      <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 lg:px-4">
                        Action
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-100">
                    {filteredProjects.length === 0 ? (
                      <tr>
                        <td
                          colSpan={6}
                          className="px-4 py-12 text-center"
                        >
                          <Search
                            size={32}
                            className="mx-auto text-gray-300"
                          />

                          <p className="mt-3 text-sm font-medium text-gray-600">
                            No projects found
                          </p>

                          <p className="mt-1 text-xs text-gray-400">
                            Try changing your search or filters.
                          </p>
                        </td>
                      </tr>
                    ) : (
                      filteredProjects.map(
                        (project, index) => (
                          <tr
                            key={
                              project.SN ??
                              project.Title ??
                              index
                            }
                            className="transition hover:bg-pink-50/40"
                          >
                            {/* TITLE */}
                            <td className="max-w-0 px-3 py-3 lg:px-4">
                              <div className="flex min-w-0 items-center gap-2">
                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-pink-50 text-pink-600">
                                  <BriefcaseBusiness
                                    size={15}
                                  />
                                </div>

                                <span
                                  className="block truncate text-sm font-semibold text-gray-800"
                                  title={project.Title}
                                >
                                  {project.Title || "-"}
                                </span>
                              </div>
                            </td>

                            {/* FOCAL */}
                            <td className="max-w-0 px-3 py-3 lg:px-4">
                              <span
                                className="block truncate text-sm text-gray-600"
                                title={
                                  project["Focal-1"] ||
                                  "Not Assigned"
                                }
                              >
                                {project["Focal-1"] ||
                                  "Not Assigned"}
                              </span>
                            </td>

                            {/* START */}
                            <td className="px-3 py-3 lg:px-4">
                              <div className="flex items-center gap-1.5 text-sm text-gray-600">
                                <CalendarDays
                                  size={14}
                                  className="shrink-0 text-gray-400"
                                />

                                <span className="truncate">
                                  {formatDate(
                                    project["Start Date"]
                                  )}
                                </span>
                              </div>
                            </td>

                            {/* END */}
                            <td className="px-3 py-3 lg:px-4">
                              <div className="flex items-center gap-1.5 text-sm text-gray-600">
                                <CalendarDays
                                  size={14}
                                  className="shrink-0 text-gray-400"
                                />

                                <span className="truncate">
                                  {formatDate(
                                    project["End Date"]
                                  )}
                                </span>
                              </div>
                            </td>

                            {/* STATUS */}
                            <td className="px-3 py-3 lg:px-4">
                              <StatusBadge
                                status={project.Status}
                              />
                            </td>

                            {/* ACTION */}
                            <td className="px-3 py-3 lg:px-4">
                              <button
                                type="button"
                                onClick={() =>
                                  setSelectedProject(
                                    project
                                  )
                                }
                                className="inline-flex items-center gap-1.5 rounded-lg border border-pink-200 bg-pink-50 px-3 py-2 text-xs font-semibold text-pink-700 transition hover:bg-pink-600 hover:text-white"
                              >
                                <Eye size={14} />
                                View Details
                              </button>
                            </td>
                          </tr>
                        )
                      )
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* =================================================
                MOBILE PROJECT CARDS
            ================================================= */}

            <div className="divide-y divide-gray-100 md:hidden">
              {filteredProjects.length === 0 ? (
                <div className="px-4 py-12 text-center">
                  <Search
                    size={32}
                    className="mx-auto text-gray-300"
                  />

                  <p className="mt-3 text-sm font-medium text-gray-600">
                    No projects found
                  </p>
                </div>
              ) : (
                filteredProjects.map(
                  (project, index) => (
                    <div
                      key={
                        project.SN ??
                        project.Title ??
                        index
                      }
                      className="p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex min-w-0 items-start gap-2.5">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-pink-50 text-pink-600">
                            <BriefcaseBusiness
                              size={16}
                            />
                          </div>

                          <div className="min-w-0">
                            <h3 className="break-words text-sm font-semibold text-gray-800">
                              {project.Title || "-"}
                            </h3>

                            <p className="mt-1 text-xs text-gray-500">
                              {project["Focal-1"] ||
                                "Not Assigned"}
                            </p>
                          </div>
                        </div>

                        <StatusBadge
                          status={project.Status}
                        />
                      </div>

                      <div className="mt-4 grid grid-cols-2 gap-3 rounded-lg bg-gray-50 p-3">
                        <div>
                          <p className="text-[11px] font-medium uppercase text-gray-400">
                            Start Date
                          </p>

                          <p className="mt-1 text-xs font-medium text-gray-700">
                            {formatDate(
                              project["Start Date"]
                            )}
                          </p>
                        </div>

                        <div>
                          <p className="text-[11px] font-medium uppercase text-gray-400">
                            End Date
                          </p>

                          <p className="mt-1 text-xs font-medium text-gray-700">
                            {formatDate(
                              project["End Date"]
                            )}
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          setSelectedProject(project)
                        }
                        className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-pink-200 bg-pink-50 px-3 py-2.5 text-xs font-semibold text-pink-700 hover:bg-pink-600 hover:text-white"
                      >
                        <Eye size={15} />
                        View Details
                      </button>
                    </div>
                  )
                )
              )}
            </div>

            {/* FOOTER */}
            <div className="border-t border-gray-100 bg-gray-50 px-4 py-3">
              <p className="text-xs text-gray-500">
                Showing{" "}
                <span className="font-semibold text-gray-700">
                  {filteredProjects.length}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-gray-700">
                  {projects.length}
                </span>{" "}
                projects
              </p>
            </div>
          </section>
        </div>
      </div>

      {/* =====================================================
          PROJECT DETAILS MODAL
      ===================================================== */}

      {selectedProject && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-3 sm:p-5"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setSelectedProject(null);
            }
          }}
        >
          <div className="flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">

            {/* MODAL HEADER */}
            <div className="flex items-start justify-between gap-4 bg-gradient-to-r from-pink-600 to-pink-500 p-5 text-white">
              <div className="flex min-w-0 items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/15">
                  <FileText size={22} />
                </div>

                <div className="min-w-0">
                  <p className="text-xs font-medium uppercase tracking-wide text-pink-100">
                    IS Project Details
                  </p>

                  <h2 className="mt-1 break-words text-lg font-bold sm:text-xl">
                    {selectedProject.Title ||
                      "Project Details"}
                  </h2>
                </div>
              </div>

              <button
                type="button"
                onClick={() =>
                  setSelectedProject(null)
                }
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/10 hover:bg-white/20"
                aria-label="Close project details"
              >
                <X size={19} />
              </button>
            </div>

            {/* MODAL CONTENT */}
            <div className="min-h-0 overflow-y-auto overscroll-contain">
              <div className="divide-y divide-gray-100">

                <ProjectDetailRow
                  label="Serial Number"
                  value={selectedProject.SN}
                  icon={ListChecks}
                />

                <ProjectDetailRow
                  label="Type"
                  value={selectedProject.Type}
                  icon={FolderKanban}
                  striped
                />

                <ProjectDetailRow
                  label="FY"
                  value={selectedProject.FY}
                  icon={CalendarDays}
                />

                <ProjectDetailRow
                  label="Title"
                  value={selectedProject.Title}
                  icon={BriefcaseBusiness}
                  striped
                />

                <ProjectDetailRow
                  label="Activity"
                  value={selectedProject.Activity}
                  icon={FileText}
                  multiline
                />

                <ProjectDetailRow
                  label="Focal-1"
                  value={selectedProject["Focal-1"]}
                  icon={UserRound}
                  striped
                />

                <ProjectDetailRow
                  label="Focal-2"
                  value={selectedProject["Focal-2"]}
                  icon={Users}
                />

                <ProjectDetailRow
                  label="Start Date"
                  value={formatDate(
                    selectedProject["Start Date"]
                  )}
                  icon={CalendarDays}
                  striped
                />

                <ProjectDetailRow
                  label="End Date"
                  value={formatDate(
                    selectedProject["End Date"]
                  )}
                  icon={CalendarDays}
                />

                <ProjectDetailRow
                  label="Duration"
                  value={selectedProject.Duration}
                  icon={Clock3}
                  striped
                />

                {/* STATUS */}
                <div className="grid grid-cols-1 gap-1 bg-white px-4 py-3 sm:grid-cols-[180px_minmax(0,1fr)] sm:gap-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-gray-600">
                    <CheckCircle2
                      size={16}
                      className="text-pink-500"
                    />

                    Status
                  </div>

                  <div>
                    <StatusBadge
                      status={selectedProject.Status}
                    />
                  </div>
                </div>

                <ProjectDetailRow
                  label="Stakeholder"
                  value={selectedProject.Stakeholder}
                  icon={Building2}
                  striped
                  multiline
                />

                <ProjectDetailRow
                  label="Budget (If any)"
                  value={selectedProject["Budget (If any)"]}
                  icon={Wallet}
                />

                <ProjectDetailRow
                  label="Remarks"
                  value={selectedProject.Remarks}
                  icon={MessageSquareText}
                  striped
                  multiline
                />

              </div>
            </div>

            {/* MODAL FOOTER */}
            <div className="flex items-center justify-end border-t border-gray-200 bg-gray-50 p-4">
              <button
                type="button"
                onClick={() =>
                  setSelectedProject(null)
                }
                className="rounded-lg bg-gray-800 px-5 py-2.5 text-sm font-semibold text-white hover:bg-gray-900"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ISProjectDrive;