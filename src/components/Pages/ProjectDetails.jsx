
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

const ProjectDetails = () => {
  const { id } = useParams();

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

const API_URL =
  "https://script.google.com/macros/s/AKfycbw9ARpnkUgzbxOpxtJVglZvV6dWfN6eqQJ3L-1fTYxJWhYrmNjwuaQqC0Wkxquyq2o/exec";

  const fetchProject = async () => {
    try {
      setLoading(true);

      const response = await fetch(API_URL);

      if (!response.ok) {
        throw new Error("Failed to load project");
      }

      const data = await response.json();

      const selectedProject = data.find(
        (item) => String(item.ID) === String(id)
      );

      if (!selectedProject) {
        throw new Error("Project not found");
      }

      setProject(selectedProject);

    } catch (error) {
      console.error(error);
      setError("Unable to load project details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProject();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-gray-500">
          Loading project details...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="p-4 text-red-700 bg-red-100 rounded-lg">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 bg-gray-50">

      {/* Back Button */}

      <div className="mb-6">

        <Link
          to="/projects"
          className="inline-flex items-center gap-2 text-sm font-medium text-pink-600 hover:text-pink-700"
        >
          <i className="fa-solid fa-arrow-left"></i>
          Back to Projects
        </Link>

      </div>


      {/* Project Details */}

      <div className="max-w-5xl mx-auto">

        <div className="overflow-hidden bg-white border border-gray-200 shadow-sm rounded-xl">


          {/* Header */}

          <div className="p-6 border-b border-gray-200">

            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

              <div>

                <p className="mb-2 text-xs font-medium tracking-wide text-pink-600 uppercase">
                  Project Details
                </p>

                <h1 className="text-3xl font-bold text-gray-800">
                  {project.Title}
                </h1>

              </div>


              <span className="px-4 py-2 text-sm font-medium text-pink-700 bg-pink-100 rounded-full">
                {project.Status}
              </span>

            </div>

          </div>


          {/* Information */}

          <div className="grid grid-cols-1 gap-6 p-6 md:grid-cols-2">


            {/* Timeline */}

            <div className="p-5 bg-gray-50 rounded-xl">

              <div className="flex items-center gap-3">

                <div className="flex items-center justify-center w-10 h-10 text-pink-600 bg-pink-100 rounded-lg">

                  <i className="fa-solid fa-calendar-days"></i>

                </div>

                <div>

                  <p className="text-xs text-gray-400 uppercase">
                    Timeline
                  </p>

                  <p className="font-medium text-gray-800">
                    {project.Timeline}
                  </p>

                </div>

              </div>

            </div>


            {/* Manager */}

            <div className="p-5 bg-gray-50 rounded-xl">

              <div className="flex items-center gap-3">

                <div className="flex items-center justify-center w-10 h-10 text-pink-600 bg-pink-100 rounded-lg">

                  <i className="fa-solid fa-user"></i>

                </div>

                <div>

                  <p className="text-xs text-gray-400 uppercase">
                    Manager
                  </p>

                  <p className="font-medium text-gray-800">
                    {project.Manager}
                  </p>

                </div>

              </div>

            </div>


          </div>


          {/* Progress */}

          <div className="px-6 pb-6">

            <div className="p-5 bg-gray-50 rounded-xl">

              <div className="flex justify-between mb-3">

                <span className="font-medium text-gray-700">
                  Project Progress
                </span>

                <span className="font-bold text-pink-600">
                  {project.Progress}%
                </span>

              </div>


              <div className="w-full h-4 overflow-hidden bg-gray-200 rounded-full">

                <div
                  className="h-full transition-all duration-700 bg-pink-600 rounded-full"
                  style={{
                    width: `${project.Progress}%`,
                  }}
                ></div>

              </div>

            </div>

          </div>


          {/* Description */}

          <div className="p-6 border-t border-gray-200">

            <h2 className="mb-3 text-lg font-semibold text-gray-800">
              Project Description
            </h2>

            <p className="leading-7 text-gray-600">
              {project.Description}
            </p>

          </div>


          {/* Project ID */}

          <div className="px-6 pb-6">

            <p className="text-sm text-gray-400">
              Project ID: {project.ID}
            </p>

          </div>


        </div>

      </div>

    </div>
  );
};

export default ProjectDetails;
