import { Effect, Exit, Scope, pipe } from "effect";
import * as T from "../../testDriver";

// Exercise 1
// Write an that models the acquisition and release of this mock file
// it should match the existing declaration

class MockFile {
  constructor(public readonly fd: number) {}
  static readonly open = (fd: number) =>
    pipe(
      T.logTest(`open ${fd}`),
      Effect.andThen(() => new MockFile(fd))
    );
  public close = Effect.suspend(() => T.logTest(`close ${this.fd}`));
}

const file = (
  fd: number
): Effect.Effect<MockFile, never, T.Test | Scope.Scope> =>
  Effect.acquireRelease(MockFile.open(fd), (f) => f.close);

const test1 = Effect.gen(function* (_) {
  const file1 = yield* _(file(1));
  const file2 = yield* _(file(2));
}).pipe(Effect.scoped);

await T.testRunAssert(1, test1, {
  logs: ["open 1", "open 2", "close 2", "close 1"],
});

// Exercise 2
// In the first example both of the scopes from both file1 and file2 are 'merged' into one
// Your challenge is to close file1 first, and before file2 closes, log "hi!"

const test2 = Effect.gen(function* (_) {
  const f1Scope = yield* _(Scope.make());
  const file1 = yield* _(file(1), Scope.extend(f1Scope));
  const f2Scope = yield* _(Scope.make());
  const file2 = yield* _(file(2), Scope.extend(f2Scope));

  yield* _(Scope.close(f1Scope, Exit.unit));

  yield* _(T.logTest("hi!"));
  yield* _(Scope.close(f2Scope, Exit.unit));
});

await T.testRunAssert(2, test2, {
  logs: ["open 1", "open 2", "close 1", "hi!", "close 2"],
});
