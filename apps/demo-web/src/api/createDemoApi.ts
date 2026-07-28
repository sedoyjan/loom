export type DemoApiOptions = {
  latency?: number;
  failNextRequest?: boolean;
};

export type Profile = { name: string };

export function createDemoApi(options: DemoApiOptions = {}) {
  let failNext = options.failNextRequest ?? false;
  const latency = options.latency ?? 300;

  const wait = (signal?: AbortSignal) =>
    new Promise<void>((resolve, reject) => {
      const timer = setTimeout(resolve, latency);
      signal?.addEventListener("abort", () => {
        clearTimeout(timer);
        reject(new DOMException("Aborted", "AbortError"));
      });
    });

  return {
    async getProfile(signal?: AbortSignal): Promise<Profile> {
      await wait(signal);
      if (failNext) {
        failNext = false;
        throw new Error("Demo API failure");
      }
      return { name: "Loom Explorer" };
    },
    async changePassword(
      _password: string,
      signal?: AbortSignal,
    ): Promise<{ ok: true }> {
      await wait(signal);
      if (failNext) {
        failNext = false;
        throw new Error("Password change failed");
      }
      return { ok: true };
    },
    setFailNextRequest(value: boolean) {
      failNext = value;
    },
  };
}
