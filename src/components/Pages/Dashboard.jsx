
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  DollarSign,
  FolderKanban,
  RefreshCw,
  TrendingUp,
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
  String(value ?? "")
    .trim()
    .toLowerCase();


const parseBudget = (value) => {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return 0;
  }

  let budget = String(value).trim();

  // Bangla digits → English digits
  const banglaDigits = {
    "০": "0",
    "১": "1",
    "২": "2",
    "৩": "3",
    "৪": "4",
    "৫": "5",
    "৬": "6",
    "৭": "7",
    "৮": "8",
    "৯": "9",
  };

  budget = budget.replace(
    /[০-৯]/g,
    (digit) => banglaDigits[digit]
  );

  budget = budget
    .replace(/BDT/gi, "")
    .replace(/Taka/gi, "")
    .replace(/Tk/gi, "")
    .replace(/৳/g, "")
    .replace(/,/g, "")
    .replace(/\s/g, "")
    .replace(/[^0-9.-]/g, "");

  const result = parseFloat(budget);

  return Number.isFinite(result)
    ? result
    : 0;
};


// ============================================================
// DASHBOARD
// ============================================================

export default function Dashboard() {

  const [projects, setProjects] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] =
    useState("");


  // ==========================================================
  // LOAD PROJECTS
  // ==========================================================

  const loadProjects = async (
    forceRefresh = false
  ) => {

    try {

      setError("");


      if (forceRefresh) {
        setRefreshing(true);
      }


      const data =
        await fetchProjects(
          forceRefresh
        );


      if (Array.isArray(data)) {
        setProjects(data);
      }

    } catch (err) {

      console.error(
        "Dashboard Error:",
        err
      );

      /*
       * Only show an error if we have
       * no existing project data.
       */
      if (projects.length === 0) {
        setError(
          err.message ||
            "Unable to load projects."
        );
      }

    } finally {

      setLoading(false);
      setRefreshing(false);

    }
  };


  // ==========================================================
  // INITIAL LOAD
  // ==========================================================

  useEffect(() => {

    loadProjects(false);

  }, []);


  // ==========================================================
  // PROJECT STATISTICS
  // ==========================================================

  const statistics = useMemo(() => {

    let completed = 0;
    let ongoing = 0;
    let onHold = 0;
    let totalBudget = 0;


    for (const project of projects) {

      const status =
        normalize(project.Status);

      const progress =
        Number(project.Progress) || 0;


      // Completed
      if (
        progress >= 100 ||
        status === "completed"
      ) {
        completed++;
      }


      // Ongoing
      if (
        status === "in progress" ||
        status === "ongoing"
      ) {
        ongoing++;
      }


      // On Hold
      if (
        status === "on hold"
      ) {
        onHold++;
      }


      // Budget
      totalBudget +=
        parseBudget(
          project.Budget
        );

    }


    return {
      total: projects.length,
      completed,
      ongoing,
      onHold,
      totalBudget,
    };

  }, [projects]);


  // ==========================================================
  // FORMAT BUDGET
  // ==========================================================

  const formattedBudget = useMemo(() => {

    return new Intl.NumberFormat(
      "en-BD",
      {
        maximumFractionDigits: 0,
      }
    ).format(
      statistics.totalBudget
    );

  }, [statistics.totalBudget]);


  // ==========================================================
  // PROJECTS TO DISPLAY
  // ==========================================================

  const displayedProjects =
    useMemo(
      () =>
        projects.slice(0, 8),
      [projects]
    );


  // ==========================================================
  // OVERVIEW CARDS
  // ==========================================================

  const overviewCards = useMemo(
    () => [

      {
        title: "Total Projects",
        value: statistics.total,
        icon: FolderKanban,
        iconStyle:
          "bg-pink-100 text-pink-600",
      },

      {
        title: "Ongoing",
        value: statistics.ongoing,
        icon: Clock3,
        iconStyle:
          "bg-blue-100 text-blue-600",
      },

      {
        title: "Completed",
        value: statistics.completed,
        icon: CheckCircle2,
        iconStyle:
          "bg-green-100 text-green-600",
      },

      {
        title: "On Hold",
        value: statistics.onHold,
        icon: TrendingUp,
        iconStyle:
          "bg-amber-100 text-amber-600",
      },

      {
        title: "Total Budget Expenditure",
        value: `৳${formattedBudget}`,
        icon: DollarSign,
        iconStyle:
          "bg-purple-100 text-purple-600",
      },

    ],
    [
      statistics,
      formattedBudget,
    ]
  );


  // ==========================================================
  // INITIAL LOADING
  // ==========================================================

  if (
    loading &&
    projects.length === 0
  ) {

    return (

      <div className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">

        <div className="mx-auto max-w-7xl">

          {/* Header */}
          <div className="mb-6">

            <div className="h-8 w-64 animate-pulse rounded-lg bg-slate-200" />

            <div className="mt-2 h-4 w-80 animate-pulse rounded bg-slate-200" />

          </div>


          {/* Overview */}
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">

            {[1, 2, 3, 4, 5].map(
              (item) => (
                <div
                  key={item}
                  className="
                    h-28
                    animate-pulse
                    rounded-2xl
                    bg-white
                    shadow-sm
                  "
                />
              )
            )}

          </div>


          {/* Projects */}
          <div className="mt-7">

            <div className="mb-4">

              <div className="h-6 w-28 animate-pulse rounded bg-slate-200" />

              <div className="mt-2 h-4 w-52 animate-pulse rounded bg-slate-200" />

            </div>


            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">

              {[1, 2, 3, 4].map(
                (item) => (
                  <div
                    key={item}
                    className="
                      h-64
                      animate-pulse
                      rounded-2xl
                      bg-white
                      shadow-sm
                    "
                  />
                )
              )}

            </div>

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

            <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
              Microfinance Technology
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Technology projects and implementation overview
            </p>

          </div>


          <button
            type="button"
            onClick={() =>
              loadProjects(true)
            }
            disabled={refreshing}
            className="
              inline-flex
              items-center
              justify-center
              gap-2
              rounded-xl
              bg-pink-600
              px-4
              py-2.5
              text-sm
              font-semibold
              text-white
              shadow-sm
              transition
              hover:bg-pink-700
              hover:shadow-md
              disabled:cursor-not-allowed
              disabled:opacity-70
            "
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
            REFRESH STATUS
        ==================================================== */}

        {refreshing && (

          <div
            className="
              mb-5
              flex
              items-center
              gap-3
              rounded-xl
              border
              border-pink-100
              bg-pink-50
              px-4
              py-3
            "
          >

            <RefreshCw
              size={16}
              className="
                animate-spin
                text-pink-600
              "
            />

            <div>

              <p className="text-sm font-semibold text-pink-700">
                Updating project data
              </p>

              <p className="text-xs text-pink-500">
                Fetching the latest information...
              </p>

            </div>

          </div>

        )}


        {/* ====================================================
            ERROR
        ==================================================== */}

        {error && (

          <div
            className="
              mb-5
              flex
              items-center
              justify-between
              gap-4
              rounded-xl
              border
              border-red-200
              bg-red-50
              px-4
              py-3
              text-sm
              text-red-700
            "
          >

            <span className="break-words">
              {error}
            </span>

            <button
              type="button"
              onClick={() =>
                loadProjects(true)
              }
              disabled={refreshing}
              className="
                shrink-0
                rounded-lg
                bg-white
                px-3
                py-1.5
                text-xs
                font-semibold
                text-red-600
                shadow-sm
                hover:bg-red-100
              "
            >
              Retry
            </button>

          </div>

        )}


        {/* ====================================================
            OVERVIEW
        ==================================================== */}

        <div
          className={`
            mb-7
            grid
            grid-cols-2
            gap-3
            transition-opacity
            duration-300
            sm:grid-cols-2
            lg:grid-cols-5
            ${
              refreshing
                ? "opacity-70"
                : "opacity-100"
            }
          `}
        >

          {overviewCards.map(
            (card) => {

              const Icon =
                card.icon;

              return (

                <div
                  key={card.title}
                  className="
                    rounded-2xl
                    border
                    border-slate-100
                    bg-white
                    p-4
                    shadow-sm
                    transition
                    duration-200
                    hover:-translate-y-1
                    hover:shadow-md
                    sm:p-5
                  "
                >

                  <div className="flex items-center justify-between gap-3">

                    <div className="min-w-0">

                      <p className="truncate text-xs font-medium text-slate-500 sm:text-sm">
                        {card.title}
                      </p>

                      <p className="mt-2 truncate text-xl font-bold text-slate-900 sm:text-2xl">
                        {card.value}
                      </p>

                    </div>


                    <div
                      className={`
                        flex
                        h-10
                        w-10
                        shrink-0
                        items-center
                        justify-center
                        rounded-xl
                        sm:h-11
                        sm:w-11
                        ${card.iconStyle}
                      `}
                    >

                      <Icon size={20} />

                    </div>

                  </div>

                </div>

              );

            }
          )}

        </div>


        {/* ====================================================
            PROJECT HEADER
        ==================================================== */}

        <div className="mb-4 flex items-center justify-between">

          <div>

            <h2 className="text-xl font-bold text-slate-900">
              Projects
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Latest technology initiatives
            </p>

          </div>


          <Link
            to="/projects"
            className="
              inline-flex
              items-center
              gap-1
              rounded-lg
              px-3
              py-2
              text-sm
              font-semibold
              text-pink-600
              transition
              hover:bg-pink-50
              hover:text-pink-700
            "
          >

            Show All

            <ArrowRight size={16} />

          </Link>

        </div>


        {/* ====================================================
            PROJECT GRID
        ==================================================== */}

        <div
          className={`
            relative
            transition-opacity
            duration-300
            ${
              refreshing
                ? "opacity-60"
                : "opacity-100"
            }
          `}
        >

          {displayedProjects.length > 0 ? (

            <div
              className="
                grid
                grid-cols-1
                gap-4
                sm:grid-cols-2
                lg:grid-cols-3
                xl:grid-cols-4
              "
            >

              {displayedProjects.map(
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
                      project.Status || ""
                    ).trim();


                  const theme =
                    projectThemes[
                      index %
                        projectThemes.length
                    ];


                  const normalizedStatus =
                    normalize(status);


                  const completed =
                    progress >= 100 ||
                    normalizedStatus ===
                      "completed";


                  return (

                    <Link
                      key={
                        project.ID ||
                        index
                      }
                      to={`/projects/${project.ID}`}
                      className="
                        group
                        overflow-hidden
                        rounded-2xl
                        border
                        border-slate-100
                        bg-white
                        shadow-sm
                        transition
                        duration-200
                        hover:-translate-y-1
                        hover:shadow-lg
                      "
                    >

                      {/* Accent */}
                      <div
                        className={`
                          h-1.5
                          bg-gradient-to-r
                          ${theme.bg}
                        `}
                      />


                      <div className="p-5">


                        {/* Logo + Status */}
                        <div className="mb-4 flex items-start justify-between">

                          <div
                            className={`
                              flex
                              h-12
                              w-12
                              items-center
                              justify-center
                              overflow-hidden
                              rounded-xl
                              ${theme.light}
                            `}
                          >

                            {project.Logo ? (

                              <img
                                src={project.Logo}
                                alt=""
                                loading="lazy"
                                decoding="async"
                                className="
                                  h-full
                                  w-full
                                  object-cover
                                "
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
                            className={`
                              rounded-full
                              px-2.5
                              py-1
                              text-[11px]
                              font-semibold
                              ${
                                completed
                                  ? "bg-green-50 text-green-600"
                                  : normalizedStatus.includes(
                                      "hold"
                                    )
                                  ? "bg-amber-50 text-amber-600"
                                  : "bg-blue-50 text-blue-600"
                              }
                            `}
                          >
                            {completed
                              ? "Completed"
                              : status ||
                                "Ongoing"}
                          </span>

                        </div>


                        {/* Title */}
                        <h3
                          className="
                            line-clamp-2
                            min-h-[48px]
                            text-base
                            font-bold
                            text-slate-900
                            transition
                            group-hover:text-pink-600
                          "
                        >
                          {project.Title ||
                            "Untitled Project"}
                        </h3>


                        {/* Manager */}
                        <p className="mt-2 line-clamp-1 text-xs text-slate-500">

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
                              className={`
                                h-full
                                rounded-full
                                bg-gradient-to-r
                                transition-all
                                duration-500
                                ${theme.bg}
                              `}
                              style={{
                                width:
                                  `${progress}%`,
                              }}
                            />

                          </div>

                        </div>


                        {/* Bottom */}
                        <div
                          className="
                            mt-5
                            flex
                            items-center
                            justify-between
                            border-t
                            border-slate-100
                            pt-4
                          "
                        >

                          <span className="text-xs font-medium text-slate-400">
                            Project #{project.ID}
                          </span>

                          <span
                            className="
                              inline-flex
                              items-center
                              gap-1
                              text-xs
                              font-semibold
                              text-pink-600
                            "
                          >
                            View
                            <ArrowRight
                              size={14}
                              className="
                                transition-transform
                                group-hover:translate-x-1
                              "
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

            <div
              className="
                rounded-2xl
                border
                border-slate-100
                bg-white
                px-6
                py-16
                text-center
                shadow-sm
              "
            >

              <FolderKanban
                size={40}
                className="mx-auto text-slate-300"
              />

              <h3 className="mt-4 font-semibold text-slate-800">
                No projects found
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                No project data is currently available.
              </p>

            </div>

          )}

        </div>


        {/* ====================================================
            SYSTEM STATUS
        ==================================================== */}

        <div
          className="
            mt-8
            flex
            items-center
            justify-center
            gap-2
            text-xs
            text-slate-400
          "
        >

          <span className="relative flex h-2 w-2">

            <span
              className="
                absolute
                inline-flex
                h-full
                w-full
                animate-ping
                rounded-full
                bg-green-400
                opacity-75
              "
            />

            <span
              className="
                relative
                inline-flex
                h-2
                w-2
                rounded-full
                bg-green-500
              "
            />

          </span>

          Data connected to Google Sheets

        </div>

      </div>

    </div>

  );
}
