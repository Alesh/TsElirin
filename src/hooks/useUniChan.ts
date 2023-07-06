import { UniChanContext, UseUniChan } from '@/contexts/UniChan';
import { useContext } from 'react';

/// Hook help to use UniChan
export default function useUniChan(): UseUniChan {
  const ctx = useContext(UniChanContext);
  if (typeof ctx.call !== 'function') throw new Error('to using `useUniChan` you need wrap your code with <UniChanProvider>');
  return ctx;
}
