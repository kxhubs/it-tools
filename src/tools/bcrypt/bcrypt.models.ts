export type Update<Result> =
  | {
    kind: 'progress'
    progress: number
  }
  | {
    kind: 'success'
    value: Result
    timeTakenMs: number
  }
  | {
    kind: 'error'
    message: string
  }
  | {
    kind: 'cancelled'
  };

export class TimedOutError extends Error {
  name = 'TimedOutError';
}
export class InvalidatedError extends Error {
  name = 'InvalidatedError';
}

export type BcryptRequest =
  | { operation: 'hash'; args: [value: string, saltRounds: number] }
  | { operation: 'compare'; args: [value: string, hash: string] };

export interface BcryptWorker {
  onmessage: ((event: MessageEvent<Update<unknown>>) => void) | null
  onerror: ((event: ErrorEvent) => void) | null
  postMessage(request: BcryptRequest): void
  terminate(): void
}

interface BcryptWithProgressOptions {
  controller: AbortController
  timeoutMs: number
  createWorker: () => BcryptWorker
}

function createWorker(): BcryptWorker {
  return new Worker(new URL('./bcrypt.worker.ts', import.meta.url), { type: 'module' }) as BcryptWorker;
}

export async function* bcryptWithProgressUpdates<Result>(
  request: BcryptRequest,
  options?: Partial<BcryptWithProgressOptions>,
): AsyncGenerator<Update<Result>, undefined, undefined> {
  const {
    controller = new AbortController(),
    timeoutMs = 10_000,
    createWorker: workerFactory = createWorker,
  } = options ?? {};
  const worker = workerFactory();

  let completed = false;
  let workerTerminated = false;
  const terminateWorker = () => {
    if (!workerTerminated) {
      workerTerminated = true;
      worker.terminate();
    }
  };
  let res = (_: Update<Result>) => {};
  const nextPromise = () =>
    new Promise<Update<Result>>((resolve) => {
      res = resolve;
    });
  const promises = [nextPromise()];
  const nextValue = (value: Update<Result>) => {
    if (completed) {
      return;
    }

    completed = value.kind === 'success' || value.kind === 'error' || value.kind === 'cancelled';
    res(value);
    if (!completed) {
      promises.push(nextPromise());
    }
  };

  const onAbort = () => {
    terminateWorker();
    if (controller.signal.reason instanceof TimedOutError) {
      nextValue({ kind: 'error', message: controller.signal.reason.message });
    }
    else {
      nextValue({ kind: 'cancelled' });
    }
  };
  controller.signal.addEventListener('abort', onAbort, { once: true });

  const timeout = setTimeout(() => {
    controller.abort(new TimedOutError(`Timed out after ${(timeoutMs / 1000).toLocaleString('en-US')}\xA0seconds`));
  }, timeoutMs);

  if (controller.signal.aborted) {
    onAbort();
  }
  else {
    try {
      worker.onmessage = event => nextValue(event.data as Update<Result>);
      worker.onerror = event => nextValue({ kind: 'error', message: event.message || 'bcrypt worker failed' });
      worker.postMessage(request);
    }
    catch (error) {
      nextValue({ kind: 'error', message: error instanceof Error ? error.message : String(error) });
    }
  }

  try {
    for await (const value of promises) {
      yield value;

      if (value.kind === 'success' || value.kind === 'error' || value.kind === 'cancelled') {
        return;
      }
    }
  }
  finally {
    clearTimeout(timeout);
    controller.signal.removeEventListener('abort', onAbort);
    worker.onmessage = null;
    worker.onerror = null;
    terminateWorker();
  }
}
