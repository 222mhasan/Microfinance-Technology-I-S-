import React, {
  useCallback,
  useDeferredValue,
  useEffect,
  useMemo,
  useState,
} from "react";

import { fetchISProjectDrive } from "../../services/api";

import {
  FolderKanban,
  Users,
  CheckCircle2,
  Clock3,
  CirclePause,
  XCircle,
  RefreshCw,
  Search,
  ArrowUpDown,
  CalendarDays,
  UserRound,
  BriefcaseBusiness,
  ListChecks,
  X,
  Eye,
  FileText,
  Building2,
  Wallet,
  MessageSquareText,
  FileSpreadsheet,
  FileDown,
} from "lucide-react";

import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

/* =========================================================
   EXPORT COLUMNS
   ONLY THESE FIELDS WILL APPEAR IN EXCEL & PDF
========================================================= */

const EXPORT_COLUMNS = [
  "SN",
  "Type",
  "FY",
  "Title",
  "Activity",
  "Focal-1",
  "Focal-2",
  "Start Date",
  "End Date",
  "Duration",
  "Status",
];

/* =========================================================
   HELPERS
========================================================= */

const normalize = (value) =>
  String(value ?? "")
    .trim()
    .toLowerCase();

const parseDate = (value) => {
  if (!value) return null;

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date;
};

