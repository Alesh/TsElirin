import { RpcClient } from '@/hooks/useRpc.ts';

export async function getStream(rpc: RpcClient, streamId: string): Promise<MediaStream> {
  const result = await rpc.call('get_answer', []);
  console.log('@result', result);
  throw Error(`Stream with id ${streamId} not found`);
}
