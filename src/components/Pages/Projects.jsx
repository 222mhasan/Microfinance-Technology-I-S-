import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const Projects = () => {
  const API_URL =
    "https://script.google.com/macros/s/AKfycbw9ARpnkUgzbxOpxtJVglZvV6dWfN6eqQJ3L-1fTYxJWhYrmNjwuaQqC0Wkxquyq2o/exec";

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(API_URL);

      if (!response.ok) {
        throw new Error("Failed to load projects");
      }

      const data = await response.json();

      setProjects(data);
    } catch (error) {
      console.error("Error loading projects:", error);

      setError("Unable to load projects.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-gray-500">Loading projects...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="p-4 text-sm text-red-700 bg-red-100 rounded-lg">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 bg-gray-50">

      {/* Page Header */}

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          Projects
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Microfinance Technology Projects
        </p>
      </div>

      {/* No Projects */}

      {projects.length === 0 ? (
        <div className="p-6 text-center bg-white rounded-xl">
          <p className="text-gray-500">
            No projects found.
          </p>
        </div>
      ) : (

        /* Project Cards */

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">

          {projects.map((project) => (

            <div
              key={project.ID}
              className="overflow-hidden transition bg-white border border-gray-200 shadow-sm rounded-xl hover:shadow-lg"
            >

              {/* Card Header */}

              <div className="p-5 border-b border-gray-100">

                <div className="flex items-start justify-between gap-3">

                  <h2 className="text-lg font-semibold text-gray-800">
                    {project.Title}
                  </h2>

                  <span className="px-2 py-1 text-xs font-medium text-pink-700 bg-pink-100 rounded-full whitespace-nowrap">
                    {project.Status}
                  </span>

                </div>

              </div>

              {/* Card Body */}

              <div className="p-5">

                {/* Timeline */}

                <div className="mb-4">

                  <p className="text-xs font-medium text-gray-400 uppercase">
                    Timeline
                  </p>

                  <p className="mt-1 text-sm text-gray-700">
                    {project.Timeline}
                  </p>

                </div>

                {/* Manager */}

                <div className="mb-4">

                  <p className="text-xs font-medium text-gray-400 uppercase">
                    Manager
                  </p>

                  <p className="mt-1 text-sm text-gray-700">
                    {project.Manager}
                  </p>

                </div>

                {/* Progress */}

                <div className="mb-5">

                  <div className="flex justify-between mb-2">

                    <span className="text-xs font-medium text-gray-500">
                      Progress
                    </span>

                    <span className="text-xs font-semibold text-pink-600">
                      {project.Progress}%
                    </span>

                  </div>

                  <div className="w-full h-2 overflow-hidden bg-gray-200 rounded-full">

                    <div
                      className="h-full bg-pink-600 rounded-full"
                      style={{
                        width: `${project.Progress}%`,
                      }}
                    ></div>

                  </div>

                </div>

                {/* View Details */}

                <Link
                  to={`/projects/${project.ID}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full px-4 py-2 text-sm font-medium text-center text-white transition bg-pink-600 rounded-lg hover:bg-pink-700"
                >
                  View Details
                </Link>

              </div>

            </div>

          ))}

        </div>

      )}

    </div>
  );
};

export default Projects;