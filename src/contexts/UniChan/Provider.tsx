import { createContext, PropsWithChildren, ReactNode, useMemo, useState } from 'react';
import { State, UseUniChan } from './interface.ts';
import UniChanImpl, { UniChanProps } from './UniChanImpl.ts';

/// UniChan context
export const Context = createContext<UseUniChan>({} as never);

type Props = PropsWithChildren<UniChanProps & { otherwise?: ReactNode }>;
/// UniChan context provider
export default function Provider(props: Props) {
  const { children, otherwise, ...propsUniChan } = props;
  const [state, setState] = useState<State>({} as never);
  const impl = useMemo(() => new UniChanImpl(setState, propsUniChan), [props]);
  return state.ready ? <Context.Provider value={{ rpc: impl.rpc }}>{children}</Context.Provider> : otherwise;
}
