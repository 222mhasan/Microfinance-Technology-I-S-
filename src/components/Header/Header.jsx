import { useEffect, useState } from "react";

const Header = ({ sidebarOpen, onMenuClick }) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const time = currentTime.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  const date = currentTime.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-20 bg-white border-b border-gray-200 shadow-sm">

      <div className="flex items-center justify-between h-full px-5">

        {/* Left Section */}
        <div className="flex items-center gap-4">

          {/* Hamburger Toggle */}
          <button
            type="button"
            onClick={onMenuClick}
            aria-label={sidebarOpen ? "Close menu" : "Open menu"}
            className="flex flex-col items-center justify-center w-10 h-10 gap-1.5 text-gray-600 transition rounded-lg hover:bg-pink-50 hover:text-pink-600"
          >
            {sidebarOpen ? (
              <>
                <span className="block w-6 h-0.5 bg-current rotate-45 translate-y-1"></span>
                <span className="block w-6 h-0.5 bg-current -rotate-45 -translate-y-1"></span>
              </>
            ) : (
              <>
                <span className="block w-6 h-0.5 bg-current"></span>
                <span className="block w-6 h-0.5 bg-current"></span>
                <span className="block w-6 h-0.5 bg-current"></span>
              </>
            )}
          </button>

          {/* Logo */}
          <div className="flex items-center justify-center w-10 h-10 font-bold text-white bg-pink-600 rounded-lg">
            MF
          </div>

          {/* Title */}
          <div>
            <h1 className="text-lg font-bold leading-tight text-gray-800">
              Microfinance Technology
            </h1>

            <p className="text-xs text-gray-500">
              Insfratructure & Support
            </p>
          </div>

        </div>

        {/* Right Section */}
        <div className="flex items-center gap-5">

          {/* Date & Time */}
          <div className="hidden text-right sm:block">
            <p className="text-sm font-semibold text-gray-700">
              {time}
            </p>

            <p className="text-xs text-gray-400">
              {date}
            </p>
          </div>

          {/* User */}
          <div className="flex items-center justify-center w-10 h-10 text-sm font-bold text-pink-700 bg-pink-100 rounded-full">
            I&S
          </div>

        </div>

      </div>

    </header>
  );
};

export default Header;