import {
  isJSONRPCError,
  isJSONRPCResponse,
  isJSONRPCResponses,
  JSONRPC,
  JSONRPCError,
  JSONRPCErrorCode,
  JSONRPCErrorImpl,
  JSONRPCID,
  JSONRPCRequest,
  JSONRPCResponse,
} from './interfaces.ts';

let lastUID = 0;
const getUID = () => (lastUID = lastUID + 1);

type Reject = (reason?: unknown) => void;
type Resolve = (value: PromiseLike<unknown> | unknown) => void;

export interface ProtocolState {
  lastMessage?: string;
  readonly ready: boolean;
  sendMessage(message: string): void;
}

// RPC client implementation
export default class JSONRPClientImpl {
  private protocolState: ProtocolState;
  private pendingMap = new Map<JSONRPCID, [Resolve, Reject, number]>();

  private whenReady(): Promise<unknown> {
    return new Promise<unknown>((resolve, reject) => {
      if (this.protocolState && this.protocolState.ready) resolve(undefined);
      else this.pendingMap.set(0, [resolve, reject, 0]);
    });
  }

  private processResponse(response: JSONRPCResponse) {
    if (!this.resolvePendingWithId(response.id, response.error || response.result)) {
      console.warn(`JSON RPC Response received with ID:${response.id} but associated pending absent`);
    }
  }

  private resolvePendingWithId(id: JSONRPCID, result: JSONRPCError | unknown = undefined) {
    const pending = this.pendingMap.get(id);
    if (pending) {
      const [resolve, reject, timeoutId] = pending;
      this.pendingMap.delete(id);
      clearTimeout(timeoutId);
      if (isJSONRPCError(result)) reject(new JSONRPCErrorImpl(result));
      else resolve(result);
      return true;
    }
    return false;
  }

  constructor(private timeout = 15000) {
    this.protocolState = {
      ready: false,
      sendMessage: () => undefined,
    };
  }

  setProtocolState(protocolState: ProtocolState) {
    this.protocolState = protocolState;
    if (this.pendingMap.has(0) && protocolState.ready) this.resolvePendingWithId(0);
    if (protocolState.lastMessage) {
      const message = JSON.parse(protocolState.lastMessage);
      if (isJSONRPCResponse(message)) this.processResponse(message);
      if (isJSONRPCResponses(message)) Array.from<JSONRPCResponse>(message).map((item) => this.processResponse(item));
    }
  }

  async call<T>(method: string, params?: unknown) {
    await this.whenReady();
    const request: JSONRPCRequest = { method, params, jsonrpc: JSONRPC, id: getUID() };
    this.protocolState.sendMessage(JSON.stringify(request));
    return (await new Promise<unknown>((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        this.resolvePendingWithId(request.id, { code: JSONRPCErrorCode.InternalError, message: 'Timeout error' });
      }, this.timeout);
      this.pendingMap.set(request.id, [resolve, reject, timeoutId as unknown as number]);
    })) as T;
  }
}
