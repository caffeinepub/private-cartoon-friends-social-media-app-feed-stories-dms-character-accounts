export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  attempts = 3,
  delayMs = 1000,
): Promise<T> {
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (err) {
      if (i === attempts - 1) throw err;
      await new Promise((r) => setTimeout(r, delayMs * (i + 1)));
    }
  }
  throw new Error("Max retries exceeded");
}
