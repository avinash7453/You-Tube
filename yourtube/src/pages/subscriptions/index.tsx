import { useUser } from "@/lib/AuthContext";

const SubscriptionsPage = () => {
  const { User } = useUser();

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6">
      <h1 className="text-2xl font-semibold text-gray-900">Subscriptions</h1>
      <p className="mt-2 text-sm text-gray-600">
        {User
          ? "Channels you subscribe to will appear here."
          : "Sign in to view your subscriptions."}
      </p>
    </div>
  );
};

export default SubscriptionsPage;
