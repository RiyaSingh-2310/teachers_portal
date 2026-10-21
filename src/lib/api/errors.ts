export class PortalError extends Error {
  code: string;

  constructor(code: string, message: string) {
    super(message);
    this.name = "PortalError";
    this.code = code;
  }
}

export function notReady(capability: string): never {
  throw new PortalError(
    "API_NOT_READY",
    `${capability} is not available yet. The school server has no teacher endpoint for this.`,
  );
}
