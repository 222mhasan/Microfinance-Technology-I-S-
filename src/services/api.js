
const API_BASE_URL =
  "https://script.google.com/macros/s/AKfycbx7NLYUAF_swJZLufxwO4RcJ1x1SM4qmjGq_SdanvyKEBkHJnWI8BCL_5LsDLvMwGj_/exec";

/* =========================================================
   PERFORMANCE SETTINGS
========================================================= */

// How long cached data remains fresh.
const CACHE_TIME = 2 * 60 * 1000;

// Maximum time to wait for an API request.
const REQUEST_TIMEOUT = 20000;

// In-memory cache avoids repeatedly parsing sessionStorage.
const memoryCache = new Map();

// Track requests already in progress.
const pendingRequests = new Map();

/* =========================================================
   CACHE KEYS
========================================================= */

const CACHE_KEYS = {
  projects: "mf_technology_projects",
  activitySummary: "mf_technology_activity_summary",
  individualTask: "mf_technology_individual_task",
  agenda: "mf_technology_agenda",
  isProjectDrive: "mf_technology_is_project_drive",
};

/* =========================================================
   CACHE HELPERS
========================================================= */

function readCache(cacheKey) {
  // Check the faster in-memory cache first.
  const memoryEntry = memoryCache.get(cacheKey);

  if (memoryEntry && Array.isArray(memoryEntry.data)) {
    return memoryEntry;
  }

  // Fall back to sessionStorage.
  try {
    const stored = sessionStorage.getItem(cacheKey);

    if (!stored) return null;

    const parsed = JSON.parse(stored);

    if (
      !parsed ||
      !Array.isArray(parsed.data) ||
      typeof parsed.timestamp !== "number"
    ) {
      sessionStorage.removeItem(cacheKey);
      return null;
    }

    memoryCache.set(cacheKey, parsed);

    return parsed;
  } catch (error) {
    console.warn("Unable to read cache:", cacheKey, error);
    return null;
  }
}

function saveCache(cacheKey, data) {
  const entry = {
    timestamp: Date.now(),
    data,
  };

  // Always update in-memory cache first.
  memoryCache.set(cacheKey, entry);

  // sessionStorage can fail if browser storage is unavailable/full.
  try {
    sessionStorage.setItem(cacheKey, JSON.stringify(entry));
  } catch (error) {
    console.warn(
      "Session cache could not be saved:",
      cacheKey,
      error
    );
  }
}

function removeCache(cacheKey) {
  memoryCache.delete(cacheKey);

  try {
    sessionStorage.removeItem(cacheKey);
  } catch (error) {
    console.warn("Unable to remove cache:", cacheKey, error);
  }
}

/* =========================================================
   GENERIC API FETCH
========================================================= */

async function fetchFromAPI(
  url,
  cacheKey,
  forceRefresh = false
) {
  const cached = readCache(cacheKey);

  // Return fresh cached data immediately.
  if (
    !forceRefresh &&
    cached &&
    Date.now() - cached.timestamp < CACHE_TIME
  ) {
    return cached.data;
  }

  // Share the existing request if the same dataset is
  // already being fetched and this is not a forced refresh.
  if (!forceRefresh && pendingRequests.has(cacheKey)) {
    return pendingRequests.get(cacheKey);
  }

  const request = (async () => {
    const controller = new AbortController();

    const timeout = setTimeout(() => {
      controller.abort();
    }, REQUEST_TIMEOUT);

    try {
      const response = await fetch(url, {
        method: "GET",
        signal: controller.signal,
        redirect: "follow",
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const data = await response.json();

      if (data && data.error) {
        throw new Error(
          data.message || "Google Apps Script returned an error."
        );
      }

      if (!Array.isArray(data)) {
        throw new Error(
          "Invalid API response. Expected an array of records."
        );
      }

      // Only the newest active request can update the cache.
      if (pendingRequests.get(cacheKey) === request) {
        saveCache(cacheKey, data);
      }

      return data;
    } catch (error) {
      console.error(`API error [${cacheKey}]:`, error);

      // If the network fails, use previously cached data
      // instead of immediately breaking the page.
      if (cached && Array.isArray(cached.data)) {
        console.warn(
          `Using previously cached data after request failure: ${cacheKey}`
        );

        return cached.data;
      }

      if (error.name === "AbortError") {
        throw new Error("Request timed out. Please try again.");
      }

      throw error;
    } finally {
      clearTimeout(timeout);
    }
  })();

  pendingRequests.set(cacheKey, request);

  try {
    return await request;
  } finally {
    // Do not remove a newer request accidentally.
    if (pendingRequests.get(cacheKey) === request) {
      pendingRequests.delete(cacheKey);
    }
  }
}

/* =========================================================
   PROJECTS
========================================================= */

export async function fetchProjects(forceRefresh = false) {
  const data = await fetchFromAPI(
    API_BASE_URL,
    CACHE_KEYS.projects,
    forceRefresh
  );

  // Preserve the existing project ordering behavior.
  return [...data].reverse();
}

/* =========================================================
   ACTIVITY SUMMARY
========================================================= */

export async function fetchActivitySummary(forceRefresh = false) {
  const url = `${API_BASE_URL}?sheet=ActivitySummary`;

  return fetchFromAPI(
    url,
    CACHE_KEYS.activitySummary,
    forceRefresh
  );
}

/* =========================================================
   INDIVIDUAL TASKS
========================================================= */

export async function fetchIndividualTasks(forceRefresh = false) {
  const url = `${API_BASE_URL}?sheet=IndividualTask`;

  return fetchFromAPI(
    url,
    CACHE_KEYS.individualTask,
    forceRefresh
  );
}

/* =========================================================
   AGENDA
========================================================= */

export async function fetchAgenda(forceRefresh = false) {
  const url = `${API_BASE_URL}?sheet=Agenda`;

  return fetchFromAPI(
    url,
    CACHE_KEYS.agenda,
    forceRefresh
  );
}

/* =========================================================
   IS PROJECT & DRIVE
========================================================= */

export async function fetchISProjectDrive(forceRefresh = false) {
  const url = `${API_BASE_URL}?sheet=ISProject%26Drive`;

  return fetchFromAPI(
    url,
    CACHE_KEYS.isProjectDrive,
    forceRefresh
  );
}

/* =========================================================
   CACHE CLEAR FUNCTIONS
========================================================= */

export function clearProjectsCache() {
  removeCache(CACHE_KEYS.projects);
}

export function clearActivitySummaryCache() {
  removeCache(CACHE_KEYS.activitySummary);
}

export function clearIndividualTaskCache() {
  removeCache(CACHE_KEYS.individualTask);
}

export function clearAgendaCache() {
  removeCache(CACHE_KEYS.agenda);
}

export function clearISProjectDriveCache() {
  removeCache(CACHE_KEYS.isProjectDrive);
}

/* =========================================================
   CLEAR ALL PORTAL CACHE
========================================================= */

export function clearAllPortalCache() {
  Object.values(CACHE_KEYS).forEach(removeCache);
}