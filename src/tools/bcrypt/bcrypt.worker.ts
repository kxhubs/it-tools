import { compare, hash } from 'bcryptjs';
import type { BcryptRequest, Update } from './bcrypt.models';

interface BcryptWorkerScope {
  onmessage: ((event: MessageEvent<BcryptRequest>) => void) | null
  postMessage(message: Update<unknown>): void
}

const workerScope = globalThis as unknown as BcryptWorkerScope;

workerScope.onmessage = ({ data: request }) => {
  const start = Date.now();
  const progress = (value: number) => workerScope.postMessage({ kind: 'progress', progress: value });

  if (request.operation === 'hash') {
    hash(request.args[0], request.args[1], (error, value) => {
      workerScope.postMessage(error
        ? { kind: 'error', message: error.message }
        : { kind: 'success', value, timeTakenMs: Date.now() - start });
    }, progress);
  }
  else {
    compare(request.args[0], request.args[1], (error, value) => {
      workerScope.postMessage(error
        ? { kind: 'error', message: error.message }
        : { kind: 'success', value, timeTakenMs: Date.now() - start });
    }, progress);
  }
};
