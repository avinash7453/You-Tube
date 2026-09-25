import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useUser } from "@/lib/AuthContext";
import axiosInstance from "@/lib/axiosinstance";

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => { open: () => void };
  }
}

type Plan = { amount: number; label: string; benefits: string };
type Plans = Record<"bronze" | "silver" | "gold", Plan>;

const PlansPage = () => {
  const { user, login } = useUser();
  const [plans, setPlans] = useState<Plans | null>(null);
  const [loadingPlan, setLoadingPlan] = useState("");

  useEffect(() => {
    axiosInstance.get("/subscription/plans").then((response) => setPlans(response.data));
  }, []);

  const handleUpgrade = async (plan: keyof Plans) => {
    const userId = user?._id || user?.id;
    if (!userId) {
      toast.error("Sign in to upgrade your plan.");
      return;
    }
    setLoadingPlan(plan);
    try {
      const response = await axiosInstance.post("/subscription/order", { userId, plan });
      if (!window.Razorpay) {
        await new Promise<void>((resolve, reject) => {
          const script = document.createElement("script");
          script.src = "https://checkout.razorpay.com/v1/checkout.js";
          script.onload = () => resolve();
          script.onerror = () => reject(new Error("Unable to load Razorpay checkout"));
          document.body.appendChild(script);
        });
      }
      const RazorpayCheckout = window.Razorpay;
      if (!RazorpayCheckout) throw new Error("Unable to load Razorpay checkout");
      const checkout = new RazorpayCheckout({
        key: response.data.keyId,
        amount: response.data.amount,
        currency: response.data.currency,
        name: "yourtube",
        description: `${plans?.[plan].label} subscription`,
        order_id: response.data.orderId,
        prefill: { name: response.data.name, email: response.data.email },
        handler: async (payment: Record<string, string>) => {
          try {
            const verified = await axiosInstance.post("/subscription/verify", {
              userId,
              plan,
              razorpay_order_id: payment.razorpay_order_id,
              razorpay_payment_id: payment.razorpay_payment_id,
              razorpay_signature: payment.razorpay_signature,
            });
            login(verified.data.user);
            toast.success(`${plans?.[plan].label} plan activated. Confirmation sent if email is configured.`);
          } catch (error: any) {
            toast.error(error.response?.data?.message || "Payment verification failed.");
          } finally {
            setLoadingPlan("");
          }
        },
        modal: { ondismiss: () => setLoadingPlan("") },
      });
      checkout.open();
    } catch (error: any) {
      setLoadingPlan("");
      toast.error(error.response?.data?.message || error.message || "Unable to start payment.");
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Choose your plan</h1>
        <p className="mt-1 text-sm text-gray-600">
          Current plan: <span className="font-medium uppercase">{user?.plan || "free"}</span>
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {plans && (Object.entries(plans) as [keyof Plans, Plan][]).map(([key, plan]) => (
          <div key={key} className="rounded-lg border bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold">{plan.label}</h2>
            <p className="mt-2 text-2xl font-bold">₹{plan.amount / 100}<span className="text-sm font-normal">/month</span></p>
            <p className="mt-3 min-h-12 text-sm text-gray-600">{plan.benefits}</p>
            <button
              className="mt-5 w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
              onClick={() => handleUpgrade(key)}
              disabled={Boolean(loadingPlan) || user?.plan === key}
            >
              {user?.plan === key ? "Current plan" : loadingPlan === key ? "Opening payment..." : `Upgrade to ${plan.label}`}
            </button>
          </div>
        ))}
      </div>
      <p className="text-xs text-gray-500">Payments use Razorpay test mode. No real charge is made with test credentials.</p>
    </div>
  );
};

export default PlansPage;
