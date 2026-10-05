// ============================================================
// MF TECHNOLOGY PORTAL
// Central API & Cache Management
// ============================================================


// ============================================================
// GOOGLE APPS SCRIPT API
// ============================================================

const API_BASE_URL =
  "https://script.google.com/macros/s/AKfycbx7NLYUAF_swJZLufxwO4RcJ1x1SM4qmjGq_SdanvyKEBkHJnWI8BCL_5LsDLvMwGj_/exec";


// ============================================================
// CACHE CONFIGURATION
// ============================================================

const CACHE_TIME = 2 * 60 * 1000; // 2 minutes

const REQUEST_TIMEOUT = 8000; // 8 seconds


const CACHE_KEYS = {
  projects: "mf_technology_projects",
  activitySummary: "mf_technology_activity_summary",
};


// ============================================================
// GENERIC API FETCH FUNCTION
// ============================================================

async function fetchFromAPI(
  url,
  cacheKey,
  forceRefresh = false
) {

  // ----------------------------------------------------------
  // 1. CHECK BROWSER CACHE
  // ----------------------------------------------------------

  if (!forceRefresh) {

    const cached =
      sessionStorage.getItem(cacheKey);

    if (cached) {

      try {

        const parsed =
          JSON.parse(cached);

        const cacheAge =
          Date.now() - parsed.timestamp;

        if (
          cacheAge < CACHE_TIME &&
          Array.isArray(parsed.data)
        ) {

          return parsed.data;

        }

      } catch (error) {

        console.warn(
          "Invalid cache:",
          error
        );

        sessionStorage.removeItem(
          cacheKey
        );

      }

    }

  }


  // ----------------------------------------------------------
  // 2. CREATE REQUEST TIMEOUT
  // ----------------------------------------------------------

  const controller =
    new AbortController();

  const timeout =
    setTimeout(
      () => controller.abort(),
      REQUEST_TIMEOUT
    );


  try {

    // --------------------------------------------------------
    // 3. REQUEST API
    // --------------------------------------------------------

    const response =
      await fetch(
        url,
        {
          signal: controller.signal,
        }
      );


    if (!response.ok) {

      throw new Error(
        `API request failed: ${response.status}`
      );

    }


    // --------------------------------------------------------
    // 4. CONVERT RESPONSE TO JSON
    // --------------------------------------------------------

    const data =
      await response.json();


    // --------------------------------------------------------
    // 5. CHECK API ERROR
    // --------------------------------------------------------

    if (
      data &&
      data.error
    ) {

      throw new Error(
        data.message ||
        "Google Apps Script returned an error."
      );

    }


    const result =
      Array.isArray(data)
        ? data
        : [];


    // --------------------------------------------------------
    // 6. SAVE TO BROWSER CACHE
    // --------------------------------------------------------

    sessionStorage.setItem(
      cacheKey,
      JSON.stringify({
        timestamp: Date.now(),
        data: result,
      })
    );


    return result;

  } catch (error) {

    if (
      error.name ===
      "AbortError"
    ) {

      throw new Error(
        "Request timed out. Please try again."
      );

    }

    throw error;

  } finally {

    clearTimeout(timeout);

  }

}


// ============================================================
// PROJECTS API
// ============================================================

export async function fetchProjects(
  forceRefresh = false
) {

  const data =
    await fetchFromAPI(
      API_BASE_URL,
      CACHE_KEYS.projects,
      forceRefresh
    );


  // ----------------------------------------------------------
  // Keep latest Google Sheet entries first
  // ----------------------------------------------------------

  return [
    ...data,
  ].reverse();

}


// ============================================================
// ACTIVITY SUMMARY API
// ============================================================

export async function fetchActivitySummary(
  forceRefresh = false
) {

  const url =
    `${API_BASE_URL}?sheet=ActivitySummary`;


  return fetchFromAPI(
    url,
    CACHE_KEYS.activitySummary,
    forceRefresh
  );

}


// ============================================================
// CLEAR PROJECT CACHE
// ============================================================

export function clearProjectsCache() {

  sessionStorage.removeItem(
    CACHE_KEYS.projects
  );

}


// ============================================================
// CLEAR ACTIVITY SUMMARY CACHE
// ============================================================

export function clearActivitySummaryCache() {

  sessionStorage.removeItem(
    CACHE_KEYS.activitySummary
  );

}


// ============================================================
// CLEAR ALL PORTAL CACHE
// ============================================================

export function clearAllPortalCache() {

  sessionStorage.removeItem(
    CACHE_KEYS.projects
  );

  sessionStorage.removeItem(
    CACHE_KEYS.activitySummary
  );

}