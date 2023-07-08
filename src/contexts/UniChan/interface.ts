/// UniChan state interface
export interface State {
  ready: boolean;
}

/// UniChan state set type
export type SetState = (value: ((prevState: State) => State) | State) => void;

/// JSON-RPC 2.0 methods interface
export interface JsonRPC2Methods {
  /// Remote calls a method with given parameters
  call<T>(method: string, params?: unknown): Promise<T>;
}

/// JSON-RPC 2.0 transport interface
export interface JsonRPC2Transport {
  /// Sends message to a remote side
  send(message: string): Promise<void>;
  /// Bind event listeners
  bind(onMessage: (message: string) => void, onClose: () => void): void;
}

/// UniChan use interface
export type UseUniChan = {
  rpc: JsonRPC2Methods;
};
