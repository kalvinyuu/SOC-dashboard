import { calculateEntropy } from "../utils/entropy";

// Dedicated thread for heavy math
self.onmessage = (event: MessageEvent) => {
  const { data, id } = event.data;

  if (!(data instanceof Uint8Array) && !(data instanceof ArrayBuffer)) {
    return;
  }

  const buffer = data instanceof Uint8Array ? data : new Uint8Array(data);
  const entropy = calculateEntropy(buffer);

  self.postMessage({ id, entropy });
};
