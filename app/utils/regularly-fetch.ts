export type FetchCallback<T> = (errored: boolean, resp?: T, error?: Error) => void;

export const regularlyFetch = <T>(url: string, interval: number, callback: FetchCallback<T>): number => {
  let isFetching = false;

  return window.setInterval(async () => {
    if (isFetching) {
      return;
    }

    isFetching = true;

    try {
      const req = await fetch(url);
      const resp = await req.json();
      callback(false, resp);
    } catch (err) {
      callback(true, undefined, err as Error);
    }

    isFetching = false;
  }, interval);
};
