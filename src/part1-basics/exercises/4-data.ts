import { Effect, Equal, HashSet, Hash, Data, Brand, pipe } from "effect";
import assert from "node:assert";

// Exercise 1
// implement equals and hash for the Transaction class
class Transaction implements Equal.Equal, Hash.Hash {
  constructor(
    public readonly id: string,
    public readonly amount: number,
    public readonly time: Date
  ) {}

  [Equal.symbol](that: unknown) {
    return (
      that instanceof Transaction && that[Hash.symbol]() === this[Hash.symbol]()
    );
  }

  [Hash.symbol]() {
    return pipe(
      Hash.string(this.id),
      Hash.combine(Hash.number(this.amount)),
      Hash.combine(Hash.number(this.time.getDate()))
    );
  }
}

assert(
  Equal.equals(
    new Transaction("1", 1, new Date(3)),
    new Transaction("1", 1, new Date(3))
  )
);

assert(
  Hash.hash(new Transaction("1", 1, new Date(3))) ===
    Hash.hash(new Transaction("1", 1, new Date(3)))
);

// Exercise 2
// Create a datatype for a string that has been guaranteed to be only ascii
// Here is a regex for you to use : /^[\x00-\x7F]*$/

type ASCIIString = string & Brand.Brand<"ASCIIString">;

const ASCIIString = Brand.refined<ASCIIString>(
  (s) => s.match(/^[\x00-\x7F]*$/) !== null,
  (s) => Brand.error("Not ASCII")
);

const string1: ASCIIString = ASCIIString("hello");
const string2: ASCIIString = ASCIIString("hello🌍");
