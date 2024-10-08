import { Button } from "@nextui-org/react";
import { useNavigate } from "react-router-dom";

export default function Thankyou() {

  const navigate = useNavigate();

  return (
    <div className="flex h-full items-center justify-center text-outline">
      <div className="w-full max-w-xl mx-auto">
        <div className="flex flex-col items-center pb-0 pt-6 px-4 mb-12">
          <div className="text-4xl lg:text-8xl font-bold text-outline flex items-center">
            <span className="whitespace-nowrap">Thank You</span>
            <span className="material-symbols-outlined text-7xl mx-2 text-outline">
              sentiment_very_satisfied
            </span>
          </div>
        </div>
        <div className="flex flex-col items-center pb-6 px-4">
          <div className="text-center mb-6 text-default-700">
            <p className="mb-4">
              Thank You for Your Support!
            </p>


            <p className="text-default-2">
              You've unlocked advanced Eigenlayer insights. Your journey to smarter restaking starts now, and we're grateful for your trust in us.
            </p>
          </div>

          <Button
            color="primary"
            fullWidth
            radius="sm"
            variant="bordered"
            onClick={() => {
              navigate('/');
            }}
          >
            Return Home
          </Button>

        </div>
      </div>
    </div>
  );
}
