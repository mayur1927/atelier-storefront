export function logPrismaError(context: string, error: unknown) {
  if (error && typeof error === "object") {
    const err = error as Record<string, unknown>;
    console.error(`[DB Error in ${context}]`, {
      name: err.name,
      code: err.code,
      message: err.message,
      meta: err.meta,
      clientVersion: err.clientVersion,
      stack: err.stack,
    });
  } else {
    console.error(`[DB Error in ${context}]`, error);
  }
}
