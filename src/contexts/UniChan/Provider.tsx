import { createContext, PropsWithChildren, ReactNode, useMemo, useState } from 'react';
import * as UniChan from './UniChan.ts';

/// UniChan use interface
export type UseUniChan = UniChan.Methods;

/// UniChan context
export const Context = createContext<UseUniChan>({} as never);

type Props = PropsWithChildren<UniChan.Props & { otherwise?: ReactNode }>;
/// UniChan context provider
export default function Provider(props: Props) {
  const { children, otherwise, ...propsUniChan } = props;
  const [state, setState] = useState<UniChan.State>({} as never);
  const impl = useMemo(() => new UniChan.Impl(setState, propsUniChan), [props]);
  return state.connected ? (
    <Context.Provider
      value={{
        rpc: impl.rpc,
        publishStream: impl.publishStream.bind(impl),
        unPublishStream: impl.unPublishStream.bind(impl),
      }}
    >
      {children}
    </Context.Provider>
  ) : (
    otherwise
  );
}
