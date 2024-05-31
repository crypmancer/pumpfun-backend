import { PublicKey } from "@solana/web3.js";
import idl from './bonding_curve.json'

const programId = new PublicKey("5mdPUgyK9mqosLtqZvfpY5pcpCqQBWHuS3XoU34CrJK3");

const POOL_SEED_PREFIX = "liquidity_pool";
// const LIQUIDITY_SEED = "LiqudityProvider";
const SOL_VAULT_PREFIX = "liquidity_sol_vault";
export{
    programId,
    idl,
    POOL_SEED_PREFIX,
    SOL_VAULT_PREFIX
}