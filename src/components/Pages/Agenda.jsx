
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { Link } from "react-router-dom";

import {
  ArrowLeft,
  ArrowDownWideNarrow,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  CirclePause,
  Clock3,
  ListChecks,
  MapPin,
  RefreshCw,
  Search,
  UserRound,
  X,
  AlertCircle,
  Activity,
  SlidersHorizontal,
  CalendarClock,
  RotateCcw,
} from "lucide-react";

import { fetchAgenda } from "../../services/api";

/* ============================================================
   IN-MEMORY CACHE
   ============================================================ */

let agendaCache = null;
let agendaCacheTime = 0;

const CACHE_TIME = 5 * 60 * 1000;

const hasFreshAgendaCache = () =>
  Array.isArray(agendaCache) &&
  Date.now() - agendaCacheTime < CACHE_TIME;

/* ============================================================
   HELPERS
   ============================================================ */

const normalize = (value) =>
  String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");

const getStatusType = (status) => {
  const value = normalize(status);

  if (["completed", "complete", "done"].includes(value)) {
    return "completed";
  }

  if (
    ["ongoing", "on going", "in progress", "in-progress"].includes(
      value
    )
  ) {
    return "ongoing";
  }

  if (["on hold", "hold", "on-hold"].includes(value)) {
    return "onHold";
  }

  if (["cancelled", "canceled"].includes(value)) {
    return "cancelled";
  }

  return "other";
};

const parseDate = (value) => {
  if (!value) return null;

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }

  const text = String(value).trim();

  // dd/MM/yyyy
  const slashMatch = text.match(
    /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/
  );

  if (slashMatch) {
    const day = Number(slashMatch[1]);
    const month = Number(slashMatch[2]) - 1;
    const year = Number(slashMatch[3]);

    const date = new Date(year, month, day);

    if (
      date.getFullYear() !== year ||
      date.getMonth() !== month ||
      date.getDate() !== day
    ) {
      return null;
    }

    return date;
  }

  // yyyy-MM-dd
  const isoMatch = text.match(
    /^(\d{4})-(\d{1,2})-(\d{1,2})$/
  );

  if (isoMatch) {
    const year = Number(isoMatch[1]);
    const month = Number(isoMatch[2]) - 1;
    const day = Number(isoMatch[3]);

    const date = new Date(year, month, day);

    if (
      date.getFullYear() !== year ||
      date.getMonth() !== month ||
      date.getDate() !== day
    ) {
      return null;
    }

    return date;
  }

  // Avoid interpreting numeric strings as timestamps.
  if (/^\d+$/.test(text)) return null;

  const date = new Date(text);

  return Number.isNaN(date.getTime()) ? null : date;
};

const formatDate = (value) => {
  const date = parseDate(value);

  if (!date) return value || "Date not set";

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
};

const getStatusClass = (status) => {
  switch (getStatusType(status)) {
    case "completed":
      return "border-green-100 bg-green-50 text-green-700";

    case "ongoing":
      return "border-blue-100 bg-blue-50 text-blue-700";

    case "onHold":
      return "border-amber-100 bg-amber-50 text-amber-700";

    case "cancelled":
      return "border-red-100 bg-red-50 text-red-700";

    default:
      return "border-slate-200 bg-slate-100 text-slate-600";
  }
};

const StatusIcon = ({ status, size = 14 }) => {
  switch (getStatusType(status)) {
    case "completed":
      return <CheckCircle2 size={size} />;

    case "ongoing":
      return <Clock3 size={size} />;

    case "onHold":
      return <CirclePause size={size} />;

    default:
      return <AlertCircle size={size} />;
  }
};

/* ============================================================
   OVERVIEW CARD
   ============================================================ */

