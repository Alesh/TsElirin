import { useContext } from 'react';
import * as JsonRPC2 from '@/contexts/JsonRPC2';

type UseJsonRPC2 = JsonRPC2.UseInterface;
/// Hook help to use RPC call
export default function useJsonRPC2(): UseJsonRPC2 {
  const ctx = useContext(JsonRPC2.Context);
  if (typeof ctx.call !== 'function') throw new Error('to using `useJsonRPC2` you need wrap your code with <JsonRPC2.Provider>');
  return ctx;
}
