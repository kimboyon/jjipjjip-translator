export async function withAuthTimeout<TFallback>(promise: Promise<unknown>, fallback: TFallback, ms = 2500): Promise<TFallback | Awaited<unknown>> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      promise,
      new Promise<TFallback>((resolve) => {
        timer = setTimeout(() => resolve(fallback), ms);
      })
    ]);
  } catch {
    return fallback;
  } finally {
    if (timer) clearTimeout(timer);
  }
}
