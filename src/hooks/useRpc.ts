import { useMemo } from 'react';
import { RpcWebSocketClient } from 'rpc-websocket-client';

/// RPC Client interface
export interface RpcClient {
  call(method: string, params?: any): Promise<unknown>;
}

/// RPC Client implementation
class PrcClientImpl implements RpcClient {
  private raw: RpcWebSocketClient;
  private connected: Promise<unknown>;

  constructor(url: string) {
    this.raw = new RpcWebSocketClient();
    this.connected = this.raw.connect(url);
  }

  async call(method: string, params?: any): Promise<unknown> {
    await this.connected;
    return await this.raw.call(method, params);
  }
}

/// RPC hook
export default function useRpc(): RpcClient {
  const url = `${document.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${document.location.host}/ws`;
  return useMemo(() => new PrcClientImpl(url), [url]);
}
