import { 
  users, 
  vehicles, 
  searchQueries, 
  savedSearches, 
  userFavorites,
  type User, 
  type InsertUser,
  type Vehicle,
  type InsertVehicle,
  type SearchQuery,
  type InsertSearchQuery,
  type SavedSearch,
  type InsertSavedSearch,
  type UserFavorite,
  type InsertUserFavorite
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, ilike, sql } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByFirebaseUid(firebaseUid: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<User>): Promise<User | undefined>;

  // Vehicle operations
  getVehicle(id: number): Promise<Vehicle | undefined>;
  getVehiclesByFilters(filters: Record<string, any>): Promise<Vehicle[]>;
  createVehicle(vehicle: InsertVehicle): Promise<Vehicle>;
  updateVehicle(id: number, updates: Partial<Vehicle>): Promise<Vehicle | undefined>;
  
  // Search operations
  createSearchQuery(query: InsertSearchQuery): Promise<SearchQuery>;
  getUserSearchHistory(userId: number, limit?: number): Promise<SearchQuery[]>;
  
  // Saved searches operations
  createSavedSearch(savedSearch: InsertSavedSearch): Promise<SavedSearch>;
  getUserSavedSearches(userId: number): Promise<SavedSearch[]>;
  updateSavedSearch(id: number, updates: Partial<SavedSearch>): Promise<SavedSearch | undefined>;
  deleteSavedSearch(id: number): Promise<boolean>;
  
  // Favorites operations
  addUserFavorite(favorite: InsertUserFavorite): Promise<UserFavorite>;
  removeUserFavorite(userId: number, vehicleId: number): Promise<boolean>;
  getUserFavorites(userId: number): Promise<Vehicle[]>;
  isUserFavorite(userId: number, vehicleId: number): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByFirebaseUid(firebaseUid: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.firebaseUid, firebaseUid));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const trialEndDate = new Date();
    trialEndDate.setMonth(trialEndDate.getMonth() + 6); // 6-month trial

    const [user] = await db
      .insert(users)
      .values({
        ...insertUser,
        trialEndDate,
      })
      .returning();
    return user;
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set(updates)
      .where(eq(users.id, id))
      .returning();
    return user || undefined;
  }

  // Vehicle operations
  async getVehicle(id: number): Promise<Vehicle | undefined> {
    const [vehicle] = await db.select().from(vehicles).where(eq(vehicles.id, id));
    return vehicle || undefined;
  }

  async getVehiclesByFilters(filters: Record<string, any>): Promise<Vehicle[]> {
    const conditions = [eq(vehicles.isActive, true)];

    // Apply filters dynamically
    if (filters.make) {
      conditions.push(ilike(vehicles.make, `%${filters.make}%`));
    }
    if (filters.model) {
      conditions.push(ilike(vehicles.model, `%${filters.model}%`));
    }
    if (filters.minYear) {
      conditions.push(sql`${vehicles.year} >= ${filters.minYear}`);
    }
    if (filters.maxYear) {
      conditions.push(sql`${vehicles.year} <= ${filters.maxYear}`);
    }
    if (filters.maxPrice) {
      conditions.push(sql`${vehicles.currentBid} <= ${filters.maxPrice}`);
    }
    if (filters.damageType) {
      conditions.push(ilike(vehicles.damageType, `%${filters.damageType}%`));
    }
    if (filters.location) {
      conditions.push(ilike(vehicles.location, `%${filters.location}%`));
    }
    if (filters.source) {
      conditions.push(eq(vehicles.source, filters.source));
    }
    if (filters.externalId) {
      conditions.push(eq(vehicles.externalId, filters.externalId));
    }

    const results = await db
      .select()
      .from(vehicles)
      .where(and(...conditions))
      .orderBy(desc(vehicles.createdAt))
      .limit(50);
    return results;
  }

  async createVehicle(vehicle: InsertVehicle): Promise<Vehicle> {
    const [newVehicle] = await db
      .insert(vehicles)
      .values(vehicle)
      .returning();
    return newVehicle;
  }

  async updateVehicle(id: number, updates: Partial<Vehicle>): Promise<Vehicle | undefined> {
    const [vehicle] = await db
      .update(vehicles)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(vehicles.id, id))
      .returning();
    return vehicle || undefined;
  }

  // Search operations
  async createSearchQuery(query: InsertSearchQuery): Promise<SearchQuery> {
    const [searchQuery] = await db
      .insert(searchQueries)
      .values(query)
      .returning();
    return searchQuery;
  }

  async getUserSearchHistory(userId: number, limit = 10): Promise<SearchQuery[]> {
    const results = await db
      .select()
      .from(searchQueries)
      .where(eq(searchQueries.userId, userId))
      .orderBy(desc(searchQueries.createdAt))
      .limit(limit);
    return results;
  }

  // Saved searches operations
  async createSavedSearch(savedSearch: InsertSavedSearch): Promise<SavedSearch> {
    const [newSavedSearch] = await db
      .insert(savedSearches)
      .values(savedSearch)
      .returning();
    return newSavedSearch;
  }

  async getUserSavedSearches(userId: number): Promise<SavedSearch[]> {
    const results = await db
      .select()
      .from(savedSearches)
      .where(eq(savedSearches.userId, userId))
      .orderBy(desc(savedSearches.createdAt));
    return results;
  }

  async updateSavedSearch(id: number, updates: Partial<SavedSearch>): Promise<SavedSearch | undefined> {
    const [savedSearch] = await db
      .update(savedSearches)
      .set(updates)
      .where(eq(savedSearches.id, id))
      .returning();
    return savedSearch || undefined;
  }

  async deleteSavedSearch(id: number): Promise<boolean> {
    const result = await db
      .delete(savedSearches)
      .where(eq(savedSearches.id, id));
    return (result.rowCount || 0) > 0;
  }

  // Favorites operations
  async addUserFavorite(favorite: InsertUserFavorite): Promise<UserFavorite> {
    const [newFavorite] = await db
      .insert(userFavorites)
      .values(favorite)
      .returning();
    return newFavorite;
  }

  async removeUserFavorite(userId: number, vehicleId: number): Promise<boolean> {
    const result = await db
      .delete(userFavorites)
      .where(and(
        eq(userFavorites.userId, userId),
        eq(userFavorites.vehicleId, vehicleId)
      ));
    return (result.rowCount || 0) > 0;
  }

  async getUserFavorites(userId: number): Promise<Vehicle[]> {
    const results = await db
      .select({
        id: vehicles.id,
        externalId: vehicles.externalId,
        source: vehicles.source,
        title: vehicles.title,
        make: vehicles.make,
        model: vehicles.model,
        year: vehicles.year,
        vin: vehicles.vin,
        mileage: vehicles.mileage,
        currentBid: vehicles.currentBid,
        buyItNowPrice: vehicles.buyItNowPrice,
        damageType: vehicles.damageType,
        location: vehicles.location,
        auctionDate: vehicles.auctionDate,
        auctionEndDate: vehicles.auctionEndDate,
        imageUrls: vehicles.imageUrls,
        auctionUrl: vehicles.auctionUrl,
        isActive: vehicles.isActive,
        createdAt: vehicles.createdAt,
        updatedAt: vehicles.updatedAt,
      })
      .from(userFavorites)
      .innerJoin(vehicles, eq(userFavorites.vehicleId, vehicles.id))
      .where(eq(userFavorites.userId, userId))
      .orderBy(desc(userFavorites.createdAt));
    
    return results;
  }

  async isUserFavorite(userId: number, vehicleId: number): Promise<boolean> {
    const [favorite] = await db
      .select()
      .from(userFavorites)
      .where(and(
        eq(userFavorites.userId, userId),
        eq(userFavorites.vehicleId, vehicleId)
      ));
    return !!favorite;
  }
}

export const storage = new DatabaseStorage();
