import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock3,
  RefreshCw,
  Search,
  AlertCircle,
  CirclePause,
  ListChecks,
  UserRound,
  MapPin,
} from "lucide-react";

import { fetchAgenda } from "../../services/api";

// ============================================================
// HELPERS
// ============================================================

const normalize = (value) =>
  String(value ?? "")
    .trim()
    .toLowerCase();

const parseDate = (value) => {
  if (!value) return null;

  const text = String(value).trim();

  // dd/MM/yyyy
  const slashMatch = text.match(
    /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/
  );

  if (slashMatch) {
    const day = Number(slashMatch[1]);
    const month = Number(slashMatch[2]) - 1;
    const year = Number(slashMatch[3]);

    const date = new Date(
      year,
      month,
      day
    );

    return Number.isNaN(date.getTime())
      ? null
      : date;
  }

  // yyyy-MM-dd
  const isoMatch = text.match(
    /^(\d{4})-(\d{1,2})-(\d{1,2})$/
  );

  if (isoMatch) {
    const year = Number(isoMatch[1]);
    const month = Number(isoMatch[2]) - 1;
    const day = Number(isoMatch[3]);

    const date = new Date(
      year,
      month,
      day
    );

    return Number.isNaN(date.getTime())
      ? null
      : date;
  }

  const date = new Date(text);

  return Number.isNaN(date.getTime())
    ? null
    : date;
};

const formatDate = (value) => {
  const date = parseDate(value);

  if (!date) {
    return value || "N/A";
  }

  return new Intl.DateTimeFormat(
    "en-GB",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  ).format(date);
};

const getStatusClass = (status) => {
  const value = normalize(status);

  if (
    value === "completed" ||
    value === "complete" ||
    value === "done"
  ) {
    return "bg-green-50 text-green-700";
  }

  if (
    value === "ongoing" ||
    value === "on going" ||
    value === "in progress" ||
    value === "in-progress"
  ) {
    return "bg-blue-50 text-blue-700";
  }

  if (
    value === "on hold" ||
    value === "hold" ||
    value === "on-hold"
  ) {
    return "bg-amber-50 text-amber-700";
  }

  if (
    value === "cancelled" ||
    value === "canceled"
  ) {
    return "bg-red-50 text-red-700";
  }

  return "bg-slate-100 text-slate-600";
};

const getStatusIcon = (status) => {
  const value = normalize(status);

  if (
    value === "completed" ||
    value === "complete" ||
    value === "done"
  ) {
    return <CheckCircle2 size={14} />;
  }

  if (
    value === "ongoing" ||
    value === "on going" ||
    value === "in progress" ||
    value === "in-progress"
  ) {
    return <Clock3 size={14} />;
  }

  if (
    value === "on hold" ||
    value === "hold" ||
    value === "on-hold"
  ) {
    return <CirclePause size={14} />;
  }

  return <AlertCircle size={14} />;
};

// ============================================================
// AGENDA PAGE
// ============================================================

