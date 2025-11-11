import { MongoClient } from "mongodb";

const getUri = (): string => {
  // const serviceName = process.env.MONGO_SERVICE_NAME;
  // const replicaSet = "nimbusReplicaSet";

  // if (serviceName) {
  //   const appEnv = cfenv.getAppEnv();
  //   const serviceCredentials = appEnv.getServiceCreds(serviceName);

  //   if (serviceCredentials) {
  //     return `${serviceCredentials.uri}?replicaSet=${replicaSet}`;
  //   }
  // }

  return "mongodb://mongo:27017/advent";
};

export const client = new MongoClient(getUri());
let isConnected = false;

export const connect = async () => {
  if (isConnected) {
    return;
  }

  client.on("close", () => {
    isConnected = false;
  });

  await client.connect();
  isConnected = true;
};
