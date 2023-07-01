import { createContext, PropsWithChildren, useEffect, useMemo, } from 'react';
import { JSONRPCClient } from 'json-rpc-2.0';
import useWebSocket from '@/hooks/useWebSocket';

/// JSON-RPC 2.0 client use interface
export interface UseInterface {
  ready: boolean;
  call<T>(method: string, params?: unknown): Promise<T>;
}

/// JSON-RPC 2.0 client context
export const Context = createContext<UseInterface>({} as never);

type RPCProviderProps = PropsWithChildren<{ uri: string; timeout?: number }>;
/// RPC Provider
export function Provider({ uri, timeout = 300, children }: RPCProviderProps) {
  const { ready, lastError, lastMessage, sendMessage } = useWebSocket(uri);
  const rpcClient = useMemo(
    () =>
      new JSONRPCClient((request) => {
        try {
          sendMessage(JSON.stringify(request));
          return Promise.resolve();
        } catch (error) {
          return Promise.reject(error);
        }
      }),
    [sendMessage]
  );
  useEffect(() => {
    if (rpcClient) {
      if (lastMessage) {
        if (typeof lastMessage === 'string') rpcClient.receive(JSON.parse(lastMessage));
        else rpcClient.rejectAllPendingRequests('You should use a text message received another');
      } else if (lastError) {
        console.error(lastError);
        rpcClient.rejectAllPendingRequests('Web socket error occurred');
      }
    }
  }, [rpcClient, lastMessage, lastError]);
  /// RPC call over websocket
  async function call<T>(method: string, params?: unknown): Promise<T> {
    return (await rpcClient.timeout(timeout * 1000).request(method, params)) as T;
  }
  return <Context.Provider value={{ ready, call }}>{children}</Context.Provider>;
}
