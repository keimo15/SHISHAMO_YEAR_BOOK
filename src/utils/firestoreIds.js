const ENCODED_DOC_ID_PREFIX = "__encoded__:";

export function toFirestoreDocId(value) {
  const id = String(value);
  return id.includes("/") ? `${ENCODED_DOC_ID_PREFIX}${encodeURIComponent(id)}` : id;
}

export function fromFirestoreDocId(id) {
  if (!id.startsWith(ENCODED_DOC_ID_PREFIX)) return id;

  try {
    return decodeURIComponent(id.slice(ENCODED_DOC_ID_PREFIX.length));
  } catch {
    return id;
  }
}
