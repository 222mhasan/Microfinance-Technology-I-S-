import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  CheckCircle2,
  Clock3,
  ListChecks,
  PauseCircle,
  RefreshCw,
  TrendingUp,
} from "lucide-react";

import { fetchActivitySummary } from "../../services/api";


// ============================================================
// STATUS CONFIGURATION
// ============================================================

const STATUS_CONFIG = [
  {
    key: "Listed",
    label: "Listed",
    className: "bg-slate-400",
  },
  {
    key: "Closed",
    label: "Closed",
    className: "bg-emerald-500",
  },
  {
    key: "On Hold",
    label: "On Hold",
    className: "bg-amber-500",
  },
  {
    key: "Ongoing",
    label: "Ongoing",
    className: "bg-blue-500",
  },
  {
    key: "Done",
    label: "Done",
    className: "bg-pink-500",
  },
];


// ============================================================
// HELPER
// ============================================================

function toNumber(value) {
  const number = Number(value);

  return Number.isFinite(number)
    ? number
    : 0;
}


// ============================================================
// MAIN COMPONENT
// ============================================================

export default function ActivitySummary() {

  const [activities, setActivities] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] =
    useState("");


  // ==========================================================
  // LOAD ACTIVITY SUMMARY
  // ==========================================================

  const loadActivities = async (
    forceRefresh = false
  ) => {

    try {

      setError("");

      if (forceRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }


      const data =
        await fetchActivitySummary(
          forceRefresh
        );


      setActivities(
        Array.isArray(data)
          ? data
          : []
      );

    } catch (error) {

      console.error(
        "Activity Summary Error:",
        error
      );

      setError(
        error.message ||
        "Unable to load activity summary."
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

    loadActivities();

  }, []);


  // ==========================================================
  // OVERVIEW TOTALS
  // ==========================================================

  const overview = useMemo(() => {

    return activities.reduce(
      (totals, activity) => {

        totals.Listed +=
          toNumber(activity.Listed);

        totals.Closed +=
          toNumber(activity.Closed);

        totals.Ongoing +=
          toNumber(activity.Ongoing);

        totals.Done +=
          toNumber(activity.Done);

        return totals;

      },
      {
        Listed: 0,
        Closed: 0,
        Ongoing: 0,
        Done: 0,
      }
    );

  }, [activities]);


  // ==========================================================
  // GRAND TOTALS
  // ==========================================================

  const grandTotals = useMemo(() => {

    return activities.reduce(
      (totals, activity) => {

        STATUS_CONFIG.forEach(
          ({ key }) => {

            totals[key] +=
              toNumber(activity[key]);

          }
        );

        totals.Total +=
          toNumber(activity.Total);

        return totals;

      },
      {
        Listed: 0,
        Closed: 0,
        "On Hold": 0,
        Ongoing: 0,
        Done: 0,
        Total: 0,
      }
    );

  }, [activities]);


  // ==========================================================
  // LOADING SKELETON
  // ==========================================================

  if (loading) {

    return (
      <div className="space-y-6">

        <div className="animate-pulse">

          <div className="mb-6 h-8 w-64 rounded-lg bg-slate-200" />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

            {[1, 2, 3, 4].map(
              (item) => (

                <div
                  key={item}
                  className="h-32 rounded-2xl bg-slate-200"
                />

              )
            )}

          </div>

        </div>

      </div>
    );

  }


  // ==========================================================
  // ERROR STATE
  // ==========================================================

  if (error) {

    return (
      <div className="flex min-h-[400px] items-center justify-center">

        <div className="w-full max-w-md rounded-2xl border border-red-200 bg-white p-8 text-center shadow-sm">

          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-50">

            <Activity
              className="text-red-500"
              size={28}
            />

          </div>

          <h2 className="mb-2 text-lg font-bold text-slate-800">
            Unable to Load Activity Summary
          </h2>

          <p className="mb-6 text-sm text-slate-500">
            {error}
          </p>

          <button
            onClick={() => loadActivities(true)}
            disabled={refreshing}
            className="inline-flex items-center gap-2 rounded-lg bg-pink-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-pink-700 disabled:cursor-not-allowed disabled:opacity-60"
          >

            <RefreshCw
              size={16}
              className={
                refreshing
                  ? "animate-spin"
                  : ""
              }
            />

            Try Again

          </button>

        </div>

      </div>
    );

  }


  // ==========================================================
  // MAIN UI
  // ==========================================================

return (
  <div className="space-y-6 p-4 sm:p-6 lg:p-8">

      {/* ======================================================
          PAGE HEADER
      ====================================================== */}

      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">

        <div>

          <div className="flex items-center gap-3">

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-pink-100">

              <Activity
                size={22}
                className="text-pink-600"
              />

            </div>

            <div>

              <h1 className="text-2xl font-bold text-slate-800">
                Activity Summary
              </h1>

              <p className="text-sm text-slate-500">
                Overview of project, drive and task activities
              </p>

            </div>

          </div>

        </div>


        {/* REFRESH */}

        <button
          onClick={() => loadActivities(true)}
          disabled={refreshing}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-pink-300 hover:text-pink-600 disabled:cursor-not-allowed disabled:opacity-60"
        >

          <RefreshCw
            size={17}
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


      {/* ======================================================
          OVERVIEW CARDS
      ====================================================== */}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

        {/* LISTED */}

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

          <div className="flex items-center justify-between">

            <div>

              <p className="text-sm font-medium text-slate-500">
                Listed
              </p>

              <h3 className="mt-2 text-3xl font-bold text-slate-800">
                {overview.Listed}
              </h3>

            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100">

              <ListChecks
                size={22}
                className="text-slate-500"
              />

            </div>

          </div>

        </div>


        {/* CLOSED */}

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

          <div className="flex items-center justify-between">

            <div>

              <p className="text-sm font-medium text-slate-500">
                Closed
              </p>

              <h3 className="mt-2 text-3xl font-bold text-emerald-600">
                {overview.Closed}
              </h3>

            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50">

              <CheckCircle2
                size={22}
                className="text-emerald-500"
              />

            </div>

          </div>

        </div>


        {/* ONGOING */}

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

          <div className="flex items-center justify-between">

            <div>

              <p className="text-sm font-medium text-slate-500">
                Ongoing
              </p>

              <h3 className="mt-2 text-3xl font-bold text-blue-600">
                {overview.Ongoing}
              </h3>

            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50">

              <Clock3
                size={22}
                className="text-blue-500"
              />

            </div>

          </div>

        </div>


        {/* DONE */}

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

          <div className="flex items-center justify-between">

            <div>

              <p className="text-sm font-medium text-slate-500">
                Done
              </p>

              <h3 className="mt-2 text-3xl font-bold text-pink-600">
                {overview.Done}
              </h3>

            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-pink-50">

              <TrendingUp
                size={22}
                className="text-pink-500"
              />

            </div>

          </div>

        </div>

      </div>


      {/* ======================================================
          TABLE + VISUALIZATION
      ====================================================== */}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-5">


        {/* ====================================================
            ACTIVITY TABLE
        ==================================================== */}

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm xl:col-span-3">

          <div className="border-b border-slate-200 px-5 py-4">

            <h2 className="font-bold text-slate-800">
              Activity Details
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Current activity status by category
            </p>

          </div>


          <div className="overflow-x-auto">

            <table className="w-full min-w-[760px] text-sm">

              <thead>

                <tr className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">

                  <th className="px-5 py-4 font-semibold">
                    Activity
                  </th>

                  <th className="px-4 py-4 text-center font-semibold">
                    Listed
                  </th>

                  <th className="px-4 py-4 text-center font-semibold">
                    Closed
                  </th>

                  <th className="px-4 py-4 text-center font-semibold">
                    On Hold
                  </th>

                  <th className="px-4 py-4 text-center font-semibold">
                    Ongoing
                  </th>

                  <th className="px-4 py-4 text-center font-semibold">
                    Done
                  </th>

                  <th className="px-5 py-4 text-center font-semibold">
                    Total
                  </th>

                </tr>

              </thead>


              <tbody className="divide-y divide-slate-100">

                {activities.map(
                  (activity, index) => (

                    <tr
                      key={
                        activity.Activity ||
                        index
                      }
                      className="transition hover:bg-slate-50"
                    >

                      <td className="px-5 py-4 font-semibold text-slate-700">
                        {activity.Activity || "-"}
                      </td>

                      <td className="px-4 py-4 text-center text-slate-600">
                        {toNumber(activity.Listed)}
                      </td>

                      <td className="px-4 py-4 text-center text-emerald-600">
                        {toNumber(activity.Closed)}
                      </td>

                      <td className="px-4 py-4 text-center text-amber-600">
                        {toNumber(activity["On Hold"])}
                      </td>

                      <td className="px-4 py-4 text-center text-blue-600">
                        {toNumber(activity.Ongoing)}
                      </td>

                      <td className="px-4 py-4 text-center text-pink-600">
                        {toNumber(activity.Done)}
                      </td>

                      <td className="px-5 py-4 text-center font-bold text-slate-800">
                        {toNumber(activity.Total)}
                      </td>

                    </tr>

                  )
                )}


                {/* GRAND TOTAL */}

                <tr className="bg-slate-50">

                  <td className="px-5 py-4 font-bold text-slate-800">
                    Grand Total
                  </td>

                  <td className="px-4 py-4 text-center font-bold text-slate-700">
                    {grandTotals.Listed}
                  </td>

                  <td className="px-4 py-4 text-center font-bold text-emerald-600">
                    {grandTotals.Closed}
                  </td>

                  <td className="px-4 py-4 text-center font-bold text-amber-600">
                    {grandTotals["On Hold"]}
                  </td>

                  <td className="px-4 py-4 text-center font-bold text-blue-600">
                    {grandTotals.Ongoing}
                  </td>

                  <td className="px-4 py-4 text-center font-bold text-pink-600">
                    {grandTotals.Done}
                  </td>

                  <td className="px-5 py-4 text-center font-bold text-slate-900">
                    {grandTotals.Total}
                  </td>

                </tr>

              </tbody>

            </table>

          </div>

        </div>


        {/* ====================================================
            STATUS VISUALIZATION
        ==================================================== */}

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm xl:col-span-2">

          <div className="mb-5">

            <h2 className="font-bold text-slate-800">
              Status Overview
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Distribution of all activities
            </p>

          </div>


          {/* STATUS BARS */}

          <div className="space-y-5">

            {STATUS_CONFIG.map(
              (status) => {

                const value =
                  grandTotals[status.key];

                const percentage =
                  grandTotals.Total > 0
                    ? (value /
                        grandTotals.Total) *
                      100
                    : 0;

                return (
                  <div
                    key={status.key}
                  >

                    <div className="mb-2 flex items-center justify-between">

                      <div className="flex items-center gap-2">

                        <span
                          className={`h-2.5 w-2.5 rounded-full ${status.className}`}
                        />

                        <span className="text-sm font-medium text-slate-600">
                          {status.label}
                        </span>

                      </div>

                      <div className="text-sm font-bold text-slate-700">

                        {value}

                        <span className="ml-1 text-xs font-normal text-slate-400">
                          ({percentage.toFixed(1)}%)
                        </span>

                      </div>

                    </div>


                    <div className="h-2 overflow-hidden rounded-full bg-slate-100">

                      <div
                        className={`h-full rounded-full transition-all duration-700 ${status.className}`}
                        style={{
                          width: `${percentage}%`,
                        }}
                      />

                    </div>

                  </div>
                );

              }
            )}

          </div>


          {/* TOTAL */}

          <div className="mt-8 rounded-xl bg-slate-50 p-4">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Total Activities
                </p>

                <p className="mt-1 text-2xl font-bold text-slate-800">
                  {grandTotals.Total}
                </p>

              </div>


              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-pink-100">

                <PauseCircle
                  size={23}
                  className="text-pink-600"
                />

              </div>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}