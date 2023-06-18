import { RpcWebSocketClient } from 'rpc-websocket-client';

/// RPC Client interface
export interface RpcClient {
  call(method: string, params?: any): Promise<unknown>;
}

let rpcClient: RpcClient | null = null;
/// Creates RpcClient
export function createPrcClient(): RpcClient {
  if (rpcClient === null) {
    const url = `${document.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${document.location.host}/ws`;
    rpcClient = new WebSocketClientImpl(url);
  }
  return rpcClient;
}

// RPC Client implementation on websocket
class WebSocketClientImpl implements RpcClient {
  private raw: RpcWebSocketClient;
  private readonly connected: Promise<unknown>;

  constructor(url: string) {
    this.raw = new RpcWebSocketClient();
    this.connected = this.raw.connect(url);
  }

  async call(method: string, params?: any): Promise<unknown> {
    await this.connected;
    return await this.raw.call(method, params);
  }
}
