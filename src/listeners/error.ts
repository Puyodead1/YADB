import { Listener, ListenerOptions, PieceContext } from "@sapphire/framework";

export class UserEvent extends Listener {
  constructor(context: PieceContext, options?: ListenerOptions) {
    super(context, {
      ...options,
    });
  }

  public async run(err: Error) {
    console.debug(`[Discord Error] ${err}`);
  }
}
