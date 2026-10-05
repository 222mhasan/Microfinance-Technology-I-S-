
import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Eye,
  Filter,
  ListTodo,
  Loader2,
  RefreshCw,
  Search,
  Target,
  User,
  X,
} from "lucide-react";

import { fetchIndividualTasks } from "../../services/api";


/* =========================================================
   HELPERS
========================================================= */

const normalize = (value) =>
  String(value ?? "")
    .trim()
    .toLowerCase();


const getTaskKey = (task, index) =>
  `${task["SN"] || "task"}-${index}`;


const formatDate = (value) => {
  if (!value) return "—";

  return String(value).trim();
};


const getStatusProgress = (status) => {
  const value = normalize(status);

  if (
    value.includes("complete") ||
    value.includes("done") ||
    value.includes("closed")
  ) {
    return 100;
  }

  if (
    value.includes("hold") ||
    value.includes("pending")
  ) {
    return 50;
  }

  if (
    value.includes("ongoing") ||
    value.includes("progress") ||
    value.includes("working")
  ) {
    return 65;
  }

  if (
    value.includes("start")
  ) {
    return 0;
  }

  return 25;
};


const getStatusStyle = (status) => {
  const value = normalize(status);

  if (
    value.includes("complete") ||
    value.includes("done") ||
    value.includes("closed")
  ) {
    return {
      badge:
        "bg-emerald-50 text-emerald-700 border-emerald-200",
      dot: "bg-emerald-500",
      bar: "bg-emerald-500",
    };
  }

  if (
    value.includes("hold") ||
    value.includes("pending")
  ) {
    return {
      badge:
        "bg-amber-50 text-amber-700 border-amber-200",
      dot: "bg-amber-500",
      bar: "bg-amber-500",
    };
  }

  if (
    value.includes("ongoing") ||
    value.includes("progress") ||
    value.includes("working")
  ) {
    return {
      badge:
        "bg-blue-50 text-blue-700 border-blue-200",
      dot: "bg-blue-500",
      bar: "bg-blue-500",
    };
  }

  return {
    badge:
      "bg-slate-50 text-slate-600 border-slate-200",
    dot: "bg-slate-400",
    bar: "bg-slate-400",
  };
};


const getPriorityStyle = (priority) => {
  const value = normalize(priority);

  if (value === "high" || value === "urgent") {
    return "bg-red-50 text-red-700 border-red-200";
  }

  if (value === "medium" || value === "normal") {
    return "bg-amber-50 text-amber-700 border-amber-200";
  }

  if (value === "low") {
    return "bg-emerald-50 text-emerald-700 border-emerald-200";
  }

  return "bg-slate-50 text-slate-600 border-slate-200";
};


const isCompleted = (task) => {
  const status = normalize(task.Status);

  return (
    status.includes("complete") ||
    status.includes("done") ||
    status.includes("closed")
  );
};


const isOngoing = (task) => {
  const status = normalize(task.Status);

  return (
    status.includes("ongoing") ||
    status.includes("progress") ||
    status.includes("working")
  );
};


const isOnHold = (task) => {
  const status = normalize(task.Status);

  return (
    status.includes("hold") ||
    status.includes("pending")
  );
};


/* =========================================================
   SMALL COMPONENTS
========================================================= */

const StatusBadge = ({ status }) => {
  const style = getStatusStyle(status);

  return (
    <span
      className={`
        inline-flex
        items-center
        gap-1.5
        rounded-full
        border
        px-2.5
        py-1
        text-xs
        font-semibold
        whitespace-nowrap
        ${style.badge}
      `}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${style.dot}`}
      />

      {status || "Not Set"}
    </span>
  );
};


const PriorityBadge = ({ priority }) => (
  <span
    className={`
      inline-flex
      rounded-full
      border
      px-2.5
      py-1
      text-xs
      font-semibold
      whitespace-nowrap
      ${getPriorityStyle(priority)}
    `}
  >
    {priority || "Not Set"}
  </span>
);


const ProgressBar = ({ status }) => {
  const progress = getStatusProgress(status);
  const style = getStatusStyle(status);

  return (
    <div className="mt-2">
      <div className="mb-1 flex items-center justify-between">
        <span className="text-[10px] font-medium text-slate-400">
          Progress
        </span>

        <span className="text-[10px] font-bold text-slate-500">
          {progress}%
        </span>
      </div>

      <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
        <div
          className={`h-full rounded-full transition-all duration-500 ${style.bar}`}
          style={{
            width: `${progress}%`,
          }}
        />
      </div>
    </div>
  );
};


const StatCard = ({
  title,
  value,
  icon: Icon,
  description,
  iconClass,
}) => (
  <div
    className="
      rounded-2xl
      border
      border-slate-200
      bg-white
      p-4
      shadow-sm
      transition-all
      duration-200
      hover:-translate-y-0.5
      hover:shadow-md
    "
  >
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <p className="text-xs font-medium text-slate-500">
          {title}
        </p>

        <p className="mt-1 text-2xl font-bold text-slate-800">
          {value}
        </p>

        <p className="mt-1 text-[11px] text-slate-400">
          {description}
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
          ${iconClass}
        `}
      >
        <Icon size={19} />
      </div>
    </div>
  </div>
);


