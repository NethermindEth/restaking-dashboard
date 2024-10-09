import { useNavigate } from "react-router-dom";


export default function Thankyou() {
  const navigate = useNavigate();

  return (
    <div className="py-20 text-default-700 text-center max-w-2xl mx-auto">
      <h1 className="text-3xl font-medium mb-2">
        Thanks for your support!
      </h1>
      <h2 className="text-xl mb-3">
        You are now subscribed
      </h2>
      <p className="text-default-2 mb-6">
        Thank you for supporting our work and helping us bring more transparency and insights to the restaking ecosystem.
      </p>
      <div className="w-12 h-12 rounded-full bg-success text-background mx-auto mb-12">
        <span class="material-symbols-outlined text-4xl leading-[48px] font-semibold">
          check
        </span>
      </div>
      <button className="text-sm text-default-2 underline" onClick={() => { navigate('/subscriptions') }}>
        Take me to the subscription page
      </button>
    </div>
  );
}
