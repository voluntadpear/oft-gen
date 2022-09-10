export type TaskMetadata = {
  name: string;
  url: string | null;
};

export function assert(condition: boolean, msg?: string): asserts condition {
  if (!condition) {
    throw new Error(msg);
  }
}
