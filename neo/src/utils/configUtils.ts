export const getEnv = (key: string): string | undefined => {
  return process.env[key];
};

export const getRequiredEnv = (key: string): string => {
  const val = process.env[key];
  if (!val) {
    throw new Error(`missing environment variable ${key}`);
  }
  return val;
};

export const getBooleanEnv = (key: string): boolean => {
  const val = process.env[key];

  if (val === '1' || val === 'true') {
    return true;
  } else if (
    val === '0' ||
    val === 'false' ||
    val === '' ||
    val === undefined
  ) {
    return false;
  } else {
    throw new Error(`unrecognized boolean value for env var ${key}: ${val}`);
  }
};

export function createConfig<T>(config: T) {
  return {
    get<K extends keyof T>(key: K) {
      return config[key];
    },

    require<K extends keyof T>(key: K) {
      const val = config[key];
      if (!val) {
        throw new Error(`missing required env var ${key}`);
      }
      return val!;
    },
  };
}
