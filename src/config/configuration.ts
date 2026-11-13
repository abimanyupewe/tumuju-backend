export interface AppConfig {
  port: number;
  environment: string;
  databaseUrl?: string;
  observe: {
    appKey: string;
    appSecret: string;
    serviceId: string;
  };
  pagination: {
    defaultLimit: number;
    maxLimit: number;
  };
  cors: {
    origin: string;
  };
}

export const configuration = (): AppConfig => ({
  port: parseInt(process.env.PORT ?? '3000', 10),
  environment: process.env.NODE_ENV ?? 'development',
  databaseUrl: process.env.DATABASE_URL,
  observe: {
    appKey: process.env.OBSERVE_APP_KEY ?? 'YOUR_APP_KEY',
    appSecret: process.env.OBSERVE_APP_SECRET ?? 'YOUR_APP_SECRET',
    serviceId: 'tumuju-backend',
  },
  pagination: {
    defaultLimit: 20,
    maxLimit: 100,
  },
  cors: {
    origin: process.env.CORS_ORIGIN ?? '*',
  },
});
