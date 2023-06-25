import { useContext } from 'react';
import RPCProvider, { UseRPClient, RPCContext } from './Provider.tsx';

export { RPCProvider };
export type { UseRPClient };
/// RPC hook
export default function useRPClient(): UseRPClient {
  const ctx = useContext(RPCContext); // ToDo: Should be implemented JSON-RPC Notification too
  console.assert(typeof ctx.call === 'function', 'to using `useRPClient` you need wrap your code with <RPCProvider>');
  return ctx;
}
