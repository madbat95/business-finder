import 'reflect-metadata';
import express from 'express';
import type { Request, Response } from 'express';
import { createApp } from '../src/create-app';

// Vercel serverless entry point. Unlike main.ts (used for local dev and
// persistent-server hosts like Render), this never calls app.listen() --
// Vercel owns the actual HTTP listener. The Nest app is initialized once
// and cached across warm invocations of the same function instance; cold
// starts re-run it, which is an accepted tradeoff of the serverless model.
const server = express();
let appReady: Promise<void> | null = null;

function ensureAppReady(): Promise<void> {
  if (!appReady) {
    appReady = createApp(server).then(async (app) => {
      await app.init();
    });
  }
  return appReady;
}

export default async function handler(req: Request, res: Response) {
  await ensureAppReady();
  server(req, res);
}
