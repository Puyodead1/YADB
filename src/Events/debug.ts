import CClient from "../CClient";

export default class {
  client!: CClient;
  constructor(client: CClient) {
    Object.defineProperty(this, "client", {
      enumerable: false,
      writable: false,
      value: client,
    });
  }

  async run(msg: string) {
    console.debug(`[Discord Debug] ${msg}`);
  }
}
