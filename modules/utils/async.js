// Origin:
// https://github.com/citizenfx/fivem/blob/master/ext/cfx-ui/src/cfx/utils/async.ts

const queueMicrotask = (globalThis || window).queueMicrotask || (fn => Promise.resolve().then(fn));

function timeout(time) {
  return new Promise((resolve) => {
    setTimeout(resolve, time);
  });
}

function idleCallback(timeout) {
  return new Promise((resolve) => {
    requestIdleCallback(resolve, { timeout });
  });
}

function animationFrame() {
  return new Promise((resolve) => {
    requestAnimationFrame(resolve);
  });
}

function resolveOrTimeout(time, timeoutError, promise) {
  return Promise.race([
    timeout(time).then(() => { throw new Error(timeoutError); }),
    promise,
  ]);
}

class Deferred {
  constructor() {
    this.promise = new Promise((resolve, reject) => {
      this.resolve = resolve;
      this.reject = reject;
    });
  }
}

/**
 * Like throttle, but also debounce but also smarter!
 *
 * Probably only useful for something using stateless async things, like async input validation
 *
 * Will only invoke callback with a result of the latest effective `runner` invokation
 *
 * `delay` adds, well, delay between `runner` invokations,
 * but only the latest effective invokation result will be passed to callback
 */
class OnlyLatest {
  constructor(runner, callback, delay) {
    this.runner = runner;
    this.callback = callback;
    this.delay = delay;

    this.runningIndex = 0;
    this.args = null;
    this.disposed = false;
    this.delayTimeout = null;
    this.delayedRunPending = false;

    if (this.delay) {
      this.run = this.delayedRunner;
    } else {
      this.run = this.normalRunner;
    }
  }

  dispose() {
    this.disposed = true;

    if (this.delayTimeout !== null) {
      clearTimeout(this.delayTimeout);
    }
  }

  get nextRunningIndex() {
    return ++this.runningIndex;
  }

  delayedRunner = (...args) => {
    this.args = args;

    if (!this.delayedRunPending) {
      this.delayedRunPending = true;

      this.delayTimeout = setTimeout(() => {
        if (this.disposed) {
          return;
        }

        this.delayedRunPending = false;
        this.delayTimeout = null;

        this.doRun();
      }, this.delay);
    }
  };

  normalRunner = (...args) => {
    this.args = args;

    this.doRun();
  };

  doRun = async () => {
    const currentIndex = this.nextRunningIndex;

    const args = this.args;
    this.args = null;

    const result = await this.runner(...args);

    if (this.disposed) {
      return;
    }

    if (currentIndex === this.runningIndex) {
      this.callback(result);
    }
  };
}

async function retry(attempts, fn) {
  let attempt = 0;

  while (attempt++ <= attempts) {
    const lastAttempt = attempt === attempts;

    try {
      return await fn();
    } catch (e) {
      if (lastAttempt) {
        throw e;
      }
    }
  }
}

module.exports = {
  queueMicrotask,
  timeout,
  idleCallback,
  animationFrame,
  resolveOrTimeout,
  Deferred,
  OnlyLatest,
  retry
};
