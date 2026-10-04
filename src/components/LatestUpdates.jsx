
import Marquee from "react-fast-marquee";

const LatestUpdates = () => {
  const updates = [
    "E-Approval onboarding has been completed for Dinajpur-1 (Progoti).",
    "Please update the Technology Officers' Professional Relationship Development sheet.",
    "Monthly Technology Support Report is now available.",
    "New Knowledge Sharing session schedule has been published.",
    "Please ensure all pending CRM issues are updated regularly.",
  ];

  return (
    <div className="w-full overflow-hidden bg-pink-50 border-b border-pink-100">
      <Marquee
        speed={50}
        pauseOnHover={true}
        gradient={false}
        direction="left"
      >
        {updates.map((update, index) => (
          <div
            key={index}
            className="flex items-center mr-16 py-2 text-sm text-gray-700"
          >
            <span className="mr-2 text-pink-600">●</span>
            {update}
          </div>
        ))}
      </Marquee>
    </div>
  );
};

export default LatestUpdates;
