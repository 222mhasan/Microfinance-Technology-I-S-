
import { NavLink } from "react-router-dom";

const Sidebar = ({ sidebarOpen, onClose }) => {
  const menuItems = [
    {
      name: "Dashboard",
      path: "/",
      icon: "⌂",
      ariaLabel: "Go to Dashboard",
    },
    {
      name: "Projects",
      path: "/projects",
      icon: "▣",
      ariaLabel: "Go to Projects",
    },
    {
      name: "Activity Summary",
      path: "/activity-summary",
      icon: "▤",
      ariaLabel: "Go to Activity Summary",
    },
    {
      name: "Reports",
      path: "/reports",
      icon: "▥",
      ariaLabel: "Go to Reports",
    },
    {
      name: "Knowledge Sharing",
      path: "/knowledge-sharing",
      icon: "◈",
      ariaLabel: "Go to Knowledge Sharing",
    },
    {
      name: "Circulars",
      path: "/circulars",
      icon: "◫",
      ariaLabel: "Go to Circulars",
    },
  ];

  return (
    <aside
      className={`
        fixed
        top-20
        left-0
        z-50
        w-64
        h-[calc(100vh-5rem)]
        bg-white
        border-r
        border-gray-200
        shadow-xl
        transition-transform
        duration-300
        ease-in-out
        ${
          sidebarOpen
            ? "translate-x-0"
            : "-translate-x-full"
        }
      `}
      aria-label="Main sidebar navigation"
    >

      {/* ==========================================
          SIDEBAR HEADER
      ========================================== */}

      <div className="flex items-center justify-between px-5 py-5 border-b border-gray-100">

        <div>

          <h2 className="text-sm font-bold text-gray-800">
            Microfinance Technology
          </h2>

          <p className="mt-1 text-[10px] font-medium tracking-wider text-gray-400 uppercase">
            Infrastructure &amp; Support
          </p>

        </div>

        {/* CLOSE BUTTON */}

        <button
          type="button"
          onClick={onClose}
          className="
            flex
            items-center
            justify-center
            w-8
            h-8
            text-gray-500
            rounded-lg
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
          <span
            className="text-xl leading-none"
            aria-hidden="true"
          >
            ×
          </span>
        </button>

      </div>

      {/* ==========================================
          NAVIGATION
      ========================================== */}

      <nav
        className="p-4"
        aria-label="Primary navigation"
      >

        <p className="px-4 mb-3 text-[10px] font-bold tracking-widest text-gray-400 uppercase">
          Main Menu
        </p>

        <div className="space-y-1">

          {menuItems.map((item) => (

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
                  px-4
                  py-3
                  rounded-xl
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
                        bg-pink-50
                        text-pink-700
                        border-l-4
                        border-pink-600
                        shadow-sm
                      `
                      : `
                        text-gray-600
                        hover:bg-gray-50
                        hover:text-pink-600
                        hover:translate-x-1
                      `
                  }
                `
              }
            >

              {/* ICON */}

              <span
                className="
                  flex
                  items-center
                  justify-center
                  flex-shrink-0
                  w-7
                  h-7
                  text-sm
                  rounded-lg
                "
                aria-hidden="true"
              >
                {item.icon}
              </span>

              {/* MENU NAME */}

              <span>
                {item.name}
              </span>

            </NavLink>

          ))}

        </div>

      </nav>

      {/* ==========================================
          BOTTOM USER SECTION
      ========================================== */}

     

    </aside>
  );
};

export default Sidebar;

