import { Listener, ListenerOptions, PieceContext } from "@sapphire/framework";

export class UserEvent extends Listener {
  constructor(context: PieceContext, options?: ListenerOptions) {
    super(context, {
      ...options,
    });
  }

  public async run(msg: string) {
    console.debug(`[Discord Warning] ${msg}`);
  }
}
