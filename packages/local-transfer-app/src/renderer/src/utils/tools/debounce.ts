export default function debounce(fn: (...args: any[]) => any, throttleMs = 500) {
  let timer: any = null;
  return (...args: any[]) => {
    if (timer) {
      clearTimeout(timer);
    }
    timer = setTimeout(() => {
      timer = null;
      fn(...args);
    }, throttleMs);
  };
}
