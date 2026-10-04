import { useState } from "react";
import { Routes, Route } from "react-router-dom";

import Header from "./components/Header/Header";
import Sidebar from "./components/Sidebar";
import Dashboard from "./components/Pages/Dashboard";
import Projects from "./components/Pages/Projects";
import ProjectDetails from "./components/Pages/ProjectDetails";

const App = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen((previous) => !previous);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Header */}
      <Header
        sidebarOpen={sidebarOpen}
        onMenuClick={toggleSidebar}
      />

      {/* Sidebar */}
      <Sidebar
        sidebarOpen={sidebarOpen}
        onClose={closeSidebar}
      />

      {/* Overlay */}
      {sidebarOpen && (
        <div
          onClick={closeSidebar}
          className="fixed inset-0 z-40 bg-black/30"
        ></div>
      )}

      {/* Main Content */}
      <main className="pt-20">

        <Routes>

          <Route
            path="/"
            element={<Dashboard />}
          />

          <Route
            path="/projects"
            element={<Projects />}
          />

          <Route
            path="/projects/:id"
            element={<ProjectDetails />}
          />

        </Routes>

      </main>

    </div>
  );
};

export default App;