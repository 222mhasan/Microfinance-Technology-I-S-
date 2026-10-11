
import { useCallback, useEffect, useMemo, useState } from "react";

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
  Users,
  X,
  CirclePause,
  RotateCcw,
  ClipboardList,
  Building2,
} from "lucide-react";

import { fetchIndividualTasks } from "../../services/api";


/* =========================================================
   HELPERS
========================================================= */

const normalize = (value) =>
  String(value ?? "")
    .trim()
    .toLowerCase();


const displayValue = (value) =>
  String(value ?? "").trim() || "—";


const formatDate = (value) =>
  String(value ?? "").trim() || "—";


const getTaskKey = (task, index) =>
  `${task.SN || task["Task Title"] || "task"}-${index}`;


/* =========================================================
   STATUS HELPERS
========================================================= */

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

  if (value.includes("start")) {
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
        "border-emerald-200 bg-emerald-50 text-emerald-700",
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
        "border-amber-200 bg-amber-50 text-amber-700",
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
        "border-blue-200 bg-blue-50 text-blue-700",
      dot: "bg-blue-500",
      bar: "bg-blue-500",
    };
  }

  return {
    badge:
      "border-slate-200 bg-slate-50 text-slate-600",
    dot: "bg-slate-400",
    bar: "bg-slate-400",
  };
};


