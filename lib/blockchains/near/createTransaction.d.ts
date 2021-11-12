import { transactions } from "near-api-js";
import { RawTx } from "../../types";
export declare function createTransaction(rawTx: RawTx): transactions.Transaction;
