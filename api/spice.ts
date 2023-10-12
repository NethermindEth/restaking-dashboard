import { SpiceClient } from "@spiceai/spice";
import * as dotenv from "dotenv";
dotenv.config();

const spiceClient = new SpiceClient(process.env.SPICE_AI_API_KEY || "");
export default spiceClient;
