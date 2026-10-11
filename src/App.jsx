import { useEffect, useState } from "react";
import { Routes, Route, useLocation } from "react-router-dom";

import Header from "./components/Header/Header";
import Sidebar from "./components/Sidebar/Sidebar";

import Dashboard from "./components/Pages/Dashboard";
import Projects from "./components/Pages/Projects";
import ProjectDetails from "./components/Pages/ProjectDetails";
import ActivitySummary from "./components/Pages/ActivitySummary";
import IndividualTask from "./components/Pages/IndividualTask";
import Agenda from "./components/Pages/Agenda";
import ISProjectDrive from "./components/Pages/ISProjectDrive";

import { logPageView } from "./utils/analytics";
import { logFirestoreActivity } from "./utils/activityLogger";
import { initializeAnonymousUser } from "./utils/auth";

// Convert the URL path to a friendly page name
function getPageName(pathname) {
  if (pathname === "/") {
    return "Dashboard";
  }

  if (pathname === "/projects") {
    return "Projects";
  }

  if (pathname.startsWith("/projects/")) {
    return "Project Details";
  }

  if (pathname === "/activity-summary") {
    return "Activity Summary";
  }

  if (pathname === "/individual-task") {
    return "Individual Task";
  }

  if (pathname === "/agenda") {
    return "Agenda";
  }

  if (pathname === "/is-project-drive") {
    return "IS Project & Drive";
  }

  return "Unknown Page";
}

// Initialize anonymous authentication once per mounted app
function FirebaseUserInitializer() {
  useEffect(() => {
    initializeAnonymousUser();
  }, []);

  return null;
}

// Track page visits
function PageViewTracker() {
  const location = useLocation();

  useEffect(() => {
    const pageName =
      getPageName(location.pathname);

    const pagePath =
      location.pathname;

    // Existing Firebase Analytics tracking
    logPageView(
      pageName,
      pagePath
    );

    // Firestore activity logging
    logFirestoreActivity({
      activityType:
        "portal_page_view",
      pageName,
      pagePath,
    });
  }, [location.pathname]);

  return null;
}

// Main application
function App() {
  const [sidebarOpen, setSidebarOpen] =
    useState(false);

  const handleMenuClick = () => {
    setSidebarOpen(
      (previous) => !previous
    );
  };

  const handleSidebarClose = () => {
    setSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Firebase anonymous authentication */}
      <FirebaseUserInitializer />

      {/* Page view + Firestore activity tracking */}
      <PageViewTracker />

      {/* Header */}
      <Header
        sidebarOpen={sidebarOpen}
        onMenuClick={handleMenuClick}
      />

      {/* Sidebar */}
      <Sidebar
        sidebarOpen={sidebarOpen}
        onClose={handleSidebarClose}
      />

      {/* Main content */}
      <main className="min-h-screen pt-20">
        <Routes>
          {/* Dashboard */}
          <Route
            path="/"
            element={<Dashboard />}
          />

          {/* Projects */}
          <Route
            path="/projects"
            element={<Projects />}
          />

          {/* Project Details */}
          <Route
            path="/projects/:id"
            element={<ProjectDetails />}
          />

          {/* Individual Task */}
          <Route
            path="/individual-task"
            element={<IndividualTask />}
          />

          {/* Activity Summary */}
          <Route
            path="/activity-summary"
            element={<ActivitySummary />}
          />

          {/* Agenda */}
          <Route
            path="/agenda"
            element={<Agenda />}
          />

          {/* IS Project & Drive */}
          <Route
            path="/is-project-drive"
            element={<ISProjectDrive />}
          />
        </Routes>
      </main>
    </div>
  );
}

export default App;