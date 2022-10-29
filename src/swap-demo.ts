import { readFile } from "mz/fs";
import { Connection, Keypair, Transaction } from "@solana/web3.js";
import { getOrca, OrcaPoolConfig, Network } from "@orca-so/sdk";
import Decimal from "decimal.js";


const main = async () => {

    /*** Setup ***/
        // 1. Read secret key file to get owner keypair
    const secretKeyString = await readFile("/Users/quanghuy/.config/solana/id.json", {
            encoding: "utf8",
        });
    const connection = new Connection("https://api.devnet.solana.com", "singleGossip");
    const secretKey = Uint8Array.from(JSON.parse(secretKeyString));
    const owner = Keypair.fromSecretKey(secretKey);

    // 2. Initialzie Orca object with mainnet connection

    const orca = getOrca(connection, Network.DEVNET);

    try {
        /*** Swap ***/
            // 3. We will be swapping 0.1 SOL for some ORCA
        const orcaSolPool = orca.getPool(OrcaPoolConfig.ORCA_SOL);
        const solToken = orcaSolPool.getTokenB();
        const solAmount = new Decimal(0.1);
        const quote = await orcaSolPool.getQuote(solToken, solAmount);
        const orcaAmount = quote.getMinOutputAmount();

        console.log(`Swap ${solAmount.toString()} SOL for at least ${orcaAmount.toNumber()} ORCA`);
        const swapPayload = await orcaSolPool.swap(owner, solToken, solAmount, orcaAmount);
        console.log(swapPayload)
        const swapTxId = await swapPayload.execute();
        console.log("Swapped:", swapTxId, "\n");

        /*** Pool Deposit ***/
            // 4. Deposit SOL and ORCA for LP token
        // const { maxTokenAIn, maxTokenBIn, minPoolTokenAmountOut } = await orcaSolPool.getDepositQuote(
        //         orcaAmount,
        //         solAmount
        //     );

        // console.log(
        //     `Deposit at most ${maxTokenBIn.toNumber()} SOL and ${maxTokenAIn.toNumber()} ORCA, for at least ${minPoolTokenAmountOut.toNumber()} LP tokens`
        // );
        // const poolDepositPayload = await orcaSolPool.deposit(
        //     owner,
        //     maxTokenAIn,
        //     maxTokenBIn,
        //     minPoolTokenAmountOut
        // );
        // const poolDepositTxId = await poolDepositPayload.execute();
        // console.log("Pool deposited:", poolDepositTxId, "\n");

    } catch (err) {
        console.warn(err);
    }
};

main()
    .then(() => {
        console.log("Done");
    })
    .catch((e) => {
        console.error(e);
    });