import React from 'react';
import { Button } from "@nextui-org/react";

const ErrorPage = () => {
  return (
    <div className="flex flex-col items-center justify-center text-gray-300 p-4 h-full">
      <div className="w-full max-w-md text-center">
        <h1 className="text-4xl font-bold mb-6 text-red-500">An Error Occured</h1>

        <div className="bg-gray-800 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center">
          <span className="material-symbols-outlined text-5xl text-red-500">
            error
          </span>
        </div>

        <p className="mb-4 text-lg">
          We're sorry, but there was an error processing your purchase.
        </p>

        <p className="mb-8 text-gray-400">
          Please try again or contact our support team if the problem persists.
        </p>

        <div className="space-y-4">
          <Button
            color="primary"
            fullWidth
            radius="sm"
            size="lg"
            variant="bordered"
          >
            Retry Purchase
          </Button>

          <Button
            color="default"
            variant="bordered"
            size="lg"
            className="w-full"
          >
            Contact Support
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ErrorPage;