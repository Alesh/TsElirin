import { useMemo } from 'react';
import { RpcClient, createPrcClient } from '@/api';

/// RPC Client hook
export default function usePrcClient(): RpcClient {
  return useMemo(createPrcClient, []);
}