/* =========================================================
   DETAILS MODAL
========================================================= */

const TaskDetailsModal = ({
  task,
  onClose,
}) => {
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      document.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [onClose]);


  if (!task) return null;


  return (
    <div
      className="
        fixed
        inset-0
        z-[100]
        flex
        items-center
        justify-center
        bg-slate-900/50
        p-3
        backdrop-blur-sm
        sm:p-6
      "
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className="
          flex
          max-h-[90vh]
          w-full
          max-w-3xl
          flex-col
          overflow-hidden
          rounded-2xl
          bg-white
          shadow-2xl
        "
      >

        {/* Modal Header */}
        <div
          className="
            flex
            items-start
            justify-between
            gap-4
            border-b
            border-slate-100
            px-5
            py-4
            sm:px-6
          "
        >
          <div className="min-w-0">
            <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-pink-600">
              Task Details
            </p>

            <h2 className="break-words text-lg font-bold text-slate-800">
              {task["Task Title"] || "Untitled Task"}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="
              flex
              h-9
              w-9
              shrink-0
              items-center
              justify-center
              rounded-lg
              text-slate-400
              transition
              hover:bg-slate-100
              hover:text-slate-700
            "
            aria-label="Close details"
          >
            <X size={18} />
          </button>
        </div>


        {/* Modal Body */}
        <div className="overflow-y-auto p-5 sm:p-6">

          {/* Status */}
          <div
            className="
              mb-5
              flex
              flex-wrap
              items-center
              gap-2
            "
          >
            <StatusBadge status={task.Status} />

            <PriorityBadge
              priority={task.Priority}
            />
          </div>


          {/* Main information */}
          <div
            className="
              grid
              grid-cols-1
              gap-4
              sm:grid-cols-2
            "
          >

            <InfoItem
              icon={User}
              label="Assigned To"
              value={task["Assigned to"]}
            />

            <InfoItem
              icon={Target}
              label="FY"
              value={task.FY}
            />

            <InfoItem
              icon={CalendarDays}
              label="Starting Date"
              value={formatDate(
                task["Starting Date"]
              )}
            />

            <InfoItem
              icon={CalendarDays}
              label="End Date"
              value={formatDate(
                task["End Date"]
              )}
            />

            <InfoItem
              icon={Clock3}
              label="Duration"
              value={
                task["Duration (C.Days)"]
                  ? `${task["Duration (C.Days)"]} days`
                  : "—"
              }
            />

            <InfoItem
              icon={User}
              label="Requester"
              value={
                task[
                  "Requester (Unit/Client)"
                ]
              }
            />

            <InfoItem
              icon={Target}
              label="Vendor"
              value={task.Vendor}
            />

            <InfoItem
              icon={User}
              label="Focal-2"
              value={task["Focal-2"]}
            />

          </div>


          {/* Milestone */}
          <div className="mt-5">
            <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">
              Milestone / Current Status
            </p>

            <div
              className="
                rounded-xl
                border
                border-slate-200
                bg-slate-50
                p-4
                text-sm
                leading-6
                text-slate-600
              "
            >
              {task[
                "Mile stones : Current Status"
              ] || "No milestone information available."}
            </div>
          </div>


          {/* Remarks */}
          <div className="mt-5">
            <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">
              Remarks / Note
            </p>

            <div
              className="
                rounded-xl
                border
                border-slate-200
                bg-white
                p-4
                text-sm
                leading-6
                text-slate-600
              "
            >
              {task["Remarks / Note"] ||
                "No remarks available."}
            </div>
          </div>


          {/* Progress */}
          <div className="mt-5">
            <ProgressBar
              status={task.Status}
            />
          </div>

        </div>
      </div>
    </div>
  );
};