const getPriorityStyle = (priority) => {
  const value = normalize(priority);

  if (
    value === "high" ||
    value === "urgent"
  ) {
    return "border-red-200 bg-red-50 text-red-700";
  }

  if (
    value === "medium" ||
    value === "normal"
  ) {
    return "border-amber-200 bg-amber-50 text-amber-700";
  }

  if (value === "low") {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  return "border-slate-200 bg-slate-50 text-slate-600";
};


/* =========================================================
   FOCAL HELPERS
========================================================= */

const getTaskFocals = (task) => {
  return [
    task["Assigned to"],
    task["Focal-1"],
    task["Focal-2"],
    task["Focal 1"],
    task["Focal 2"],
    task.Focal,
  ]
    .map((value) =>
      String(value ?? "").trim()
    )
    .filter(Boolean);
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
        whitespace-nowrap
        rounded-full
        border
        px-2.5
        py-1
        text-xs
        font-semibold
        ${style.badge}
      `}
    >
      <span
        className={`
          h-1.5
          w-1.5
          rounded-full
          ${style.dot}
        `}
      />

      {displayValue(status) === "—"
        ? "Not Set"
        : status}
    </span>
  );
};


const PriorityBadge = ({ priority }) => (
  <span
    className={`
      inline-flex
      whitespace-nowrap
      rounded-full
      border
      px-2.5
      py-1
      text-xs
      font-semibold
      ${getPriorityStyle(priority)}
    `}
  >
    {displayValue(priority) === "—"
      ? "Not Set"
      : priority}
  </span>
);


const ProgressBar = ({ status }) => {
  const progress =
    getStatusProgress(status);

  const style =
    getStatusStyle(status);

  return (
    <div className="mt-2">

      <div className="mb-1 flex items-center justify-between">

        <span className="text-[10px] font-medium text-slate-400">
          Status progress
        </span>

        <span className="text-[10px] font-bold text-slate-500">
          {progress}%
        </span>

      </div>

      <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">

        <div
          className={`
            h-full
            rounded-full
            transition-all
            duration-500
            ${style.bar}
          `}
          style={{
            width: `${progress}%`,
          }}
        />

      </div>

    </div>
  );
};


/* =========================================================
   STAT CARD
========================================================= */

const StatCard = ({
  title,
  value,
  description,
  icon: Icon,
  colorClass,
  active,
  onClick,
}) => (
  <button
    type="button"
    onClick={onClick}
    aria-pressed={active}
    className={`
      group
      w-full
      rounded-2xl
      border
      p-4
      text-left
      transition
      duration-200
      hover:-translate-y-0.5
      hover:shadow-md

      ${
        active
          ? "border-pink-300 bg-pink-50/70 ring-1 ring-pink-200"
          : "border-slate-200 bg-white hover:border-pink-200"
      }
    `}
  >

    <div className="flex items-center justify-between gap-3">

      <div className="min-w-0">

        <p className="text-xs font-semibold text-slate-500">
          {title}
        </p>

        <p className="mt-1 text-2xl font-bold tracking-tight text-slate-800 sm:text-3xl">
          {value}
        </p>

        <p className="mt-1 text-[11px] text-slate-400">
          {description}
        </p>

      </div>

      <div
        className={`
          flex
          h-11
          w-11
          shrink-0
          items-center
          justify-center
          rounded-xl
          ${colorClass}
        `}
      >
        <Icon size={21} />
      </div>

    </div>

  </button>
);


/* =========================================================
   SECTION HEADING
========================================================= */

const SectionHeading = ({
  icon: Icon,
  title,
  description,
  action,
}) => (
  <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">

    <div className="flex items-center gap-3">

      <div
        className="
          flex
          h-9
          w-9
          items-center
          justify-center
          rounded-xl
          bg-pink-50
          text-pink-600
        "
      >
        <Icon size={18} />
      </div>

      <div>

        <h2 className="text-sm font-bold text-slate-800">
          {title}
        </h2>

        {description && (
          <p className="mt-0.5 text-xs text-slate-400">
            {description}
          </p>
        )}

      </div>

    </div>

    {action}

  </div>
);


/* =========================================================
   INFO ITEM
========================================================= */

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
          {displayValue(value)}
        </p>

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

    if (!task) return undefined;

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

  }, [task, onClose]);


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
        bg-slate-950/50
        p-3
        backdrop-blur-sm
        sm:p-6
      "
      onMouseDown={(event) => {

        if (
          event.target ===
          event.currentTarget
        ) {
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

        {/* HEADER */}

        <div
          className="
            flex
            items-start
            justify-between
            gap-4
            border-b
            border-slate-100
            bg-gradient-to-r
            from-pink-50
            to-white
            px-5
            py-4
            sm:px-6
          "
        >

          <div className="min-w-0">

            <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-pink-600">
              Individual Task · #{displayValue(task.SN)}
            </p>

            <h2 className="break-words text-lg font-bold text-slate-800">
              {task["Task Title"] ||
                "Untitled Task"}
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Review assignment, timeline,
              focal persons and remarks.
            </p>

          </div>


          <button
            type="button"
            onClick={onClose}
            aria-label="Close details"
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
              hover:bg-white
              hover:text-slate-700
            "
          >
            <X size={18} />
          </button>

        </div>


        {/* BODY */}

        <div className="overflow-y-auto p-5 sm:p-6">

          <div className="mb-5 flex flex-wrap items-center gap-2">

            <StatusBadge
              status={task.Status}
            />

            <PriorityBadge
              priority={task.Priority}
            />

            <span
              className="
                rounded-full
                border
                border-slate-200
                bg-white
                px-2.5
                py-1
                text-xs
                font-semibold
                text-slate-500
              "
            >
              FY: {displayValue(task.FY)}
            </span>

          </div>


          {/* INFORMATION */}

          <div
            className="
              grid
              grid-cols-1
              gap-3
              sm:grid-cols-2
            "
          >

            <InfoItem
              icon={User}
              label="Assigned To"
              value={task["Assigned to"]}
            />

            <InfoItem
              icon={Users}
              label="Focal-1"
              value={
                task["Focal-1"] ||
                task["Focal 1"]
              }
            />

            <InfoItem
              icon={Users}
              label="Focal-2"
              value={
                task["Focal-2"] ||
                task["Focal 2"]
              }
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
                task[
                  "Duration (C.Days)"
                ]
                  ? `${task["Duration (C.Days)"]} days`
                  : "—"
              }
            />

            <InfoItem
              icon={Building2}
              label="Requester / Unit"
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

          </div>


          {/* MILESTONE */}

          <div className="mt-5">

            <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">
              Milestone / Current Status
            </p>

            <div
              className="
                whitespace-pre-wrap
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
              ] ||
                "No milestone information available."}
            </div>

          </div>


          {/* REMARKS */}

          <div className="mt-5">

            <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">
              Remarks / Note
            </p>

            <div
              className="
                whitespace-pre-wrap
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


          {/* PROGRESS */}

          <div className="mt-5">

            <ProgressBar
              status={task.Status}
            />

          </div>

        </div>


        {/* FOOTER */}

        <div
          className="
            flex
            justify-end
            border-t
            border-slate-100
            bg-slate-50
            px-5
            py-3
          "
        >

          <button
            type="button"
            onClick={onClose}
            className="
              rounded-lg
              bg-slate-800
              px-4
              py-2
              text-xs
              font-semibold
              text-white
              transition
              hover:bg-slate-700
            "
          >
            Close Details
          </button>

        </div>

      </div>

    </div>
  );
};


/* =========================================================
   MOBILE TASK CARD
========================================================= */

const MobileTaskCard = ({
  task,
  onViewDetails,
}) => (

  <article
    className="
      rounded-2xl
      border
      border-slate-200
      bg-white
      p-4
      shadow-sm
      transition
      hover:border-pink-200
      hover:shadow-md
    "
  >

    <div className="flex items-start justify-between gap-3">

      <div className="min-w-0">

        <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-pink-600">
          Task #{displayValue(task.SN)}
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


    <div className="mt-4 flex flex-wrap items-center gap-2">

      <StatusBadge
        status={task.Status}
      />

      {task.FY && (
        <span
          className="
            rounded-full
            bg-slate-100
            px-2.5
            py-1
            text-xs
            font-medium
            text-slate-600
          "
        >
          FY {task.FY}
        </span>
      )}

    </div>


    <div className="mt-4 grid grid-cols-2 gap-3">

      <div>

        <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">
          Assigned To
        </p>

        <p className="mt-1 break-words text-xs font-semibold text-slate-700">
          {displayValue(
            task["Assigned to"]
          )}
        </p>

      </div>


      <div>

        <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">
          Focal-2
        </p>

        <p className="mt-1 break-words text-xs font-semibold text-slate-700">
          {displayValue(
            task["Focal-2"] ||
            task["Focal 2"]
          )}
        </p>

      </div>


      <div>

        <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">
          Start Date
        </p>

        <p className="mt-1 text-xs font-semibold text-slate-700">
          {formatDate(
            task["Starting Date"]
          )}
        </p>

      </div>


      <div>

        <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">
          End Date
        </p>

        <p className="mt-1 text-xs font-semibold text-slate-700">
          {formatDate(
            task["End Date"]
          )}
        </p>

      </div>

    </div>


    <ProgressBar
      status={task.Status}
    />


    <div
      className="
        mt-4
        flex
        items-center
        justify-between
        gap-3
        border-t
        border-slate-100
        pt-3
      "
    >

      <p className="max-w-[65%] truncate text-xs text-slate-400">
        {task[
          "Requester (Unit/Client)"
        ] ||
          "No requester"}
      </p>


      <button
        type="button"
        onClick={() =>
          onViewDetails(task)
        }
        className="
          inline-flex
          items-center
          gap-1.5
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

        View Details

      </button>

    </div>

  </article>
);


/* =========================================================
   MAIN COMPONENT
========================================================= */

const IndividualTask = () => {

  const [tasks, setTasks] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] =
    useState("");


  /* FILTER STATES */

  const [searchTerm, setSearchTerm] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState("All");

  const [priorityFilter, setPriorityFilter] =
    useState("All");

  const [focalFilter, setFocalFilter] =
    useState("All");


  /* MODAL */

  const [selectedTask, setSelectedTask] =
    useState(null);


  /* =====================================================
     LOAD DATA
  ===================================================== */

  const loadTasks = useCallback(
    async (forceRefresh = false) => {

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


        setTasks(
          Array.isArray(data)
            ? data
            : []
        );

      } catch (err) {

        console.error(
          "Individual Task Error:",
          err
        );

        setError(
          err?.message ||
            "Unable to load individual tasks."
        );

      } finally {

        setLoading(false);
        setRefreshing(false);

      }

    },
    []
  );


  useEffect(() => {

    loadTasks(false);

  }, [loadTasks]);


  /* =====================================================
     DYNAMIC STATUS OPTIONS
  ===================================================== */

  const statuses = useMemo(() => {

    const values =
      tasks
        .map((task) =>
          String(
            task.Status ?? ""
          ).trim()
        )
        .filter(Boolean);


    return [
      "All",
      ...Array.from(
        new Set(values)
      ).sort((a, b) =>
        a.localeCompare(b)
      ),
    ];

  }, [tasks]);


  /* =====================================================
     DYNAMIC PRIORITY OPTIONS
  ===================================================== */

  const priorities = useMemo(() => {

    const values =
      tasks
        .map((task) =>
          String(
            task.Priority ?? ""
          ).trim()
        )
        .filter(Boolean);


    return [
      "All",
      ...Array.from(
        new Set(values)
      ).sort((a, b) =>
        a.localeCompare(b)
      ),
    ];

  }, [tasks]);


  /* =====================================================
     DYNAMIC FOCAL OPTIONS
  ===================================================== */

  const focals = useMemo(() => {

    const values =
      tasks.flatMap(
        getTaskFocals
      );


    return [
      "All",
      ...Array.from(
        new Set(values)
      ).sort((a, b) =>
        a.localeCompare(b)
      ),
    ];

  }, [tasks]);


  /* =====================================================
     STATISTICS
  ===================================================== */

  const stats = useMemo(() => {

    return {

      total: tasks.length,

      ongoing:
        tasks.filter(
          isOngoing
        ).length,

      completed:
        tasks.filter(
          isCompleted
        ).length,

      onHold:
        tasks.filter(
          isOnHold
        ).length,

    };

  }, [tasks]);


  /* =====================================================
     FILTER TASKS
  ===================================================== */

  const filteredTasks = useMemo(() => {

    const search =
      normalize(searchTerm);


    return tasks.filter(
      (task) => {

        const searchableText =
          Object.values(task)
            .filter(
              (value) =>
                value !== null &&
                value !== undefined
            )
            .map(String)
            .join(" ")
            .toLowerCase();


        const matchesSearch =
          !search ||
          searchableText.includes(
            search
          );


        const matchesStatus =
          statusFilter === "All" ||
          normalize(
            task.Status
          ) ===
            normalize(
              statusFilter
            );


        const matchesPriority =
          priorityFilter === "All" ||
          normalize(
            task.Priority
          ) ===
            normalize(
              priorityFilter
            );


        const matchesFocal =
          focalFilter === "All" ||
          getTaskFocals(
            task
          ).some(
            (focal) =>
              normalize(
                focal
              ) ===
                normalize(
                  focalFilter
                )
          );


        return (
          matchesSearch &&
          matchesStatus &&
          matchesPriority &&
          matchesFocal
        );

      }
    );

  }, [
    tasks,
    searchTerm,
    statusFilter,
    priorityFilter,
    focalFilter,
  ]);


  /* =====================================================
     FILTER CONTROLS
  ===================================================== */

  const clearFilters = () => {

    setSearchTerm("");
    setStatusFilter("All");
    setPriorityFilter("All");
    setFocalFilter("All");

  };


  const hasActiveFilters =
    Boolean(
      searchTerm.trim()
    ) ||
    statusFilter !== "All" ||
    priorityFilter !== "All" ||
    focalFilter !== "All";


  const selectStatus = (
    status
  ) => {

    setStatusFilter(
      (current) =>
        current === status
          ? "All"
          : status
    );

  };


  /* =====================================================
     RENDER
  ===================================================== */

  return (

    <div
      className="
        dashboard-fade
        min-h-screen
        bg-slate-50
      "
    >

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
            HEADER
        ================================================= */}

        <header
          className="
            relative
            mb-6
            overflow-hidden
            rounded-2xl
            bg-gradient-to-r
            from-pink-700
            via-pink-600
            to-rose-500
            p-5
            text-white
            shadow-md
            sm:p-7
          "
        >

          <div
            className="
              pointer-events-none
              absolute
              -right-10
              -top-16
              h-56
              w-56
              rounded-full
              border-[28px]
              border-white/10
            "
          />

          <div
            className="
              pointer-events-none
              absolute
              -bottom-20
              right-40
              h-48
              w-48
              rounded-full
              bg-white/10
              blur-2xl
            "
          />


          <div
            className="
              relative
              flex
              flex-col
              gap-5
              sm:flex-row
              sm:items-center
              sm:justify-between
            "
          >

            <div
              className="
                flex
                items-start
                gap-3
              "
            >

              <div
                className="
                  flex
                  h-12
                  w-12
                  shrink-0
                  items-center
                  justify-center
                  rounded-xl
                  border
                  border-white/20
                  bg-white/15
                  shadow-sm
                "
              >
                <ListTodo size={24} />
              </div>


              <div className="min-w-0">

                <p
                  className="
                    text-[10px]
                    font-bold
                    uppercase
                    tracking-[0.2em]
                    text-pink-100
                  "
                >
                  Microfinance Technology
                </p>

                <h1
                  className="
                    mt-1
                    text-xl
                    font-bold
                    sm:text-2xl
                  "
                >
                  Individual Tasks
                </h1>

                <p
                  className="
                    mt-1
                    max-w-xl
                    text-xs
                    leading-5
                    text-pink-50
                    sm:text-sm
                  "
                >
                  Track assignments, focal persons,
                  timelines and delivery status in
                  one place.
                </p>

              </div>

            </div>


            <button
              type="button"
              onClick={() =>
                loadTasks(true)
              }
              disabled={refreshing}
              className="
                inline-flex
                items-center
                justify-center
                gap-2
                self-start
                rounded-xl
                border
                border-white/25
                bg-white/15
                px-4
                py-2.5
                text-sm
                font-semibold
                text-white
                backdrop-blur-sm
                transition
                hover:bg-white/25
                disabled:cursor-not-allowed
                disabled:opacity-60
                sm:self-auto
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
                : "Refresh Data"}

            </button>

          </div>


          <div
            className="
              relative
              mt-5
              flex
              flex-wrap
              gap-2
            "
          >

            <span
              className="
                rounded-full
                border
                border-white/20
                bg-white/10
                px-3
                py-1.5
                text-xs
                text-white
              "
            >
              <ClipboardList
                size={13}
                className="mr-1.5 inline"
              />

              {stats.total} total tasks

            </span>


            <span
              className="
                rounded-full
                border
                border-white/20
                bg-white/10
                px-3
                py-1.5
                text-xs
                text-white
              "
            >
              <Users
                size={13}
                className="mr-1.5 inline"
              />

              {Math.max(
                focals.length - 1,
                0
              )}{" "}
              focal persons

            </span>

          </div>

        </header>


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

            <div
              className="
                flex
                items-start
                gap-3
              "
            >

              <AlertCircle
                size={19}
                className="
                  mt-0.5
                  shrink-0
                  text-red-600
                "
              />

              <div>

                <p
                  className="
                    text-sm
                    font-semibold
                    text-red-800
                  "
                >
                  Unable to load tasks
                </p>

                <p
                  className="
                    mt-0.5
                    break-words
                    text-xs
                    text-red-600
                  "
                >
                  {error}
                </p>

              </div>

            </div>


            <button
              type="button"
              onClick={() =>
                loadTasks(true)
              }
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
            OVERVIEW
        ================================================= */}

        <SectionHeading
          icon={Target}
          title="Task Overview"
          description="Click a card to filter the task list by status."
        />


        <div
          className="
            mb-7
            grid
            grid-cols-2
            gap-3
            xl:grid-cols-4
          "
        >

          <StatCard
            title="Total Tasks"
            value={stats.total}
            description="All assigned tasks"
            icon={ListTodo}
            colorClass="bg-pink-50 text-pink-600"
            active={
              statusFilter === "All"
            }
            onClick={() =>
              setStatusFilter("All")
            }
          />


          <StatCard
            title="Ongoing"
            value={stats.ongoing}
            description="Currently in progress"
            icon={Clock3}
            colorClass="bg-blue-50 text-blue-600"
            active={
              statusFilter === "ongoing"
            }
            onClick={() =>
              selectStatus("ongoing")
            }
          />


          <StatCard
            title="Completed"
            value={stats.completed}
            description="Successfully completed"
            icon={CheckCircle2}
            colorClass="bg-emerald-50 text-emerald-600"
            active={
              statusFilter === "completed"
            }
            onClick={() =>
              selectStatus("completed")
            }
          />


          <StatCard
            title="On Hold"
            value={stats.onHold}
            description="Pending or on hold"
            icon={CirclePause}
            colorClass="bg-amber-50 text-amber-600"
            active={
              statusFilter === "hold"
            }
            onClick={() =>
              selectStatus("hold")
            }
          />

        </div>


        {/* =================================================
            FILTER SECTION
        ================================================= */}

        <section
          className="
            mb-6
            rounded-2xl
            border
            border-slate-200
            bg-white
            p-4
            shadow-sm
            sm:p-5
          "
        >

          <SectionHeading
            icon={Filter}
            title="Find & Filter Tasks"
            description="
              Combine focal-wise, status,
              priority and keyword filters.
            "
            action={
              hasActiveFilters ? (

                <button
                  type="button"
                  onClick={clearFilters}
                  className="
                    inline-flex
                    items-center
                    gap-1.5
                    self-start
                    rounded-lg
                    px-3
                    py-2
                    text-xs
                    font-semibold
                    text-pink-700
                    transition
                    hover:bg-pink-50
                    sm:self-auto
                  "
                >

                  <RotateCcw size={13} />

                  Reset filters

                </button>

              ) : null
            }
          />


          <div
            className="
              grid
              grid-cols-1
              gap-3
              sm:grid-cols-2
              xl:grid-cols-4
            "
          >

            {/* SEARCH */}

            <div
              className="
                relative
                sm:col-span-2
                xl:col-span-1
              "
            >

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
                placeholder="
                  Search task, person,
                  vendor...
                "
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


            {/* FOCAL FILTER */}

            <div className="relative">

              <Users
                size={16}
                className="
                  pointer-events-none
                  absolute
                  left-3
                  top-1/2
                  -translate-y-1/2
                  text-pink-600
                "
              />

              <select
                value={focalFilter}
                onChange={(event) =>
                  setFocalFilter(
                    event.target.value
                  )
                }
                aria-label="Filter by focal person"
                className="
                  h-11
                  w-full
                  appearance-none
                  rounded-xl
                  border
                  border-pink-200
                  bg-pink-50/50
                  pl-9
                  pr-8
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

                {focals.map(
                  (focal) => (
                    <option
                      key={focal}
                      value={focal}
                    >
                      {focal === "All"
                        ? "All Focal Persons"
                        : focal}
                    </option>
                  )
                )}

              </select>


              <ChevronRight
                size={15}
                className="
                  pointer-events-none
                  absolute
                  right-3
                  top-1/2
                  -translate-y-1/2
                  rotate-90
                  text-slate-400
                "
              />

            </div>


            {/* STATUS */}

            <div className="relative">

              <CheckCircle2
                size={16}
                className="
                  pointer-events-none
                  absolute
                  left-3
                  top-1/2
                  -translate-y-1/2
                  text-slate-400
                "
              />

              <select
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(
                    event.target.value
                  )
                }
                aria-label="Filter by status"
                className="
                  h-11
                  w-full
                  appearance-none
                  rounded-xl
                  border
                  border-slate-200
                  bg-slate-50
                  pl-9
                  pr-8
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

                <option value="All">
                  All Statuses
                </option>

                {statuses
                  .filter(
                    (status) =>
                      status !== "All"
                  )
                  .map(
                    (status) => (
                      <option
                        key={status}
                        value={status}
                      >
                        {status}
                      </option>
                    )
                  )}

              </select>


              <ChevronRight
                size={15}
                className="
                  pointer-events-none
                  absolute
                  right-3
                  top-1/2
                  -translate-y-1/2
                  rotate-90
                  text-slate-400
                "
              />

            </div>


            {/* PRIORITY */}

            <div className="relative">

              <Target
                size={16}
                className="
                  pointer-events-none
                  absolute
                  left-3
                  top-1/2
                  -translate-y-1/2
                  text-slate-400
                "
              />

              <select
                value={priorityFilter}
                onChange={(event) =>
                  setPriorityFilter(
                    event.target.value
                  )
                }
                aria-label="Filter by priority"
                className="
                  h-11
                  w-full
                  appearance-none
                  rounded-xl
                  border
                  border-slate-200
                  bg-slate-50
                  pl-9
                  pr-8
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

                <option value="All">
                  All Priorities
                </option>

                {priorities
                  .filter(
                    (priority) =>
                      priority !== "All"
                  )
                  .map(
                    (priority) => (
                      <option
                        key={priority}
                        value={priority}
                      >
                        {priority}
                      </option>
                    )
                  )}

              </select>


              <ChevronRight
                size={15}
                className="
                  pointer-events-none
                  absolute
                  right-3
                  top-1/2
                  -translate-y-1/2
                  rotate-90
                  text-slate-400
                "
              />

            </div>

          </div>


          {/* ACTIVE FILTER SUMMARY */}

          <div
            className="
              mt-4
              flex
              flex-wrap
              items-center
              justify-between
              gap-2
              border-t
              border-slate-100
              pt-3
            "
          >

            <p className="text-xs text-slate-500">

              Showing{" "}

              <span className="font-bold text-slate-800">
                {filteredTasks.length}
              </span>{" "}

              of{" "}

              <span className="font-bold text-slate-800">
                {tasks.length}
              </span>{" "}

              tasks

            </p>


            <div
              className="
                flex
                flex-wrap
                gap-2
              "
            >

              {focalFilter !==
                "All" && (

                <span
                  className="
                    rounded-full
                    bg-pink-50
                    px-2.5
                    py-1
                    text-[11px]
                    font-semibold
                    text-pink-700
                  "
                >
                  Focal: {focalFilter}
                </span>

              )}


              {statusFilter !==
                "All" && (

                <span
                  className="
                    rounded-full
                    bg-blue-50
                    px-2.5
                    py-1
                    text-[11px]
                    font-semibold
                    text-blue-700
                  "
                >
                  Status: {statusFilter}
                </span>

              )}


              {priorityFilter !==
                "All" && (

                <span
                  className="
                    rounded-full
                    bg-amber-50
                    px-2.5
                    py-1
                    text-[11px]
                    font-semibold
                    text-amber-700
                  "
                >
                  Priority: {priorityFilter}
                </span>

              )}

            </div>

          </div>

        </section>


        {/* =================================================
            TASK LIST HEADER
        ================================================= */}

        <div
          className="
            mb-3
            flex
            flex-col
            gap-1
            sm:flex-row
            sm:items-end
            sm:justify-between
          "
        >

          <div>

            <h2
              className="
                text-base
                font-bold
                text-slate-800
              "
            >
              Task Register
            </h2>

            <p
              className="
                mt-0.5
                text-xs
                text-slate-400
              "
            >
              Select a task to view its
              complete information.
            </p>

          </div>


          {!loading && (

            <span
              className="
                text-xs
                font-medium
                text-slate-500
              "
            >
              {filteredTasks.length}{" "}
              result
              {filteredTasks.length ===
              1
                ? ""
                : "s"}
            </span>

          )}

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
              className="
                animate-spin
                text-pink-600
              "
            />

            <p
              className="
                mt-3
                text-sm
                font-semibold
                text-slate-600
              "
            >
              Loading tasks...
            </p>

            <p
              className="
                mt-1
                text-xs
                text-slate-400
              "
            >
              Retrieving the latest task data.
            </p>

          </div>

        )}


        {/* =================================================
            EMPTY
        ================================================= */}

        {!loading &&
          filteredTasks.length ===
            0 && (

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
                <ListTodo
                  size={25}
                />
              </div>


              <h3
                className="
                  mt-4
                  text-sm
                  font-bold
                  text-slate-700
                "
              >
                No tasks found
              </h3>


              <p
                className="
                  mt-1
                  max-w-sm
                  text-xs
                  text-slate-400
                "
              >
                Try another focal person,
                search term or filter
                combination.
              </p>


              {hasActiveFilters && (

                <button
                  type="button"
                  onClick={
                    clearFilters
                  }
                  className="
                    mt-4
                    rounded-lg
                    bg-pink-600
                    px-4
                    py-2
                    text-xs
                    font-semibold
                    text-white
                    transition
                    hover:bg-pink-700
                  "
                >
                  Clear All Filters
                </button>

              )}

            </div>

          )}


        {/* =================================================
            MOBILE
        ================================================= */}

        {!loading &&
          filteredTasks.length >
            0 && (

            <div
              className="
                space-y-3
                md:hidden
              "
            >

              {filteredTasks.map(
                (
                  task,
                  index
                ) => (

                  <MobileTaskCard
                    key={getTaskKey(
                      task,
                      index
                    )}
                    task={task}
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
          filteredTasks.length >
            0 && (

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

              <div
                className="
                  overflow-x-auto
                "
              >

                <table
                  className="
                    w-full
                    min-w-[1100px]
                    border-collapse
                  "
                >

                  <thead>

                    <tr
                      className="
                        border-b
                        border-slate-200
                        bg-slate-50
                      "
                    >

                      <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        Task
                      </th>

                      <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        Assigned To
                      </th>

                      <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        Focal Persons
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
                      (
                        task,
                        index
                      ) => {

                        const focalNames =
                          getTaskFocals(
                            task
                          );


                        return (

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

                            {/* TASK */}

                            <td
                              className="
                                max-w-[300px]
                                px-4
                                py-4
                              "
                            >

                              <div
                                className="
                                  flex
                                  items-start
                                  gap-3
                                "
                              >

                                <div
                                  className="
                                    mt-0.5
                                    flex
                                    h-9
                                    w-9
                                    shrink-0
                                    items-center
                                    justify-center
                                    rounded-xl
                                    bg-pink-50
                                    text-xs
                                    font-bold
                                    text-pink-600
                                  "
                                >
                                  {task.SN ||
                                    "—"}
                                </div>


                                <div className="min-w-0">

                                  <p
                                    className="
                                      break-words
                                      text-sm
                                      font-semibold
                                      text-slate-700
                                    "
                                  >
                                    {task[
                                      "Task Title"
                                    ] ||
                                      "Untitled Task"}
                                  </p>


                                  <p
                                    className="
                                      mt-1
                                      text-[11px]
                                      text-slate-400
                                    "
                                  >
                                    FY:{" "}
                                    {displayValue(
                                      task.FY
                                    )}
                                  </p>

                                </div>

                              </div>

                            </td>


                            {/* ASSIGNED */}

                            <td
                              className="
                                px-4
                                py-4
                              "
                            >

                              <div
                                className="
                                  flex
                                  items-center
                                  gap-2
                                "
                              >

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
                                  <User
                                    size={13}
                                  />
                                </div>


                                <span
                                  className="
                                    max-w-[150px]
                                    truncate
                                    text-xs
                                    font-semibold
                                    text-slate-700
                                  "
                                >
                                  {displayValue(
                                    task[
                                      "Assigned to"
                                    ]
                                  )}
                                </span>

                              </div>

                            </td>


                            {/* FOCAL PERSONS */}

                            <td
                              className="
                                max-w-[190px]
                                px-4
                                py-4
                              "
                            >

                              <div
                                className="
                                  flex
                                  flex-wrap
                                  gap-1
                                "
                              >

                                {focalNames.length >
                                0 ? (

                                  focalNames.map(
                                    (
                                      focal
                                    ) => (

                                      <button
                                        type="button"
                                        key={focal}
                                        onClick={() =>
                                          setFocalFilter(
                                            focal
                                          )
                                        }
                                        title={`Filter by ${focal}`}
                                        className="
                                          max-w-[170px]
                                          truncate
                                          rounded-full
                                          border
                                          border-pink-100
                                          bg-pink-50
                                          px-2
                                          py-1
                                          text-[10px]
                                          font-semibold
                                          text-pink-700
                                          transition
                                          hover:border-pink-300
                                          hover:bg-pink-100
                                        "
                                      >
                                        {focal}
                                      </button>

                                    )
                                  )

                                ) : (

                                  <span className="text-xs text-slate-400">
                                    —
                                  </span>

                                )}

                              </div>

                            </td>


                            {/* PRIORITY */}

                            <td
                              className="
                                px-4
                                py-4
                              "
                            >

                              <PriorityBadge
                                priority={
                                  task.Priority
                                }
                              />

                            </td>


                            {/* TIMELINE */}

                            <td
                              className="
                                px-4
                                py-4
                              "
                            >

                              <div className="text-xs">

                                <div
                                  className="
                                    flex
                                    items-center
                                    gap-1.5
                                    text-slate-600
                                  "
                                >

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


                                <div
                                  className="
                                    mt-1
                                    text-[10px]
                                    text-slate-400
                                  "
                                >
                                  End:{" "}
                                  {formatDate(
                                    task[
                                      "End Date"
                                    ]
                                  )}
                                </div>

                              </div>

                            </td>


                            {/* STATUS */}

                            <td
                              className="
                                min-w-[150px]
                                px-4
                                py-4
                              "
                            >

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


                            {/* REQUESTER */}

                            <td
                              className="
                                max-w-[170px]
                                px-4
                                py-4
                              "
                            >

                              <p
                                className="
                                  truncate
                                  text-xs
                                  font-medium
                                  text-slate-600
                                "
                              >
                                {displayValue(
                                  task[
                                    "Requester (Unit/Client)"
                                  ]
                                )}
                              </p>

                            </td>


                            {/* DETAILS */}

                            <td
                              className="
                                px-4
                                py-4
                                text-right
                              "
                            >

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

                        );

                      }
                    )}

                  </tbody>

                </table>

              </div>


              <div
                className="
                  flex
                  items-center
                  justify-between
                  gap-3
                  border-t
                  border-slate-100
                  bg-slate-50/70
                  px-4
                  py-3
                "
              >

                <p
                  className="
                    text-[11px]
                    text-slate-400
                  "
                >
                  Task register · Filtered
                  results update automatically.
                </p>


                <p
                  className="
                    text-xs
                    font-semibold
                    text-slate-600
                  "
                >
                  {filteredTasks.length} tasks
                </p>

              </div>

            </div>

          )}

      </div>


      {/* =================================================
          DETAILS MODAL
      ================================================= */}

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
