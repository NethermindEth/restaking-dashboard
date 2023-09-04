import { SpiceClient } from "@spiceai/spice";

const spiceClient = new SpiceClient(process.env.NEXT_PUBLIC_STRIPE_KEY || "");
export default spiceClient;