const InfoItem = ({
  icon: Icon,
  label,
  value,
}) => (
  <div
    className="
      rounded-xl
      border
      border-slate-100
      bg-slate-50
      p-3
    "
  >
    <div className="flex items-start gap-3">

      <div
        className="
          flex
          h-8
          w-8
          shrink-0
          items-center
          justify-center
          rounded-lg
          bg-white
          text-pink-600
          shadow-sm
        "
      >
        <Icon size={15} />
      </div>

      <div className="min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
          {label}
        </p>

        <p className="mt-1 break-words text-sm font-medium text-slate-700">
          {value || "—"}
        </p>
      </div>

    </div>
  </div>
);


/* =========================================================
   MOBILE TASK CARD
========================================================= */

const MobileTaskCard = ({
  task,
  taskKey,
  onViewDetails,
}) => {
  return (
    <article
      key={taskKey}
      className="
        rounded-2xl
        border
        border-slate-200
        bg-white
        p-4
        shadow-sm
      "
    >

      <div className="flex items-start justify-between gap-3">

        <div className="min-w-0">
          <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-pink-600">
            Task #{task.SN || "—"}
          </p>

          <h3 className="break-words text-sm font-bold leading-5 text-slate-800">
            {task["Task Title"] ||
              "Untitled Task"}
          </h3>
        </div>

        <PriorityBadge
          priority={task.Priority}
        />

      </div>


      <div className="mt-4 grid grid-cols-2 gap-3">

        <div>
          <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">
            Assigned To
          </p>

          <p className="mt-1 truncate text-xs font-semibold text-slate-700">
            {task["Assigned to"] || "—"}
          </p>
        </div>


        <div>
          <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">
            Status
          </p>

          <div className="mt-1">
            <StatusBadge status={task.Status} />
          </div>
        </div>


        <div>
          <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">
            Start Date
          </p>

          <p className="mt-1 text-xs font-semibold text-slate-700">
            {formatDate(task["Starting Date"])}
          </p>
        </div>


        <div>
          <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">
            End Date
          </p>

          <p className="mt-1 text-xs font-semibold text-slate-700">
            {formatDate(task["End Date"])}
          </p>
        </div>

      </div>


      <ProgressBar status={task.Status} />


      <div
        className="
          mt-4
          flex
          items-center
          justify-between
          border-t
          border-slate-100
          pt-3
        "
      >

        <p className="max-w-[65%] truncate text-xs text-slate-400">
          {task[
            "Requester (Unit/Client)"
          ] || "No requester"}
        </p>

        <button
          type="button"
          onClick={() =>
            onViewDetails(task)
          }
          className="
            inline-flex
            items-center
            gap-1
            rounded-lg
            bg-pink-50
            px-3
            py-2
            text-xs
            font-semibold
            text-pink-700
            transition
            hover:bg-pink-100
          "
        >
          <Eye size={14} />
          Details
        </button>

      </div>

    </article>
  );
};


/* =========================================================
   MAIN COMPONENT
========================================================= */

