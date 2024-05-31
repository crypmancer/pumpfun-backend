"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SOL_VAULT_PREFIX = exports.POOL_SEED_PREFIX = exports.idl = exports.programId = void 0;
const web3_js_1 = require("@solana/web3.js");
const bonding_curve_json_1 = __importDefault(require("./bonding_curve.json"));
exports.idl = bonding_curve_json_1.default;
const programId = new web3_js_1.PublicKey("5mdPUgyK9mqosLtqZvfpY5pcpCqQBWHuS3XoU34CrJK3");
exports.programId = programId;
const POOL_SEED_PREFIX = "liquidity_pool";
exports.POOL_SEED_PREFIX = POOL_SEED_PREFIX;
// const LIQUIDITY_SEED = "LiqudityProvider";
const SOL_VAULT_PREFIX = "liquidity_sol_vault";
exports.SOL_VAULT_PREFIX = SOL_VAULT_PREFIX;
