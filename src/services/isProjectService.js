import {
  collection,
  getDocs,
} from "firebase/firestore";

import { db } from "../firebase";
import { fetchISProjectDrive } from "./api";

const FIRESTORE_COLLECTION = "isProjects";

/*
|--------------------------------------------------------------------------
| Convert Firestore document → existing portal format
|--------------------------------------------------------------------------
|
| Firestore:
| title
| focal1
| startDate
|
| Existing React UI:
| Title
| Focal-1
| Start Date
|
| This mapping lets us keep your existing UI.
|
*/

const mapFirestoreProject = (doc, index) => {
  const data = doc.data();

  return {
    // Firestore document ID
    ID: doc.id,

    // Existing portal field names
    SN: data.sn ?? "",
    Type: data.type ?? "",
    FY: data.fy ?? "",
    Title: data.title ?? "",
    Activity: data.activity ?? "",

    "Focal-1": data.focal1 ?? "",
    "Focal-2": data.focal2 ?? "",

    "Start Date": data.startDate ?? "",
    "End Date": data.endDate ?? "",

    Duration: data.duration ?? "",
    Status: data.status ?? "",
    Stakeholder: data.stakeholder ?? "",

    "Budget (If any)": data.budget ?? "",

    Remarks: data.remarks ?? "",

    // Internal fields
    __firestoreId: doc.id,
    __firestoreOrder: index,
    __source: "firestore",
  };
};

/*
|--------------------------------------------------------------------------
| Get projects from Firestore
|--------------------------------------------------------------------------
*/

export const fetchISProjectsFromFirestore =
  async () => {
    const snapshot = await getDocs(
      collection(
        db,
        FIRESTORE_COLLECTION
      )
    );

    const projects = snapshot.docs.map(
      (doc, index) =>
        mapFirestoreProject(doc, index)
    );

    /*
    | Sort by SN descending
    |
    | Highest SN first.
    |
    | Works whether SN is stored as:
    | 1
    | "1"
    */

    projects.sort((a, b) => {
      const aSN = Number(a.SN);
      const bSN = Number(b.SN);

      const validA =
        Number.isFinite(aSN);

      const validB =
        Number.isFinite(bSN);

      if (validA && validB) {
        return bSN - aSN;
      }

      if (validA) {
        return -1;
      }

      if (validB) {
        return 1;
      }

      return String(
        b.Title || ""
      ).localeCompare(
        String(a.Title || "")
      );
    });

    return projects;
  };

/*
|--------------------------------------------------------------------------
| Get projects from Google Sheet
|--------------------------------------------------------------------------
*/

export const fetchISProjectsFromSheet =
  async () => {
    const data =
      await fetchISProjectDrive();

    if (!Array.isArray(data)) {
      throw new Error(
        "Invalid data received from Google Sheet."
      );
    }

    return data.map(
      (item, index) => ({
        ...item,

        __sheetOrder: index,
        __source: "google-sheet",
      })
    );
  };

/*
|--------------------------------------------------------------------------
| HYBRID LOADER
|--------------------------------------------------------------------------
|
| Priority:
|
| 1. Firestore
| 2. Google Sheet fallback
|
| Google Sheet is NOT deleted.
| Existing Google Sheet API remains available.
|
*/

export const fetchISProjectDriveHybrid =
  async () => {
    let firestoreError = null;

    /*
    |--------------------------------------------------------------------------
    | First try Firestore
    |--------------------------------------------------------------------------
    */

    try {
      const firestoreProjects =
        await fetchISProjectsFromFirestore();

      if (
        Array.isArray(
          firestoreProjects
        ) &&
        firestoreProjects.length > 0
      ) {
        return firestoreProjects;
      }

      console.warn(
        "Firestore is available but no IS Projects were found."
      );
    } catch (error) {
      firestoreError = error;

      console.warn(
        "Firestore failed. Trying Google Sheet...",
        error
      );
    }

    /*
    |--------------------------------------------------------------------------
    | Google Sheet fallback
    |--------------------------------------------------------------------------
    */

    try {
      return await fetchISProjectsFromSheet();
    } catch (sheetError) {
      console.error(
        "Both Firestore and Google Sheet failed.",
        {
          firestoreError,
          sheetError,
        }
      );

      throw new Error(
        "Unable to load IS Project & Drive data."
      );
    }
  };