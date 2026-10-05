import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  FolderKanban,
  UserRound,
  Wallet,
} from "lucide-react";

import { fetchProjects } from "../../services/api";


// ============================================================
// PROJECT THEMES
// ============================================================

const projectThemes = [
  {
    gradient: "from-pink-500 to-rose-500",
    light: "bg-pink-50",
    text: "text-pink-600",
  },
  {
    gradient: "from-blue-500 to-indigo-500",
    light: "bg-blue-50",
    text: "text-blue-600",
  },
  {
    gradient: "from-emerald-500 to-green-500",
    light: "bg-emerald-50",
    text: "text-emerald-600",
  },
  {
    gradient: "from-purple-500 to-violet-500",
    light: "bg-purple-50",
    text: "text-purple-600",
  },
  {
    gradient: "from-orange-500 to-amber-500",
    light: "bg-orange-50",
    text: "text-orange-600",
  },
];


// ============================================================
// PROJECT DETAILS
// ============================================================

export default function ProjectDetails() {

  const { id } = useParams();

  const [project, setProject] = useState(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");


  // ==========================================================
  // LOAD PROJECT
  // ==========================================================

  useEffect(() => {

    let active = true;


    const loadProject = async () => {

      setLoading(true);

      setError("");


      try {

        // ------------------------------------------------------
        // fetchProjects() automatically uses browser cache
        // ------------------------------------------------------

        const projects =
          await fetchProjects();


        // ------------------------------------------------------
        // Find requested project
        // ------------------------------------------------------

        const foundProject =
          projects.find(
            (item) =>
              String(item.ID) ===
              String(id)
          );


        if (!foundProject) {

          throw new Error(
            "Project not found."
          );

        }


        if (active) {

          setProject(
            foundProject
          );

        }

      } catch (err) {

        console.error(
          "Project Details Error:",
          err
        );


        if (active) {

          setError(
            err.message ||
            "Unable to load project."
          );

        }

      } finally {

        if (active) {

          setLoading(false);

        }

      }

    };


    loadProject();


    return () => {

      active = false;

    };

  }, [id]);


  // ==========================================================
  // PROJECT THEME
  // ==========================================================

  const theme = useMemo(() => {

    if (!project) {

      return projectThemes[0];

    }


    const index =
      Number(project.ID || 0) %
      projectThemes.length;


    return projectThemes[index];

  }, [project]);


  // ==========================================================
  // PROJECT VALUES
  // ==========================================================

  const progress = Math.min(
    100,
    Math.max(
      0,
      Number(
        project?.Progress
      ) || 0
    )
  );


  const status =
    String(
      project?.Status || ""
    ).trim();


  const normalizedStatus =
    status.toLowerCase();


  const isCompleted =
    progress >= 100 ||
    normalizedStatus ===
      "completed";


  // ==========================================================
  // LOADING STATE
  // ==========================================================

  if (loading) {

    return (

      <div className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">

        <div className="mx-auto max-w-5xl">

          <div className="mb-6 h-5 w-24 animate-pulse rounded bg-slate-200" />

          <div className="overflow-hidden rounded-3xl bg-white shadow-sm">

            <div className="h-2 animate-pulse bg-slate-200" />

            <div className="p-6 sm:p-8 lg:p-10">

              <div className="flex flex-col gap-6 sm:flex-row">

                <div className="h-20 w-20 shrink-0 animate-pulse rounded-2xl bg-slate-200" />

                <div className="flex-1">

                  <div className="h-8 w-2/3 animate-pulse rounded-lg bg-slate-200" />

                  <div className="mt-3 h-4 w-1/3 animate-pulse rounded bg-slate-100" />

                </div>

              </div>


              <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">

                {[1, 2, 3].map(
                  (item) => (

                    <div
                      key={item}
                      className="h-24 animate-pulse rounded-2xl bg-slate-100"
                    />

                  )
                )}

              </div>

            </div>

          </div>

        </div>

      </div>

    );

  }


  // ==========================================================
  // ERROR STATE
  // ==========================================================

  if (error || !project) {

    return (

      <div className="min-h-screen bg-slate-50 px-4 py-10 sm:px-6">

        <div className="mx-auto max-w-xl text-center">

          <div className="rounded-3xl border border-slate-100 bg-white px-6 py-12 shadow-sm">

            <FolderKanban
              size={48}
              className="mx-auto text-slate-300"
            />

            <h1 className="mt-5 text-xl font-bold text-slate-900">

              Project Not Found

            </h1>

            <p className="mt-2 text-sm text-slate-500">

              {error ||
                "The requested project could not be found."}

            </p>


            <Link
              to="/projects"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-pink-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-pink-700"
            >

              <ArrowLeft
                size={16}
              />

              Back to Projects

            </Link>

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

      <div className="mx-auto max-w-5xl">


        {/* ====================================================
            BACK LINK
        ==================================================== */}

        <div className="mb-5">

          <Link
            to="/projects"
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-pink-600"
          >

            <ArrowLeft
              size={16}
            />

            Back to Projects

          </Link>

        </div>


        {/* ====================================================
            MAIN CARD
        ==================================================== */}

        <div className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm">


          {/* ==================================================
              TOP ACCENT
          ================================================== */}

          <div
            className={`h-2 bg-gradient-to-r ${theme.gradient}`}
          />


          <div className="p-6 sm:p-8 lg:p-10">


            {/* =================================================
                HERO
            ================================================= */}

            <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">

              <div className="flex min-w-0 items-start gap-4 sm:gap-5">

                {/* Logo */}

                <div
                  className={`flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl ${theme.light}`}
                >

                  {project.Logo ? (

                    <img
                      src={project.Logo}
                      alt=""
                      loading="eager"
                      decoding="async"
                      className="h-full w-full object-cover"
                    />

                  ) : (

                    <FolderKanban
                      size={30}
                      className={
                        theme.text
                      }
                    />

                  )}

                </div>


                {/* Title */}

                <div className="min-w-0">

                  <div className="mb-2 flex flex-wrap items-center gap-2">

                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-500">

                      Project #{project.ID}

                    </span>


                    <span
                      className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                        isCompleted
                          ? "bg-green-50 text-green-600"
                          : normalizedStatus.includes(
                              "hold"
                            )
                          ? "bg-amber-50 text-amber-600"
                          : "bg-blue-50 text-blue-600"
                      }`}
                    >

                      {isCompleted
                        ? "Completed"
                        : status ||
                          "Ongoing"}

                    </span>

                  </div>


                  <h1 className="text-2xl font-bold leading-tight text-slate-900 sm:text-3xl">

                    {project.Title ||
                      "Untitled Project"}

                  </h1>

                </div>

              </div>

            </div>


            {/* =================================================
                PROJECT INFORMATION
            ================================================= */}

            <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">


              {/* Timeline */}

              <div className="rounded-2xl bg-slate-50 p-5">

                <div className="flex items-center gap-3">

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600">

                    <Clock3
                      size={19}
                    />

                  </div>

                  <div>

                    <p className="text-xs font-medium text-slate-400">

                      Timeline

                    </p>

                    <p className="mt-1 text-sm font-semibold text-slate-800">

                      {project.Timeline ||
                        "N/A"}

                    </p>

                  </div>

                </div>

              </div>


              {/* Manager */}

              <div className="rounded-2xl bg-slate-50 p-5">

                <div className="flex items-center gap-3">

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100 text-purple-600">

                    <UserRound
                      size={19}
                    />

                  </div>

                  <div>

                    <p className="text-xs font-medium text-slate-400">

                      Manager

                    </p>

                    <p className="mt-1 text-sm font-semibold text-slate-800">

                      {project.Manager ||
                        "N/A"}

                    </p>

                  </div>

                </div>

              </div>


              {/* Budget */}

              <div className="rounded-2xl bg-slate-50 p-5">

                <div className="flex items-center gap-3">

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">

                    <Wallet
                      size={19}
                    />

                  </div>

                  <div>

                    <p className="text-xs font-medium text-slate-400">

                      Budget

                    </p>

                    <p className="mt-1 text-sm font-semibold text-slate-800">

                      {project.Budget ||
                        "N/A"}

                    </p>

                  </div>

                </div>

              </div>

            </div>


            {/* =================================================
                PROGRESS
            ================================================= */}

            <div className="mt-8 rounded-2xl border border-slate-100 bg-white">

              <div className="p-5 sm:p-6">

                <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

                  <div>

                    <p className="text-sm font-semibold text-slate-900">

                      Project Progress

                    </p>

                    <p className="mt-1 text-xs text-slate-500">

                      Current implementation progress

                    </p>

                  </div>


                  {/* Circular Progress */}

                  <div className="flex items-center gap-4">

                    <div className="relative flex h-20 w-20 items-center justify-center">

                      <svg
                        className="h-20 w-20 -rotate-90"
                        viewBox="0 0 100 100"
                      >

                        <circle
                          cx="50"
                          cy="50"
                          r="42"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="8"
                          className="text-slate-100"
                        />

                        <circle
                          cx="50"
                          cy="50"
                          r="42"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="8"
                          strokeLinecap="round"
                          strokeDasharray="264"
                          strokeDashoffset={
                            264 -
                            (264 *
                              progress) /
                              100
                          }
                          className={
                            theme.text
                          }
                        />

                      </svg>


                      <span className="absolute text-sm font-bold text-slate-800">

                        {progress}%

                      </span>

                    </div>


                    <div>

                      <p className="text-xs text-slate-400">

                        Status

                      </p>

                      <p className="mt-1 text-sm font-bold text-slate-800">

                        {isCompleted
                          ? "Completed"
                          : status ||
                            "Ongoing"}

                      </p>

                    </div>

                  </div>

                </div>


                {/* Progress Bar */}

                <div className="mt-6">

                  <div className="h-3 overflow-hidden rounded-full bg-slate-100">

                    <div
                      className={`h-full rounded-full bg-gradient-to-r ${theme.gradient} transition-all duration-700`}
                      style={{
                        width: `${progress}%`,
                      }}
                    />

                  </div>

                </div>

              </div>

            </div>


            {/* =================================================
                DESCRIPTION
            ================================================= */}

            {project.Description && (

              <div className="mt-8">

                <h2 className="text-lg font-bold text-slate-900">

                  About This Project

                </h2>

                <p className="mt-3 whitespace-pre-line text-sm leading-7 text-slate-600">

                  {project.Description}

                </p>

              </div>

            )}


            {/* =================================================
                FOOTER
            ================================================= */}

            <div className="mt-10 flex flex-col gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:items-center sm:justify-between">

              <div className="flex items-center gap-2 text-xs text-slate-400">

                <CheckCircle2
                  size={15}
                />

                Project information is connected to Google Sheets

              </div>


              <Link
                to="/projects"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
              >

                <ArrowLeft
                  size={16}
                />

                All Projects

              </Link>

            </div>

          </div>

        </div>

      </div>

    </div>

  );

}