function OverviewCard({
  title,
  count,
  icon: Icon,
  theme,
  active,
  onClick,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`group relative w-full overflow-hidden rounded-2xl border bg-white p-4 text-left shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-pink-400 sm:p-5 ${
        active
          ? "border-pink-300 ring-2 ring-pink-100 shadow-md"
          : "border-slate-100 hover:border-pink-200"
      }`}
    >
      <div
        className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${theme.gradient}`}
      />

      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 sm:text-sm">
            {title}
          </p>

          <p className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            {count}
          </p>

          <div
            className={`mt-3 inline-flex items-center gap-1 text-xs font-semibold ${
              active ? "text-pink-600" : "text-slate-400"
            }`}
          >
            {active ? (
              <>
                <Check size={13} />
                Selected
              </>
            ) : (
              <>
                View items
                <span className="transition-transform group-hover:translate-x-1">
                  →
                </span>
              </>
            )}
          </div>
        </div>

        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${theme.iconBg} ${theme.iconText} transition duration-200 group-hover:scale-110 sm:h-12 sm:w-12`}
        >
          <Icon size={23} />
        </div>
      </div>

      {active && (
        <div className="absolute bottom-0 left-0 h-1 w-full bg-pink-500" />
      )}
    </button>
  );
}

/* ============================================================
   FILTER SELECT
   ============================================================ */

function FilterSelect({ label, value, options, onChange }) {
  return (
    <label className="block min-w-0">
      <span className="mb-1.5 block text-xs font-semibold text-slate-500">
        {label}
      </span>

      <div className="relative">
        <select
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-white px-3 pr-9 text-sm text-slate-700 outline-none transition hover:border-slate-300 focus:border-pink-400 focus:ring-2 focus:ring-pink-100"
        >
          {options.map((option) => (
            <option key={option} value={option}>
              {option === "All" ? `All ${label}s` : option}
            </option>
          ))}
        </select>

        <ChevronDown
          size={15}
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
        />
      </div>
    </label>
  );
}

/* ============================================================
   AGENDA PAGE
   ============================================================ */

