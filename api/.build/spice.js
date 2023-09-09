"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var spice_1 = require("@spiceai/spice");
var dotenv = require("dotenv");
dotenv.config();
var spiceClient = new spice_1.SpiceClient(process.env.SPICE || "");
exports.default = spiceClient;
//# sourceMappingURL=spice.js.map