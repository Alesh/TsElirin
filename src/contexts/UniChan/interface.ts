/// UniChan state interface
export interface State {
  ready: boolean;
}

/// UniChan state set type
export type SetState = (value: ((prevState: State) => State) | State) => void;

/// UniChan methods interface
export interface Methods {
  /// Remote calls to this method with given parameters
  call<T>(method: string, params?: unknown): Promise<T>;
}

/// UniChan use interface
export type UseUniChan = Methods;
