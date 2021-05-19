export function delay<T>(ms: number, callback: () => T | Promise<T>): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    setTimeout(async () => {
      try {
        const value = await callback();
        resolve(value);
      } catch (error) {
        reject(error);
      }
    }, ms);
  });
}
