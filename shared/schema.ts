import { pgTable, text, serial, integer, boolean, timestamp, decimal, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  firebaseUid: text("firebase_uid").notNull().unique(),
  email: text("email").notNull().unique(),
  displayName: text("display_name"),
  photoURL: text("photo_url"),
  trialStartDate: timestamp("trial_start_date").notNull().defaultNow(),
  trialEndDate: timestamp("trial_end_date").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Vehicle listings table
export const vehicles = pgTable("vehicles", {
  id: serial("id").primaryKey(),
  externalId: text("external_id").notNull(),
  source: text("source").notNull(), // 'copart', 'iaai', 'manheim', 'adesa', 'ebay'
  title: text("title").notNull(),
  make: text("make").notNull(),
  model: text("model").notNull(),
  year: integer("year").notNull(),
  vin: text("vin"),
  mileage: integer("mileage"),
  currentBid: decimal("current_bid", { precision: 10, scale: 2 }),
  buyItNowPrice: decimal("buy_it_now_price", { precision: 10, scale: 2 }),
  damageType: text("damage_type"),
  location: text("location"),
  auctionDate: timestamp("auction_date"),
  auctionEndDate: timestamp("auction_end_date"),
  imageUrls: jsonb("image_urls").$type<string[]>().default([]),
  auctionUrl: text("auction_url"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Search queries table
export const searchQueries = pgTable("search_queries", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  query: text("query").notNull(),
  parsedFilters: jsonb("parsed_filters").$type<Record<string, any>>(),
  resultCount: integer("result_count").default(0),
  isBookmarked: boolean("is_bookmarked").default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Saved searches table
export const savedSearches = pgTable("saved_searches", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  name: text("name").notNull(),
  query: text("query").notNull(),
  parsedFilters: jsonb("parsed_filters").$type<Record<string, any>>(),
  alertsEnabled: boolean("alerts_enabled").default(false),
  lastRunAt: timestamp("last_run_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// User favorite vehicles table
export const userFavorites = pgTable("user_favorites", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  vehicleId: integer("vehicle_id").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  searchQueries: many(searchQueries),
  savedSearches: many(savedSearches),
  favorites: many(userFavorites),
}));

export const vehiclesRelations = relations(vehicles, ({ many }) => ({
  favorites: many(userFavorites),
}));

export const searchQueriesRelations = relations(searchQueries, ({ one }) => ({
  user: one(users, { fields: [searchQueries.userId], references: [users.id] }),
}));

export const savedSearchesRelations = relations(savedSearches, ({ one }) => ({
  user: one(users, { fields: [savedSearches.userId], references: [users.id] }),
}));

export const userFavoritesRelations = relations(userFavorites, ({ one }) => ({
  user: one(users, { fields: [userFavorites.userId], references: [users.id] }),
  vehicle: one(vehicles, { fields: [userFavorites.vehicleId], references: [vehicles.id] }),
}));

// Zod schemas
export const insertUserSchema = createInsertSchema(users).pick({
  firebaseUid: true,
  email: true,
  displayName: true,
  photoURL: true,
});

export const insertVehicleSchema = createInsertSchema(vehicles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSearchQuerySchema = createInsertSchema(searchQueries).omit({
  id: true,
  createdAt: true,
});

export const insertSavedSearchSchema = createInsertSchema(savedSearches).omit({
  id: true,
  createdAt: true,
  lastRunAt: true,
});

export const insertUserFavoriteSchema = createInsertSchema(userFavorites).omit({
  id: true,
  createdAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Vehicle = typeof vehicles.$inferSelect;
export type InsertVehicle = z.infer<typeof insertVehicleSchema>;
export type SearchQuery = typeof searchQueries.$inferSelect;
export type InsertSearchQuery = z.infer<typeof insertSearchQuerySchema>;
export type SavedSearch = typeof savedSearches.$inferSelect;
export type InsertSavedSearch = z.infer<typeof insertSavedSearchSchema>;
export type UserFavorite = typeof userFavorites.$inferSelect;
export type InsertUserFavorite = z.infer<typeof insertUserFavoriteSchema>;
