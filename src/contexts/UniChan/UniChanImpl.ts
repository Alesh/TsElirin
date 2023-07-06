import { Methods, SetState, State } from './interface.ts';

export type UniChanProps = Partial<{
  uri: string;
  reconnect_at: number;
}>;
/// UniChan implementation
export default class UniChanImpl implements Methods {
  private state: State = {} as never;
  private readonly setState: (state: Partial<State>) => void;

  // Connects to remote side
  private async connect(uri: string): Promise<void> {
    const offer = {};
    const resp = await fetch(uri, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(offer),
    });
    if (resp.ok) {
      const answer = await resp.json();
      console.log('!UniChanImpl.connect:answer', answer);
    } else throw new Error('Cannot connect to remote side');
  }

  constructor(setState: SetState, { uri = '/unichan', reconnect_at = 5 }: UniChanProps = {}) {
    this.setState = (partialState) => {
      this.state = { ...this.state, ...partialState };
      setState(this.state);
    };
    // Set initial state
    this.setState({ ready: false });
    // Connect to remote side
    this.connect(uri)
      .then(() => this.setState({ ready: true }))
      .catch((err) => {
        console.error(err);
        const timerId = setInterval(() => {
          this.connect(uri)
            .then(() => {
              clearInterval(timerId);
              this.setState({ ready: true });
            })
            .catch(console.error);
        }, reconnect_at * 1000);
      });
  }

  call<T>(method: string, params?: unknown): Promise<T> {
    console.log('!UniChanImpl.call', method, params);
    throw new Error('Not yet implemented');
  }
}
