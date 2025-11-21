import cfenv from "cfenv";
import Redis from "ioredis";

const getCreds = (): { port: number; host: string; password?: string } => {
  const serviceName = process.env.REDIS_SERVICE_NAME;

  if (serviceName) {
    const appEnv = cfenv.getAppEnv();
    const serviceCredentials = appEnv.getServiceCreds(serviceName);

    if (serviceCredentials) {
      return {
        host: serviceCredentials.host,
        port: serviceCredentials.port,
        password: serviceCredentials.password,
      };
    }
  }

  return {
    port: 6379,
    host: "redis",
  };
};

const redis = new Redis(getCreds());

export default redis;
