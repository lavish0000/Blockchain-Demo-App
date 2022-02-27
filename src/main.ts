import sha256 from "crypto-js/sha256";
import { TransactionType } from "./types";

export default class Blockchain {
  readonly blockSize: number;
  readonly initialBalances: number[];
  readonly transactions: TransactionType[];
  readonly blocks: Block[];
  readonly pendingTransactions: TransactionType[];

  constructor(
    initialBalances: number[],
    transactions: [number, number, number][],
    blockSize: number
  ) {
    this.blockSize = blockSize;
    this.initialBalances = initialBalances;
    this.transactions = transactions;
    this.blocks = [];
    this.pendingTransactions = [];
  }

  private getGenesisBlock() {
    return new Block([], "0");
  }

  initialize() {
    const initialBlock = this.getGenesisBlock();

    this.blocks.push(initialBlock);
    this.pendingTransactions.push(...this.transactions);
    this.processPendingTransactions();
  }

  private createBlock(currentBalance: number[], transactions: TransactionType[]) {
    const block: TransactionType[] = [];

    while (block.length < this.blockSize) { // until block is full
      const transaction = transactions.shift();

      if (!transaction) break;
      const [from, to, amount] = transaction;
      const newBalance = (currentBalance[from] || 0) - amount;

      if (newBalance >= 0 && currentBalance[from] !== undefined && currentBalance[to] !== undefined) {
        currentBalance[from] = newBalance;
        currentBalance[to] += amount;
        block.push(transaction);
      } else {
        console.log("Invalid transcation -> ", transaction);
      }
    }
    return block;
  }

  private processPendingTransactions() {
    const currentBalance = [...this.initialBalances];
    const transactions = this.pendingTransactions.splice(0);

    while (transactions.length) {
      const previousBlock = this.blocks[this.blocks.length - 1];

      const block = this.createBlock(currentBalance, transactions);
      const newBlock = new Block(block, previousBlock.hash);
      this.blocks.push(newBlock);
    }
  }

  getBalance(account: number) {
    let initialBalance = this.initialBalances[account];

    this.blocks.map(
      (block) =>
        (initialBalance = block.getAccountBalance(account, initialBalance))
    );
    return initialBalance;
  }
}

export class Block {
  timestamp: number;
  transactions: TransactionType[];
  previousHash: string;
  hash: string;
  nonce: number;

  constructor(transactions: TransactionType[], previousHash: string) {
    this.timestamp = new Date().getTime();
    this.transactions = transactions;
    this.previousHash = previousHash;
    this.nonce = 0;
    this.calculateNonce();
    this.hash = this.calculateHash();
  }

  private calculateHash() {
    return sha256(
      this.timestamp +
        JSON.stringify(this.transactions) +
        this.previousHash +
        this.nonce
    ).toString();
  }

  private calculateNonce() {
    let hash = this.calculateHash();

    while (hash.substring(0, 4) !== "1234") {
      this.nonce++;
      hash = this.calculateHash();
    }
  }

  getAccountBalance(account: number, balance: number) {
    const accountBalance = this.transactions.reduce(
      (acc, [from, to, value]) => {
        if (from === account) return acc - value;
        else if (to === account) return acc + value;
        else return acc;
      },
      balance
    );
    return accountBalance;
  }
}

const blockSize = 4;
const initialBalances = [200, 0, 0, 20];
const transactions: TransactionType[] = [
  [10, 3, 50],
  [0, 2, 100],
  [2, 3, 80],
  [3, 1, 10],
];

const blockChain = new Blockchain(initialBalances, transactions, blockSize);
blockChain.initialize();

console.log(blockChain.getBalance(0)); // => 100
console.log(blockChain.getBalance(1)); // => 10
console.log(blockChain.getBalance(2)); // => 20
console.log(blockChain.getBalance(3)); // => 90
