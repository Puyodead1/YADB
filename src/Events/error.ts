import CClient from "../CClient";

export default (client: CClient, err: Error) => {
  console.debug(`[Discord Error] ${err}`);
};
