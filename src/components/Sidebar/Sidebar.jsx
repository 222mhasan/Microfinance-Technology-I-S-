import { NavLink } from "react-router-dom";

import {
  LayoutDashboard,
  FolderKanban,
  ListTodo,
  BarChart3,
  CalendarDays,
  BriefcaseBusiness,
} from "lucide-react";

const Sidebar = ({ sidebarOpen, onClose }) => {
  const menuItems = [
    {
      name: "Dashboard",
      path: "/",
      icon: LayoutDashboard,
      ariaLabel: "Go to Dashboard",
    },
    {
      name: "IS Project & Drive",
      path: "/is-project-drive",
      icon: BriefcaseBusiness,
    },
    {
      name: "Projects",
      path: "/projects",
      icon: FolderKanban,
      ariaLabel: "Go to Projects",
    },
    {
      name: "Individual Task",
      path: "/individual-task",
      icon: ListTodo,
      ariaLabel: "Go to Individual Task",
    },
    {
      name: "Activity Summary",
      path: "/activity-summary",
      icon: BarChart3,
      ariaLabel: "Go to Activity Summary",
    },
    {
      name: "Agenda",
      path: "/agenda",
      icon: CalendarDays,
    },
    
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <button
          type="button"
          onClick={onClose}
          aria-label="Close sidebar overlay"
          className="fixed inset-0 top-20 z-40 bg-black/20 lg:hidden"
        />
      )}

      <aside
        className={`
          fixed
          top-20
          left-0
          z-50
          h-[calc(100vh-5rem)]
          w-64
          border-r
          border-gray-200
          bg-white
          shadow-xl
          transition-transform
          duration-300
          ease-in-out
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        `}
        aria-label="Main sidebar navigation"
      >
        {/* ==========================================
            SIDEBAR HEADER
        ========================================== */}

        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-5">
          <div>
            <h2 className="text-sm font-bold text-gray-800">
              Microfinance Technology
            </h2>

            <p className="mt-1 text-[10px] font-medium uppercase tracking-wider text-gray-400">
              Infrastructure &amp; Support
            </p>
          </div>

          {/* Close Button */}

          <button
            type="button"
            onClick={onClose}
            className="
              flex
              h-8
              w-8
              items-center
              justify-center
              rounded-lg
              text-gray-500
              transition
              hover:bg-pink-50
              hover:text-pink-600
              focus:outline-none
              focus:ring-2
              focus:ring-pink-500
              focus:ring-offset-2
            "
            aria-label="Close navigation sidebar"
          >
            <span className="text-xl leading-none" aria-hidden="true">
              ×
            </span>
          </button>
        </div>

        {/* ==========================================
            NAVIGATION
        ========================================== */}

        <nav className="p-4" aria-label="Primary navigation">
          <p className="mb-3 px-4 text-[10px] font-bold uppercase tracking-widest text-gray-400">
            Main Menu
          </p>

          <div className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.name}
                  to={item.path}
                  onClick={onClose}
                  end={item.path === "/"}
                  aria-label={item.ariaLabel}
                  className={({ isActive }) =>
                    `
                      group
                      flex
                      items-center
                      gap-3
                      rounded-xl
                      px-4
                      py-3
                      text-sm
                      font-medium
                      transition-all
                      duration-200
                      focus:outline-none
                      focus:ring-2
                      focus:ring-pink-500
                      focus:ring-offset-1

                      ${
                        isActive
                          ? `
                            border-l-4
                            border-pink-600
                            bg-pink-50
                            text-pink-700
                            shadow-sm
                          `
                          : `
                            text-gray-600
                            hover:translate-x-1
                            hover:bg-gray-50
                            hover:text-pink-600
                          `
                      }
                    `
                  }
                >
                  {/* Icon */}

                  <span
                    className="
                      flex
                      h-7
                      w-7
                      flex-shrink-0
                      items-center
                      justify-center
                      rounded-lg
                    "
                    aria-hidden="true"
                  >
                    <Icon size={18} />
                  </span>

                  {/* Menu Name */}

                  <span>{item.name}</span>
                </NavLink>
              );
            })}
          </div>
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
