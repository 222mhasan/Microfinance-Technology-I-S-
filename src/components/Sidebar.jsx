import { NavLink } from "react-router-dom";

const Sidebar = ({ sidebarOpen, onClose }) => {
  const menuItems = [
    {
      name: "Dashboard",
      path: "/",
    },
    {
      name: "Projects",
      path: "/projects",
    },
    {
      name: "Reports",
      path: "/reports",
    },
    {
      name: "Knowledge Sharing",
      path: "/knowledge-sharing",
    },
    {
      name: "Circulars",
      path: "/circulars",
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
    >
      {/* Sidebar Header */}
      <div className="flex items-center justify-between px-5 py-5 border-b border-gray-100">

        <div>
          <h2 className="text-sm font-bold text-gray-800">
            Microfinance Technology
          </h2>

         
        </div>

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="flex items-center justify-center w-8 h-8 text-gray-500 rounded-lg hover:bg-pink-50 hover:text-pink-600"
          aria-label="Close sidebar"
        >
          <span className="text-xl leading-none">
            ×
          </span>
        </button>

      </div>

      {/* Menu */}
      <nav className="p-4">

        <div className="space-y-1">

          {menuItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              onClick={onClose}
              className={({ isActive }) =>
                `
                flex
                items-center
                px-4
                py-3
                rounded-lg
                text-sm
                font-medium
                transition-all
                duration-200
                ${
                  isActive
                    ? "bg-pink-50 text-pink-700 border-l-4 border-pink-600"
                    : "text-gray-600 hover:bg-gray-50 hover:text-pink-600"
                }
                `
              }
            >
              <span>{item.name}</span>
            </NavLink>
          ))}

        </div>

      </nav>

      {/* Bottom User Section */}
      <div className="absolute bottom-0 left-0 w-full p-4 border-t border-gray-200 bg-white">

        <div className="flex items-center gap-3">

          <div className="flex items-center justify-center flex-shrink-0 w-10 h-10 text-sm font-bold text-pink-700 bg-pink-100 rounded-full">
            MH
          </div>

          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-700 truncate">
              Technology Officer
            </p>

            <p className="text-xs text-gray-400 truncate">
              Microfinance Technology
            </p>
          </div>

        </div>

      </div>

    </aside>
  );
};

export default Sidebar;