const IndividualTask = () => {

  const [tasks, setTasks] = useState([]);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] =
    useState("");

  const [searchTerm, setSearchTerm] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState("All");

  const [priorityFilter, setPriorityFilter] =
    useState("All");

  const [selectedTask, setSelectedTask] =
    useState(null);


  /* =====================================================
     LOAD DATA
  ===================================================== */

  const loadTasks = async (
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
        await fetchIndividualTasks(
          forceRefresh
        );


      if (Array.isArray(data)) {
        setTasks(data);
      } else {
        setTasks([]);
      }

    } catch (err) {

      console.error(
        "Individual Task Error:",
        err
      );

      setError(
        err.message ||
          "Unable to load individual tasks."
      );

    } finally {

      setLoading(false);
      setRefreshing(false);

    }

  };


  useEffect(() => {
    loadTasks(false);
  }, []);


  /* =====================================================
     DYNAMIC FILTER OPTIONS
  ===================================================== */

  const statuses = useMemo(() => {

    const values = tasks
      .map((task) => task.Status)
      .filter(Boolean)
      .map((value) => String(value).trim());

    return [
      "All",
      ...Array.from(
        new Set(values)
      ),
    ];

  }, [tasks]);


  const priorities = useMemo(() => {

    const values = tasks
      .map((task) => task.Priority)
      .filter(Boolean)
      .map((value) => String(value).trim());

    return [
      "All",
      ...Array.from(
        new Set(values)
      ),
    ];

  }, [tasks]);


  /* =====================================================
     FILTER TASKS
  ===================================================== */

  const filteredTasks = useMemo(() => {

    const search =
      normalize(searchTerm);


    return tasks.filter((task) => {

      const searchableText = [
        task.SN,
        task["Assigned to"],
        task.Priority,
        task.FY,
        task["Task Title"],
        task[
          "Mile stones : Current Status"
        ],
        task["Starting Date"],
        task["End Date"],
        task["Duration (C.Days)"],
        task.Status,
        task[
          "Requester (Unit/Client)"
        ],
        task.Vendor,
        task["Focal-2"],
        task["Remarks / Note"],
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();


      const matchesSearch =
        !search ||
        searchableText.includes(search);


      const matchesStatus =
        statusFilter === "All" ||
        normalize(task.Status) ===
          normalize(statusFilter);


      const matchesPriority =
        priorityFilter === "All" ||
        normalize(task.Priority) ===
          normalize(priorityFilter);


      return (
        matchesSearch &&
        matchesStatus &&
        matchesPriority
      );

    });

  }, [
    tasks,
    searchTerm,
    statusFilter,
    priorityFilter,
  ]);


  /* =====================================================
     STATISTICS
  ===================================================== */

  const stats = useMemo(() => {

    const total = tasks.length;

    const completed =
      tasks.filter(isCompleted).length;

    const ongoing =
      tasks.filter(isOngoing).length;

    const onHold =
      tasks.filter(isOnHold).length;

    return {
      total,
      completed,
      ongoing,
      onHold,
    };

  }, [tasks]);


  /* =====================================================
     CLEAR FILTERS
  ===================================================== */

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("All");
    setPriorityFilter("All");
  };


  const hasActiveFilters =
    Boolean(searchTerm) ||
    statusFilter !== "All" ||
    priorityFilter !== "All";


  /* =====================================================
     RENDER
  ===================================================== */

  return (
    <div className="dashboard-fade min-h-screen bg-slate-50">

      <div
        className="
          mx-auto
          w-full
          max-w-[1800px]
          px-3
          py-5
          sm:px-5
          sm:py-6
          lg:px-8
        "
      >

        {/* =================================================
            PAGE HEADER
        ================================================= */}

        <div
          className="
            mb-5
            flex
            flex-col
            gap-4
            sm:flex-row
            sm:items-center
            sm:justify-between
          "
        >

          <div className="min-w-0">

            <div className="flex items-center gap-3">

              <div
                className="
                  flex
                  h-11
                  w-11
                  shrink-0
                  items-center
                  justify-center
                  rounded-xl
                  bg-pink-600
                  text-white
                  shadow-sm
                "
              >
                <ListTodo size={21} />
              </div>

              <div className="min-w-0">

                <h1
                  className="
                    truncate
                    text-xl
                    font-bold
                    text-slate-800
                    sm:text-2xl
                  "
                >
                  Individual Tasks
                </h1>

                <p className="mt-0.5 text-xs text-slate-500 sm:text-sm">
                  Monitor assigned tasks, progress and current status
                </p>

              </div>

            </div>

          </div>


          <button
            type="button"
            onClick={() => loadTasks(true)}
            disabled={refreshing}
            className="
              inline-flex
              w-full
              items-center
              justify-center
              gap-2
              rounded-xl
              border
              border-slate-200
              bg-white
              px-4
              py-2.5
              text-sm
              font-semibold
              text-slate-700
              shadow-sm
              transition
              hover:border-pink-200
              hover:bg-pink-50
              hover:text-pink-700
              disabled:cursor-not-allowed
              disabled:opacity-60
              sm:w-auto
            "
          >

            {refreshing ? (
              <Loader2
                size={16}
                className="animate-spin"
              />
            ) : (
              <RefreshCw size={16} />
            )}

            {refreshing
              ? "Refreshing..."
              : "Refresh"}

          </button>

        </div>


        {/* =================================================
            ERROR
        ================================================= */}

        {error && (
          <div
            className="
              mb-5
              flex
              flex-col
              gap-3
              rounded-xl
              border
              border-red-200
              bg-red-50
              p-4
              sm:flex-row
              sm:items-center
              sm:justify-between
            "
          >

            <div className="flex items-start gap-3">

              <AlertCircle
                size={19}
                className="mt-0.5 shrink-0 text-red-600"
              />

              <div>
                <p className="text-sm font-semibold text-red-800">
                  Unable to load tasks
                </p>

                <p className="mt-0.5 break-words text-xs text-red-600">
                  {error}
                </p>
              </div>

            </div>


            <button
              type="button"
              onClick={() => loadTasks(true)}
              className="
                rounded-lg
                bg-red-600
                px-3
                py-2
                text-xs
                font-semibold
                text-white
                hover:bg-red-700
              "
            >
              Try Again
            </button>

          </div>
        )}


        {/* =================================================
            STAT CARDS
        ================================================= */}

        <div
          className="
            mb-5
            grid
            grid-cols-2
            gap-3
            lg:grid-cols-4
          "
        >

          <StatCard
            title="Total Tasks"
            value={stats.total}
            description="All assigned tasks"
            icon={ListTodo}
            iconClass="bg-pink-50 text-pink-600"
          />

          <StatCard
            title="Ongoing"
            value={stats.ongoing}
            description="Currently in progress"
            icon={Clock3}
            iconClass="bg-blue-50 text-blue-600"
          />

          <StatCard
            title="Completed"
            value={stats.completed}
            description="Successfully completed"
            icon={CheckCircle2}
            iconClass="bg-emerald-50 text-emerald-600"
          />

          <StatCard
            title="On Hold"
            value={stats.onHold}
            description="Pending or on hold"
            icon={AlertCircle}
            iconClass="bg-amber-50 text-amber-600"
          />

        </div>


        {/* =================================================
            FILTER TOOLBAR
        ================================================= */}

        <section
          className="
            mb-5
            rounded-2xl
            border
            border-slate-200
            bg-white
            p-4
            shadow-sm
          "
        >

          <div
            className="
              mb-3
              flex
              flex-col
              gap-2
              sm:flex-row
              sm:items-center
              sm:justify-between
            "
          >

            <div className="flex items-center gap-2">

              <Filter
                size={16}
                className="text-pink-600"
              />

              <h2 className="text-sm font-bold text-slate-700">
                Search &amp; Filter
              </h2>

              {hasActiveFilters && (
                <span
                  className="
                    rounded-full
                    bg-pink-100
                    px-2
                    py-0.5
                    text-[10px]
                    font-bold
                    text-pink-700
                  "
                >
                  Active
                </span>
              )}

            </div>


            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="
                  inline-flex
                  items-center
                  gap-1
                  self-start
                  text-xs
                  font-semibold
                  text-pink-600
                  hover:text-pink-700
                  sm:self-auto
                "
              >
                <X size={13} />
                Clear filters
              </button>
            )}

          </div>


          <div
            className="
              grid
              grid-cols-1
              gap-3
              md:grid-cols-[minmax(0,1fr)_180px_180px]
            "
          >

            {/* Search */}
            <div className="relative">

              <Search
                size={17}
                className="
                  pointer-events-none
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
                placeholder="Search task, assignee, requester, vendor..."
                className="
                  h-11
                  w-full
                  rounded-xl
                  border
                  border-slate-200
                  bg-slate-50
                  pl-10
                  pr-4
                  text-sm
                  text-slate-700
                  outline-none
                  transition
                  placeholder:text-slate-400
                  focus:border-pink-400
                  focus:bg-white
                  focus:ring-2
                  focus:ring-pink-100
                "
              />

            </div>


            {/* Status */}
            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(
                  event.target.value
                )
              }
              className="
                h-11
                w-full
                rounded-xl
                border
                border-slate-200
                bg-slate-50
                px-3
                text-sm
                font-medium
                text-slate-700
                outline-none
                focus:border-pink-400
                focus:bg-white
                focus:ring-2
                focus:ring-pink-100
              "
            >

              {statuses.map((status) => (
                <option
                  key={status}
                  value={status}
                >
                  {status === "All"
                    ? "All Statuses"
                    : status}
                </option>
              ))}

            </select>


            {/* Priority */}
            <select
              value={priorityFilter}
              onChange={(event) =>
                setPriorityFilter(
                  event.target.value
                )
              }
              className="
                h-11
                w-full
                rounded-xl
                border
                border-slate-200
                bg-slate-50
                px-3
                text-sm
                font-medium
                text-slate-700
                outline-none
                focus:border-pink-400
                focus:bg-white
                focus:ring-2
                focus:ring-pink-100
              "
            >

              {priorities.map((priority) => (
                <option
                  key={priority}
                  value={priority}
                >
                  {priority === "All"
                    ? "All Priorities"
                    : priority}
                </option>
              ))}

            </select>

          </div>

        </section>


        {/* =================================================
            RESULTS HEADER
        ================================================= */}

        <div
          className="
            mb-3
            flex
            flex-col
            gap-1
            sm:flex-row
            sm:items-center
            sm:justify-between
          "
        >

          <div>

            <h2 className="text-sm font-bold text-slate-700">
              Task List
            </h2>

            <p className="text-xs text-slate-400">
              Showing{" "}
              <span className="font-semibold text-slate-600">
                {filteredTasks.length}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-slate-600">
                {tasks.length}
              </span>{" "}
              tasks
            </p>

          </div>

        </div>


        {/* =================================================
            LOADING
        ================================================= */}

        {loading && (
          <div
            className="
              flex
              min-h-[280px]
              flex-col
              items-center
              justify-center
              rounded-2xl
              border
              border-slate-200
              bg-white
            "
          >

            <Loader2
              size={30}
              className="animate-spin text-pink-600"
            />

            <p className="mt-3 text-sm font-semibold text-slate-600">
              Loading tasks...
            </p>

            <p className="mt-1 text-xs text-slate-400">
              Please wait while the latest data is retrieved.
            </p>

          </div>
        )}


        {/* =================================================
            EMPTY STATE
        ================================================= */}

        {!loading &&
          filteredTasks.length === 0 && (
            <div
              className="
                flex
                min-h-[280px]
                flex-col
                items-center
                justify-center
                rounded-2xl
                border
                border-dashed
                border-slate-300
                bg-white
                px-5
                text-center
              "
            >

              <div
                className="
                  flex
                  h-14
                  w-14
                  items-center
                  justify-center
                  rounded-full
                  bg-slate-100
                  text-slate-400
                "
              >
                <ListTodo size={25} />
              </div>

              <h3 className="mt-4 text-sm font-bold text-slate-700">
                No tasks found
              </h3>

              <p className="mt-1 max-w-sm text-xs text-slate-400">
                Try changing your search term or filters.
              </p>

              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="
                    mt-4
                    rounded-lg
                    bg-pink-600
                    px-4
                    py-2
                    text-xs
                    font-semibold
                    text-white
                    hover:bg-pink-700
                  "
                >
                  Clear Filters
                </button>
              )}

            </div>
          )}


        {/* =================================================
            MOBILE CARDS
        ================================================= */}

        {!loading &&
          filteredTasks.length > 0 && (
            <div className="space-y-3 md:hidden">

              {filteredTasks.map(
                (task, index) => (
                  <MobileTaskCard
                    key={getTaskKey(
                      task,
                      index
                    )}
                    task={task}
                    taskKey={getTaskKey(
                      task,
                      index
                    )}
                    onViewDetails={
                      setSelectedTask
                    }
                  />
                )
              )}

            </div>
          )}


        {/* =================================================
            DESKTOP TABLE
        ================================================= */}

        {!loading &&
          filteredTasks.length > 0 && (
            <div
              className="
                hidden
                overflow-hidden
                rounded-2xl
                border
                border-slate-200
                bg-white
                shadow-sm
                md:block
              "
            >

              <div className="overflow-x-auto">

                <table className="w-full min-w-[1050px] border-collapse">

                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50">

                      <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        Task
                      </th>

                      <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        Assigned To
                      </th>

                      <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        Priority
                      </th>

                      <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        Timeline
                      </th>

                      <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        Status
                      </th>

                      <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        Requester
                      </th>

                      <th className="px-4 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        Details
                      </th>

                    </tr>
                  </thead>


                  <tbody>

                    {filteredTasks.map(
                      (task, index) => (
                        <tr
                          key={getTaskKey(
                            task,
                            index
                          )}
                          className="
                            border-b
                            border-slate-100
                            last:border-b-0
                            transition
                            hover:bg-pink-50/30
                          "
                        >

                          {/* Task */}
                          <td className="max-w-[320px] px-4 py-4">

                            <div className="flex items-start gap-3">

                              <div
                                className="
                                  mt-0.5
                                  flex
                                  h-8
                                  w-8
                                  shrink-0
                                  items-center
                                  justify-center
                                  rounded-lg
                                  bg-pink-50
                                  text-xs
                                  font-bold
                                  text-pink-600
                                "
                              >
                                {task.SN || "—"}
                              </div>

                              <div className="min-w-0">

                                <p className="break-words text-sm font-semibold text-slate-700">
                                  {task[
                                    "Task Title"
                                  ] ||
                                    "Untitled Task"}
                                </p>

                                <p className="mt-1 text-[11px] text-slate-400">
                                  FY:{" "}
                                  {task.FY ||
                                    "—"}
                                </p>

                              </div>

                            </div>

                          </td>


                          {/* Assigned */}
                          <td className="px-4 py-4">

                            <div className="flex items-center gap-2">

                              <div
                                className="
                                  flex
                                  h-7
                                  w-7
                                  shrink-0
                                  items-center
                                  justify-center
                                  rounded-full
                                  bg-slate-100
                                  text-slate-500
                                "
                              >
                                <User size={13} />
                              </div>

                              <span className="max-w-[150px] truncate text-xs font-semibold text-slate-700">
                                {task[
                                  "Assigned to"
                                ] || "—"}
                              </span>

                            </div>

                          </td>


                          {/* Priority */}
                          <td className="px-4 py-4">
                            <PriorityBadge
                              priority={
                                task.Priority
                              }
                            />
                          </td>


                          {/* Timeline */}
                          <td className="px-4 py-4">

                            <div className="text-xs">

                              <div className="flex items-center gap-1.5 text-slate-600">
                                <CalendarDays
                                  size={13}
                                  className="text-slate-400"
                                />

                                {formatDate(
                                  task[
                                    "Starting Date"
                                  ]
                                )}
                              </div>

                              <div className="mt-1 text-[10px] text-slate-400">
                                →{" "}
                                {formatDate(
                                  task[
                                    "End Date"
                                  ]
                                )}
                              </div>

                            </div>

                          </td>


                          {/* Status */}
                          <td className="min-w-[150px] px-4 py-4">

                            <StatusBadge
                              status={
                                task.Status
                              }
                            />

                            <ProgressBar
                              status={
                                task.Status
                              }
                            />

                          </td>


                          {/* Requester */}
                          <td className="max-w-[170px] px-4 py-4">

                            <p className="truncate text-xs font-medium text-slate-600">
                              {task[
                                "Requester (Unit/Client)"
                              ] ||
                                "—"}
                            </p>

                          </td>


                          {/* Details */}
                          <td className="px-4 py-4 text-right">

                            <button
                              type="button"
                              onClick={() =>
                                setSelectedTask(
                                  task
                                )
                              }
                              className="
                                inline-flex
                                items-center
                                gap-1
                                rounded-lg
                                border
                                border-slate-200
                                bg-white
                                px-3
                                py-2
                                text-xs
                                font-semibold
                                text-slate-600
                                transition
                                hover:border-pink-200
                                hover:bg-pink-50
                                hover:text-pink-700
                              "
                            >
                              View
                              <ChevronRight
                                size={13}
                              />
                            </button>

                          </td>

                        </tr>
                      )
                    )}

                  </tbody>

                </table>

              </div>

            </div>
          )}

      </div>


      {/* ===================================================
          DETAILS MODAL
      =================================================== */}

      <TaskDetailsModal
        task={selectedTask}
        onClose={() =>
          setSelectedTask(null)
        }
      />

    </div>
  );
};


export default IndividualTask;
