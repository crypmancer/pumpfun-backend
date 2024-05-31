"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeLiquidity = exports.sellToken = exports.buyToken = exports.addLiquidity = exports.createPool = exports.initialize = void 0;
const web3_js_1 = require("@solana/web3.js");
const config_1 = require("./config");
const anchor_1 = require("@coral-xyz/anchor");
const spl_token_1 = require("@solana/spl-token");
const token_1 = require("@coral-xyz/anchor/dist/cjs/utils/token");
const curveSeed = "CurveConfiguration";
const POOL_SEED_PREFIX = "liquidity_pool";
// const LIQUIDITY_SEED = "LiqudityProvider";
const SOL_VAULT_PREFIX = "liquidity_sol_vault";
// const mint1 = new PublicKey("6zzdo86hP9Qnpz3SkdV64qYXxp9EUwbWNL2YFBFzYpfw");
// const mint2 = new PublicKey("HD7TPfz7QwaoTGf46ifxiqAWc1NVxBBJ9mpRQbqtwamQ");
const tokenDecimal = 9;
// const amount = new BN(1000000000).mul(new BN(10 ** tokenDecimal));
function initialize(connection, wallet, amount, mint1) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log("calling initialize..");
        if (!wallet.publicKey || !connection) {
            console.log("Warning: Wallet not connected");
            return;
        }
        console.log(connection);
        const provider = new anchor_1.AnchorProvider(connection, wallet, {});
        (0, anchor_1.setProvider)(provider);
        const program = new anchor_1.Program(config_1.idl, config_1.programId);
        try {
            const [curveConfig] = web3_js_1.PublicKey.findProgramAddressSync([Buffer.from(curveSeed)], program.programId);
            const [poolPda] = web3_js_1.PublicKey.findProgramAddressSync([Buffer.from(POOL_SEED_PREFIX), mint1.toBuffer()], program.programId);
            const poolToken = yield (0, spl_token_1.getAssociatedTokenAddress)(mint1, poolPda, true);
            const [poolSolVault] = web3_js_1.PublicKey.findProgramAddressSync([Buffer.from(SOL_VAULT_PREFIX), mint1.toBuffer()], program.programId);
            const userAta1 = yield (0, spl_token_1.getAssociatedTokenAddress)(mint1, wallet.publicKey);
            const tx = new web3_js_1.Transaction().add(web3_js_1.ComputeBudgetProgram.setComputeUnitLimit({ units: 200000 }), web3_js_1.ComputeBudgetProgram.setComputeUnitPrice({ microLamports: 1200000 }), 
            // await program.methods
            //   .initialize(1)
            //   .accounts({
            //     dexConfigurationAccount: curveConfig,
            //     admin: wallet.publicKey,
            //     rent: SYSVAR_RENT_PUBKEY,
            //     systemProgram: SystemProgram.programId,
            //   })
            //   .instruction(),
            yield program.methods
                .createPool()
                .accounts({
                pool: poolPda,
                tokenMint: mint1,
                poolTokenAccount: poolToken,
                payer: wallet.publicKey,
                tokenProgram: token_1.TOKEN_PROGRAM_ID,
                rent: web3_js_1.SYSVAR_RENT_PUBKEY,
                associatedTokenProgram: token_1.ASSOCIATED_PROGRAM_ID,
                systemProgram: web3_js_1.SystemProgram.programId,
            })
                .instruction(), yield program.methods
                .addLiquidity()
                .accounts({
                pool: poolPda,
                poolSolVault: poolSolVault,
                tokenMint: mint1,
                poolTokenAccount: poolToken,
                userTokenAccount: userAta1,
                user: wallet.publicKey,
                tokenProgram: token_1.TOKEN_PROGRAM_ID,
                associatedTokenProgram: token_1.ASSOCIATED_PROGRAM_ID,
                rent: web3_js_1.SYSVAR_RENT_PUBKEY,
                systemProgram: web3_js_1.SystemProgram.programId,
            })
                .instruction());
            if (amount > 0) {
                tx.add(yield program.methods
                    .buy(new anchor_1.BN(amount * Math.pow(10, 9)))
                    .accounts({
                    pool: poolPda,
                    tokenMint: mint1,
                    poolSolVault,
                    poolTokenAccount: poolToken,
                    userTokenAccount: userAta1,
                    dexConfigurationAccount: curveConfig,
                    user: wallet.publicKey,
                    tokenProgram: token_1.TOKEN_PROGRAM_ID,
                    associatedTokenProgram: token_1.ASSOCIATED_PROGRAM_ID,
                    rent: web3_js_1.SYSVAR_RENT_PUBKEY,
                    systemProgram: web3_js_1.SystemProgram.programId,
                })
                    .instruction());
            }
            tx.feePayer = wallet.publicKey;
            tx.recentBlockhash = (yield connection.getLatestBlockhash()).blockhash;
            console.log(yield connection.simulateTransaction(tx));
            const sig = yield wallet.signTransaction(tx);
            const sTx = sig.serialize();
            const signature = yield connection.sendRawTransaction(sTx, {
                skipPreflight: true,
            });
            const blockhash = yield connection.getLatestBlockhash();
            yield connection.confirmTransaction({
                signature,
                blockhash: blockhash.blockhash,
                lastValidBlockHeight: blockhash.lastValidBlockHeight,
            }, "confirmed");
            console.log("Successfully initialized : ", `https://solscan.io/tx/${signature}?cluster=devnet`);
            return { token: mint1, signature };
            // let pool = await program.account.curveConfiguration.fetch(curveConfig);
            // console.log("Pool State : ", pool);
            // return true;
        }
        catch (error) {
            console.log("Error in initialization :", error);
            return false;
        }
    });
}
exports.initialize = initialize;
function createPool(connection, wallet, mint1) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const provider = new anchor_1.AnchorProvider(connection, wallet, {});
            (0, anchor_1.setProvider)(provider);
            const program = new anchor_1.Program(config_1.idl, config_1.programId);
            const [poolPda] = web3_js_1.PublicKey.findProgramAddressSync([Buffer.from(POOL_SEED_PREFIX), mint1.toBuffer()], program.programId);
            const poolToken = yield (0, spl_token_1.getAssociatedTokenAddress)(mint1, poolPda, true);
            const tx = new web3_js_1.Transaction().add(web3_js_1.ComputeBudgetProgram.setComputeUnitLimit({ units: 200000 }), web3_js_1.ComputeBudgetProgram.setComputeUnitPrice({ microLamports: 200000 }), yield program.methods
                .createPool()
                .accounts({
                pool: poolPda,
                tokenMint: mint1,
                poolTokenAccount: poolToken,
                payer: wallet.publicKey,
                tokenProgram: token_1.TOKEN_PROGRAM_ID,
                rent: web3_js_1.SYSVAR_RENT_PUBKEY,
                associatedTokenProgram: token_1.ASSOCIATED_PROGRAM_ID,
                systemProgram: web3_js_1.SystemProgram.programId,
            })
                .instruction());
            tx.feePayer = wallet.publicKey;
            tx.recentBlockhash = (yield connection.getLatestBlockhash()).blockhash;
            console.log(yield connection.simulateTransaction(tx));
            const sig = yield wallet.signTransaction(tx);
            const sTx = sig.serialize();
            const signature = yield connection.sendRawTransaction(sTx, {
                skipPreflight: true,
            });
            const blockhash = yield connection.getLatestBlockhash();
            yield connection.confirmTransaction({
                signature,
                blockhash: blockhash.blockhash,
                lastValidBlockHeight: blockhash.lastValidBlockHeight,
            }, "confirmed");
            console.log("Successfully created pool : ", signature);
            return true;
        }
        catch (error) {
            console.log("Error in creating pool", error);
            return false;
        }
    });
}
exports.createPool = createPool;
function addLiquidity(connection, user, mint1) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const provider = new anchor_1.AnchorProvider(connection, user, {});
            (0, anchor_1.setProvider)(provider);
            const program = new anchor_1.Program(config_1.idl, config_1.programId);
            const [poolPda] = web3_js_1.PublicKey.findProgramAddressSync([Buffer.from(POOL_SEED_PREFIX), mint1.toBuffer()], program.programId);
            // const [liquidityProviderAccount] = PublicKey.findProgramAddressSync(
            //   [
            //     Buffer.from(LIQUIDITY_SEED),
            //     poolPda.toBuffer(),
            //     user.publicKey.toBuffer(),
            //   ],
            //   program.programId
            // );
            const [poolSolVault] = web3_js_1.PublicKey.findProgramAddressSync([Buffer.from(SOL_VAULT_PREFIX), mint1.toBuffer()], program.programId);
            const poolToken = yield (0, spl_token_1.getAssociatedTokenAddress)(mint1, poolPda, true);
            const userAta1 = yield (0, spl_token_1.getAssociatedTokenAddress)(mint1, user.publicKey);
            const tx = new web3_js_1.Transaction().add(web3_js_1.ComputeBudgetProgram.setComputeUnitLimit({ units: 200000 }), web3_js_1.ComputeBudgetProgram.setComputeUnitPrice({ microLamports: 200000 }), yield program.methods
                .addLiquidity()
                .accounts({
                pool: poolPda,
                poolSolVault: poolSolVault,
                tokenMint: mint1,
                poolTokenAccount: poolToken,
                userTokenAccount: userAta1,
                user: user.publicKey,
                tokenProgram: token_1.TOKEN_PROGRAM_ID,
                associatedTokenProgram: token_1.ASSOCIATED_PROGRAM_ID,
                rent: web3_js_1.SYSVAR_RENT_PUBKEY,
                systemProgram: web3_js_1.SystemProgram.programId,
            })
                .instruction());
            tx.feePayer = user.publicKey;
            tx.recentBlockhash = (yield connection.getLatestBlockhash()).blockhash;
            console.log(yield connection.simulateTransaction(tx));
            const sig = yield user.signTransaction(tx);
            const sTx = sig.serialize();
            const signature = yield connection.sendRawTransaction(sTx, {
                skipPreflight: true,
            });
            const blockhash = yield connection.getLatestBlockhash();
            yield connection.confirmTransaction({
                signature,
                blockhash: blockhash.blockhash,
                lastValidBlockHeight: blockhash.lastValidBlockHeight,
            }, "confirmed");
            console.log("Successfully added liquidity : ", `https://solscan.io/tx/${signature}?cluster=devnet`);
            const userBalance = (yield connection.getTokenAccountBalance(userAta1))
                .value.uiAmount;
            const poolBalance = (yield connection.getTokenAccountBalance(poolToken))
                .value.uiAmount;
            console.log("after creating pool => userBalance:", userBalance);
            console.log("after creating pool => poolBalance:", poolBalance);
        }
        catch (error) {
            console.log("Error in adding liquidity", error);
        }
    });
}
exports.addLiquidity = addLiquidity;
function buyToken(connection, user, amount, mint1) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const provider = new anchor_1.AnchorProvider(connection, user, {});
            (0, anchor_1.setProvider)(provider);
            const program = new anchor_1.Program(config_1.idl, config_1.programId);
            const [curveConfig] = web3_js_1.PublicKey.findProgramAddressSync([Buffer.from(curveSeed)], program.programId);
            const [poolPda] = web3_js_1.PublicKey.findProgramAddressSync([Buffer.from(POOL_SEED_PREFIX), mint1.toBuffer()], program.programId);
            const poolToken = yield (0, spl_token_1.getAssociatedTokenAddress)(mint1, poolPda, true);
            const userAta1 = yield (0, spl_token_1.getAssociatedTokenAddress)(mint1, user.publicKey);
            const [poolSolVault] = web3_js_1.PublicKey.findProgramAddressSync([Buffer.from(SOL_VAULT_PREFIX), mint1.toBuffer()], program.programId);
            const tx = new web3_js_1.Transaction().add(web3_js_1.ComputeBudgetProgram.setComputeUnitLimit({ units: 200000 }), web3_js_1.ComputeBudgetProgram.setComputeUnitPrice({ microLamports: 200000 }), yield program.methods
                .buy(new anchor_1.BN(amount * Math.pow(10, 9)))
                .accounts({
                pool: poolPda,
                tokenMint: mint1,
                poolSolVault,
                poolTokenAccount: poolToken,
                userTokenAccount: userAta1,
                dexConfigurationAccount: curveConfig,
                user: user.publicKey,
                tokenProgram: token_1.TOKEN_PROGRAM_ID,
                associatedTokenProgram: token_1.ASSOCIATED_PROGRAM_ID,
                rent: web3_js_1.SYSVAR_RENT_PUBKEY,
                systemProgram: web3_js_1.SystemProgram.programId,
            })
                .instruction());
            tx.feePayer = user.publicKey;
            tx.recentBlockhash = (yield connection.getLatestBlockhash()).blockhash;
            console.log(yield connection.simulateTransaction(tx));
            const sig = yield user.signTransaction(tx);
            const sTx = sig.serialize();
            const signature = yield connection.sendRawTransaction(sTx, {
                skipPreflight: true,
            });
            const blockhash = yield connection.getLatestBlockhash();
            yield connection.confirmTransaction({
                signature,
                blockhash: blockhash.blockhash,
                lastValidBlockHeight: blockhash.lastValidBlockHeight,
            }, "confirmed");
            console.log("Successfully bought : ", `https://solscan.io/tx/${signature}?cluster=devnet`);
        }
        catch (error) {
            console.log("Error in swap transaction", error.message);
            toast.error(error.message);
        }
    });
}
exports.buyToken = buyToken;
function sellToken(connection, wallet, amount, mint1) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const provider = new anchor_1.AnchorProvider(connection, wallet, {});
            (0, anchor_1.setProvider)(provider);
            const program = new anchor_1.Program(config_1.idl, config_1.programId);
            const [curveConfig] = web3_js_1.PublicKey.findProgramAddressSync([Buffer.from(curveSeed)], program.programId);
            const [poolPda] = web3_js_1.PublicKey.findProgramAddressSync([Buffer.from(POOL_SEED_PREFIX), mint1.toBuffer()], program.programId);
            const poolToken = yield (0, spl_token_1.getAssociatedTokenAddress)(mint1, poolPda, true);
            const userAta1 = yield (0, spl_token_1.getAssociatedTokenAddress)(mint1, wallet.publicKey);
            const [poolSolVault, bump] = web3_js_1.PublicKey.findProgramAddressSync([Buffer.from(SOL_VAULT_PREFIX), mint1.toBuffer()], program.programId);
            const bnAmount = new anchor_1.BN(amount).mul(new anchor_1.BN(Math.pow(10, tokenDecimal)));
            const tx = new web3_js_1.Transaction()
                .add(web3_js_1.ComputeBudgetProgram.setComputeUnitLimit({ units: 200000 }), web3_js_1.ComputeBudgetProgram.setComputeUnitPrice({ microLamports: 200000 }), yield program.methods
                .sell(bnAmount, bump)
                .accounts({
                pool: poolPda,
                tokenMint: mint1,
                poolSolVault,
                poolTokenAccount: poolToken,
                userTokenAccount: userAta1,
                dexConfigurationAccount: curveConfig,
                user: wallet.publicKey,
                tokenProgram: token_1.TOKEN_PROGRAM_ID,
                associatedTokenProgram: token_1.ASSOCIATED_PROGRAM_ID,
                rent: web3_js_1.SYSVAR_RENT_PUBKEY,
                systemProgram: web3_js_1.SystemProgram.programId
            })
                .instruction());
            tx.feePayer = wallet.publicKey;
            tx.recentBlockhash = (yield connection.getLatestBlockhash()).blockhash;
            console.log(yield connection.simulateTransaction(tx));
            const sig = yield wallet.signTransaction(tx);
            const sTx = sig.serialize();
            const signature = yield connection.sendRawTransaction(sTx, {
                skipPreflight: true,
            });
            const blockhash = yield connection.getLatestBlockhash();
            yield connection.confirmTransaction({
                signature,
                blockhash: blockhash.blockhash,
                lastValidBlockHeight: blockhash.lastValidBlockHeight,
            }, "confirmed");
            console.log("Successfully Sold : ", `https://solscan.io/tx/${signature}?cluster=devnet`);
        }
        catch (error) {
            console.log("Error in sell transaction", error);
            toast.error(error.message);
        }
    });
}
exports.sellToken = sellToken;
function removeLiquidity(connection, user, mint1) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const provider = new anchor_1.AnchorProvider(connection, user, {});
            (0, anchor_1.setProvider)(provider);
            const program = new anchor_1.Program(config_1.idl, config_1.programId);
            const [poolPda] = web3_js_1.PublicKey.findProgramAddressSync([Buffer.from(POOL_SEED_PREFIX), mint1.toBuffer()], program.programId);
            const poolToken = yield (0, spl_token_1.getAssociatedTokenAddress)(mint1, poolPda, true);
            const userAta1 = yield (0, spl_token_1.getAssociatedTokenAddress)(mint1, user.publicKey);
            const [poolSolVault, bump] = web3_js_1.PublicKey.findProgramAddressSync([Buffer.from(SOL_VAULT_PREFIX), mint1.toBuffer()], program.programId);
            console.log('pooldsolvault => ', poolSolVault);
            console.log("token supply => ", bump);
            const tx = new web3_js_1.Transaction().add(web3_js_1.ComputeBudgetProgram.setComputeUnitLimit({ units: 200000 }), web3_js_1.ComputeBudgetProgram.setComputeUnitPrice({ microLamports: 200000 }), yield program.methods
                .removeLiquidity(bump)
                .accounts({
                pool: poolPda,
                tokenMint: mint1,
                poolTokenAccount: poolToken,
                userTokenAccount: userAta1,
                poolSolVault,
                user: user.publicKey,
                tokenProgram: token_1.TOKEN_PROGRAM_ID,
                associatedTokenProgram: token_1.ASSOCIATED_PROGRAM_ID,
                rent: web3_js_1.SYSVAR_RENT_PUBKEY,
                systemProgram: web3_js_1.SystemProgram.programId,
            })
                .instruction());
            tx.feePayer = user.publicKey;
            tx.recentBlockhash = (yield connection.getLatestBlockhash()).blockhash;
            console.log(yield connection.simulateTransaction(tx));
            const sig = yield user.signTransaction(tx);
            const sTx = sig.serialize();
            const signature = yield connection.sendRawTransaction(sTx, {
                skipPreflight: true,
            });
            const blockhash = yield connection.getLatestBlockhash();
            yield connection.confirmTransaction({
                signature,
                blockhash: blockhash.blockhash,
                lastValidBlockHeight: blockhash.lastValidBlockHeight,
            }, "confirmed");
            console.log("Successfully removed liquidity : ", `https://solscan.io/tx/${signature}?cluster=devnet`);
        }
        catch (error) {
            console.log("Error in removing liquidity", error);
        }
    });
}
exports.removeLiquidity = removeLiquidity;
