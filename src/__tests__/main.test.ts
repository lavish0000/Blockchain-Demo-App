import Blockchain, { Block } from "../main";
import { TransactionType } from "../types";

const initialBalances = [200, 0, 0, 20];
const transactions: TransactionType[] = [
  [10, 3, 50],
  [0, 2, 100],
  [2, 3, 80],
  [3, 1, 10],
];
const blockSize = 3;

describe("main", () => {
  it("should create a new blockchain", () => {
    const blockchain = new Blockchain(initialBalances, transactions, blockSize);
    expect(blockchain.initialBalances).toEqual([200, 0, 0, 20]);
    expect(blockchain.transactions).toEqual([
      [10, 3, 50],
      [0, 2, 100],
      [2, 3, 80],
      [3, 1, 10],
    ]);
    expect(blockchain.blockSize).toEqual(3);
  });

  it("should initialize the blockchain", () => {
    const blockchain = new Blockchain(initialBalances, transactions, blockSize);
    blockchain.initialize();
    expect(blockchain.blocks.length).toEqual(2);
    expect(blockchain.pendingTransactions).toEqual([]);
  });

  it("should get the balance of an account", () => {
    const blockchain = new Blockchain(initialBalances, transactions, blockSize);
    blockchain.initialize();
    expect(blockchain.getBalance(0)).toEqual(100);
    expect(blockchain.getBalance(1)).toEqual(10);
    expect(blockchain.getBalance(2)).toEqual(20);
    expect(blockchain.getBalance(3)).toEqual(90);
  });

  it("should get block balance", () => {
    const validBlock: TransactionType[] = [
      [0, 2, 100],
      [2, 3, 80],
      [3, 1, 10],
    ];
    const block = new Block(validBlock, "0");
    expect(block.getAccountBalance(0, initialBalances[0])).toEqual(100);
    expect(block.getAccountBalance(1, initialBalances[1])).toEqual(10);
    expect(block.getAccountBalance(2, initialBalances[2])).toEqual(20);
    expect(block.getAccountBalance(3, initialBalances[3])).toEqual(90);
  });
});
