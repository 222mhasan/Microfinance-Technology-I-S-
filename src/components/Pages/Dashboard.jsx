
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
// DASHBOARD
// ============================================================

export default function Dashboard() {

  const [projects, setProjects] = useState([]);

  const [loading, setLoading] = useState(true);

  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState("");


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
        "Dashboard Error:",
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
  // PROJECT STATISTICS
  // ==========================================================

  const statistics = useMemo(() => {

    const total =
      projects.length;


    // --------------------------------------------------------
    // COMPLETED PROJECTS
    // --------------------------------------------------------

    const completed =
      projects.filter(
        (project) =>
          Number(
            project.Progress
          ) >= 100 ||

          String(
            project.Status || ""
          )
            .toLowerCase()
            .trim() === "completed"
      ).length;


    // --------------------------------------------------------
    // ONGOING PROJECTS
    // --------------------------------------------------------

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


    // --------------------------------------------------------
    // ON HOLD PROJECTS
    // --------------------------------------------------------

    const onHold =
      projects.filter(
        (project) =>
          String(
            project.Status || ""
          )
            .toLowerCase()
            .trim() === "on hold"
      ).length;


    // ========================================================
    // TOTAL BUDGET EXPENDITURE
    // ========================================================

    const totalBudget =
      projects.reduce(
        (
          total,
          project
        ) => {

          // Get Budget value from Google Sheet
          let budget =
            project.Budget;


          // Ignore empty values
          if (
            budget === null ||
            budget === undefined ||
            budget === ""
          ) {

            return total;

          }


          // Convert to string
          budget =
            String(
              budget
            ).trim();


          // --------------------------------------------------
          // Remove currency/text formatting
          // --------------------------------------------------

          budget =
            budget
              .replace(
                /BDT/gi,
                ""
              )
              .replace(
                /Taka/gi,
                ""
              )
              .replace(
                /Tk/gi,
                ""
              )
              .replace(
                /৳/g,
                ""
              )
              .replace(
                /,/g,
                ""
              )
              .replace(
                /\s/g,
                ""
              );


          // --------------------------------------------------
          // Convert Bangla numbers to English numbers
          // --------------------------------------------------

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


          budget =
            budget.replace(
              /[০-৯]/g,
              (digit) =>
                banglaDigits[digit]
            );


          // --------------------------------------------------
          // Remove anything except numbers,
          // decimal point and minus sign
          // --------------------------------------------------

          budget =
            budget.replace(
              /[^0-9.-]/g,
              ""
            );


          // --------------------------------------------------
          // Convert to number
          // --------------------------------------------------

          const numericBudget =
            parseFloat(
              budget
            );


          // --------------------------------------------------
          // Add valid budget
          // --------------------------------------------------

          if (
            Number.isFinite(
              numericBudget
            )
          ) {

            return (
              total +
              numericBudget
            );

          }


          return total;

        },
        0
      );


    // ========================================================
    // RETURN STATISTICS
    // ========================================================

    return {
      total,
      completed,
      ongoing,
      onHold,
      totalBudget,
    };

  }, [projects]);


  // ==========================================================
  // FORMAT TOTAL BUDGET
  // ==========================================================

  const formattedBudget =
    new Intl.NumberFormat(
      "en-BD",
      {
        maximumFractionDigits: 0,
      }
    ).format(
      statistics.totalBudget
    );


  // ==========================================================
  // PROJECTS TO DISPLAY
  // ==========================================================

  const displayedProjects =
    projects.slice(
      0,
      8
    );


  // ==========================================================
  // OVERVIEW CARDS
  // ==========================================================

  const overviewCards = [

    {
      title:
        "Total Projects",

      value:
        statistics.total,

      icon:
        FolderKanban,

      iconStyle:
        "bg-pink-100 text-pink-600",
    },


    {
      title:
        "Ongoing",

      value:
        statistics.ongoing,

      icon:
        Clock3,

      iconStyle:
        "bg-blue-100 text-blue-600",
    },


    {
      title:
        "Completed",

      value:
        statistics.completed,

      icon:
        CheckCircle2,

      iconStyle:
        "bg-green-100 text-green-600",
    },


    {
      title:
        "On Hold",

      value:
        statistics.onHold,

      icon:
        TrendingUp,

      iconStyle:
        "bg-amber-100 text-amber-600",
    },


    {
      title:
        "Total Budget Expenditure",

      value:
        `৳${formattedBudget}`,

      icon:
        DollarSign,

      iconStyle:
        "bg-purple-100 text-purple-600",
    },

  ];


  // ==========================================================
  // INITIAL LOADING STATE
  // ==========================================================

  if (
    loading &&
    projects.length === 0
  ) {

    return (

      <div className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">

        <div className="mx-auto max-w-7xl">


          {/* ==================================================
              PAGE HEADER SKELETON
          ================================================== */}

          <div className="mb-6 flex items-center justify-between">

            <div>

              <div className="h-8 w-72 animate-pulse rounded-lg bg-slate-200" />

              <div className="mt-2 h-4 w-80 animate-pulse rounded bg-slate-200" />

            </div>


            <div className="h-11 w-28 animate-pulse rounded-xl bg-slate-200" />

          </div>


          {/* ==================================================
              OVERVIEW SKELETON
          ================================================== */}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">

            {[
              1,
              2,
              3,
              4,
              5,
            ].map(
              (item) => (

                <div
                  key={item}
                  className="h-28 animate-pulse rounded-2xl bg-white shadow-sm"
                />

              )
            )}

          </div>


          {/* ==================================================
              PROJECT SKELETON
          ================================================== */}

          <div className="mt-7">

            <div className="mb-4">

              <div className="h-6 w-28 animate-pulse rounded bg-slate-200" />

              <div className="mt-2 h-4 w-52 animate-pulse rounded bg-slate-200" />

            </div>


            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">

              {[
                1,
                2,
                3,
                4,
                5,
                6,
                7,
                8,
              ].map(
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
            PAGE HEADER
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


          {/* ==================================================
              REFRESH BUTTON
          ================================================== */}

          <button
            onClick={() =>
              loadProjects(true)
            }
            disabled={refreshing}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-pink-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-pink-700 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-80"
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

          <div className="mb-5 flex items-center gap-3 rounded-xl border border-pink-100 bg-pink-50 px-4 py-3">

            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-sm">

              <RefreshCw
                size={15}
                className="animate-spin text-pink-600"
              />

            </div>


            <div>

              <p className="text-sm font-semibold text-pink-700">

                Updating project data

              </p>


              <p className="text-xs text-pink-500">

                Fetching the latest information from Google Sheets...

              </p>

            </div>

          </div>

        )}


        {/* ====================================================
            ERROR MESSAGE
        ==================================================== */}

        {error && (

          <div className="mb-5 flex items-center justify-between gap-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">

            <span>
              {error}
            </span>


            <button
              onClick={() =>
                loadProjects(true)
              }
              disabled={refreshing}
              className="shrink-0 rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-red-600 shadow-sm transition hover:bg-red-100 disabled:opacity-60"
            >

              Retry

            </button>

          </div>

        )}


        {/* ====================================================
            OVERVIEW CARDS
        ==================================================== */}

        <div
          className={`mb-7 grid grid-cols-1 gap-4 transition-opacity duration-300 sm:grid-cols-2 lg:grid-cols-5 ${
            refreshing
              ? "opacity-70"
              : "opacity-100"
          }`}
        >

          {overviewCards.map(
            (card) => {

              const Icon =
                card.icon;


              return (

                <div
                  key={card.title}
                  className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-md"
                >

                  <div className="flex items-center justify-between gap-3">

                    <div className="min-w-0">

                      <p className="text-sm font-medium text-slate-500">

                        {card.title}

                      </p>


                      <p className="mt-2 text-2xl font-bold text-slate-900 sm:text-3xl">

                        {card.value}

                      </p>

                    </div>


                    <div
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${card.iconStyle}`}
                    >

                      <Icon
                        size={21}
                      />

                    </div>

                  </div>

                </div>

              );

            }
          )}

        </div>


        {/* ====================================================
            PROJECT SECTION HEADER
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


          {/* ==================================================
              SHOW ALL
          ================================================== */}

          <Link
            to="/projects"
            className="inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-semibold text-pink-600 transition hover:bg-pink-50 hover:text-pink-700"
          >

            Show All

            <ArrowRight
              size={16}
            />

          </Link>

        </div>


        {/* ====================================================
            PROJECT GRID
        ==================================================== */}

        <div
          className={`relative transition-opacity duration-300 ${
            refreshing
              ? "pointer-events-none opacity-60"
              : "opacity-100"
          }`}
        >


          {/* ==================================================
              REFRESH OVERLAY
          ================================================== */}

          {refreshing && (

            <div className="absolute inset-0 z-10 flex items-start justify-center pt-10">

              <div className="rounded-full border border-pink-100 bg-white px-4 py-2 text-xs font-semibold text-pink-600 shadow-lg">

                <span className="flex items-center gap-2">

                  <RefreshCw
                    size={14}
                    className="animate-spin"
                  />

                  Updating projects...

                </span>

              </div>

            </div>

          )}


          {displayedProjects.length > 0 ? (

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">

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
                      project.Status ||
                      ""
                    )
                      .trim();


                  const theme =
                    projectThemes[
                      index %
                      projectThemes.length
                    ];


                  const completed =
                    progress >= 100 ||
                    status
                      .toLowerCase() ===
                      "completed";


                  return (

                    <Link
                      key={
                        project.ID ||
                        index
                      }
                      to={`/projects/${project.ID}`}
                      className="group overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-lg"
                    >


                      {/* ==================================================
                          CARD ACCENT
                      ================================================== */}

                      <div
                        className={`h-1.5 bg-gradient-to-r ${theme.bg}`}
                      />


                      <div className="p-5">


                        {/* ==================================================
                            LOGO + STATUS
                        ================================================== */}

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


                          {/* STATUS */}

                          <span
                            className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                              completed
                                ? "bg-green-50 text-green-600"
                                : status
                                    .toLowerCase()
                                    .includes(
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


                        {/* ==================================================
                            TITLE
                        ================================================== */}

                        <h3 className="line-clamp-2 min-h-[48px] text-base font-bold text-slate-900 transition group-hover:text-pink-600">

                          {project.Title ||
                            "Untitled Project"}

                        </h3>


                        {/* ==================================================
                            MANAGER
                        ================================================== */}

                        <p className="mt-2 line-clamp-1 text-xs text-slate-500">

                          Manager:{" "}

                          <span className="font-medium text-slate-700">

                            {project.Manager ||
                              "N/A"}

                          </span>

                        </p>


                        {/* ==================================================
                            TIMELINE
                        ================================================== */}

                        <p className="mt-1 line-clamp-1 text-xs text-slate-500">

                          Timeline:{" "}

                          <span className="font-medium text-slate-700">

                            {project.Timeline ||
                              "N/A"}

                          </span>

                        </p>


                        {/* ==================================================
                            PROGRESS
                        ================================================== */}

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


                        {/* ==================================================
                            BOTTOM
                        ================================================== */}

                        <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">

                          <span className="text-xs font-medium text-slate-400">

                            Project #{project.ID}

                          </span>


                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-pink-600">

                            View

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

        <div className="mt-8 flex items-center justify-center gap-2 text-xs text-slate-400">

          <span className="relative flex h-2 w-2">

            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />

            <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />

          </span>


          Data connected to Google Sheets

        </div>

      </div>

    </div>

  );
}
