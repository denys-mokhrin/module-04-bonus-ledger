import 'reflect-metadata';
import { existsSync } from 'node:fs';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigError, loadConfig } from './shared/config';

async function bootstrap(): Promise<void> {
  if (existsSync('.env')) process.loadEnvFile('.env');

  // Fail fast, before Nest starts, with a message that names the bad variables.
  let port: number;
  try {
    port = loadConfig(process.env).PORT;
  } catch (error) {
    if (error instanceof ConfigError) {
      console.error(error.message);
      process.exit(1);
    }
    throw error;
  }

  const app = await NestFactory.create(AppModule);
  app.enableShutdownHooks();
  await app.listen(port);
}

void bootstrap();
