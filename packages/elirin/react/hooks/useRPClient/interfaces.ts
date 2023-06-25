export type JSONRPC = '2.0';
export const JSONRPC: JSONRPC = '2.0';

export type JSONRPCID = string | number;
export type JSONRPCParams = unknown;
export const isJSONRPCID = (id: unknown): id is JSONRPCID => typeof id === 'string' || typeof id === 'number';

export interface JSONRPCRequest {
  jsonrpc: JSONRPC;
  method: string;
  params?: JSONRPCParams;
  id: JSONRPCID;
}

export interface JSONRPCNotify {
  jsonrpc: JSONRPC;
  method: string;
  params?: JSONRPCParams;
}

export interface JSONRPCSuccessResponse {
  jsonrpc: JSONRPC;
  id: JSONRPCID;
  result: unknown;
  error?: undefined;
}

export interface JSONRPCError {
  code: number;
  message: string;
  data?: unknown;
}

export interface JSONRPCErrorResponse {
  jsonrpc: JSONRPC;
  id: JSONRPCID;
  result?: undefined;
  error: JSONRPCError;
}

export type JSONRPCResponse = JSONRPCSuccessResponse | JSONRPCErrorResponse;

export const isJSONRPCNotify = (entity: unknown): entity is JSONRPCNotify => {
  const inst = entity as JSONRPCNotify;
  return inst.jsonrpc === JSONRPC && inst.method !== undefined && inst.params === undefined;
};

export const isJSONRPCNotifies = (entity: unknown): entity is JSONRPCNotify[] => {
  const inst = entity as JSONRPCNotify[];
  return Array.isArray(inst) && inst.every(isJSONRPCNotify);
};

export const isJSONRPCResponse = (entity: unknown): entity is JSONRPCResponse => {
  const inst = entity as JSONRPCResponse;
  return isJSONRPCID(inst.id) && inst.jsonrpc === JSONRPC && (inst.result !== undefined || inst.error !== undefined);
};

export const isJSONRPCResponses = (entity: JSONRPCResponse[]): entity is JSONRPCResponse[] => {
  const inst = entity as JSONRPCResponse[];
  return Array.isArray(inst) && inst.every(isJSONRPCResponse);
};

export enum JSONRPCErrorCode {
  ParseError = -32700,
  InvalidRequest = -32600,
  MethodNotFound = -32601,
  InvalidParams = -32602,
  InternalError = -32603,
}

export interface JSONRPCError {
  code: JSONRPCErrorCode | number;
  message: string;
  data?: unknown;
}

export const isJSONRPCError = (entity: unknown): entity is JSONRPCError => {
  const inst = entity as JSONRPCError;
  return inst !== undefined && inst.code !== undefined && inst.message !== undefined;
};

export class JSONRPCErrorImpl extends Error implements JSONRPCError {
  public code: number;
  public data?: unknown;

  constructor({ message, code, data }: JSONRPCError) {
    super(data ? `${message}; ${data}` : message);
    Object.setPrototypeOf(this, JSONRPCErrorImpl.prototype);
    this.code = code;
    this.data = data;
  }

  toObject(): JSONRPCError {
    return { code: this.code, message: this.message, ...(this.data ? { data: this.data } : {}) };
  }
}
