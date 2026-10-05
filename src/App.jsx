
import { useState } from "react";
import { Routes, Route } from "react-router-dom";

import Header from "./components/Header/Header";
import Sidebar from "./components/Sidebar/Sidebar";

import Dashboard from "./components/Pages/Dashboard";
import Projects from "./components/Pages/Projects";
import ProjectDetails from "./components/Pages/ProjectDetails";
import ActivitySummary from "./components/Pages/ActivitySummary";
import IndividualTask from "./components/Pages/IndividualTask";

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleMenuClick = () => {
    setSidebarOpen((previous) => !previous);
  };

  const handleSidebarClose = () => {
    setSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-50">

      {/* ==========================================
          HEADER
      ========================================== */}
      <Header
        sidebarOpen={sidebarOpen}
        onMenuClick={handleMenuClick}
      />

      {/* ==========================================
          SIDEBAR
      ========================================== */}
      <Sidebar
        sidebarOpen={sidebarOpen}
        onClose={handleSidebarClose}
      />

      {/* ==========================================
          MAIN CONTENT
      ========================================== */}
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

        </Routes>

      </main>

    </div>
  );
}

export default App;