export default function Agenda() {
  const [agenda, setAgenda] = useState(
    () => (hasFreshAgendaCache() ? agendaCache : [])
  );

  const [loading, setLoading] = useState(
    () => !hasFreshAgendaCache()
  );

  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedZone, setSelectedZone] = useState("All");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");

  // Separate overview-card filter from the exact status dropdown.
  const [quickFilter, setQuickFilter] = useState("All");

  const [sortOrder, setSortOrder] = useState("Oldest first");

  /* ==========================================================
     LOAD AGENDA
     ========================================================== */

  const loadAgenda = useCallback(async (forceRefresh = false) => {
    if (!forceRefresh && hasFreshAgendaCache()) {
      setAgenda(agendaCache);
      setLoading(false);
      setError("");
      return;
    }

    if (forceRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError("");

    try {
      const data = await fetchAgenda(forceRefresh);
      const safeData = Array.isArray(data) ? data : [];

      agendaCache = safeData;
      agendaCacheTime = Date.now();

      setAgenda(safeData);
    } catch (err) {
      console.error("Agenda Error:", err);

      if (Array.isArray(agendaCache)) {
        setAgenda(agendaCache);
        setError(
          "Unable to refresh. Showing previously loaded data."
        );
      } else {
        setError(err?.message || "Unable to load agenda data.");
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadAgenda(false);
  }, [loadAgenda]);

  /* ==========================================================
     PREPARE DATA ONCE
     ========================================================== */

  const preparedAgenda = useMemo(() => {
    return agenda.map((item, index) => {
      const zone = String(item?.["Zone Name"] ?? "").trim();
      const category = String(item?.Category ?? "").trim();
      const status = String(item?.Status ?? "").trim();
      const responsible = String(
        item?.["Responsible Person/Subunit"] ?? ""
      ).trim();
      const update = String(item?.["Current Update"] ?? "").trim();
      const agendaTitle = String(item?.Agenda ?? "").trim();
      const date = parseDate(item?.Date);

      return {
        ...item,
        _key: item?.SL || item?.ID || `${agendaTitle}-${index}`,
        _index: index,
        _zone: zone,
        _category: category,
        _status: status,
        _statusType: getStatusType(status),
        _responsible: responsible,
        _update: update,
        _agenda: agendaTitle,
        _date: date,
        _searchText: normalize(
          [
            agendaTitle,
            zone,
            category,
            status,
            responsible,
            update,
            item?.["Tentative Timeline"],
            item?.Date,
          ].join(" ")
        ),
      };
    });
  }, [agenda]);

  /* ==========================================================
     FILTER OPTIONS
     ========================================================== */

  const zones = useMemo(
    () => [
      "All",
      ...new Set(
        preparedAgenda.map((item) => item._zone).filter(Boolean)
      ),
    ].sort((a, b) => {
      if (a === "All") return -1;
      if (b === "All") return 1;
      return a.localeCompare(b);
    }),
    [preparedAgenda]
  );

  const categories = useMemo(
    () => [
      "All",
      ...new Set(
        preparedAgenda
          .map((item) => item._category)
          .filter(Boolean)
      ),
    ].sort((a, b) => {
      if (a === "All") return -1;
      if (b === "All") return 1;
      return a.localeCompare(b);
    }),
    [preparedAgenda]
  );

  const statuses = useMemo(
    () => [
      "All",
      ...new Set(
        preparedAgenda.map((item) => item._status).filter(Boolean)
      ),
    ].sort((a, b) => {
      if (a === "All") return -1;
      if (b === "All") return 1;
      return a.localeCompare(b);
    }),
    [preparedAgenda]
  );

  /* ==========================================================
     STATISTICS
     ========================================================== */

  const statistics = useMemo(() => {
    let completed = 0;
    let ongoing = 0;
    let onHold = 0;

    for (const item of preparedAgenda) {
      if (item._statusType === "completed") completed++;
      else if (item._statusType === "ongoing") ongoing++;
      else if (item._statusType === "onHold") onHold++;
    }

    return {
      total: preparedAgenda.length,
      completed,
      ongoing,
      onHold,
    };
  }, [preparedAgenda]);

  /* ==========================================================
     FILTERED AND SORTED RESULTS
     ========================================================== */

  const filteredAgenda = useMemo(() => {
    const search = normalize(searchTerm);

    const result = preparedAgenda.filter((item) => {
      if (search && !item._searchText.includes(search)) {
        return false;
      }

      if (
        selectedZone !== "All" &&
        item._zone !== selectedZone
      ) {
        return false;
      }

      if (
        selectedCategory !== "All" &&
        item._category !== selectedCategory
      ) {
        return false;
      }

      if (
        selectedStatus !== "All" &&
        item._status !== selectedStatus
      ) {
        return false;
      }

      if (
        quickFilter !== "All" &&
        item._statusType !== quickFilter
      ) {
        return false;
      }

      return true;
    });

    result.sort((a, b) => {
      const aTime = a._date?.getTime() ?? null;
      const bTime = b._date?.getTime() ?? null;

      if (aTime === null && bTime === null) {
        return a._index - b._index;
      }

      if (aTime === null) return 1;
      if (bTime === null) return -1;

      return sortOrder === "Newest first"
        ? bTime - aTime
        : aTime - bTime;
    });

    return result;
  }, [
    preparedAgenda,
    searchTerm,
    selectedZone,
    selectedCategory,
    selectedStatus,
    quickFilter,
    sortOrder,
  ]);

  /* ==========================================================
     CLEAR FILTERS
     ========================================================== */

  const clearFilters = useCallback(() => {
    setSearchTerm("");
    setSelectedZone("All");
    setSelectedCategory("All");
    setSelectedStatus("All");
    setQuickFilter("All");
    setSortOrder("Oldest first");
  }, []);

  const hasActiveFilters =
    Boolean(searchTerm.trim()) ||
    selectedZone !== "All" ||
    selectedCategory !== "All" ||
    selectedStatus !== "All" ||
    quickFilter !== "All";

  /* ==========================================================
     LOADING STATE
     ========================================================== */

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="h-8 w-56 animate-pulse rounded-lg bg-slate-200" />
          <div className="mt-3 h-4 w-72 animate-pulse rounded bg-slate-200" />

          <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="h-32 animate-pulse rounded-2xl bg-white shadow-sm"
              />
            ))}
          </div>

          <div className="mt-6 h-28 animate-pulse rounded-2xl bg-white shadow-sm" />

          <div className="mt-6 space-y-4">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="h-48 animate-pulse rounded-2xl bg-white shadow-sm"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  /* ==========================================================
     MAIN UI
     ========================================================== */

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">

        {/* HEADER */}

        <div className="mb-7 flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
          <div className="flex items-start gap-3">
            <Link
              to="/dashboard"
              aria-label="Back to dashboard"
              className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:border-pink-200 hover:bg-pink-50 hover:text-pink-600"
            >
              <ArrowLeft size={19} />
            </Link>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
                  Technology Agenda
                </h1>

                <span className="inline-flex items-center gap-1 rounded-full border border-pink-100 bg-pink-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-pink-700">
                  <Activity size={12} />
                  Live overview
                </span>
              </div>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                Track agenda items, responsible teams, timelines, and the latest updates.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => loadAgenda(true)}
            disabled={refreshing}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-pink-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70"
          >
            <RefreshCw
              size={16}
              className={refreshing ? "animate-spin" : ""}
            />
            {refreshing ? "Refreshing..." : "Refresh data"}
          </button>
        </div>

        {/* ERROR MESSAGE */}

        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
            <AlertCircle size={19} className="mt-0.5 shrink-0" />

            <div className="min-w-0 flex-1">
              <p className="font-semibold">Agenda data notice</p>
              <p className="mt-1 leading-5">{error}</p>
            </div>

            <button
              type="button"
              onClick={() => loadAgenda(true)}
              className="shrink-0 rounded-lg bg-white px-3 py-2 text-xs font-semibold text-amber-800 shadow-sm hover:bg-amber-100"
            >
              Retry
            </button>
          </div>
        )}

        {/* OVERVIEW */}

        <section aria-label="Agenda overview">
          <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Agenda overview
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                Select a card to filter the agenda below.
              </p>
            </div>

            {quickFilter !== "All" && (
              <button
                type="button"
                onClick={() => setQuickFilter("All")}
                className="inline-flex items-center gap-1 text-xs font-semibold text-pink-600 hover:text-pink-800"
              >
                <RotateCcw size={13} />
                Reset overview
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            <OverviewCard
              title="Total Agenda"
              count={statistics.total}
              icon={ListChecks}
              theme={{
                gradient: "from-pink-500 to-rose-500",
                iconBg: "bg-pink-50",
                iconText: "text-pink-600",
              }}
              active={quickFilter === "All"}
              onClick={() => setQuickFilter("All")}
            />

            <OverviewCard
              title="Ongoing"
              count={statistics.ongoing}
              icon={Clock3}
              theme={{
                gradient: "from-blue-500 to-indigo-500",
                iconBg: "bg-blue-50",
                iconText: "text-blue-600",
              }}
              active={quickFilter === "ongoing"}
              onClick={() => setQuickFilter("ongoing")}
            />

            <OverviewCard
              title="Completed"
              count={statistics.completed}
              icon={CheckCircle2}
              theme={{
                gradient: "from-emerald-500 to-green-500",
                iconBg: "bg-emerald-50",
                iconText: "text-emerald-600",
              }}
              active={quickFilter === "completed"}
              onClick={() => setQuickFilter("completed")}
            />

            <OverviewCard
              title="On Hold"
              count={statistics.onHold}
              icon={CirclePause}
              theme={{
                gradient: "from-amber-400 to-orange-500",
                iconBg: "bg-amber-50",
                iconText: "text-amber-600",
              }}
              active={quickFilter === "onHold"}
              onClick={() => setQuickFilter("onHold")}
            />
          </div>
        </section>

        {/* FILTER PANEL */}

        <section className="mt-7 overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-4 py-4 sm:px-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                <SlidersHorizontal size={19} />
              </div>

              <div>
                <h2 className="font-bold text-slate-900">
                  Find agenda items
                </h2>
                <p className="mt-0.5 text-xs text-slate-500">
                  Search and narrow your results.
                </p>
              </div>
            </div>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold text-pink-600 transition hover:bg-pink-50"
              >
                <X size={14} />
                Clear filters
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 lg:grid-cols-4 sm:p-5">
            {/* SEARCH */}

            <label className="block min-w-0 lg:col-span-1">
              <span className="mb-1.5 block text-xs font-semibold text-slate-500">
                Search
              </span>

              <div className="relative">
                <Search
                  size={17}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type="search"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Agenda, person, update..."
                  className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-pink-400 focus:bg-white focus:ring-2 focus:ring-pink-100"
                />
              </div>
            </label>

            <FilterSelect
              label="Zone"
              value={selectedZone}
              options={zones}
              onChange={setSelectedZone}
            />

            <FilterSelect
              label="Category"
              value={selectedCategory}
              options={categories}
              onChange={setSelectedCategory}
            />

            <FilterSelect
              label="Status"
              value={selectedStatus}
              options={statuses}
              onChange={setSelectedStatus}
            />
          </div>

          <div className="flex flex-col gap-3 border-t border-slate-100 bg-slate-50/70 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
            <p className="text-xs text-slate-500">
              Showing{" "}
              <span className="font-bold text-slate-900">
                {filteredAgenda.length}
              </span>{" "}
              of{" "}
              <span className="font-bold text-slate-900">
                {agenda.length}
              </span>{" "}
              agenda items
            </p>

            <label className="flex items-center gap-2 text-xs text-slate-500">
              <ArrowDownWideNarrow size={15} />

              <span className="font-semibold">Sort by date</span>

              <select
                value={sortOrder}
                onChange={(event) => setSortOrder(event.target.value)}
                className="rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-xs font-medium text-slate-700 outline-none focus:border-pink-400"
              >
                <option>Oldest first</option>
                <option>Newest first</option>
              </select>
            </label>
          </div>
        </section>

        {/* ACTIVE FILTER CHIPS */}

        {(quickFilter !== "All" ||
          selectedZone !== "All" ||
          selectedCategory !== "All" ||
          selectedStatus !== "All") && (
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-slate-500">
              Active:
            </span>

            {quickFilter !== "All" && (
              <button
                type="button"
                onClick={() => setQuickFilter("All")}
                className="inline-flex items-center gap-1.5 rounded-full border border-pink-100 bg-pink-50 px-3 py-1.5 text-xs font-semibold capitalize text-pink-700"
              >
                {quickFilter === "onHold" ? "On Hold" : quickFilter}
                <X size={12} />
              </button>
            )}

            {selectedZone !== "All" && (
              <button
                type="button"
                onClick={() => setSelectedZone("All")}
                className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600"
              >
                {selectedZone}
                <X size={12} />
              </button>
            )}

            {selectedCategory !== "All" && (
              <button
                type="button"
                onClick={() => setSelectedCategory("All")}
                className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600"
              >
                {selectedCategory}
                <X size={12} />
              </button>
            )}

            {selectedStatus !== "All" && (
              <button
                type="button"
                onClick={() => setSelectedStatus("All")}
                className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600"
              >
                {selectedStatus}
                <X size={12} />
              </button>
            )}
          </div>
        )}

        {/* AGENDA LIST HEADER */}

        <div className="mb-4 mt-7 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-lg font-extrabold text-slate-900">
              Agenda details
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Review responsibilities, timelines, and progress updates.
            </p>
          </div>

          <div className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-500 shadow-sm">
            <CalendarDays size={14} />
            {filteredAgenda.length} results
          </div>
        </div>

        {/* AGENDA ITEMS */}

        {filteredAgenda.length > 0 ? (
          <div className="space-y-4">
            {filteredAgenda.map((item, index) => {
              const statusTheme = {
                completed: {
                  border: "border-l-green-500",
                  dot: "bg-green-500",
                },
                ongoing: {
                  border: "border-l-blue-500",
                  dot: "bg-blue-500",
                },
                onHold: {
                  border: "border-l-amber-500",
                  dot: "bg-amber-500",
                },
                cancelled: {
                  border: "border-l-red-500",
                  dot: "bg-red-500",
                },
                other: {
                  border: "border-l-slate-300",
                  dot: "bg-slate-400",
                },
              }[item._statusType];

              return (
                <article
                  key={item._key}
                  className={`group overflow-hidden rounded-2xl border border-slate-200/80 border-l-4 ${statusTheme.border} bg-white shadow-sm transition duration-200 hover:border-slate-300 hover:shadow-md`}
                >
                  {/* CARD HEADER */}

                  <div className="p-4 sm:p-5">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="flex min-w-0 gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-pink-50 to-rose-100 text-sm font-extrabold text-pink-700 ring-1 ring-pink-100">
                          {item.SL || index + 1}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="break-words text-base font-bold leading-6 text-slate-900 transition group-hover:text-pink-700 sm:text-lg">
                              {item._agenda || "Untitled Agenda"}
                            </h3>

                            <span
                              className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-bold ${getStatusClass(
                                item._status
                              )}`}
                            >
                              <StatusIcon status={item._status} />
                              {item._status || "Not Set"}
                            </span>
                          </div>

                          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-500">
                            <span className="inline-flex items-center gap-1.5">
                              <MapPin
                                size={14}
                                className="text-pink-500"
                              />
                              {item._zone || "Zone not specified"}
                            </span>

                            <span className="inline-flex items-center gap-1.5">
                              <CalendarDays
                                size={14}
                                className="text-pink-500"
                              />
                              {formatDate(item.Date)}
                            </span>

                            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 font-semibold text-slate-600">
                              {item._category || "General"}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div
                        className={`hidden h-9 w-9 shrink-0 items-center justify-center rounded-xl sm:flex ${item._statusType === "completed"
                          ? "bg-green-50 text-green-600"
                          : item._statusType === "ongoing"
                            ? "bg-blue-50 text-blue-600"
                            : item._statusType === "onHold"
                              ? "bg-amber-50 text-amber-600"
                              : "bg-slate-50 text-slate-500"
                          }`}
                      >
                        <StatusIcon status={item._status} size={18} />
                      </div>
                    </div>

                    {/* DETAIL PANELS */}

                    <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-3">
                      {/* RESPONSIBLE PERSON */}

                      <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-4 transition group-hover:bg-white">
                        <div className="flex items-center gap-2">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-pink-50 text-pink-600">
                            <UserRound size={16} />
                          </div>

                          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            Responsible person / subunit
                          </p>
                        </div>

                        <p className="mt-3 break-words text-sm font-semibold leading-5 text-slate-700">
                          {item._responsible || "Not assigned"}
                        </p>
                      </div>

                      {/* TIMELINE */}

                      <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-4 transition group-hover:bg-white">
                        <div className="flex items-center gap-2">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                            <CalendarClock size={16} />
                          </div>

                          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            Tentative timeline
                          </p>
                        </div>

                        <p className="mt-3 break-words text-sm font-semibold leading-5 text-slate-700">
                          {item["Tentative Timeline"] || "Not specified"}
                        </p>
                      </div>

                      {/* CURRENT UPDATE */}

                      <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-4 transition group-hover:bg-white">
                        <div className="flex items-center gap-2">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                            <Activity size={16} />
                          </div>

                          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            Current update
                          </p>
                        </div>

                        <p className="mt-3 whitespace-pre-line break-words text-sm leading-6 text-slate-700">
                          {item._update || "No update available yet."}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* CARD FOOTER */}

                  <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 bg-slate-50/70 px-4 py-3 sm:px-5">
                    <span className="inline-flex items-center gap-2 text-xs text-slate-500">
                      <span
                        className={`h-2 w-2 rounded-full ${statusTheme.dot}`}
                      />
                      {item._status || "Status not set"}
                    </span>

                    <span className="text-[11px] font-medium text-slate-400">
                      Agenda #{item.SL || index + 1}
                    </span>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-pink-50 text-pink-500">
              <CalendarDays size={30} />
            </div>

            <h3 className="mt-5 text-lg font-bold text-slate-900">
              No agenda items found
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              There are no agenda items matching your current search and
              filters. Try changing your filters or view all agenda items.
            </p>

            <button
              type="button"
              onClick={clearFilters}
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-pink-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-pink-700"
            >
              <RotateCcw size={15} />
              Show all agenda items
            </button>
          </div>
        )}

        {/* FOOTER */}

        <div className="mt-8 flex flex-col items-center justify-center gap-2 border-t border-slate-200 py-5 text-center sm:flex-row sm:gap-3">
          <span className="inline-flex items-center gap-2 rounded-full border border-green-100 bg-green-50 px-3 py-1.5 text-xs font-semibold text-green-700">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
            </span>
            Google Sheets integration
          </span>

          <span className="text-xs text-slate-400">
            Agenda information is displayed from your connected data source.
          </span>
        </div>
      </div>
    </div>
  );
}
