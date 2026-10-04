
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

const ProjectDetails = () => {
  const { id } = useParams();

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const API_URL =
    "https://script.google.com/macros/s/AKfycbw9ARpnkUgzbxOpxtJVglZvV6dWfN6eqQJ3L-1fTYxJWhYrmNjwuaQqC0Wkxquyq2o/exec";

  // ==========================================
  // FETCH PROJECT
  // ==========================================

  const fetchProject = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(API_URL);

      if (!response.ok) {
        throw new Error("Failed to load project");
      }

      const data = await response.json();

      const selectedProject = data.find(
        (item) => String(item.ID) === String(id)
      );

      if (!selectedProject) {
        throw new Error("Project not found");
      }

      setProject(selectedProject);
    } catch (error) {
      console.error(error);
      setError("Unable to load project details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProject();
  }, [id]);

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[600px] bg-gray-50">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-5">
            <div className="absolute inset-0 border-4 border-gray-200 rounded-full"></div>

            <div className="absolute inset-0 border-4 border-transparent rounded-full border-t-pink-600 animate-spin"></div>
          </div>

          <p className="text-sm font-semibold text-gray-600">
            Loading project details...
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
      <div className="min-h-screen p-6 bg-gray-50">
        <div className="max-w-xl p-8 mx-auto mt-16 text-center bg-white border border-red-200 shadow-sm rounded-2xl">
          <div className="flex items-center justify-center w-16 h-16 mx-auto mb-5 text-2xl font-bold text-red-600 bg-red-100 rounded-full">
            !
          </div>

          <h2 className="text-xl font-bold text-gray-800">
            Project Not Available
          </h2>

          <p className="mt-2 text-sm text-gray-500">
            {error}
          </p>

          <Link
            to="/projects"
            className="inline-flex items-center gap-2 px-5 py-2.5 mt-6 text-sm font-medium text-white transition bg-pink-600 rounded-lg hover:bg-pink-700"
          >
            ← Back to Projects
          </Link>
        </div>
      </div>
    );
  }

  // ==========================================
  // PROGRESS
  // ==========================================

  const progress = Math.min(
    Math.max(Number(project.Progress || 0), 0),
    100
  );

  const radius = 55;

  const circumference = 2 * Math.PI * radius;

  const progressOffset =
    circumference -
    (progress / 100) * circumference;

  // ==========================================
  // DYNAMIC THEMES
  // ==========================================

  const themes = [
    {
      page: "from-pink-50 via-white to-rose-50",
      primary: "text-pink-600",
      bg: "bg-pink-100",
      border: "border-pink-200",
      progress: "text-pink-600",
      gradient: "from-pink-500 to-rose-500",
      badge: "bg-pink-100 text-pink-700",
      glow: "bg-pink-200",
    },
    {
      page: "from-blue-50 via-white to-cyan-50",
      primary: "text-blue-600",
      bg: "bg-blue-100",
      border: "border-blue-200",
      progress: "text-blue-600",
      gradient: "from-blue-500 to-cyan-500",
      badge: "bg-blue-100 text-blue-700",
      glow: "bg-blue-200",
    },
    {
      page: "from-purple-50 via-white to-violet-50",
      primary: "text-purple-600",
      bg: "bg-purple-100",
      border: "border-purple-200",
      progress: "text-purple-600",
      gradient: "from-purple-500 to-violet-500",
      badge: "bg-purple-100 text-purple-700",
      glow: "bg-purple-200",
    },
    {
      page: "from-emerald-50 via-white to-green-50",
      primary: "text-emerald-600",
      bg: "bg-emerald-100",
      border: "border-emerald-200",
      progress: "text-emerald-600",
      gradient: "from-emerald-500 to-green-500",
      badge: "bg-emerald-100 text-emerald-700",
      glow: "bg-emerald-200",
    },
    {
      page: "from-orange-50 via-white to-amber-50",
      primary: "text-orange-600",
      bg: "bg-orange-100",
      border: "border-orange-200",
      progress: "text-orange-600",
      gradient: "from-orange-500 to-amber-500",
      badge: "bg-orange-100 text-orange-700",
      glow: "bg-orange-200",
    },
  ];

  const theme =
    themes[
      Math.abs(Number(project.ID || 0)) %
        themes.length
    ];

  // ==========================================
  // STATUS COLOR
  // ==========================================

  let statusClass = theme.badge;

  if (project.Status === "Completed") {
    statusClass = "bg-green-100 text-green-700";
  }

  if (project.Status === "Near Completion") {
    statusClass = "bg-orange-100 text-orange-700";
  }

  // ==========================================
  // RETURN
  // ==========================================

  return (
    <div
      className={`
        relative
        min-h-screen
        p-6
        overflow-hidden
        bg-gradient-to-br
        ${theme.page}
      `}
    >
      {/* ======================================
          BACKGROUND DECORATION
      ====================================== */}

      <div
        className={`
          absolute
          w-96
          h-96
          rounded-full
          -top-40
          -right-40
          ${theme.glow}
          opacity-30
          blur-3xl
        `}
      ></div>

      <div
        className={`
          absolute
          w-80
          h-80
          rounded-full
          -bottom-40
          -left-40
          ${theme.glow}
          opacity-20
          blur-3xl
        `}
      ></div>

      {/* ======================================
          MAIN CONTENT
      ====================================== */}

      <div className="relative z-10 max-w-6xl mx-auto">

        {/* ======================================
            BACK BUTTON
        ====================================== */}

        <div className="mb-6">
          <Link
            to="/projects"
            className={`
              inline-flex
              items-center
              gap-2
              px-4
              py-2
              text-sm
              font-medium
              bg-white
              border
              ${theme.border}
              rounded-xl
              shadow-sm
              transition
              hover:-translate-x-1
              ${theme.primary}
            `}
          >
            <span className="text-lg">
              ←
            </span>

            Back to Projects
          </Link>
        </div>

        {/* ======================================
            MAIN CARD
        ====================================== */}

        <div className="overflow-hidden bg-white border border-gray-200 shadow-xl rounded-3xl">

          {/* ====================================
              HERO SECTION
          ==================================== */}

          <div
            className={`
              relative
              overflow-hidden
              p-6
              md:p-10
              bg-gradient-to-br
              ${theme.page}
              border-b
              ${theme.border}
            `}
          >

            {/* Decorative circle */}

            <div
              className={`
                absolute
                w-72
                h-72
                rounded-full
                -right-24
                -top-32
                ${theme.glow}
                opacity-30
                blur-2xl
              `}
            ></div>

            <div className="relative z-10 flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">

              {/* =================================
                  PROJECT INFORMATION
              ================================= */}

              <div className="flex items-center gap-5">

                {/* LOGO */}

                <div
                  className={`
                    flex
                    items-center
                    justify-center
                    flex-shrink-0
                    w-24
                    h-24
                    md:w-28
                    md:h-28
                    overflow-hidden
                    bg-white
                    border
                    ${theme.border}
                    shadow-lg
                    rounded-3xl
                  `}
                >

                  {project.Logo ? (

                    <img
                      src={project.Logo}
                      alt={`${project.Title} logo`}
                      className="object-contain w-full h-full p-3 transition-transform duration-500 hover:scale-110"
                    />

                  ) : (

                    <span
                      className={`
                        text-2xl
                        font-bold
                        ${theme.primary}
                      `}
                    >
                      MF
                    </span>

                  )}

                </div>

                {/* TITLE */}

                <div>

                  <p
                    className={`
                      mb-2
                      text-xs
                      font-semibold
                      tracking-widest
                      uppercase
                      ${theme.primary}
                    `}
                  >
                    Project Details
                  </p>

                  <h1 className="max-w-2xl text-2xl font-bold leading-tight text-gray-800 md:text-4xl">
                    {project.Title}
                  </h1>

                  <div className="flex flex-wrap items-center gap-3 mt-4">

                    <span
                      className={`
                        px-3
                        py-1.5
                        text-xs
                        font-semibold
                        rounded-full
                        ${statusClass}
                      `}
                    >
                      {project.Status}
                    </span>

                    <span className="text-xs text-gray-500">
                      Project ID: {project.ID}
                    </span>

                  </div>

                </div>

              </div>

              {/* =================================
                  CIRCULAR PROGRESS
              ================================= */}

              <div className="relative flex items-center justify-center flex-shrink-0 w-36 h-36">

                <svg
                  className="w-36 h-36 -rotate-90"
                  viewBox="0 0 130 130"
                >

                  <circle
                    cx="65"
                    cy="65"
                    r={radius}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="10"
                    className="text-gray-200"
                  />

                  <circle
                    cx="65"
                    cy="65"
                    r={radius}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="10"
                    strokeLinecap="round"
                    className={
                      progress === 100
                        ? "text-green-500"
                        : theme.progress
                    }
                    strokeDasharray={circumference}
                    strokeDashoffset={progressOffset}
                    style={{
                      transition:
                        "stroke-dashoffset 1.5s ease-out",
                    }}
                  />

                </svg>

                <div className="absolute inset-0 flex flex-col items-center justify-center">

                  <span className="text-2xl font-bold text-gray-800">
                    {progress}%
                  </span>

                  <span className="text-xs text-gray-400">
                    Complete
                  </span>

                </div>

              </div>

            </div>

          </div>

          {/* ======================================
              INFORMATION CARDS
          ====================================== */}

          <div className="grid grid-cols-1 gap-5 p-6 md:grid-cols-3">

            {/* TIMELINE */}

            <div
              className={`
                p-5
                border
                ${theme.border}
                ${theme.bg}
                rounded-2xl
                transition
                duration-300
                hover:-translate-y-1
                hover:shadow-md
              `}
            >

              <div className="flex items-start gap-4">

                <div className="flex items-center justify-center flex-shrink-0 w-12 h-12 text-xl bg-white rounded-xl shadow-sm">
                  📅
                </div>

                <div>

                  <p className="text-xs font-semibold tracking-wider text-gray-400 uppercase">
                    Timeline
                  </p>

                  <p className="mt-1 text-base font-semibold text-gray-800">
                    {project.Timeline}
                  </p>

                </div>

              </div>

            </div>

            {/* MANAGER */}

            <div
              className={`
                p-5
                border
                ${theme.border}
                ${theme.bg}
                rounded-2xl
                transition
                duration-300
                hover:-translate-y-1
                hover:shadow-md
              `}
            >

              <div className="flex items-start gap-4">

                <div className="flex items-center justify-center flex-shrink-0 w-12 h-12 text-xl bg-white rounded-xl shadow-sm">
                  👤
                </div>

                <div className="min-w-0">

                  <p className="text-xs font-semibold tracking-wider text-gray-400 uppercase">
                    Project Manager
                  </p>

                  <p className="mt-1 text-base font-semibold text-gray-800 truncate">
                    {project.Manager}
                  </p>

                </div>

              </div>

            </div>

            {/* ======================================
                BUDGET
            ====================================== */}

            <div
              className="
                p-5
                border
                border-emerald-200
                bg-emerald-50
                rounded-2xl
                transition
                duration-300
                hover:-translate-y-1
                hover:shadow-md
              "
            >

              <div className="flex items-start gap-4">

                {/* BUDGET LOGO */}

                <div
                  className="
                    flex
                    items-center
                    justify-center
                    flex-shrink-0
                    w-12
                    h-12
                    text-xl
                    bg-white
                    rounded-xl
                    shadow-sm
                  "
                >
                  💰
                </div>

                <div className="min-w-0">

                  <p className="text-xs font-semibold tracking-wider text-gray-400 uppercase">
                    Project Budget
                  </p>

                  <p className="mt-1 text-base font-bold text-emerald-700 truncate">
                    {project.Budget || "Not Available"}
                  </p>

                </div>

              </div>

            </div>

          </div>

          {/* ======================================
              PROGRESS SECTION
          ====================================== */}

          <div className="px-6 pb-6">

            <div className="p-6 bg-gray-50 border border-gray-100 rounded-2xl">

              <div className="flex items-center justify-between mb-4">

                <div>

                  <p className="text-sm font-semibold text-gray-800">
                    Project Progress
                  </p>

                  <p className="mt-1 text-xs text-gray-400">
                    Overall implementation progress
                  </p>

                </div>

                <span
                  className={`
                    text-lg
                    font-bold
                    ${theme.primary}
                  `}
                >
                  {progress}%
                </span>

              </div>

              {/* Progress Bar */}

              <div className="w-full h-4 overflow-hidden bg-gray-200 rounded-full">

                <div
                  className={`
                    h-full
                    rounded-full
                    bg-gradient-to-r
                    ${theme.gradient}
                  `}
                  style={{
                    width: `${progress}%`,
                    transition:
                      "width 1.5s ease-out",
                  }}
                ></div>

              </div>

              {/* Progress labels */}

              <div className="flex justify-between mt-2 text-[10px] text-gray-400">

                <span>
                  Started
                </span>

                <span>
                  {progress < 100
                    ? "In Progress"
                    : "Completed"}
                </span>

                <span>
                  100%
                </span>

              </div>

            </div>

          </div>

          {/* ======================================
              DESCRIPTION
          ====================================== */}

          <div className="px-6 pb-8">

            <div className="p-6 bg-white border border-gray-200 rounded-2xl">

              <div className="flex items-center gap-3 mb-4">

                <div
                  className={`
                    flex
                    items-center
                    justify-center
                    w-10
                    h-10
                    rounded-xl
                    ${theme.bg}
                    ${theme.primary}
                  `}
                >
                  📝
                </div>

                <div>

                  <h2 className="text-lg font-bold text-gray-800">
                    Project Description
                  </h2>

                  <p className="text-xs text-gray-400">
                    Project overview and details
                  </p>

                </div>

              </div>

              <p className="text-sm leading-7 text-gray-600">
                {project.Description ||
                  "No project description available."}
              </p>

            </div>

          </div>

          {/* ======================================
              FOOTER
          ====================================== */}

          <div className="flex flex-col justify-between gap-3 px-6 py-5 border-t border-gray-200 bg-gray-50 sm:flex-row sm:items-center">

            <div>

              <p className="text-xs text-gray-400">
                Microfinance Technology
              </p>

              <p className="mt-1 text-xs font-medium text-gray-500">
                Project ID: {project.ID}
              </p>

            </div>

            <Link
              to="/projects"
              className={`
                inline-flex
                items-center
                justify-center
                px-4
                py-2
                text-xs
                font-semibold
                text-white
                rounded-lg
                bg-gradient-to-r
                ${theme.gradient}
                transition
                hover:shadow-lg
                active:scale-95
              `}
            >
              ← All Projects
            </Link>

          </div>

        </div>

      </div>

    </div>
  );
};

export default ProjectDetails;
