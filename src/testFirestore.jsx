import { useEffect, useState } from "react";

import {
  getAuth,
  signInAnonymously,
  onAuthStateChanged,
} from "firebase/auth";

import {
  collection,
  getDocs,
} from "firebase/firestore";

import { app, db } from "./firebase";

function TestFirestore() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const auth = getAuth(app);

    const unsubscribe = onAuthStateChanged(
      auth,
      async (user) => {
        try {
          // -----------------------------------------
          // Make sure Firebase user is available
          // -----------------------------------------

          if (!user) {
            await signInAnonymously(auth);
            return;
          }

          console.log(
            "Firebase user ready:",
            user.uid
          );

          // -----------------------------------------
          // Get all documents from isProjects
          // -----------------------------------------

          const snapshot = await getDocs(
            collection(db, "isProjects")
          );

          console.log(
            "Firestore documents found:",
            snapshot.size
          );

          // -----------------------------------------
          // Convert Firestore documents to objects
          // -----------------------------------------

          const projectData = snapshot.docs.map(
            (doc) => ({
              id: doc.id,
              ...doc.data(),
            })
          );

          console.log(
            "Firestore project data:",
            projectData
          );

          setProjects(projectData);
        } catch (error) {
          console.error(
            "Firestore test failed:",
            error
          );

          setError(error.message);
        } finally {
          setLoading(false);
        }
      }
    );

    return () => unsubscribe();
  }, []);

  // -----------------------------------------
  // Loading
  // -----------------------------------------

  if (loading) {
    return (
      <div
        style={{
          padding: "30px",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <h2>Connecting to Firestore...</h2>
      </div>
    );
  }

  // -----------------------------------------
  // Error
  // -----------------------------------------

  if (error) {
    return (
      <div
        style={{
          padding: "30px",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <h2>Firestore Error</h2>

        <p
          style={{
            color: "red",
          }}
        >
          {error}
        </p>
      </div>
    );
  }

  // -----------------------------------------
  // Main UI
  // -----------------------------------------

  return (
    <div
      style={{
        padding: "30px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h1>IS Projects & Drive</h1>

      <p>
        Total Projects:{" "}
        <strong>{projects.length}</strong>
      </p>

      {projects.length === 0 ? (
        <p>
          No projects found in Firestore.
        </p>
      ) : (
        <div
          style={{
            overflowX: "auto",
            marginTop: "20px",
          }}
        >
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              minWidth: "1400px",
            }}
          >
            <thead>
              <tr>
                <th style={headerStyle}>
                  SN
                </th>

                <th style={headerStyle}>
                  Type
                </th>

                <th style={headerStyle}>
                  FY
                </th>

                <th style={headerStyle}>
                  Title
                </th>

                <th style={headerStyle}>
                  Activity
                </th>

                <th style={headerStyle}>
                  Focal-1
                </th>

                <th style={headerStyle}>
                  Focal-2
                </th>

                <th style={headerStyle}>
                  Start Date
                </th>

                <th style={headerStyle}>
                  End Date
                </th>

                <th style={headerStyle}>
                  Duration
                </th>

                <th style={headerStyle}>
                  Status
                </th>

                <th style={headerStyle}>
                  Stakeholder
                </th>

                <th style={headerStyle}>
                  Budget
                </th>

                <th style={headerStyle}>
                  Remarks
                </th>
              </tr>
            </thead>

            <tbody>
              {projects.map((project) => (
                <tr key={project.id}>
                  <td style={cellStyle}>
                    {project.sn || "-"}
                  </td>

                  <td style={cellStyle}>
                    {project.type || "-"}
                  </td>

                  <td style={cellStyle}>
                    {project.fy || "-"}
                  </td>

                  <td style={cellStyle}>
                    {project.title || "-"}
                  </td>

                  <td style={cellStyle}>
                    {project.activity || "-"}
                  </td>

                  <td style={cellStyle}>
                    {project.focal1 || "-"}
                  </td>

                  <td style={cellStyle}>
                    {project.focal2 || "-"}
                  </td>

                  <td style={cellStyle}>
                    {project.startDate || "-"}
                  </td>

                  <td style={cellStyle}>
                    {project.endDate || "-"}
                  </td>

                  <td style={cellStyle}>
                    {project.duration || "-"}
                  </td>

                  <td style={cellStyle}>
                    {project.status || "-"}
                  </td>

                  <td style={cellStyle}>
                    {project.stakeholder || "-"}
                  </td>

                  <td style={cellStyle}>
                    {project.budget || "-"}
                  </td>

                  <td style={cellStyle}>
                    {project.remarks || "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// -----------------------------------------
// Table Header Style
// -----------------------------------------

const headerStyle = {
  border: "1px solid #ddd",
  padding: "10px",
  background: "#f3f3f3",
  textAlign: "left",
  whiteSpace: "nowrap",
};

// -----------------------------------------
// Table Cell Style
// -----------------------------------------

const cellStyle = {
  border: "1px solid #ddd",
  padding: "10px",
  verticalAlign: "top",
};

export default TestFirestore;
