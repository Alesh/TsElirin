import { useContext } from 'react';
import RPCProvider, { UseRPC, RPCContext } from './Provider.tsx';

export { RPCProvider };
export type { UseRPC };
/// RPC hook
export default function useRPC(): UseRPC {
  const ctx = useContext(RPCContext); // ToDo: Should be implemented JSON-RPC Notification too
  console.assert(typeof ctx.call === 'function', 'to using `useRPC` you need wrap your code with <RPCProvider>');
  return ctx;
}
