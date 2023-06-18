import { createRtcChannel, RtcChannel } from './webrtc.ts';
import { createPrcClient, RpcClient } from './wsrpc.ts';

export type { RtcChannel, RpcClient };
export { createRtcChannel, createPrcClient };
