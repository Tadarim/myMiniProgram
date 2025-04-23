type EventCallback<T = any> = (...args: T[]) => void;


class EventBus {
  private events: Map<string, Set<EventCallback>>;

  constructor() {
    this.events = new Map();
  }

  /**
   * 订阅事件
   * @param eventName 事件名称
   * @param callback 回调函数
   * @returns 返回取消订阅的方法
   */
  on(eventName: string, callback: EventCallback): () => void {
    if (!this.events.has(eventName)) {
      this.events.set(eventName, new Set());
    }
    const callbacks = this.events.get(eventName)!;
    callbacks.add(callback);

    // 返回取消订阅的函数
    return () => this.off(eventName, callback);
  }

  /**
   * 取消订阅事件
   * @param eventName 事件名称
   * @param callback 要取消的回调函数
   */
  off(eventName: string, callback: EventCallback): void {
    const callbacks = this.events.get(eventName);
    if (callbacks) {
      callbacks.delete(callback);
      if (callbacks.size === 0) {
        this.events.delete(eventName);
      }
    }
  }

  /**
   * 发布事件
   * @param eventName 事件名称
   * @param args 传递给回调的参数
   */
  emit(eventName: string, ...args: any[]): void {
    const callbacks = this.events.get(eventName);
    if (callbacks) {
      callbacks.forEach((callback) => {
        try {
          callback(...args);
        } catch (error) {
          console.error(`EventBus emit error for event "${eventName}":`, error);
        }
      });
    }
  }

  /**
   * 一次性订阅事件，触发后自动取消
   * @param eventName 事件名称
   * @param callback 回调函数
   * @returns 返回取消订阅的方法
   */
  once(eventName: string, callback: EventCallback): () => void {
    const onceCallback: EventCallback = (...args) => {
      callback(...args);
      this.off(eventName, onceCallback);
    };
    return this.on(eventName, onceCallback);
  }

  /**
   * 清空所有事件
   */
  clear(): void {
    this.events.clear();
  }
}

const eventBus = new EventBus();
export default eventBus;

export { EventBus };
