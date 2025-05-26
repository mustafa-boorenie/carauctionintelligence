import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { OpenAIService } from "./services/openai";
import { AuctionConnector } from "./services/auctionConnector";
import { insertSearchQuerySchema, insertSavedSearchSchema, insertUserFavoriteSchema } from "@shared/schema";
import { z } from "zod";

const openAIService = new OpenAIService();
const auctionConnector = new AuctionConnector();

// Auth middleware to extract user from request
const requireAuth = async (req: any, res: any, next: any) => {
  const firebaseUid = req.headers['x-user-uid'];
  if (!firebaseUid) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    const user = await storage.getUserByFirebaseUid(firebaseUid);
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }
    req.user = user;
    next();
  } catch (error) {
    res.status(500).json({ error: 'Authentication error' });
  }
};

export async function registerRoutes(app: Express): Promise<Server> {
  // User routes
  app.post("/api/users", async (req, res) => {
    try {
      const userData = req.body;
      const user = await storage.createUser(userData);
      res.json(user);
    } catch (error: any) {
      res.status(400).json({ error: error?.message || 'Failed to create user' });
    }
  });

  app.get("/api/users/me", requireAuth, async (req: any, res) => {
    res.json(req.user);
  });

  // Search routes
  app.post("/api/search", requireAuth, async (req: any, res) => {
    try {
      const { query } = req.body;
      
      if (!query || typeof query !== 'string') {
        return res.status(400).json({ error: 'Query is required' });
      }

      // Process natural language query with OpenAI
      const parsedFilters = await openAIService.parseSearchQuery(query);
      
      // Search across auction platforms
      const vehicles = await auctionConnector.searchVehicles(parsedFilters);
      
      // Save search query to history
      await storage.createSearchQuery({
        userId: req.user.id,
        query,
        parsedFilters: parsedFilters as any,
        resultCount: vehicles.length,
      });

      res.json({
        query,
        parsedFilters,
        results: vehicles,
        count: vehicles.length,
      });
    } catch (error) {
      console.error('Search error:', error);
      res.status(500).json({ error: 'Search failed. Please try again.' });
    }
  });

  app.get("/api/search/history", requireAuth, async (req: any, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const history = await storage.getUserSearchHistory(req.user.id, limit);
      res.json(history);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch search history' });
    }
  });

  // Saved searches routes
  app.post("/api/saved-searches", requireAuth, async (req: any, res) => {
    try {
      const data = insertSavedSearchSchema.parse({
        ...req.body,
        userId: req.user.id,
      });
      const savedSearch = await storage.createSavedSearch(data);
      res.json(savedSearch);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid data', details: error.errors });
      }
      res.status(500).json({ error: 'Failed to save search' });
    }
  });

  app.get("/api/saved-searches", requireAuth, async (req: any, res) => {
    try {
      const savedSearches = await storage.getUserSavedSearches(req.user.id);
      res.json(savedSearches);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch saved searches' });
    }
  });

  app.put("/api/saved-searches/:id", requireAuth, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      const savedSearch = await storage.updateSavedSearch(id, updates);
      
      if (!savedSearch) {
        return res.status(404).json({ error: 'Saved search not found' });
      }
      
      res.json(savedSearch);
    } catch (error) {
      res.status(500).json({ error: 'Failed to update saved search' });
    }
  });

  app.delete("/api/saved-searches/:id", requireAuth, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteSavedSearch(id);
      
      if (!success) {
        return res.status(404).json({ error: 'Saved search not found' });
      }
      
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete saved search' });
    }
  });

  // Run saved search
  app.post("/api/saved-searches/:id/run", requireAuth, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const savedSearches = await storage.getUserSavedSearches(req.user.id);
      const savedSearch = savedSearches.find(s => s.id === id);
      
      if (!savedSearch) {
        return res.status(404).json({ error: 'Saved search not found' });
      }

      // Search with saved filters
      const vehicles = await auctionConnector.searchVehicles(savedSearch.parsedFilters || {});
      
      // Update last run time
      await storage.updateSavedSearch(id, { lastRunAt: new Date() });
      
      res.json({
        query: savedSearch.query,
        results: vehicles,
        count: vehicles.length,
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to run saved search' });
    }
  });

  // Favorites routes
  app.post("/api/favorites", requireAuth, async (req: any, res) => {
    try {
      const data = insertUserFavoriteSchema.parse({
        ...req.body,
        userId: req.user.id,
      });
      const favorite = await storage.addUserFavorite(data);
      res.json(favorite);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid data', details: error.errors });
      }
      res.status(500).json({ error: 'Failed to add favorite' });
    }
  });

  app.delete("/api/favorites/:vehicleId", requireAuth, async (req: any, res) => {
    try {
      const vehicleId = parseInt(req.params.vehicleId);
      const success = await storage.removeUserFavorite(req.user.id, vehicleId);
      
      if (!success) {
        return res.status(404).json({ error: 'Favorite not found' });
      }
      
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: 'Failed to remove favorite' });
    }
  });

  app.get("/api/favorites", requireAuth, async (req: any, res) => {
    try {
      const favorites = await storage.getUserFavorites(req.user.id);
      res.json(favorites);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch favorites' });
    }
  });

  // Vehicle routes
  app.get("/api/vehicles/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const vehicle = await storage.getVehicle(id);
      
      if (!vehicle) {
        return res.status(404).json({ error: 'Vehicle not found' });
      }
      
      res.json(vehicle);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch vehicle' });
    }
  });

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  const httpServer = createServer(app);
  return httpServer;
}
