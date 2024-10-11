import { useNavigate } from 'react-router-dom';

export default function ThankYou() {
  const navigate = useNavigate();

  return (
    <div className="mx-auto max-w-2xl py-20 text-center text-default-700">
      <h1 className="mb-2 text-3xl font-medium">Thanks for your support!</h1>
      <h2 className="mb-3 text-xl">You are now subscribed</h2>
      <p className="mb-6 text-default-2">
        Thank you for supporting our work and helping us bring more transparency
        and insights to the restaking ecosystem.
      </p>
      <div className="mx-auto mb-12 h-12 w-12 rounded-full bg-success text-background">
        <span className="material-symbols-outlined text-4xl font-semibold leading-[48px]">
          check
        </span>
      </div>
      <button
        className="text-sm text-default-2 underline"
        onClick={() => {
          navigate('/subscriptions');
        }}
      >
        Take me to the subscription page
      </button>
    </div>
  );
}
