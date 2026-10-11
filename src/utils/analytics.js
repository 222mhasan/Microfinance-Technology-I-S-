
import { logEvent } from "firebase/analytics";
import { analytics } from "../firebase";

// ==================================================
// Prevent Duplicate Events in Development
// ==================================================

const recentEvents = new Map();

const DUPLICATE_BLOCK_TIME = 1000;

// ==================================================
// Generic Firebase Analytics Event
// ==================================================

export function logActivity(eventName, eventData = {}) {
  try {
    if (!analytics) {
      console.warn(
        `Firebase Analytics is not available. Event skipped: ${eventName}`
      );

      return;
    }

    // ----------------------------------------------
    // Create a unique key for duplicate detection
    // ----------------------------------------------

    const eventKey = `${eventName}:${JSON.stringify(eventData)}`;

    const currentTime = Date.now();

    const previousTime = recentEvents.get(eventKey);

    // ----------------------------------------------
    // Ignore duplicate event within 1 second
    // ----------------------------------------------

    if (
      previousTime &&
      currentTime - previousTime < DUPLICATE_BLOCK_TIME
    ) {
      console.log(
        "Duplicate Firebase Analytics event skipped:",
        eventName
      );

      return;
    }

    recentEvents.set(eventKey, currentTime);

    // ----------------------------------------------
    // Send event to Firebase Analytics
    // ----------------------------------------------

    logEvent(analytics, eventName, eventData);

    console.log("Firebase Analytics Event:", {
      eventName,
      eventData,
    });
  } catch (error) {
    console.error(
      `Failed to log Firebase Analytics event: ${eventName}`,
      error
    );
  }
}

// ==================================================
// Page View
// ==================================================

export function logPageView(
  pageName,
  path = window.location.pathname
) {
  logActivity("portal_page_view", {
    page_name: String(pageName || ""),
    page_path: String(path || ""),
  });
}

// ==================================================
// Project Opened
// ==================================================

export function logProjectOpened(
  projectId,
  projectTitle
) {
  logActivity("project_opened", {
    project_id: String(projectId || ""),
    project_title: String(projectTitle || ""),
  });
}

// ==================================================
// Search Used
// ==================================================

export function logSearch(
  section,
  searchTerm
) {
  logActivity("search_used", {
    section: String(section || ""),
    search_term: String(searchTerm || ""),
  });
}

// ==================================================
// Filter Used
// ==================================================

export function logFilterUsed(
  section,
  filterName,
  filterValue
) {
  logActivity("filter_used", {
    section: String(section || ""),
    filter_name: String(filterName || ""),
    filter_value: String(filterValue || ""),
  });
}

// ==================================================
// External Link Clicked
// ==================================================

export function logExternalLinkClicked(
  section,
  url
) {
  logActivity("external_link_clicked", {
    section: String(section || ""),
    url: String(url || ""),
  });
}

// ==================================================
// Refresh
// ==================================================

export function logRefresh(section) {
  logActivity("refresh_clicked", {
    section: String(section || ""),
  });
}