const formatDate = (value) => {
  if (!value) return "-";

  const date = parseDate(value);

  if (!date) {
    return String(value);
  }

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const getStatus = (value) => {
  const status = normalize(value);

  if (
    status.includes("done") ||
    status.includes("complete") ||
    status.includes("completed") ||
    status.includes("closed")
  ) {
    return "Done";
  }

  if (
    status.includes("hold") ||
    status.includes("pause") ||
    status.includes("paused")
  ) {
    return "On Hold";
  }

  if (status.includes("close") || status.includes("cancel")) {
    return "Close";
  }

  if (
    status.includes("ongoing") ||
    status.includes("on going") ||
    status.includes("progress") ||
    status.includes("working")
  ) {
    return "Ongoing";
  }

  if (!value) {
    return "Ongoing";
  }

  return String(value);
};

const getStatusKey = (value) => {
  const status = normalize(getStatus(value));

  if (status === "done") return "done";
  if (status === "on hold") return "hold";
  if (status === "close") return "close";

  return "ongoing";
};

const getStatusStyle = (value) => {
  const key = getStatusKey(value);

  const styles = {
    done: {
      badge:
        "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200",
      dot: "bg-emerald-500",
    },

    ongoing: {
      badge: "bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-200",
      dot: "bg-blue-500",
    },

    hold: {
      badge: "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200",
      dot: "bg-amber-500",
    },

    close: {
      badge: "bg-red-50 text-red-700 ring-1 ring-inset ring-red-200",
      dot: "bg-red-500",
    },
  };

  return styles[key] || styles.ongoing;
};

/* =========================================================
   EXPORT HELPERS
========================================================= */

const formatExportValue = (key, value) => {
  if (value === null || value === undefined || value === "") {
    return "";
  }

  if (key === "Start Date" || key === "End Date") {
    return formatDate(value);
  }

  if (key === "Status") {
    return getStatus(value);
  }

  if (typeof value === "object") {
    try {
      return JSON.stringify(value);
    } catch {
      return String(value);
    }
  }

  return String(value);
};

/*
 * Creates one clean row containing ONLY the 11
 * selected export columns.
 */
const getExportObject = (project) => {
  const result = {};

  EXPORT_COLUMNS.forEach((column) => {
    result[column] = formatExportValue(column, project?.[column]);
  });

  return result;
};

/*
 * Used by selected-project detail export.
 */
const getProjectDetailExportRows = (project) => {
  return EXPORT_COLUMNS.map((column) => ({
    Field: column,
    Details: formatExportValue(column, project?.[column]),
  }));
};

const sanitizeFileName = (value) => {
  return (
    String(value || "IS-Project")
      .replace(/[<>:"/\\|?*\x00-\x1F]/g, "")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 100) || "IS-Project"
  );
};

const getCurrentDateTime = () => {
  return new Date().toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

/* =========================================================
   STATUS BADGE
========================================================= */

const StatusBadge = ({ status }) => {
  const style = getStatusStyle(status);

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${style.badge}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />

      {getStatus(status)}
    </span>
  );
};

/* =========================================================
   SUMMARY METRIC
========================================================= */

const SummaryMetric = ({
  icon: Icon,
  label,
  value,
  colorClass,
  onClick,
  active = false,
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group rounded-2xl border p-4 text-left transition-all ${
        active
          ? "border-pink-300 bg-pink-50 shadow-sm"
          : "border-slate-200 bg-white hover:-translate-y-0.5 hover:border-pink-200 hover:shadow-md"
      }`}
    >
      <div className="flex items-center justify-between">
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-xl ${colorClass}`}
        >
          <Icon size={20} />
        </div>

        <ArrowUpDown
          size={14}
          className="text-slate-300 transition group-hover:text-pink-400"
        />
      </div>

      <p className="mt-3 text-xs font-medium text-slate-500">{label}</p>

      <p className="mt-1 text-2xl font-bold text-slate-900">{value}</p>
    </button>
  );
};

/* =========================================================
   PROJECT DETAIL ROW
========================================================= */

const ProjectDetailRow = ({ icon: Icon, label, value, fullWidth = false }) => {
  return (
    <div
      className={`rounded-xl border border-slate-200 bg-slate-50 p-4 ${
        fullWidth ? "md:col-span-2" : ""
      }`}
    >
      <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
        <Icon size={14} />
        {label}
      </div>

      <div className="whitespace-pre-wrap break-words text-sm font-medium text-slate-800">
        {value || "-"}
      </div>
    </div>
  );
};

/* =========================================================
   MAIN COMPONENT
========================================================= */

const ISProjectDrive = () => {
  const [projects, setProjects] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState("");

  const [selectedFocal, setSelectedFocal] = useState("All");

  const [statusFilter, setStatusFilter] = useState("All");

  const [search, setSearch] = useState("");

  const [sortConfig, setSortConfig] = useState({
    key: "__sheetOrder",
    direction: "desc",
  });

  const [selectedProject, setSelectedProject] = useState(null);

  const deferredSearch = useDeferredValue(search);

  /* =======================================================
     LOAD GOOGLE SHEET DATA
  ======================================================= */

  const loadProjects = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const data = await fetchISProjectDrive();

      if (!Array.isArray(data)) {
        throw new Error("Invalid data received from Google Sheet.");
      }

      const normalizedData = data.map((item, index) => ({
        ...item,
        __sheetOrder: index,
      }));

      setProjects(normalizedData);
    } catch (err) {
      console.error("IS Project & Drive loading error:", err);

      setError(err?.message || "Unable to load IS Project & Drive data.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  /* =======================================================
     SCROLL TOP
  ======================================================= */

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, []);

  /* =======================================================
     ESCAPE MODAL
  ======================================================= */

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setSelectedProject(null);
      }
    };

    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, []);

  /* =======================================================
     SUMMARY
  ======================================================= */

  const summary = useMemo(() => {
    const focalMap = {};

    let done = 0;
    let ongoing = 0;
    let hold = 0;
    let close = 0;

    projects.forEach((project) => {
      const focal = project["Focal-1"] || project.Focal || "Unassigned";

      focalMap[focal] = (focalMap[focal] || 0) + 1;

      const statusKey = getStatusKey(project.Status);

      if (statusKey === "done") {
        done++;
      } else if (statusKey === "hold") {
        hold++;
      } else if (statusKey === "close") {
        close++;
      } else {
        ongoing++;
      }
    });

    return {
      total: projects.length,
      done,
      ongoing,
      hold,
      close,
      focalMap,
    };
  }, [projects]);

  /* =======================================================
     FILTER / SEARCH / SORT
  ======================================================= */

  const filteredProjects = useMemo(() => {
    const query = normalize(deferredSearch);

    let result = [...projects];

    /* Focal */
    if (selectedFocal !== "All") {
      result = result.filter((project) => {
        const focal = project["Focal-1"] || project.Focal || "Unassigned";

        return focal === selectedFocal;
      });
    }

    /* Status */
    if (statusFilter !== "All") {
      result = result.filter(
        (project) => getStatusKey(project.Status) === statusFilter,
      );
    }

    /* Search */
    if (query) {
      result = result.filter((project) =>
        Object.values(project).some((value) =>
          normalize(value).includes(query),
        ),
      );
    }

    /* Sort */
    result.sort((a, b) => {
      const { key, direction } = sortConfig;

      if (key === "__sheetOrder") {
        return direction === "desc"
          ? b.__sheetOrder - a.__sheetOrder
          : a.__sheetOrder - b.__sheetOrder;
      }

      const aValue = normalize(a[key]);

      const bValue = normalize(b[key]);

      if (aValue < bValue) {
        return direction === "asc" ? -1 : 1;
      }

      if (aValue > bValue) {
        return direction === "asc" ? 1 : -1;
      }

      return 0;
    });

    return result;
  }, [projects, selectedFocal, statusFilter, deferredSearch, sortConfig]);

  /* =======================================================
     SORT
  ======================================================= */

  const handleSort = (key) => {
    setSortConfig((previous) => {
      if (previous.key === key) {
        return {
          key,
          direction: previous.direction === "asc" ? "desc" : "asc",
        };
      }

      return {
        key,
        direction: "asc",
      };
    });
  };

  /* =======================================================
     FILTERS
  ======================================================= */

  const handleStatusFilter = (status) => {
    setStatusFilter(status);
  };

  const handleTotalClick = () => {
    setSelectedFocal("All");
    setStatusFilter("All");
    setSearch("");

    setSortConfig({
      key: "__sheetOrder",
      direction: "desc",
    });
  };

  const clearFilters = () => {
    setSelectedFocal("All");
    setStatusFilter("All");
    setSearch("");

    setSortConfig({
      key: "__sheetOrder",
      direction: "desc",
    });
  };

  /* =======================================================
     EXPORT ALL — EXCEL
  ======================================================= */

  const handleExportAllExcel = () => {
    if (!filteredProjects.length) {
      return;
    }

    /*
     * ONLY the 11 selected columns are exported.
     */
    const rows = filteredProjects.map(getExportObject);

    const worksheet = XLSX.utils.json_to_sheet(rows);

    /*
     * Excel column widths
     */
    worksheet["!cols"] = EXPORT_COLUMNS.map((column) => {
      let width = column.length + 3;

      rows.forEach((row) => {
        const value = String(row[column] ?? "");

        width = Math.max(width, Math.min(value.length + 2, 45));
      });

      /*
       * Activity and Title need more space.
       */
      if (column === "Title") {
        width = Math.max(width, 35);
      }

      if (column === "Activity") {
        width = Math.max(width, 45);
      }

      return {
        wch: Math.min(width, 50),
      };
    });

    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, "IS Project & Drive");

    const filterName =
      selectedFocal === "All" ? "All" : sanitizeFileName(selectedFocal);

    XLSX.writeFile(
      workbook,
      `Microfinance-Technology-IS-Project-Drive-${filterName}.xlsx`,
    );
  };

  /* =======================================================
     EXPORT ALL — PDF
  ======================================================= */

  const handleExportAllPDF = () => {
    if (!filteredProjects.length) {
      return;
    }

    const doc = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: "a4",
      compress: true,
    });

    const pageWidth = doc.internal.pageSize.getWidth();

    const pageHeight = doc.internal.pageSize.getHeight();

    const generatedDate = new Date().toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

    /* =====================================================
       FIRST PAGE REPORT HEADER
    ===================================================== */

    doc.setFont("helvetica", "bold");

    doc.setFontSize(17);

    doc.text("Microfinance Technology", 14, 14);

    doc.setFontSize(13);

    doc.text("IS Project & Drive Report", 14, 22);

    doc.setFont("helvetica", "normal");

    doc.setFontSize(9);

    doc.text(`Generated: ${generatedDate}`, 14, 29);

    doc.text(`Total Records: ${filteredProjects.length}`, 14, 35);

    doc.text(
      `Filter: ${selectedFocal === "All" ? "All Records" : selectedFocal}`,
      14,
      41,
    );

    if (statusFilter !== "All") {
      doc.text(`Status: ${getStatus(statusFilter)}`, 14, 47);
    }

    /*
     * ONLY 11 COLUMNS
     */
    const tableHead = [EXPORT_COLUMNS];

    /*
     * ONLY 11 COLUMNS
     */
    const tableBody = filteredProjects.map((project) =>
      EXPORT_COLUMNS.map((column) =>
        formatExportValue(column, project[column]),
      ),
    );

    const totalColumns = EXPORT_COLUMNS.length;

    /*
     * Because there are 11 columns,
     * use a small font and landscape A4.
     */
    autoTable(doc, {
      startY: statusFilter === "All" ? 50 : 56,

      /*
       * IMPORTANT:
       * Small margin means page 2 starts
       * very close to the top.
       */
      margin: {
        top: 8,
        right: 7,
        bottom: 12,
        left: 7,
      },

      head: tableHead,

      body: tableBody,

      theme: "grid",

      tableWidth: "auto",

      styles: {
        font: "helvetica",

        fontSize: 6.3,

        cellPadding: 1.7,

        overflow: "linebreak",

        valign: "top",

        lineColor: [210, 210, 210],

        lineWidth: 0.1,
      },

      headStyles: {
        fontStyle: "bold",

        fontSize: 6.5,

        halign: "center",

        valign: "middle",

        cellPadding: 2,

        fillColor: [190, 24, 93],

        textColor: [255, 255, 255],

        lineColor: [150, 20, 75],

        lineWidth: 0.2,
      },

      bodyStyles: {
        textColor: [40, 40, 40],
      },

      alternateRowStyles: {
        fillColor: [248, 250, 252],
      },

      /*
       * Explicit widths.
       *
       * Total is approximately 283mm,
       * suitable for landscape A4.
       */
      columnStyles: {
        0: {
          cellWidth: 12,
          halign: "center",
        },

        1: {
          cellWidth: 17,
        },

        2: {
          cellWidth: 14,
        },

        3: {
          cellWidth: 40,
        },

        4: {
          cellWidth: 53,
        },

        5: {
          cellWidth: 25,
        },

        6: {
          cellWidth: 25,
        },

        7: {
          cellWidth: 22,
        },

        8: {
          cellWidth: 22,
        },

        9: {
          cellWidth: 20,
        },

        10: {
          cellWidth: 23,
        },
      },

      /*
       * Header repeats automatically on every page.
       */
      showHead: "everyPage",

      pageBreak: "auto",

      rowPageBreak: "auto",

      /*
       * IMPORTANT FIX:
       *
       * The large first-page report header is
       * NOT repeated on page 2, 3, 4...
       *
       * Only a very small header is shown.
       */
      didDrawPage: () => {
        const pageNumber = doc.internal.getNumberOfPages();

        if (pageNumber > 1) {
          doc.setFont("helvetica", "bold");

          doc.setFontSize(7.5);

          doc.text("Microfinance Technology — IS Project & Drive", 7, 5);

          doc.setFont("helvetica", "normal");

          doc.setFontSize(7);

          doc.text(`Page ${pageNumber}`, pageWidth - 7, 5, {
            align: "right",
          });
        }

        /*
         * Footer
         */
        doc.setFont("helvetica", "normal");

        doc.setFontSize(6.5);

        doc.text(
          "Microfinance Technology - IS Project & Drive",
          7,
          pageHeight - 5,
        );

        doc.text(`Page ${pageNumber}`, pageWidth - 7, pageHeight - 5, {
          align: "right",
        });
      },
    });

    const filterName =
      selectedFocal === "All" ? "All-Records" : sanitizeFileName(selectedFocal);

    doc.save(`Microfinance-Technology-IS-Project-Drive-${filterName}.pdf`);
  };

  /* =======================================================
     SELECTED PROJECT — EXCEL
  ======================================================= */

  const handleExportProjectExcel = () => {
    if (!selectedProject) {
      return;
    }

    /*
     * ONLY the selected 11 fields.
     */
    const rows = getProjectDetailExportRows(selectedProject);

    const worksheet = XLSX.utils.json_to_sheet(rows);

    worksheet["!cols"] = [
      {
        wch: 25,
      },
      {
        wch: 90,
      },
    ];

    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, "Project Details");

    const title = selectedProject.Title || "IS Project";

    XLSX.writeFile(workbook, `${sanitizeFileName(title)} - Details.xlsx`);
  };

  /* =======================================================
     SELECTED PROJECT — PDF
  ======================================================= */

  const handleExportProjectPDF = () => {
    if (!selectedProject) {
      return;
    }

    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
      compress: true,
    });

    const pageWidth = doc.internal.pageSize.getWidth();

    const pageHeight = doc.internal.pageSize.getHeight();

    const title = selectedProject.Title || "IS Project Details";

    const rows = getProjectDetailExportRows(selectedProject);

    /* HEADER */

    doc.setFont("helvetica", "bold");

    doc.setFontSize(16);

    doc.text("Microfinance Technology", 14, 15);

    doc.setFontSize(12);

    doc.text("IS Project & Drive — Project Details", 14, 23);

    doc.setFont("helvetica", "normal");

    doc.setFontSize(9);

    doc.text(`Generated: ${getCurrentDateTime()}`, 14, 30);

    doc.setFont("helvetica", "bold");

    doc.setFontSize(10);

    const titleLines = doc.splitTextToSize(title, pageWidth - 28);

    doc.text(titleLines, 14, 38);

    const tableStartY = 42 + titleLines.length * 5;

    /*
     * ONLY the 11 selected fields.
     */
    autoTable(doc, {
      startY: tableStartY,

      margin: {
        top: 8,
        right: 14,
        bottom: 14,
        left: 14,
      },

      head: [["Field", "Details"]],

      body: rows.map((row) => [row.Field, row.Details]),

      theme: "grid",

      styles: {
        font: "helvetica",

        fontSize: 8.5,

        cellPadding: 3,

        overflow: "linebreak",

        valign: "top",

        lineColor: [215, 215, 215],

        lineWidth: 0.1,
      },

      headStyles: {
        fillColor: [190, 24, 93],

        textColor: [255, 255, 255],

        fontStyle: "bold",

        halign: "left",
      },

      columnStyles: {
        0: {
          cellWidth: 45,

          fontStyle: "bold",
        },

        1: {
          cellWidth: 130,
        },
      },

      showHead: "everyPage",

      pageBreak: "auto",

      didDrawPage: () => {
        const pageNumber = doc.internal.getNumberOfPages();

        doc.setFont("helvetica", "normal");

        doc.setFontSize(7);

        doc.text(
          "Microfinance Technology - IS Project & Drive",
          14,
          pageHeight - 6,
        );

        doc.text(`Page ${pageNumber}`, pageWidth - 14, pageHeight - 6, {
          align: "right",
        });
      },
    });

    doc.save(`${sanitizeFileName(title)} - Details.pdf`);
  };

  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="flex h-12 w-12 animate-spin items-center justify-center rounded-full border-4 border-pink-100 border-t-pink-600">
            <RefreshCw size={22} className="text-pink-600" />
          </div>

          <p className="text-sm font-medium text-slate-500">
            Loading IS Project & Drive...
          </p>
        </div>
      </div>
    );
  }

  /* =======================================================
     ERROR
  ======================================================= */

  if (error) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
          <div className="flex items-start gap-3">
            <XCircle size={24} className="mt-0.5 text-red-600" />

            <div>
              <h2 className="font-bold text-red-800">
                Unable to load IS Project & Drive
              </h2>

              <p className="mt-1 text-sm text-red-700">{error}</p>

              <button
                type="button"
                onClick={() => loadProjects(true)}
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
              >
                <RefreshCw size={16} />
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* =======================================================
     MAIN UI
  ======================================================= */

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-[1700px] px-4 py-5 sm:px-6 lg:px-8">
        {/* =================================================
            PAGE HEADER
        ================================================= */}

        <div className="mb-6 rounded-3xl bg-gradient-to-r from-white via-rose-50 to-pink-400 p-6 text-slate-800 shadow-lg">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-pink-100 text-pink-700">
                  <FolderKanban size={25} />
                </div>

                <div>
                  <h1 className="text-2xl font-bold sm:text-3xl">
                    IS Project & Drive
                  </h1>

                  <p className="mt-1 text-sm text-pink-700">
                    Information System Projects, Activities & Drive
                  </p>
                </div>
              </div>

              
            </div>

            <button
              type="button"
              onClick={() => loadProjects(true)}
              disabled={refreshing}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-pink-700 shadow-sm transition hover:bg-pink-50 disabled:cursor-not-allowed disabled:opacity-70"
            >
              <RefreshCw
                size={17}
                className={refreshing ? "animate-spin" : ""}
              />

              {refreshing ? "Refreshing..." : "Refresh Data"}
            </button>
          </div>
        </div>

        {/* =================================================
            SUMMARY
        ================================================= */}

        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          <SummaryMetric
            icon={FolderKanban}
            label="Total Projects"
            value={summary.total}
            colorClass="bg-pink-50 text-pink-600"
            active={
              selectedFocal === "All" && statusFilter === "All" && !search
            }
            onClick={handleTotalClick}
          />

          <SummaryMetric
            icon={Users}
            label="Focal Areas"
            value={Object.keys(summary.focalMap).length}
            colorClass="bg-violet-50 text-violet-600"
          />

          <SummaryMetric
            icon={CheckCircle2}
            label="Done"
            value={summary.done}
            colorClass="bg-emerald-50 text-emerald-600"
            active={statusFilter === "done"}
            onClick={() =>
              handleStatusFilter(statusFilter === "done" ? "All" : "done")
            }
          />

          <SummaryMetric
            icon={Clock3}
            label="Ongoing"
            value={summary.ongoing}
            colorClass="bg-blue-50 text-blue-600"
            active={statusFilter === "ongoing"}
            onClick={() =>
              handleStatusFilter(statusFilter === "ongoing" ? "All" : "ongoing")
            }
          />

          <SummaryMetric
            icon={CirclePause}
            label="On Hold"
            value={summary.hold}
            colorClass="bg-amber-50 text-amber-600"
            active={statusFilter === "hold"}
            onClick={() =>
              handleStatusFilter(statusFilter === "hold" ? "All" : "hold")
            }
          />

          <SummaryMetric
            icon={XCircle}
            label="Close"
            value={summary.close}
            colorClass="bg-red-50 text-red-600"
            active={statusFilter === "close"}
            onClick={() =>
              handleStatusFilter(statusFilter === "close" ? "All" : "close")
            }
          />
        </div>

        {/* =================================================
            CONTENT
        ================================================= */}

        <div className="grid gap-5 xl:grid-cols-[250px_minmax(0,1fr)]">
          {/* =================================================
              FOCAL AREA
          ================================================= */}

          <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-4 shadow-sm xl:sticky xl:top-5">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="font-bold text-slate-900">Focal Areas</h2>

                <p className="mt-1 text-xs text-slate-400">
                  Filter by focal person
                </p>
              </div>

              <Users size={18} className="text-pink-500" />
            </div>

            <div className="space-y-1.5">
              <button
                type="button"
                onClick={() => setSelectedFocal("All")}
                className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm transition ${
                  selectedFocal === "All"
                    ? "bg-pink-50 font-semibold text-pink-700"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <span>All</span>

                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-500">
                  {summary.total}
                </span>
              </button>

              {Object.entries(summary.focalMap)
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([focal, count]) => (
                  <button
                    key={focal}
                    type="button"
                    onClick={() => setSelectedFocal(focal)}
                    className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm transition ${
                      selectedFocal === focal
                        ? "bg-pink-50 font-semibold text-pink-700"
                        : "text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <span className="truncate pr-2">{focal}</span>

                    <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-500">
                      {count}
                    </span>
                  </button>
                ))}
            </div>
          </aside>

          {/* =================================================
              TABLE
          ================================================= */}

          <section className="min-w-0 rounded-2xl border border-slate-200 bg-white shadow-sm">
            {/* TABLE HEADER */}

            <div className="border-b border-slate-200 p-4">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    All IS Projects & Drive
                  </h2>

                  <p className="mt-1 text-xs text-slate-400">
                    Showing{" "}
                    <span className="font-semibold text-slate-600">
                      {filteredProjects.length}
                    </span>{" "}
                    of{" "}
                    <span className="font-semibold text-slate-600">
                      {projects.length}
                    </span>{" "}
                    records
                  </p>
                </div>

                <div className="flex w-full flex-col gap-2 sm:flex-row xl:w-auto">
                  {/* EXCEL */}

                  <button
                    type="button"
                    onClick={handleExportAllExcel}
                    disabled={!filteredProjects.length}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-2.5 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <FileSpreadsheet size={17} />
                    Excel
                  </button>

                  {/* PDF */}

                  <button
                    type="button"
                    onClick={handleExportAllPDF}
                    disabled={!filteredProjects.length}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm font-semibold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <FileDown size={17} />
                    PDF
                  </button>

                  {/* SEARCH */}

                  <div className="relative w-full sm:min-w-[260px] xl:w-[300px]">
                    <Search
                      size={17}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      type="text"
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                      placeholder="Search projects..."
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-10 text-sm outline-none transition focus:border-pink-400 focus:bg-white focus:ring-2 focus:ring-pink-100"
                    />

                    {search && (
                      <button
                        type="button"
                        onClick={() => setSearch("")}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                      >
                        <X size={16} />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* FILTERS */}

              <div className="mt-4 flex flex-wrap items-center gap-2">
                <span className="text-xs font-semibold text-slate-400">
                  Filters:
                </span>

                <button
                  type="button"
                  onClick={() => setStatusFilter("All")}
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                    statusFilter === "All"
                      ? "bg-slate-900 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  All Status
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setStatusFilter(
                      statusFilter === "ongoing" ? "All" : "ongoing",
                    )
                  }
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                    statusFilter === "ongoing"
                      ? "bg-blue-600 text-white"
                      : "bg-blue-50 text-blue-700 hover:bg-blue-100"
                  }`}
                >
                  Ongoing
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setStatusFilter(statusFilter === "done" ? "All" : "done")
                  }
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                    statusFilter === "done"
                      ? "bg-emerald-600 text-white"
                      : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                  }`}
                >
                  Done
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setStatusFilter(statusFilter === "hold" ? "All" : "hold")
                  }
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                    statusFilter === "hold"
                      ? "bg-amber-500 text-white"
                      : "bg-amber-50 text-amber-700 hover:bg-amber-100"
                  }`}
                >
                  On Hold
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setStatusFilter(statusFilter === "close" ? "All" : "close")
                  }
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                    statusFilter === "close"
                      ? "bg-red-600 text-white"
                      : "bg-red-50 text-red-700 hover:bg-red-100"
                  }`}
                >
                  Close
                </button>

                {(selectedFocal !== "All" ||
                  statusFilter !== "All" ||
                  search) && (
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="ml-auto inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold text-pink-600 hover:bg-pink-50"
                  >
                    <X size={13} />
                    Clear Filters
                  </button>
                )}
              </div>
            </div>

            {/* =================================================
                DESKTOP TABLE
            ================================================= */}

            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[900px] border-collapse">
                <colgroup>
                  <col className="w-[29%]" />
                  <col className="w-[17%]" />
                  <col className="w-[12%]" />
                  <col className="w-[12%]" />
                  <col className="w-[13%]" />
                  <col className="w-[17%]" />
                </colgroup>

                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-left">
                    <th className="px-4 py-3 text-xs font-bold uppercase tracking-wide text-slate-500">
                      Title
                    </th>

                    <th className="px-4 py-3 text-xs font-bold uppercase tracking-wide text-slate-500">
                      Focal-1
                    </th>

                    <th className="px-4 py-3 text-xs font-bold uppercase tracking-wide text-slate-500">
                      <button
                        type="button"
                        onClick={() => handleSort("Start Date")}
                        className="inline-flex items-center gap-1 hover:text-pink-600"
                      >
                        Start Date
                        <ArrowUpDown size={12} />
                      </button>
                    </th>

                    <th className="px-4 py-3 text-xs font-bold uppercase tracking-wide text-slate-500">
                      <button
                        type="button"
                        onClick={() => handleSort("End Date")}
                        className="inline-flex items-center gap-1 hover:text-pink-600"
                      >
                        End Date
                        <ArrowUpDown size={12} />
                      </button>
                    </th>

                    <th className="px-4 py-3 text-xs font-bold uppercase tracking-wide text-slate-500">
                      Status
                    </th>

                    <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-wide text-slate-500">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredProjects.map((project, index) => (
                    <tr
                      key={
                        project.SN || project.ID || `${project.Title}-${index}`
                      }
                      className="border-b border-slate-100 transition hover:bg-pink-50/30"
                    >
                      <td className="px-4 py-4">
                        <div className="max-w-[420px]">
                          <div className="font-semibold text-slate-800">
                            {project.Title || "-"}
                          </div>

                          {project.Type && (
                            <div className="mt-1 text-xs text-slate-400">
                              {project.Type}
                            </div>
                          )}
                        </div>
                      </td>

                      <td className="px-4 py-4">
                        <span className="text-sm font-medium text-slate-700">
                          {project["Focal-1"] || project.Focal || "-"}
                        </span>
                      </td>

                      <td className="px-4 py-4 text-sm text-slate-600">
                        {formatDate(project["Start Date"])}
                      </td>

                      <td className="px-4 py-4 text-sm text-slate-600">
                        {formatDate(project["End Date"])}
                      </td>

                      <td className="px-4 py-4">
                        <StatusBadge status={project.Status} />
                      </td>

                      <td className="px-4 py-4 text-right">
                        <button
                          type="button"
                          onClick={() => setSelectedProject(project)}
                          className="inline-flex items-center gap-1.5 rounded-xl bg-pink-50 px-3 py-2 text-xs font-bold text-pink-700 transition hover:bg-pink-100"
                        >
                          <Eye size={15} />
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* =================================================
                MOBILE
            ================================================= */}

            <div className="space-y-3 p-3 md:hidden">
              {filteredProjects.map((project, index) => (
                <div
                  key={project.SN || project.ID || `${project.Title}-${index}`}
                  className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="font-bold text-slate-800">
                        {project.Title || "-"}
                      </h3>

                      <p className="mt-1 text-xs text-slate-400">
                        {project["Focal-1"] || project.Focal || "-"}
                      </p>
                    </div>

                    <StatusBadge status={project.Status} />
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <div className="rounded-xl bg-slate-50 p-3">
                      <div className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                        Start Date
                      </div>

                      <div className="mt-1 text-xs font-semibold text-slate-700">
                        {formatDate(project["Start Date"])}
                      </div>
                    </div>

                    <div className="rounded-xl bg-slate-50 p-3">
                      <div className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                        End Date
                      </div>

                      <div className="mt-1 text-xs font-semibold text-slate-700">
                        {formatDate(project["End Date"])}
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setSelectedProject(project)}
                    className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-pink-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-pink-700"
                  >
                    <Eye size={16} />
                    View Details
                  </button>
                </div>
              ))}
            </div>

            {/* NO DATA */}

            {!filteredProjects.length && (
              <div className="px-6 py-16 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                  <Search size={24} />
                </div>

                <h3 className="mt-4 font-bold text-slate-800">
                  No projects found
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  Try changing your search or filter.
                </p>

                <button
                  type="button"
                  onClick={clearFilters}
                  className="mt-4 rounded-xl bg-pink-600 px-4 py-2 text-sm font-semibold text-white hover:bg-pink-700"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </section>
        </div>
      </div>

      {/* =====================================================
          DETAILS MODAL
      ===================================================== */}

      {selectedProject && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-3 backdrop-blur-sm sm:p-5"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setSelectedProject(null);
            }
          }}
        >
          <div className="flex max-h-[94vh] w-full max-w-5xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl">
            {/* MODAL HEADER */}

            <div className="flex items-start justify-between gap-4 border-b border-slate-200 bg-gradient-to-r from-pink-700 to-rose-500 p-5 text-white">
              <div className="min-w-0">
                <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-pink-100">
                  <FileText size={15} />
                  IS Project Details
                </div>

                <h2 className="break-words text-xl font-bold sm:text-2xl">
                  {selectedProject.Title || "Project Details"}
                </h2>

                <div className="mt-2 flex flex-wrap items-center gap-2">
                  {selectedProject.Type && (
                    <span className="rounded-full bg-white/15 px-2.5 py-1 text-xs">
                      {selectedProject.Type}
                    </span>
                  )}

                  <span className="rounded-full bg-white/15 px-2.5 py-1 text-xs">
                    {selectedProject.FY || "FY"}
                  </span>

                  <span className="rounded-full bg-white px-2.5 py-1 text-xs font-bold text-pink-700">
                    {getStatus(selectedProject.Status)}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedProject(null)}
                className="shrink-0 rounded-xl bg-white/10 p-2 text-white transition hover:bg-white/20"
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>

            {/* MODAL BODY */}

            <div className="overflow-y-auto p-4 sm:p-6">
              <div className="grid gap-3 md:grid-cols-2">
                <ProjectDetailRow
                  icon={ListChecks}
                  label="Serial Number"
                  value={selectedProject.SN}
                />

                <ProjectDetailRow
                  icon={BriefcaseBusiness}
                  label="Type"
                  value={selectedProject.Type}
                />

                <ProjectDetailRow
                  icon={CalendarDays}
                  label="FY"
                  value={selectedProject.FY}
                />

                <ProjectDetailRow
                  icon={FolderKanban}
                  label="Title"
                  value={selectedProject.Title}
                  fullWidth
                />

                <ProjectDetailRow
                  icon={FileText}
                  label="Activity"
                  value={selectedProject.Activity}
                  fullWidth
                />

                <ProjectDetailRow
                  icon={UserRound}
                  label="Focal-1"
                  value={selectedProject["Focal-1"]}
                />

                <ProjectDetailRow
                  icon={UserRound}
                  label="Focal-2"
                  value={selectedProject["Focal-2"]}
                />

                <ProjectDetailRow
                  icon={CalendarDays}
                  label="Start Date"
                  value={formatDate(selectedProject["Start Date"])}
                />

                <ProjectDetailRow
                  icon={CalendarDays}
                  label="End Date"
                  value={formatDate(selectedProject["End Date"])}
                />

                <ProjectDetailRow
                  icon={Clock3}
                  label="Duration"
                  value={selectedProject.Duration}
                />

                <ProjectDetailRow
                  icon={CheckCircle2}
                  label="Status"
                  value={<StatusBadge status={selectedProject.Status} />}
                />

                <ProjectDetailRow
                  icon={Building2}
                  label="Stakeholder"
                  value={selectedProject.Stakeholder}
                  fullWidth
                />

                <ProjectDetailRow
                  icon={Wallet}
                  label="Budget (If any)"
                  value={selectedProject["Budget (If any)"]}
                />

                <ProjectDetailRow
                  icon={MessageSquareText}
                  label="Remarks"
                  value={selectedProject.Remarks}
                  fullWidth
                />
              </div>
            </div>

            {/* =================================================
                MODAL FOOTER
            ================================================= */}

            <div className="flex flex-col gap-3 border-t border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-slate-400">
                Excel and PDF contain the selected 11 project fields.
              </p>

              <div className="flex flex-wrap gap-2">
                {/* EXCEL */}

                <button
                  type="button"
                  onClick={handleExportProjectExcel}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-bold text-emerald-700 transition hover:bg-emerald-100"
                >
                  <FileSpreadsheet size={17} />
                  Excel
                </button>

                {/* PDF */}

                <button
                  type="button"
                  onClick={handleExportProjectPDF}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-bold text-red-700 transition hover:bg-red-100"
                >
                  <FileDown size={17} />
                  PDF
                </button>

                {/* CLOSE */}

                <button
                  type="button"
                  onClick={() => setSelectedProject(null)}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-slate-800"
                >
                  <X size={17} />
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ISProjectDrive;
