import CClient from "../CClient";

export default (client: CClient, msg: string) => {
  console.debug(`[Discord Warning] ${msg}`);
};
