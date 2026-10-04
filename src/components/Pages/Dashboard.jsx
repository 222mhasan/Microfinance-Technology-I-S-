import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const Dashboard = () => {
  const API_URL =
    "https://script.google.com/macros/s/AKfycbw9ARpnkUgzbxOpxtJVglZvV6dWfN6eqQJ3L-1fTYxJWhYrmNjwuaQqC0Wkxquyq2o/exec";

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ==========================================
  // FETCH PROJECTS
  // ==========================================

  const fetchProjects = async () => {
    try {
      setLoading(true);
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

      setProjects(data);
    } catch (error) {
      console.error("Error loading dashboard:", error);

      if (error.name === "AbortError") {
        setError("The server is taking too long to respond.");
      } else {
        setError("Unable to load dashboard data.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[500px] bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-4 border-4 border-gray-200 rounded-full border-t-pink-600 animate-spin"></div>

          <p className="text-sm font-medium text-gray-500">
            Loading dashboard...
          </p>

          <p className="mt-1 text-xs text-gray-400">
            Please wait
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
      <div className="p-6 bg-gray-50 min-h-[500px]">
        <div className="max-w-xl p-6 mx-auto mt-10 text-center bg-white border border-red-200 shadow-sm rounded-2xl">
          <div className="flex items-center justify-center w-14 h-14 mx-auto mb-4 text-xl font-bold text-red-600 bg-red-100 rounded-full">
            !
          </div>

          <h2 className="text-lg font-bold text-gray-800">
            Unable to load dashboard
          </h2>

          <p className="mt-2 text-sm text-gray-500">
            {error}
          </p>

          <button
            onClick={fetchProjects}
            className="px-5 py-2.5 mt-5 text-sm font-medium text-white transition bg-pink-600 rounded-lg hover:bg-pink-700 active:scale-95"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // ==========================================
  // DASHBOARD CALCULATIONS
  // ==========================================

  const totalProjects = projects.length;

  const inProgress = projects.filter(
    (project) => project.Status === "In Progress"
  ).length;

  const nearCompletion = projects.filter(
    (project) => project.Status === "Near Completion"
  ).length;

  const completed = projects.filter(
    (project) => project.Status === "Completed"
  ).length;

  const averageProgress =
    totalProjects > 0
      ? Math.round(
          projects.reduce(
            (total, project) =>
              total + Number(project.Progress || 0),
            0
          ) / totalProjects
        )
      : 0;

  // ==========================================
  // SUMMARY CARD DATA
  // ==========================================

  const summaryCards = [
    {
      title: "Total Projects",
      value: totalProjects,
      description: "All technology projects",
      valueClass: "text-gray-800",
    },
    {
      title: "In Progress",
      value: inProgress,
      description: "Currently active",
      valueClass: "text-pink-600",
    },
    {
      title: "Near Completion",
      value: nearCompletion,
      description: "Almost completed",
      valueClass: "text-orange-500",
    },
    {
      title: "Completed",
      value: completed,
      description: "Successfully completed",
      valueClass: "text-green-600",
    },
    {
      title: "Average Progress",
      value: `${averageProgress}%`,
      description: "Overall project progress",
      valueClass: "text-blue-600",
    },
  ];

  // ==========================================
  // RETURN
  // ==========================================

  return (
    <div className="relative min-h-screen p-6 overflow-hidden bg-gray-50 dashboard-fade">

      {/* ======================================
          BACKGROUND DECORATION
      ====================================== */}

      <div className="absolute top-0 right-0 w-72 h-72 bg-pink-100 rounded-full opacity-30 blur-3xl"></div>

      <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-100 rounded-full opacity-20 blur-3xl"></div>


      {/* ======================================
          MAIN CONTENT
      ====================================== */}

      <div className="relative z-10">

        {/* PAGE HEADER */}

        <div className="mb-7 dashboard-card">

          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">

            <div>

              <p className="mb-1 text-xs font-semibold tracking-widest text-pink-600 uppercase">
                Microfinance Technology
              </p>

              <h1 className="text-2xl font-bold text-gray-800 md:text-3xl">
                Technology Dashboard
              </h1>

              <p className="mt-1 text-sm text-gray-500">
                Microfinance Technology Project Overview
              </p>

            </div>

            <div className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 shadow-sm rounded-xl">

              <span className="relative flex w-2.5 h-2.5">
                <span className="absolute inline-flex w-full h-full bg-green-400 rounded-full opacity-75 animate-ping"></span>

                <span className="relative inline-flex w-2.5 h-2.5 bg-green-500 rounded-full"></span>
              </span>

              <span className="text-xs font-medium text-gray-600">
                System Active
              </span>

            </div>

          </div>

        </div>


        {/* ======================================
            SUMMARY CARDS
        ====================================== */}

        <div className="grid grid-cols-1 gap-5 mb-7 sm:grid-cols-2 lg:grid-cols-5">

          {summaryCards.map((card, index) => (
            <div
              key={card.title}
              className="p-5 bg-white border border-gray-200 shadow-sm rounded-2xl dashboard-card summary-card"
              style={{
                animationDelay: `${0.1 + index * 0.1}s`,
              }}
            >

              <p className="text-sm font-medium text-gray-500">
                {card.title}
              </p>

              <h2
                className={`mt-2 text-3xl font-bold ${card.valueClass}`}
              >
                {card.value}
              </h2>

              <p className="mt-1 text-xs text-gray-400">
                {card.description}
              </p>

            </div>
          ))}

        </div>


        {/* ======================================
            PROJECT OVERVIEW
        ====================================== */}

        <div
          className="p-6 bg-white border border-gray-200 shadow-sm rounded-2xl dashboard-card"
          style={{
            animationDelay: "0.6s",
          }}
        >

          {/* SECTION HEADER */}

          <div className="flex flex-col justify-between gap-3 mb-6 sm:flex-row sm:items-center">

            <div>

              <h2 className="text-lg font-semibold text-gray-800">
                Project Overview
              </h2>

              <p className="mt-1 text-xs text-gray-500">
                Current status and progress of technology projects
              </p>

            </div>

            <div className="flex items-center self-start gap-2 px-3 py-1.5 text-xs font-medium text-pink-700 bg-pink-50 rounded-full">

              <span className="w-2 h-2 bg-pink-500 rounded-full"></span>

              {totalProjects} Projects

            </div>

          </div>


          {/* ======================================
              NO PROJECTS
          ====================================== */}

          {projects.length === 0 ? (

            <div className="py-16 text-center">

              <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 text-xl font-bold text-pink-600 bg-pink-50 rounded-2xl">
                MF
              </div>

              <p className="text-sm text-gray-500">
                No projects found.
              </p>

            </div>

          ) : (

            /* ====================================
               PROJECT GRID
            ==================================== */

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">

              {projects.map((project, index) => {

                // --------------------------------
                // PROGRESS
                // --------------------------------

                const progress = Math.min(
                  Math.max(
                    Number(project.Progress || 0),
                    0
                  ),
                  100
                );

                const radius = 32;

                const circumference =
                  2 * Math.PI * radius;

                const progressOffset =
                  circumference -
                  (progress / 100) *
                    circumference;


                // --------------------------------
                // STATUS COLOR
                // --------------------------------

                const statusColor =
                  project.Status === "Completed"
                    ? "bg-green-100 text-green-700"
                    : project.Status === "Near Completion"
                    ? "bg-orange-100 text-orange-700"
                    : "bg-pink-100 text-pink-700";


                // --------------------------------
                // CARD
                // --------------------------------

                return (
                  <Link
                    key={project.ID}
                    to={`/projects/${project.ID}`}
                    style={{
                      animationDelay: `${0.7 + index * 0.1}s`,
                    }}
                    className="block p-5 bg-white border border-gray-200 shadow-sm rounded-2xl dashboard-card project-card"
                  >

                    {/* LOGO + PROGRESS */}

                    <div className="flex items-center justify-between">

                      {/* PROJECT LOGO */}

                      <div className="flex items-center justify-center w-16 h-16 overflow-hidden bg-pink-50 border border-pink-100 rounded-2xl project-logo">

                        {project.Logo ? (

                          <img
                            src={project.Logo}
                            alt={project.Title}
                            className="object-contain w-full h-full p-2"
                          />

                        ) : (

                          <span className="text-lg font-bold text-pink-600">
                            MF
                          </span>

                        )}

                      </div>


                      {/* CIRCULAR PROGRESS */}

                      <div className="relative flex items-center justify-center w-20 h-20">

                        <svg
                          className="w-20 h-20 -rotate-90"
                          viewBox="0 0 80 80"
                        >

                          {/* BACKGROUND */}

                          <circle
                            cx="40"
                            cy="40"
                            r={radius}
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="7"
                            className="text-gray-200"
                          />


                          {/* PROGRESS */}

                          <circle
                            cx="40"
                            cy="40"
                            r={radius}
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="7"
                            strokeLinecap="round"
                            className={`progress-circle ${
                              progress === 100
                                ? "text-green-500"
                                : "text-pink-600"
                            }`}
                            strokeDasharray={circumference}
                            strokeDashoffset={progressOffset}
                          />

                        </svg>


                        {/* PROGRESS TEXT */}

                        <div className="absolute inset-0 flex flex-col items-center justify-center">

                          <span className="text-sm font-bold text-gray-800">
                            {progress}%
                          </span>

                          <span className="text-[9px] text-gray-400">
                            Done
                          </span>

                        </div>

                      </div>

                    </div>


                    {/* PROJECT TITLE */}

                    <div className="mt-5">

                      <h3 className="text-base font-bold leading-6 text-gray-800 line-clamp-2">
                        {project.Title}
                      </h3>

                    </div>


                    {/* STATUS */}

                    <div className="mt-3">

                      <span
                        className={`inline-flex px-2.5 py-1 text-[10px] font-semibold rounded-full ${statusColor}`}
                      >
                        {project.Status}
                      </span>

                    </div>


                    {/* DESCRIPTION */}

                    <p className="mt-4 text-sm leading-5 text-gray-500 line-clamp-3">
                      {project.Description ||
                        "No project description available."}
                    </p>


                    {/* TIMELINE */}

                    <div className="mt-5">

                      <p className="text-[10px] font-semibold tracking-wider text-gray-400 uppercase">
                        Timeline
                      </p>

                      <p className="mt-1 text-sm font-medium text-gray-700">
                        {project.Timeline}
                      </p>

                    </div>


                    {/* MANAGER */}

                    <div className="mt-4">

                      <p className="text-[10px] font-semibold tracking-wider text-gray-400 uppercase">
                        Manager
                      </p>

                      <p className="mt-1 text-sm text-gray-700 truncate">
                        {project.Manager}
                      </p>

                    </div>


                    {/* VIEW DETAILS */}

                    <div className="flex items-center justify-between pt-4 mt-5 border-t border-gray-100">

                      <span className="text-xs font-medium text-gray-400">
                        Click to view details
                      </span>

                      <span className="text-sm font-semibold text-pink-600 view-arrow">
                        View →
                      </span>

                    </div>

                  </Link>
                );
              })}

            </div>

          )}

        </div>

      </div>

    </div>
  );
};

export default Dashboard;