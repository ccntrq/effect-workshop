import { Effect, Either, Option, ReadonlyArray } from "effect";
import * as T from "../../testDriver";

// Exercise 1
// Come up with a way to run this effect until it succeeds, no matter how many times it fails

let i = 0;
const eventuallySuceeds = Effect.suspend(() =>
  i++ < 100 ? Effect.fail("error") : Effect.succeed(5)
);

const testOne = eventuallySuceeds.pipe(Effect.retry({ until: (e) => !e }));

await T.testRunAssert(1, testOne, { success: 5 });

// Exercise 2
// Instead of short circuiting on the first error, collect all errors and fail with an array of them

const maybeFail = (j: number) =>
  j % 2 !== 0 ? Effect.fail(`odd ${j}`) : Effect.succeed(j);
const maybeFailArr = new Array(10).fill(0).map((_, i) => maybeFail(i + 1));

const testTwo = Effect.all(maybeFailArr, { mode: "either" }).pipe(
  Effect.map((eithers) => eithers.filter(Either.isLeft).map((e) => e.left)),
  Effect.flatMap(Effect.fail)
);

await T.testRunAssert(2, testTwo, {
  failure: ["odd 1", "odd 3", "odd 5", "odd 7", "odd 9"],
});

// Exercise 3
// Now succeed with both a array of success values and an array of errors

const testThree = Effect.all(maybeFailArr, { mode: "either" }).pipe(
  Effect.map((eithers) => ({
    success: eithers.filter(Either.isRight).map((e) => e.right),
    failure: eithers.filter(Either.isLeft).map((e) => e.left),
  }))
);

await T.testRunAssert(3, testThree, {
  success: {
    success: [2, 4, 6, 8, 10],
    failure: ["odd 1", "odd 3", "odd 5", "odd 7", "odd 9"],
  },
});
