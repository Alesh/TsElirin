import { JsonRPC2Methods, JsonRPC2Transport } from './interface.ts';
import { JSONRPCClient } from 'json-rpc-2.0';

/// Transport based on RTC data channel
export class DataChannelTransport implements JsonRPC2Transport {
  constructor(private dataChannel: RTCDataChannel) {}

  bind(onMessage: (message: string) => void, onClose: () => void): void {
    this.dataChannel.onmessage = (ev) => onMessage(ev.data);
    this.dataChannel.onclose = () => onClose();
  }

  async send(message: string): Promise<void> {
    if (this.dataChannel.readyState != 'open') {
      await new Promise((resolve) => {
        this.dataChannel.onopen = resolve;
      });
    }
    this.dataChannel.send(message);
  }
}

/// JSON-RPC 2.0
export default class JsonRPC2 implements JsonRPC2Methods {
  private rpcClient: JSONRPCClient<void>;

  private onMessage: OmitThisParameter<(message: unknown) => void>;
  private onClose: OmitThisParameter<(err?: Error) => void>;

  // Received message from remote side
  private messageReceived(message: unknown) {
    if (typeof message === 'string') this.rpcClient.receive(JSON.parse(message));
    else this.closeTransport(new Error('You should use a text message received another'));
  }

  // Closed message transport
  private closeTransport(err?: Error) {
    if (err) console.error(err);
    this.rpcClient.rejectAllPendingRequests(err?.message ?? '');
  }

  constructor(transport: JsonRPC2Transport, private timeout: number = 180) {
    this.onMessage = this.messageReceived.bind(this);
    this.onClose = this.closeTransport.bind(this);
    transport.bind(this.onMessage, this.onClose);
    // initialize RPC Client
    this.rpcClient = new JSONRPCClient(async (request) => {
      try {
        await transport.send(JSON.stringify(request));
        return Promise.resolve();
      } catch (error) {
        return Promise.reject(error);
      }
    });
  }

  call<T>(method: string, params?: unknown): Promise<T> {
    let timeoutId;
    return Promise.race([
      new Promise((_, reject) => (timeoutId = setTimeout(() => reject(new Error('Timeout error')), this.timeout * 1000))),
      (async () => {
        clearTimeout(timeoutId);
        return await this.rpcClient.timeout(this.timeout * 1000).request(method, params);
      })(),
    ]) as Promise<T>;
  }
}
