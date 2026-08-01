import { compare, hash } from 'bcryptjs';
import { assert, describe, expect, test, vi } from 'vitest';
import {
  type BcryptRequest,
  type BcryptWorker,
  InvalidatedError,
  type Update,
  bcryptWithProgressUpdates,
} from './bcrypt.models';

// simplified polyfill for https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/fromAsync
async function fromAsync<T>(iter: AsyncIterable<T>) {
  const out: T[] = [];
  for await (const val of iter) {
    out.push(val);
  }
  return out;
}

function checkProgressAndGetResult<T>(updates: Update<T>[]) {
  const first = updates.at(0);
  const penultimate = updates.at(-2);
  const last = updates.at(-1);
  const allExceptLast = updates.slice(0, -1);

  expect(allExceptLast.every(x => x.kind === 'progress')).toBeTruthy();
  expect(first).toEqual({ kind: 'progress', progress: 0 });
  expect(penultimate).toEqual({ kind: 'progress', progress: 1 });

  assert(last != null && last.kind === 'success');

  return last;
}

function createTestWorker(): BcryptWorker {
  const worker: BcryptWorker = {
    onmessage: null,
    onerror: null,
    postMessage(request: BcryptRequest) {
      const start = Date.now();
      const progress = (value: number) => worker.onmessage?.({ data: { kind: 'progress', progress: value } } as MessageEvent);
      if (request.operation === 'hash') {
        hash(request.args[0], request.args[1], (error, value) => {
          worker.onmessage?.({
            data: error
              ? { kind: 'error', message: error.message }
              : { kind: 'success', value, timeTakenMs: Date.now() - start },
          } as MessageEvent);
        }, progress);
      }
      else {
        compare(request.args[0], request.args[1], (error, value) => {
          worker.onmessage?.({
            data: error
              ? { kind: 'error', message: error.message }
              : { kind: 'success', value, timeTakenMs: Date.now() - start },
          } as MessageEvent);
        }, progress);
      }
    },
    terminate() {},
  };
  return worker;
}

describe('bcrypt models', () => {
  describe(bcryptWithProgressUpdates.name, () => {
    test('with bcrypt hash function', async () => {
      const updates = await fromAsync(bcryptWithProgressUpdates<string>(
        { operation: 'hash', args: ['abc', 5] },
        { createWorker: createTestWorker },
      ));
      const result = checkProgressAndGetResult(updates);

      expect(result.value).toMatch(/^\$2a\$05\$.{53}$/);
      expect(result.timeTakenMs).toBeGreaterThan(0);
    });

    test('with bcrypt compare function', async () => {
      const updates = await fromAsync(
        bcryptWithProgressUpdates<boolean>(
          { operation: 'compare', args: ['abc', '$2a$05$FHzYelm8Qn.IhGP.N8V1TOWFlRTK.8cphbxZSvSFo9B6HGscnQdhy'] },
          { createWorker: createTestWorker },
        ),
      );
      const result = checkProgressAndGetResult(updates);

      expect(result.value).toBe(true);
      expect(result.timeTakenMs).toBeGreaterThan(0);
    });

    test('cancels without throwing when inputs are invalidated', async () => {
      const controller = new AbortController();
      const terminate = vi.fn();
      const worker: BcryptWorker = { onmessage: null, onerror: null, postMessage() {}, terminate };
      const updatesPromise = fromAsync(bcryptWithProgressUpdates<string>(
        { operation: 'hash', args: ['abc', 20] },
        { controller, createWorker: () => worker },
      ));

      controller.abort(new InvalidatedError('Input changed'));

      await expect(updatesPromise).resolves.toEqual([{ kind: 'cancelled' }]);
      expect(terminate).toHaveBeenCalledOnce();
    });

    test('terminates the worker when execution times out', async () => {
      vi.useFakeTimers();
      const terminate = vi.fn();
      const worker: BcryptWorker = { onmessage: null, onerror: null, postMessage() {}, terminate };
      const updatesPromise = fromAsync(bcryptWithProgressUpdates<string>(
        { operation: 'hash', args: ['abc', 20] },
        { timeoutMs: 25, createWorker: () => worker },
      ));

      await vi.advanceTimersByTimeAsync(25);

      await expect(updatesPromise).resolves.toEqual([
        { kind: 'error', message: 'Timed out after 0.025\xA0seconds' },
      ]);
      expect(terminate).toHaveBeenCalledOnce();
      vi.useRealTimers();
    });
  });
});