export default function Agenda() {
  const [agenda, setAgenda] = useState([]);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] =
    useState("");

  const [searchTerm, setSearchTerm] =
    useState("");

  const [selectedZone, setSelectedZone] =
    useState("All");

  const [selectedCategory, setSelectedCategory] =
    useState("All");

  const [selectedStatus, setSelectedStatus] =
    useState("All");

  // ==========================================================
  // LOAD DATA
  // ==========================================================

  const loadAgenda = async (
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
        await fetchAgenda(
          forceRefresh
        );

      if (Array.isArray(data)) {
        setAgenda(data);
      } else {
        setAgenda([]);
      }

    } catch (err) {
      console.error(
        "Agenda Error:",
        err
      );

      setError(
        err.message ||
          "Unable to load agenda data."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadAgenda(false);
  }, []);

  // ==========================================================
  // FILTER OPTIONS
  // ==========================================================

  const zones = useMemo(() => {
    const values = agenda
      .map((item) =>
        String(
          item["Zone Name"] || ""
        ).trim()
      )
      .filter(Boolean);

    return [
      "All",
      ...Array.from(
        new Set(values)
      ).sort(),
    ];
  }, [agenda]);

  const categories = useMemo(() => {
    const values = agenda
      .map((item) =>
        String(
          item.Category || ""
        ).trim()
      )
      .filter(Boolean);

    return [
      "All",
      ...Array.from(
        new Set(values)
      ).sort(),
    ];
  }, [agenda]);

  const statuses = useMemo(() => {
    const values = agenda
      .map((item) =>
        String(
          item.Status || ""
        ).trim()
      )
      .filter(Boolean);

    return [
      "All",
      ...Array.from(
        new Set(values)
      ).sort(),
    ];
  }, [agenda]);

  // ==========================================================
  // FILTER DATA
  // ==========================================================

  const filteredAgenda = useMemo(() => {
    const search =
      normalize(searchTerm);

    return [...agenda]
      .filter((item) => {
        const zone =
          String(
            item["Zone Name"] || ""
          ).trim();

        const category =
          String(
            item.Category || ""
          ).trim();

        const status =
          String(
            item.Status || ""
          ).trim();

        const matchesSearch =
          !search ||
          normalize(
            item.Agenda
          ).includes(search) ||
          normalize(
            item["Responsible Person/Subunit"]
          ).includes(search) ||
          normalize(
            item["Current Update"]
          ).includes(search) ||
          normalize(zone).includes(search);

        const matchesZone =
          selectedZone === "All" ||
          zone === selectedZone;

        const matchesCategory =
          selectedCategory === "All" ||
          category === selectedCategory;

        const matchesStatus =
          selectedStatus === "All" ||
          status === selectedStatus;

        return (
          matchesSearch &&
          matchesZone &&
          matchesCategory &&
          matchesStatus
        );
      })
      .sort((a, b) => {
        const dateA =
          parseDate(a.Date);

        const dateB =
          parseDate(b.Date);

        if (!dateA && !dateB) {
          return 0;
        }

        if (!dateA) return 1;
        if (!dateB) return -1;

        return dateA - dateB;
      });
  }, [
    agenda,
    searchTerm,
    selectedZone,
    selectedCategory,
    selectedStatus,
  ]);

  // ==========================================================
  // STATISTICS
  // ==========================================================

  const statistics = useMemo(() => {
    let completed = 0;
    let ongoing = 0;
    let onHold = 0;

    for (const item of agenda) {
      const status =
        normalize(item.Status);

      if (
        status === "completed" ||
        status === "complete" ||
        status === "done"
      ) {
        completed++;
      } else if (
        status === "ongoing" ||
        status === "on going" ||
        status === "in progress" ||
        status === "in-progress"
      ) {
        ongoing++;
      } else if (
        status === "on hold" ||
        status === "hold" ||
        status === "on-hold"
      ) {
        onHold++;
      }
    }

    return {
      total: agenda.length,
      completed,
      ongoing,
      onHold,
    };
  }, [agenda]);

  // ==========================================================
  // LOADING
  // ==========================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">

          <div className="h-8 w-56 animate-pulse rounded-lg bg-slate-200" />

          <div className="mt-2 h-4 w-80 animate-pulse rounded bg-slate-200" />

          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[1, 2, 3, 4].map(
              (item) => (
                <div
                  key={item}
                  className="h-24 animate-pulse rounded-2xl bg-white shadow-sm"
                />
              )
            )}
          </div>

          <div className="mt-6 h-20 animate-pulse rounded-2xl bg-white shadow-sm" />

          <div className="mt-6 h-96 animate-pulse rounded-2xl bg-white shadow-sm" />
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

        <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

          <div>
            <div className="flex items-center gap-3">

              <Link
                to="/dashboard"
                className="
                  flex
                  h-9
                  w-9
                  items-center
                  justify-center
                  rounded-xl
                  bg-white
                  text-slate-500
                  shadow-sm
                  transition
                  hover:bg-pink-50
                  hover:text-pink-600
                "
              >
                <ArrowLeft size={18} />
              </Link>

              <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                  Agenda
                </h1>

                <p className="mt-1 text-sm text-slate-500">
                  Technology agenda and current updates
                </p>
              </div>

            </div>
          </div>

          <button
            type="button"
            onClick={() =>
              loadAgenda(true)
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
            ERROR
        ==================================================== */}

        {error && (
          <div className="mb-5 flex items-center justify-between gap-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">

            <span>
              {error}
            </span>

            <button
              type="button"
              onClick={() =>
                loadAgenda(true)
              }
              className="rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-red-600 shadow-sm"
            >
              Retry
            </button>

          </div>
        )}

        {/* ====================================================
            SUMMARY
        ==================================================== */}

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">

          <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 text-slate-600">
                <ListChecks size={20} />
              </div>

              <div>
                <p className="text-xs text-slate-500">
                  Total Agenda
                </p>

                <p className="mt-1 text-2xl font-bold text-slate-900">
                  {statistics.total}
                </p>
              </div>

            </div>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <Clock3 size={20} />
              </div>

              <div>
                <p className="text-xs text-slate-500">
                  Ongoing
                </p>

                <p className="mt-1 text-2xl font-bold text-blue-700">
                  {statistics.ongoing}
                </p>
              </div>

            </div>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-50 text-green-600">
                <CheckCircle2 size={20} />
              </div>

              <div>
                <p className="text-xs text-slate-500">
                  Completed
                </p>

                <p className="mt-1 text-2xl font-bold text-green-700">
                  {statistics.completed}
                </p>
              </div>

            </div>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                <CirclePause size={20} />
              </div>

              <div>
                <p className="text-xs text-slate-500">
                  On Hold
                </p>

                <p className="mt-1 text-2xl font-bold text-amber-700">
                  {statistics.onHold}
                </p>
              </div>

            </div>
          </div>

        </div>

        {/* ====================================================
            FILTERS
        ==================================================== */}

        <div className="mt-6 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">

            {/* Search */}

            <div className="relative">

              <Search
                size={17}
                className="
                  absolute
                  left-3
                  top-1/2
                  -translate-y-1/2
                  text-slate-400
                "
              />

              <input
                type="text"
                value={searchTerm}
                onChange={(event) =>
                  setSearchTerm(
                    event.target.value
                  )
                }
                placeholder="Search agenda..."
                className="
                  h-10
                  w-full
                  rounded-xl
                  border
                  border-slate-200
                  bg-slate-50
                  pl-10
                  pr-3
                  text-sm
                  text-slate-700
                  outline-none
                  transition
                  focus:border-pink-400
                  focus:bg-white
                  focus:ring-2
                  focus:ring-pink-100
                "
              />

            </div>

            {/* Zone */}

            <select
              value={selectedZone}
              onChange={(event) =>
                setSelectedZone(
                  event.target.value
                )
              }
              className="
                h-10
                rounded-xl
                border
                border-slate-200
                bg-slate-50
                px-3
                text-sm
                text-slate-700
                outline-none
                focus:border-pink-400
                focus:ring-2
                focus:ring-pink-100
              "
            >
              {zones.map(
                (zone) => (
                  <option
                    key={zone}
                    value={zone}
                  >
                    {zone === "All"
                      ? "All Zones"
                      : zone}
                  </option>
                )
              )}
            </select>

            {/* Category */}

            <select
              value={
                selectedCategory
              }
              onChange={(event) =>
                setSelectedCategory(
                  event.target.value
                )
              }
              className="
                h-10
                rounded-xl
                border
                border-slate-200
                bg-slate-50
                px-3
                text-sm
                text-slate-700
                outline-none
                focus:border-pink-400
                focus:ring-2
                focus:ring-pink-100
              "
            >
              {categories.map(
                (category) => (
                  <option
                    key={category}
                    value={category}
                  >
                    {category === "All"
                      ? "All Categories"
                      : category}
                  </option>
                )
              )}
            </select>

            {/* Status */}

            <select
              value={selectedStatus}
              onChange={(event) =>
                setSelectedStatus(
                  event.target.value
                )
              }
              className="
                h-10
                rounded-xl
                border
                border-slate-200
                bg-slate-50
                px-3
                text-sm
                text-slate-700
                outline-none
                focus:border-pink-400
                focus:ring-2
                focus:ring-pink-100
              "
            >
              {statuses.map(
                (status) => (
                  <option
                    key={status}
                    value={status}
                  >
                    {status === "All"
                      ? "All Status"
                      : status}
                  </option>
                )
              )}
            </select>

          </div>

          <div className="mt-3 flex items-center justify-between">

            <p className="text-xs text-slate-400">
              Showing{" "}
              <span className="font-semibold text-slate-600">
                {filteredAgenda.length}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-slate-600">
                {agenda.length}
              </span>{" "}
              agenda items
            </p>

            <button
              type="button"
              onClick={() => {
                setSearchTerm("");
                setSelectedZone("All");
                setSelectedCategory("All");
                setSelectedStatus("All");
              }}
              className="text-xs font-semibold text-pink-600 hover:text-pink-700"
            >
              Clear Filters
            </button>

          </div>

        </div>

        {/* ====================================================
            AGENDA LIST
        ==================================================== */}

        <div className="mt-6 overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">

          <div className="border-b border-slate-100 px-5 py-4">

            <div className="flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-pink-50 text-pink-600">
                <CalendarDays size={20} />
              </div>

              <div>
                <h2 className="font-bold text-slate-900">
                  Agenda Details
                </h2>

                <p className="text-xs text-slate-500">
                  Detailed agenda and current updates
                </p>
              </div>

            </div>

          </div>

          {filteredAgenda.length > 0 ? (

            <div className="divide-y divide-slate-100">

              {filteredAgenda.map(
                (item, index) => (

                  <div
                    key={
                      item.SL ||
                      index
                    }
                    className="
                      p-5
                      transition
                      hover:bg-slate-50/70
                    "
                  >

                    {/* TOP */}

                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">

                      <div className="flex min-w-0 gap-4">

                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-pink-50 text-sm font-bold text-pink-600">
                          {item.SL ||
                            index + 1}
                        </div>

                        <div className="min-w-0">

                          <div className="flex flex-wrap items-center gap-2">

                            <h3 className="text-base font-bold text-slate-900">
                              {item.Agenda ||
                                "Untitled Agenda"}
                            </h3>

                            <span
                              className={`
                                inline-flex
                                items-center
                                gap-1
                                rounded-full
                                px-2.5
                                py-1
                                text-[11px]
                                font-semibold
                                ${getStatusClass(
                                  item.Status
                                )}
                              `}
                            >
                              {getStatusIcon(
                                item.Status
                              )}

                              {item.Status ||
                                "Not Set"}
                            </span>

                          </div>

                          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-2 text-xs text-slate-500">

                            <span className="inline-flex items-center gap-1.5">
                              <MapPin size={13} />
                              {item["Zone Name"] ||
                                "N/A"}
                            </span>

                            <span className="inline-flex items-center gap-1.5">
                              <CalendarDays size={13} />
                              {formatDate(
                                item.Date
                              )}
                            </span>

                            <span className="rounded-full bg-slate-100 px-2.5 py-1 font-medium text-slate-600">
                              {item.Category ||
                                "General"}
                            </span>

                          </div>

                        </div>

                      </div>

                    </div>

                    {/* DETAILS */}

                    <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-3">

                      <div className="rounded-xl bg-slate-50 p-4">

                        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                          Responsible Person / Subunit
                        </p>

                        <div className="mt-2 flex items-start gap-2">

                          <UserRound
                            size={16}
                            className="mt-0.5 shrink-0 text-pink-500"
                          />

                          <p className="text-sm font-medium text-slate-700">
                            {item[
                              "Responsible Person/Subunit"
                            ] ||
                              "N/A"}
                          </p>

                        </div>

                      </div>

                      <div className="rounded-xl bg-slate-50 p-4">

                        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                          Tentative Timeline
                        </p>

                        <p className="mt-2 text-sm font-medium text-slate-700">
                          {item[
                            "Tentative Timeline"
                          ] ||
                            "N/A"}
                        </p>

                      </div>

                      <div className="rounded-xl bg-slate-50 p-4">

                        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                          Current Update
                        </p>

                        <p className="mt-2 text-sm leading-6 text-slate-700">
                          {item[
                            "Current Update"
                          ] ||
                            "No update available"}
                        </p>

                      </div>

                    </div>

                  </div>

                )
              )}

            </div>

          ) : (

            <div className="px-6 py-16 text-center">

              <CalendarDays
                size={42}
                className="mx-auto text-slate-300"
              />

              <h3 className="mt-4 font-semibold text-slate-800">
                No agenda found
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Try changing your search or filters.
              </p>

            </div>

          )}

        </div>

        {/* ====================================================
            FOOTER
        ==================================================== */}

        <div className="mt-8 flex items-center justify-center gap-2 text-xs text-slate-400">

          <span className="relative flex h-2 w-2">

            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />

            <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />

          </span>

          Agenda data connected to Google Sheets

        </div>

      </div>

    </div>
  );
}