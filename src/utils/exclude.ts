// /**
//  * Exclude keys from object
//  * @param obj
//  * @param keys
//  * @returns
//  */
// const exclude = <Type, Key extends keyof Type>(
//   obj: Type,
//   keys: Key[]
// ): Omit<Type, Key> => {
//   for (const key of keys) {
//     delete obj[key];
//   }
//   return obj;
// };

// export default exclude;

/**
 * Exclude keys from object (immutable version)
 */
const exclude = <Type, Key extends keyof Type>(
  obj: Type,
  keys: Key[]
): Omit<Type, Key> => {
  const clone = { ...obj };
  for (const key of keys) {
    delete clone[key];
  }
  return clone;
};

export default exclude;
