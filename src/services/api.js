const API_BASE_URL =
  "https://script.google.com/macros/s/AKfycbx7NLYUAF_swJZLufxwO4RcJ1x1SM4qmjGq_SdanvyKEBkHJnWI8BCL_5LsDLvMwGj_/exec";


const CACHE_TIME =
  2 * 60 * 1000;


const REQUEST_TIMEOUT =
  20000;


/* =========================================================
   CACHE KEYS
========================================================= */

const CACHE_KEYS = {

  projects:
    "mf_technology_projects",

  activitySummary:
    "mf_technology_activity_summary",

  individualTask:
    "mf_technology_individual_task",

  agenda:
    "mf_technology_agenda",

  isProjectDrive:
    "mf_technology_is_project_drive",

};


/* =========================================================
   GENERIC API FETCH
========================================================= */

async function fetchFromAPI(
  url,
  cacheKey,
  forceRefresh = false
) {

  /* -------------------------------------------------------
     CHECK SESSION CACHE
  ------------------------------------------------------- */

  if (!forceRefresh) {

    const cached =
      sessionStorage.getItem(
        cacheKey
      );


    if (cached) {

      try {

        const parsed =
          JSON.parse(cached);


        const cacheAge =
          Date.now() -
          parsed.timestamp;


        if (
          cacheAge < CACHE_TIME &&
          Array.isArray(parsed.data)
        ) {

          console.log(
            `Using cached data: ${cacheKey}`
          );


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


  /* -------------------------------------------------------
     REQUEST TIMEOUT
  ------------------------------------------------------- */

  const controller =
    new AbortController();


  const timeout =
    setTimeout(() => {

      controller.abort();

    }, REQUEST_TIMEOUT);


  try {

    console.log(
      "API Request Started:",
      url
    );


    const response =
      await fetch(url, {

        method: "GET",

        signal:
          controller.signal,

        redirect: "follow",

        cache: "no-store",

      });


    console.log(
      "API Response Status:",
      response.status
    );


    console.log(
      "API Response URL:",
      response.url
    );


    if (!response.ok) {

      throw new Error(
        `API request failed: ${response.status}`
      );

    }


    const data =
      await response.json();


    console.log(
      "API Data Received:",
      Array.isArray(data)
        ? `Array(${data.length})`
        : data
    );


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


    /* -----------------------------------------------------
       SAVE CACHE
    ----------------------------------------------------- */

    sessionStorage.setItem(

      cacheKey,

      JSON.stringify({

        timestamp:
          Date.now(),

        data:
          result,

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


    console.error(
      "API Fetch Error:",
      error
    );


    throw error;


  } finally {

    clearTimeout(
      timeout
    );

  }

}


/* =========================================================
   PROJECTS
========================================================= */

export async function fetchProjects(
  forceRefresh = false
) {

  const data =
    await fetchFromAPI(

      API_BASE_URL,

      CACHE_KEYS.projects,

      forceRefresh

    );


  return [
    ...data
  ].reverse();

}


/* =========================================================
   ACTIVITY SUMMARY
========================================================= */

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


/* =========================================================
   INDIVIDUAL TASK
========================================================= */

export async function fetchIndividualTasks(
  forceRefresh = false
) {

  const url =
    `${API_BASE_URL}?sheet=IndividualTask`;


  return fetchFromAPI(

    url,

    CACHE_KEYS.individualTask,

    forceRefresh

  );

}


/* =========================================================
   AGENDA
========================================================= */

export async function fetchAgenda(
  forceRefresh = false
) {

  const url =
    `${API_BASE_URL}?sheet=Agenda`;


  return fetchFromAPI(

    url,

    CACHE_KEYS.agenda,

    forceRefresh

  );

}


/* =========================================================
   IS PROJECT & DRIVE
========================================================= */

export async function fetchISProjectDrive(
  forceRefresh = false
) {

  const url =
    `${API_BASE_URL}?sheet=ISProject%26Drive`;


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

  sessionStorage.removeItem(
    CACHE_KEYS.projects
  );

}


export function clearActivitySummaryCache() {

  sessionStorage.removeItem(
    CACHE_KEYS.activitySummary
  );

}


export function clearIndividualTaskCache() {

  sessionStorage.removeItem(
    CACHE_KEYS.individualTask
  );

}


export function clearAgendaCache() {

  sessionStorage.removeItem(
    CACHE_KEYS.agenda
  );

}


export function clearISProjectDriveCache() {

  sessionStorage.removeItem(
    CACHE_KEYS.isProjectDrive
  );

}


/* =========================================================
   CLEAR EVERYTHING
========================================================= */

export function clearAllPortalCache() {

  sessionStorage.removeItem(
    CACHE_KEYS.projects
  );


  sessionStorage.removeItem(
    CACHE_KEYS.activitySummary
  );


  sessionStorage.removeItem(
    CACHE_KEYS.individualTask
  );


  sessionStorage.removeItem(
    CACHE_KEYS.agenda
  );


  sessionStorage.removeItem(
    CACHE_KEYS.isProjectDrive
  );

}