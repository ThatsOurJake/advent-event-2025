import Redis from "ioredis";

// TODO: Substitution and cfenv
const redis = new Redis({
  port: 6379,
  host: "redis",
});

export default redis;
