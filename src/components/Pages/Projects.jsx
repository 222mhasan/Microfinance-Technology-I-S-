import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock3,
  FolderKanban,
  RefreshCw,
  Search,
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
// PROJECTS PAGE
// ============================================================

export default function Projects() {

  const [projects, setProjects] = useState([]);

  const [loading, setLoading] = useState(true);

  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState("");

  const [searchTerm, setSearchTerm] = useState("");

  const [statusFilter, setStatusFilter] =
    useState("All");


  // ==========================================================
  // LOAD PROJECTS
  // ==========================================================

  const loadProjects = async (
    forceRefresh = false
  ) => {

    setError("");

    try {

      if (forceRefresh) {

        setRefreshing(true);

      } else {

        setLoading(true);

      }


      const data =
        await fetchProjects(
          forceRefresh
        );


      setProjects(data);

    } catch (err) {

      console.error(
        "Projects Error:",
        err
      );


      setError(
        err.message ||
        "Unable to load projects."
      );

    } finally {

      setLoading(false);

      setRefreshing(false);

    }

  };


  // ==========================================================
  // INITIAL LOAD
  // ==========================================================

  useEffect(() => {

    loadProjects();

  }, []);


  // ==========================================================
  // FILTER PROJECTS
  // ==========================================================

  const filteredProjects =
    useMemo(() => {

      const search =
        searchTerm
          .toLowerCase()
          .trim();


      return projects.filter(
        (project) => {

          // --------------------------------------------------
          // SEARCH
          // --------------------------------------------------

          const matchesSearch =
            !search ||
            String(
              project.Title || ""
            )
              .toLowerCase()
              .includes(search) ||
            String(
              project.Manager || ""
            )
              .toLowerCase()
              .includes(search) ||
            String(
              project.Description || ""
            )
              .toLowerCase()
              .includes(search);


          // --------------------------------------------------
          // STATUS
          // --------------------------------------------------

          const status =
            String(
              project.Status || ""
            )
              .toLowerCase()
              .trim();


          const progress =
            Number(
              project.Progress
            ) || 0;


          let matchesStatus =
            true;


          if (
            statusFilter ===
            "Completed"
          ) {

            matchesStatus =
              progress >= 100 ||
              status ===
                "completed";

          }


          if (
            statusFilter ===
            "In Progress"
          ) {

            matchesStatus =
              status ===
                "in progress" ||
              status ===
                "ongoing";

          }


          if (
            statusFilter ===
            "On Hold"
          ) {

            matchesStatus =
              status ===
                "on hold";

          }


          if (
            statusFilter ===
            "Not Started"
          ) {

            matchesStatus =
              status ===
                "not started" ||
              progress === 0;

          }


          return (
            matchesSearch &&
            matchesStatus
          );

        }
      );

    }, [
      projects,
      searchTerm,
      statusFilter,
    ]);


  // ==========================================================
  // SUMMARY COUNTS
  // ==========================================================

  const summary = useMemo(() => {

    const total =
      projects.length;


    const completed =
      projects.filter(
        (project) => {

          const status =
            String(
              project.Status || ""
            )
              .toLowerCase()
              .trim();

          return (
            Number(project.Progress) >= 100 ||
            status === "completed"
          );

        }
      ).length;


    const ongoing =
      projects.filter(
        (project) => {

          const status =
            String(
              project.Status || ""
            )
              .toLowerCase()
              .trim();

          return (
            status === "in progress" ||
            status === "ongoing"
          );

        }
      ).length;


    const onHold =
      projects.filter(
        (project) =>
          String(
            project.Status || ""
          )
            .toLowerCase()
            .trim() ===
          "on hold"
      ).length;


    return {
      total,
      completed,
      ongoing,
      onHold,
    };

  }, [projects]);


  // ==========================================================
  // LOADING STATE
  // ==========================================================

  if (
    loading &&
    projects.length === 0
  ) {

    return (

      <div className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">

        <div className="mx-auto max-w-7xl">

          <div className="mb-6 h-8 w-64 animate-pulse rounded-lg bg-slate-200" />


          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">

            {[1, 2, 3, 4].map(
              (item) => (

                <div
                  key={item}
                  className="h-24 animate-pulse rounded-2xl bg-white shadow-sm"
                />

              )
            )}

          </div>


          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">

            {[1, 2, 3, 4, 5, 6, 7, 8].map(
              (item) => (

                <div
                  key={item}
                  className="h-72 animate-pulse rounded-2xl bg-white shadow-sm"
                />

              )
            )}

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


        {/* ====================================================
            HEADER
        ==================================================== */}

        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

          <div>

            <div className="mb-2">

              <Link
                to="/"
                className="inline-flex items-center gap-1 text-sm font-medium text-slate-500 transition hover:text-pink-600"
              >

                <ArrowLeft
                  size={16}
                />

                Dashboard

              </Link>

            </div>


            <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">

              All Projects

            </h1>

            <p className="mt-1 text-sm text-slate-500">

              Explore all Microfinance Technology projects

            </p>

          </div>


          <button
            onClick={() =>
              loadProjects(true)
            }
            disabled={refreshing}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-pink-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-pink-700 disabled:cursor-not-allowed disabled:opacity-70"
          >

            <RefreshCw
              size={16}
              className={
                refreshing
                  ? "animate-spin"
                  : ""
              }
            />

            {refreshing
              ? "Refreshing..."
              : "Refresh"}

          </button>

        </div>


        {/* ====================================================
            ERROR
        ==================================================== */}

        {error && (

          <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">

            {error}

          </div>

        )}


        {/* ====================================================
            SUMMARY CARDS
        ==================================================== */}

        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">

          <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-sm text-slate-500">
                  Total Projects
                </p>

                <p className="mt-2 text-3xl font-bold text-slate-900">
                  {summary.total}
                </p>

              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-pink-100 text-pink-600">

                <FolderKanban
                  size={21}
                />

              </div>

            </div>

          </div>


          <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-sm text-slate-500">
                  In Progress
                </p>

                <p className="mt-2 text-3xl font-bold text-slate-900">
                  {summary.ongoing}
                </p>

              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 text-blue-600">

                <Clock3
                  size={21}
                />

              </div>

            </div>

          </div>


          <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-sm text-slate-500">
                  Completed
                </p>

                <p className="mt-2 text-3xl font-bold text-slate-900">
                  {summary.completed}
                </p>

              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-100 text-green-600">

                <CheckCircle2
                  size={21}
                />

              </div>

            </div>

          </div>


          <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-sm text-slate-500">
                  On Hold
                </p>

                <p className="mt-2 text-3xl font-bold text-slate-900">
                  {summary.onHold}
                </p>

              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-100 text-amber-600">

                <Clock3
                  size={21}
                />

              </div>

            </div>

          </div>

        </div>


        {/* ====================================================
            SEARCH + FILTER
        ==================================================== */}

        <div className="mb-6 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">

          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

            {/* Search */}

            <div className="relative w-full lg:max-w-md">

              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="text"
                value={searchTerm}
                onChange={(event) =>
                  setSearchTerm(
                    event.target.value
                  )
                }
                placeholder="Search projects..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm text-slate-800 outline-none transition focus:border-pink-400 focus:bg-white focus:ring-2 focus:ring-pink-100"
              />

            </div>


            {/* Status Filter */}

            <div className="flex flex-wrap gap-2">

              {[
                "All",
                "In Progress",
                "Completed",
                "On Hold",
                "Not Started",
              ].map(
                (status) => (

                  <button
                    key={status}
                    onClick={() =>
                      setStatusFilter(
                        status
                      )
                    }
                    className={`rounded-lg px-3 py-2 text-xs font-semibold transition ${
                      statusFilter === status
                        ? "bg-pink-600 text-white"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >

                    {status}

                  </button>

                )
              )}

            </div>

          </div>

        </div>


        {/* ====================================================
            RESULT COUNT
        ==================================================== */}

        <div className="mb-4 flex items-center justify-between">

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

          </p>

        </div>


        {/* ====================================================
            PROJECT GRID
        ==================================================== */}

        {filteredProjects.length > 0 ? (

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">

            {filteredProjects.map(
              (project, index) => {

                const progress =
                  Math.min(
                    100,
                    Math.max(
                      0,
                      Number(
                        project.Progress
                      ) || 0
                    )
                  );


                const status =
                  String(
                    project.Status ||
                    ""
                  ).trim();


                const normalizedStatus =
                  status
                    .toLowerCase();


                const completed =
                  progress >= 100 ||
                  normalizedStatus ===
                    "completed";


                const theme =
                  projectThemes[
                    index %
                    projectThemes.length
                  ];


                return (

                  <Link
                    key={
                      project.ID ||
                      index
                    }
                    to={`/projects/${project.ID}`}
                    className="group overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-lg"
                  >

                    {/* Accent */}

                    <div
                      className={`h-1.5 bg-gradient-to-r ${theme.bg}`}
                    />


                    <div className="p-5">


                      {/* Top */}

                      <div className="mb-4 flex items-start justify-between">

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
                              className={
                                theme.text
                              }
                            />

                          )}

                        </div>


                        <span
                          className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                            completed
                              ? "bg-green-50 text-green-600"
                              : normalizedStatus.includes(
                                  "hold"
                                )
                              ? "bg-amber-50 text-amber-600"
                              : "bg-blue-50 text-blue-600"
                          }`}
                        >

                          {completed
                            ? "Completed"
                            : status ||
                              "Ongoing"}

                        </span>

                      </div>


                      {/* Title */}

                      <h2 className="line-clamp-2 min-h-[48px] text-base font-bold text-slate-900 transition group-hover:text-pink-600">

                        {project.Title ||
                          "Untitled Project"}

                      </h2>


                      {/* Description */}

                      <p className="mt-2 line-clamp-2 min-h-[40px] text-xs leading-5 text-slate-500">

                        {project.Description ||
                          "No description available."}

                      </p>


                      {/* Manager */}

                      <p className="mt-3 line-clamp-1 text-xs text-slate-500">

                        Manager:{" "}

                        <span className="font-medium text-slate-700">

                          {project.Manager ||
                            "N/A"}

                        </span>

                      </p>


                      {/* Timeline */}

                      <p className="mt-1 line-clamp-1 text-xs text-slate-500">

                        Timeline:{" "}

                        <span className="font-medium text-slate-700">

                          {project.Timeline ||
                            "N/A"}

                        </span>

                      </p>


                      {/* Progress */}

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
                            style={{
                              width: `${progress}%`,
                            }}
                          />

                        </div>

                      </div>


                      {/* Footer */}

                      <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">

                        <span className="text-xs font-medium text-slate-400">

                          #{project.ID}

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

              }
            )}

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

          </div>

        )}

      </div>

    </div>

  );

}