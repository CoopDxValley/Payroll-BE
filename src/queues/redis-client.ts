// import IORedis from "ioredis";

// interface CustomRedisGlobal extends Global {
//   redisClient: IORedis;
// }

// declare const global: CustomRedisGlobal;

// const redisClient =
//   global.redisClient ??
//   new IORedis({
//     host: process.env.REDIS_HOST || "localhost",
//     port: parseInt(process.env.REDIS_PORT || "6379"),
//     maxRetriesPerRequest: null,
//   });

// if (!global.redisClient) global.redisClient = redisClient;

// export default redisClient;
