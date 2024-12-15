import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import * as trpcExpress from '@trpc/server/adapters/express';
import { appRouter } from './router'; // Import your appRouter
import { createContext } from './context'; // Import your createContext function

const prisma = new PrismaClient();
const app = express();

// Middleware setup
app.use(cors());
app.use(express.json());

// Set up TRPC handler with context
app.use(
  '/trpc',
  trpcExpress.createExpressMiddleware({
    router: appRouter,
    createContext, // Use your createContext function to add user data to the context
  })
);

// Start the server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
