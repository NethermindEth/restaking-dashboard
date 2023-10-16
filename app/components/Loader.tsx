import React from "react";

export default () => {
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-white opacity-75">
      <div className="loader ease-linear rounded-full border-4 border-t-4 border-gray-200 h-12 w-12"></div>
    </div>
  );
};
