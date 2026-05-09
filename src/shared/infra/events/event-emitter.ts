import EventEmitter from "events";
import { logger } from "src/shared/logger";
export class TypedEventEmitter<TEventMap extends Record<string, unknown[]>> {
  private emitter = new EventEmitter();

  emit<K extends keyof TEventMap>(event: K, ...args: TEventMap[K]): boolean {
    if (process.env.NODE_ENV !== "production") {
      logger.debug(
        { event, payload: args[0] },
        `Event emitted: ${String(event)}`,
      );
    }
    return this.emitter.emit(event as string, ...args);
  }

  on<K extends keyof TEventMap>(
    event: K,
    listener: (...args: TEventMap[K]) => void,
  ): this {
    this.emitter.on(event as string, listener as (...args: unknown[]) => void);
    return this;
  }

  once<K extends keyof TEventMap>(
    event: K,
    listener: (...args: TEventMap[K]) => void,
  ): this {
    this.emitter.once(
      event as string,
      listener as (...args: unknown[]) => void,
    );
    return this;
  }

  off<K extends keyof TEventMap>(
    event: K,
    listener: (...args: TEventMap[K]) => void,
  ): this {
    this.emitter.off(event as string, listener as (...args: unknown[]) => void);
    return this;
  }
}
