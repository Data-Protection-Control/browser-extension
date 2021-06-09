export function delay<T = void>(ms: number, callback?: () => T | Promise<T>): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    setTimeout(async () => {
      if (!callback) {
        resolve();
        return;
      }
      try {
        const value = await callback();
        resolve(value);
      } catch (error) {
        reject(error);
      }
    }, ms);
  });
}
