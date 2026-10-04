import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

const Projects = () => {
  const API_URL =
    "https://script.google.com/macros/s/AKfycbw9ARpnkUgzbxOpxtJVglZvV6dWfN6eqQJ3L-1fTYxJWhYrmNjwuaQqC0Wkxquyq2o/exec";

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  // ==========================================
  // PROJECT THEMES
  // ==========================================

  const projectThemes = [
    {
      card: "from-pink-50 via-white to-rose-50",
      border: "border-pink-200",
      top: "bg-pink-500",
      logo: "bg-pink-100 border-pink-200",
      logoText: "text-pink-600",
      progress: "text-pink-600",
      progressBar: "bg-pink-500",
      badge: "bg-pink-100 text-pink-700",
      arrow: "text-pink-600",
      glow: "bg-pink-200",
      icon: "text-pink-500",
    },
    {
      card: "from-blue-50 via-white to-cyan-50",
      border: "border-blue-200",
      top: "bg-blue-500",
      logo: "bg-blue-100 border-blue-200",
      logoText: "text-blue-600",
      progress: "text-blue-600",
      progressBar: "bg-blue-500",
      badge: "bg-blue-100 text-blue-700",
      arrow: "text-blue-600",
      glow: "bg-blue-200",
      icon: "text-blue-500",
    },
    {
      card: "from-purple-50 via-white to-violet-50",
      border: "border-purple-200",
      top: "bg-purple-500",
      logo: "bg-purple-100 border-purple-200",
      logoText: "text-purple-600",
      progress: "text-purple-600",
      progressBar: "bg-purple-500",
      badge: "bg-purple-100 text-purple-700",
      arrow: "text-purple-600",
      glow: "bg-purple-200",
      icon: "text-purple-500",
    },
    {
      card: "from-emerald-50 via-white to-green-50",
      border: "border-emerald-200",
      top: "bg-emerald-500",
      logo: "bg-emerald-100 border-emerald-200",
      logoText: "text-emerald-600",
      progress: "text-emerald-600",
      progressBar: "bg-emerald-500",
      badge: "bg-emerald-100 text-emerald-700",
      arrow: "text-emerald-600",
      glow: "bg-emerald-200",
      icon: "text-emerald-500",
    },
    {
      card: "from-orange-50 via-white to-amber-50",
      border: "border-orange-200",
      top: "bg-orange-500",
      logo: "bg-orange-100 border-orange-200",
      logoText: "text-orange-600",
      progress: "text-orange-600",
      progressBar: "bg-orange-500",
      badge: "bg-orange-100 text-orange-700",
      arrow: "text-orange-600",
      glow: "bg-orange-200",
      icon: "text-orange-500",
    },
  ];

  // ==========================================
  // FETCH PROJECTS
  // ==========================================

  const fetchProjects = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const controller = new AbortController();

      const timeout = setTimeout(() => {
        controller.abort();
      }, 10000);

      const response = await fetch(API_URL, {
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!response.ok) {
        throw new Error("Failed to load projects");
      }

      const data = await response.json();

      if (!Array.isArray(data)) {
        throw new Error("Invalid data received");
      }

      // ==========================================
      // LATEST GOOGLE SHEET ENTRY FIRST
      // ==========================================

      const latestFirst = [...data].reverse();

      setProjects(latestFirst);

    } catch (error) {
      console.error("Error loading projects:", error);

      if (error.name === "AbortError") {
        setError("The server is taking too long to respond.");
      } else {
        setError("Unable to load projects.");
      }

    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  // ==========================================
  // STATUS LIST
  // ==========================================

  const statuses = useMemo(() => {
    const uniqueStatuses = [
      ...new Set(
        projects
          .map((project) => project.Status)
          .filter(Boolean)
      ),
    ];

    return ["All", ...uniqueStatuses];
  }, [projects]);

  // ==========================================
  // FILTER PROJECTS
  // ==========================================

  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      const search = searchTerm.toLowerCase().trim();

      const matchesSearch =
        !search ||
        String(project.Title || "")
          .toLowerCase()
          .includes(search) ||
        String(project.Manager || "")
          .toLowerCase()
          .includes(search) ||
        String(project.Description || "")
          .toLowerCase()
          .includes(search);

      const matchesStatus =
        statusFilter === "All" ||
        project.Status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [projects, searchTerm, statusFilter]);

  // ==========================================
  // SUMMARY
  // ==========================================

  const totalProjects = projects.length;

  // Progress is 100% = Completed
  const completed = projects.filter(
    (project) => Number(project.Progress || 0) >= 100
  ).length;

  // Progress below 100% = Active
  const inProgress = projects.filter(
    (project) => {
      const progress = Number(project.Progress || 0);

      return progress > 0 && progress < 100;
    }
  ).length;

  // Progress 80% - 99% = Near Completion
  const nearCompletion = projects.filter(
    (project) => {
      const progress = Number(project.Progress || 0);

      return progress >= 80 && progress < 100;
    }
  ).length;

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[600px] bg-gray-50">

        <div className="text-center">

          <div className="relative flex items-center justify-center w-16 h-16 mx-auto mb-5">

            <div className="absolute inset-0 border-4 border-pink-100 rounded-full"></div>

            <div className="absolute inset-0 border-4 border-transparent rounded-full border-t-pink-600 animate-spin"></div>

            <span className="text-xs font-bold text-pink-600">
              MF
            </span>

          </div>

          <h2 className="text-sm font-semibold text-gray-700">
            Loading Projects
          </h2>

          <p className="mt-1 text-xs text-gray-400">
            Fetching the latest project information...
          </p>

        </div>

      </div>
    );
  }

  // ==========================================
  // ERROR
  // ==========================================

  if (error) {
    return (
      <div className="min-h-screen p-6 bg-gray-50">

        <div className="max-w-xl p-8 mx-auto mt-10 text-center bg-white border border-red-200 shadow-sm rounded-2xl">

          <div className="flex items-center justify-center w-16 h-16 mx-auto mb-5 text-2xl font-bold text-red-600 bg-red-100 rounded-2xl">
            !
          </div>

          <h2 className="text-xl font-bold text-gray-800">
            Unable to Load Projects
          </h2>

          <p className="mt-2 text-sm text-gray-500">
            {error}
          </p>

          <button
            onClick={() => fetchProjects(true)}
            className="px-6 py-2.5 mt-6 text-sm font-semibold text-white transition bg-pink-600 rounded-lg hover:bg-pink-700 active:scale-95"
          >
            Try Again
          </button>

        </div>

      </div>
    );
  }

  // ==========================================
  // RETURN
  // ==========================================

  return (
    <div className="relative min-h-screen p-6 overflow-hidden bg-gray-50">

      {/* ======================================
          BACKGROUND DECORATION
      ====================================== */}

      <div className="absolute top-0 right-0 w-80 h-80 bg-pink-100 rounded-full opacity-30 blur-3xl"></div>

      <div className="absolute bottom-0 left-0 w-80 h-80 bg-purple-100 rounded-full opacity-20 blur-3xl"></div>

      <div className="absolute top-1/2 left-1/2 w-72 h-72 bg-blue-100 rounded-full opacity-10 blur-3xl"></div>

      <div className="relative z-10">

        {/* ======================================
            PAGE HEADER
        ====================================== */}

        <div className="mb-7">

          <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">

            <div>

              <p className="mb-1 text-xs font-bold tracking-[0.2em] text-pink-600 uppercase">
                Microfinance Technology
              </p>

              <h1 className="text-3xl font-bold text-gray-800 md:text-4xl">
                Technology Projects
              </h1>

              <p className="mt-2 text-sm text-gray-500">
                Explore ongoing and completed Microfinance Technology projects.
              </p>

            </div>

            {/* REFRESH BUTTON */}

            <button
              type="button"
              onClick={() => fetchProjects(true)}
              disabled={refreshing}
              className="inline-flex items-center self-start gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 transition bg-white border border-gray-200 shadow-sm rounded-xl hover:border-pink-300 hover:text-pink-600 hover:shadow-md disabled:opacity-60 lg:self-center"
            >

              <span
                className={`text-base ${
                  refreshing ? "animate-spin" : ""
                }`}
              >
                ↻
              </span>

              {refreshing ? "Refreshing..." : "Refresh"}

            </button>

          </div>

        </div>


        {/* ======================================
            SUMMARY
        ====================================== */}

        <div className="grid grid-cols-2 gap-4 mb-7 md:grid-cols-4">

          {/* TOTAL */}

          <div className="relative p-5 overflow-hidden bg-white border border-pink-100 shadow-sm rounded-2xl">

            <div className="absolute w-20 h-20 bg-pink-100 rounded-full -right-5 -top-5 opacity-60"></div>

            <div className="relative">

              <p className="text-xs font-semibold tracking-wide text-gray-400 uppercase">
                Total
              </p>

              <p className="mt-2 text-3xl font-bold text-pink-600">
                {totalProjects}
              </p>

              <p className="mt-1 text-xs text-gray-400">
                All projects
              </p>

            </div>

          </div>


          {/* IN PROGRESS */}

          <div className="relative p-5 overflow-hidden bg-white border border-blue-100 shadow-sm rounded-2xl">

            <div className="absolute w-20 h-20 bg-blue-100 rounded-full -right-5 -top-5 opacity-60"></div>

            <div className="relative">

              <p className="text-xs font-semibold tracking-wide text-gray-400 uppercase">
                In Progress
              </p>

              <p className="mt-2 text-3xl font-bold text-blue-600">
                {inProgress}
              </p>

              <p className="mt-1 text-xs text-gray-400">
                Active projects
              </p>

            </div>

          </div>


          {/* NEAR COMPLETION */}

          <div className="relative p-5 overflow-hidden bg-white border border-orange-100 shadow-sm rounded-2xl">

            <div className="absolute w-20 h-20 bg-orange-100 rounded-full -right-5 -top-5 opacity-60"></div>

            <div className="relative">

              <p className="text-xs font-semibold tracking-wide text-gray-400 uppercase">
                Near Completion
              </p>

              <p className="mt-2 text-3xl font-bold text-orange-500">
                {nearCompletion}
              </p>

              <p className="mt-1 text-xs text-gray-400">
                80% or more
              </p>

            </div>

          </div>


          {/* COMPLETED */}

          <div className="relative p-5 overflow-hidden bg-white border border-green-100 shadow-sm rounded-2xl">

            <div className="absolute w-20 h-20 bg-green-100 rounded-full -right-5 -top-5 opacity-60"></div>

            <div className="relative">

              <p className="text-xs font-semibold tracking-wide text-gray-400 uppercase">
                Completed
              </p>

              <p className="mt-2 text-3xl font-bold text-green-600">
                {completed}
              </p>

              <p className="mt-1 text-xs text-gray-400">
                100% completed
              </p>

            </div>

          </div>

        </div>


        {/* ======================================
            SEARCH + FILTER
        ====================================== */}

        <div className="p-4 mb-7 bg-white border border-gray-200 shadow-sm rounded-2xl">

          <div className="flex flex-col gap-4 md:flex-row md:items-center">

            {/* SEARCH */}

            <div className="relative flex-1">

              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                ⌕
              </span>

              <input
                type="text"
                value={searchTerm}
                onChange={(event) =>
                  setSearchTerm(event.target.value)
                }
                placeholder="Search project, manager or description..."
                className="w-full py-3 pl-11 pr-4 text-sm text-gray-700 transition bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-100"
              />

            </div>


            {/* STATUS FILTER */}

            <div className="flex items-center gap-2">

              <span className="hidden text-xs font-semibold text-gray-400 uppercase sm:block">
                Status:
              </span>

              <select
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(event.target.value)
                }
                className="px-4 py-3 text-sm font-medium text-gray-700 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-100"
              >

                {statuses.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}

              </select>

            </div>

          </div>

        </div>


        {/* ======================================
            RESULTS HEADER
        ====================================== */}

        <div className="flex items-center justify-between mb-5">

          <div>

            <h2 className="text-lg font-bold text-gray-800">
              Project Collection
            </h2>

            <p className="mt-1 text-xs text-gray-400">
              Showing {filteredProjects.length} of {totalProjects} projects
            </p>

          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-pink-700 bg-pink-50 rounded-full">

            <span className="w-2 h-2 bg-pink-500 rounded-full animate-pulse"></span>

            Latest First

          </div>

        </div>


        {/* ======================================
            NO PROJECTS
        ====================================== */}

        {filteredProjects.length === 0 ? (

          <div className="p-12 text-center bg-white border border-gray-200 shadow-sm rounded-2xl">

            <div className="flex items-center justify-center w-16 h-16 mx-auto mb-5 text-xl font-bold text-pink-600 bg-pink-50 rounded-2xl">
              MF
            </div>

            <h3 className="text-lg font-semibold text-gray-700">
              No Projects Found
            </h3>

            <p className="max-w-md mx-auto mt-2 text-sm text-gray-400">
              Try changing your search keyword or status filter.
            </p>

            <button
              type="button"
              onClick={() => {
                setSearchTerm("");
                setStatusFilter("All");
              }}
              className="px-5 py-2 mt-5 text-sm font-medium text-pink-600 transition border border-pink-200 rounded-lg hover:bg-pink-50"
            >
              Clear Filters
            </button>

          </div>

        ) : (

          /* ======================================
              PROJECT GRID
          ====================================== */

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">

            {filteredProjects.map((project, index) => {

              // =================================
              // PROGRESS
              // =================================

              const progress = Math.min(
                Math.max(
                  Number(project.Progress || 0),
                  0
                ),
                100
              );

              const radius = 31;

              const circumference =
                2 * Math.PI * radius;

              const progressOffset =
                circumference -
                (progress / 100) * circumference;


              // =================================
              // THEME
              // =================================

              const theme =
                projectThemes[
                  index % projectThemes.length
                ];


              // =================================
              // STATUS
              // =================================

              let statusClass = theme.badge;

              if (progress === 100) {
                statusClass =
                  "bg-green-100 text-green-700";
              } else if (project.Status === "Near Completion") {
                statusClass =
                  "bg-orange-100 text-orange-700";
              } else if (project.Status === "In Progress") {
                statusClass =
                  "bg-blue-100 text-blue-700";
              } else if (project.Status === "Completed") {
                statusClass =
                  "bg-green-100 text-green-700";
              }


              return (

                <Link
                  key={project.ID}
                  to={`/projects/${project.ID}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`
                    group
                    relative
                    block
                    overflow-hidden
                    bg-gradient-to-br
                    ${theme.card}
                    border
                    ${theme.border}
                    shadow-sm
                    rounded-2xl
                    transition-all
                    duration-300
                    hover:-translate-y-2
                    hover:shadow-xl
                  `}
                >

                  {/* TOP COLOR BAR */}

                  <div
                    className={`
                      absolute
                      top-0
                      left-0
                      right-0
                      h-1
                      ${progress === 100
                        ? "bg-green-500"
                        : theme.top
                      }
                    `}
                  ></div>


                  {/* DECORATIVE GLOW */}

                  <div
                    className={`
                      absolute
                      w-32
                      h-32
                      rounded-full
                      -right-12
                      -top-12
                      ${theme.glow}
                      opacity-20
                      blur-3xl
                      transition-transform
                      duration-500
                      group-hover:scale-150
                    `}
                  ></div>


                  <div className="relative z-10 p-5">

                    {/* LOGO + PROGRESS */}

                    <div className="flex items-center justify-between">

                      {/* LOGO */}

                      <div
                        className={`
                          flex
                          items-center
                          justify-center
                          w-20
                          h-20
                          overflow-hidden
                          border
                          rounded-2xl
                          transition-all
                          duration-300
                          group-hover:scale-105
                          group-hover:rotate-[-3deg]
                          ${theme.logo}
                        `}
                      >

                        {project.Logo ? (

                          <img
                            src={project.Logo}
                            alt={`${project.Title} logo`}
                            className="object-contain w-full h-full p-2"
                            loading="lazy"
                          />

                        ) : (

                          <span
                            className={`text-xl font-bold ${theme.logoText}`}
                          >
                            MF
                          </span>

                        )}

                      </div>


                      {/* CIRCULAR PROGRESS */}

                      <div className="relative flex items-center justify-center w-[76px] h-[76px]">

                        <svg
                          className="w-[76px] h-[76px] -rotate-90"
                          viewBox="0 0 80 80"
                        >

                          <circle
                            cx="40"
                            cy="40"
                            r={radius}
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="7"
                            className="text-gray-200/80"
                          />

                          <circle
                            cx="40"
                            cy="40"
                            r={radius}
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="7"
                            strokeLinecap="round"
                            className={`
                              ${
                                progress === 100
                                  ? "text-green-500"
                                  : theme.progress
                              }
                            `}
                            strokeDasharray={circumference}
                            strokeDashoffset={progressOffset}
                          />

                        </svg>

                        <div className="absolute inset-0 flex flex-col items-center justify-center">

                          <span className="text-sm font-bold text-gray-800">
                            {progress}%
                          </span>

                          <span className="text-[9px] text-gray-400">
                            Progress
                          </span>

                        </div>

                      </div>

                    </div>


                    {/* TITLE */}

                    <div className="mt-5">

                      <h3 className="text-lg font-bold leading-6 text-gray-800 transition-colors duration-200 line-clamp-2 group-hover:text-pink-700">
                        {project.Title}
                      </h3>

                    </div>


                    {/* STATUS */}

                    <div className="mt-3">

                      <span
                        className={`
                          inline-flex
                          px-2.5
                          py-1
                          text-[10px]
                          font-bold
                          rounded-full
                          ${statusClass}
                        `}
                      >
                        {progress === 100
                          ? "Completed"
                          : project.Status || "Unknown"}
                      </span>

                    </div>


                    {/* DESCRIPTION */}

                    <p className="mt-4 text-sm leading-5 text-gray-500 line-clamp-3">
                      {project.Description ||
                        "No project description available."}
                    </p>


                    {/* INFORMATION */}

                    <div className="grid grid-cols-1 gap-3 mt-5">

                      {/* TIMELINE */}

                      <div className="p-3 bg-white/70 border border-white/80 rounded-xl">

                        <p className="text-[9px] font-bold tracking-wider text-gray-400 uppercase">
                          Timeline
                        </p>

                        <p className="mt-1 text-sm font-semibold text-gray-700">
                          {project.Timeline || "Not Available"}
                        </p>

                      </div>


                      {/* MANAGER */}

                      <div className="p-3 bg-white/70 border border-white/80 rounded-xl">

                        <p className="text-[9px] font-bold tracking-wider text-gray-400 uppercase">
                          Project Manager
                        </p>

                        <p className="mt-1 text-sm font-semibold text-gray-700 truncate">
                          {project.Manager || "Not Available"}
                        </p>

                      </div>


                      {/* BUDGET */}

                      {project.Budget && (

                        <div className="p-3 bg-white/70 border border-white/80 rounded-xl">

                          <p className="text-[9px] font-bold tracking-wider text-gray-400 uppercase">
                            Budget
                          </p>

                          <p className="mt-1 text-sm font-semibold text-emerald-600 break-words">
                            {project.Budget}
                          </p>

                        </div>

                      )}

                    </div>


                    {/* PROGRESS BAR */}

                    <div className="mt-5">

                      <div className="flex items-center justify-between mb-2">

                        <span className="text-[10px] font-bold tracking-wider text-gray-400 uppercase">
                          Project Progress
                        </span>

                        <span
                          className={`text-xs font-bold ${
                            progress === 100
                              ? "text-green-600"
                              : theme.progress
                          }`}
                        >
                          {progress}%
                        </span>

                      </div>

                      <div className="w-full h-2 overflow-hidden bg-gray-200/70 rounded-full">

                        <div
                          className={`
                            h-full
                            rounded-full
                            transition-all
                            duration-700
                            ${
                              progress === 100
                                ? "bg-green-500"
                                : theme.progressBar
                            }
                          `}
                          style={{
                            width: `${progress}%`,
                          }}
                        ></div>

                      </div>

                    </div>


                    {/* VIEW DETAILS */}

                    <div className="flex items-center justify-between pt-4 mt-5 border-t border-gray-200/60">

                      <span className="text-xs font-medium text-gray-400">
                        View project details
                      </span>

                      <span
                        className={`
                          text-sm
                          font-bold
                          transition-transform
                          duration-300
                          group-hover:translate-x-1
                          ${
                            progress === 100
                              ? "text-green-600"
                              : theme.arrow
                          }
                        `}
                      >
                        View →
                      </span>

                    </div>

                  </div>

                </Link>

              );
            })}

          </div>

        )}

      </div>

    </div>
  );
};

export default Projects;