import React from "react";

const Error = ({ message }: { message: string }) => {
  return (
    <div
      className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
      role="alert"
    >
      <strong className="block sm:inline">{message}</strong>
    </div>
  );
};

export default Error;
