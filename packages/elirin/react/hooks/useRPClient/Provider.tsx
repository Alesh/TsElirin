import { createContext, PropsWithChildren, useEffect, useMemo } from 'react';
import useWebSocket from '@elirin/react/hooks/useWebSocket';
import JSONRPClient, { ProtocolState } from './JSONRPClient.ts';

export type UseRPClient = { call<T>(method: string, params?: unknown): Promise<T> };
export const RPCContext = createContext<UseRPClient>({} as never);

type RPCProviderProps = PropsWithChildren<{ wsUri: string; timeout?: number }>;
/// RPC Provider
export default function RPCProvider({ wsUri, timeout, children }: RPCProviderProps) {
  const { ready, sendMessage, lastMessage } = useWebSocket(wsUri);
  const rpcClient = useMemo(() => new JSONRPClient(timeout), [timeout]);
  useEffect(() => {
    rpcClient.setProtocolState({ ready, sendMessage, lastMessage } as ProtocolState);
  }, [rpcClient, ready, sendMessage, lastMessage]);
  return <RPCContext.Provider value={{ call: rpcClient.call.bind(rpcClient) }}>{children}</RPCContext.Provider>;
}
