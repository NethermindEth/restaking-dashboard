import { SpiceClient } from "@spiceai/spice";
import * as dotenv from "dotenv";
dotenv.config();

if (process.env.SPICE_AI_API_KEY === undefined) {
    throw new Error("SPICE_AI_API_KEY env variable not set");
}

const spiceClient = new SpiceClient(process.env.SPICE_AI_API_KEY || "");
export default spiceClient;
