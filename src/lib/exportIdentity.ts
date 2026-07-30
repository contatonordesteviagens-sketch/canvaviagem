const fnv1a = (value: string) => {
  let hash = 0x811c9dc5;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(36);
};

export function createExportIdentity(
  type: "ad" | "carousel",
  projectId: string | null | undefined,
  payload: string,
) {
  return `${type}:${projectId || "unassigned"}:${fnv1a(payload)}`;
}
