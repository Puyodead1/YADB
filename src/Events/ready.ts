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

  async run() {
    console.log(`[Ready] Logged in as ${this.client.user?.tag}.`);

    this.client.mentionPrefix = new RegExp(`^<@!?${this.client.user?.id}>`);
  }
}
