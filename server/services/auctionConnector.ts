import { Vehicle, InsertVehicle } from "@shared/schema";
import { storage } from "../storage";
import { EbayConnector } from "./ebayConnector";
import { ParsedSearchFilters } from "./openai";

export class AuctionConnector {
  private ebayConnector: EbayConnector;

  constructor() {
    this.ebayConnector = new EbayConnector();
  }

  async searchVehicles(filters: ParsedSearchFilters): Promise<Vehicle[]> {
    const results: Vehicle[] = [];

    try {
      // Search eBay Motors (real implementation)
      const ebayResults = await this.ebayConnector.searchVehicles(filters);
      results.push(...ebayResults);

      // For other sources, we'll create placeholder data for now
      // In production, you would implement actual API connectors for:
      // - Copart API
      // - IAAI API  
      // - Manheim API
      // - ADESA API

      // Search database for existing vehicles that match filters
      const dbResults = await storage.getVehiclesByFilters(filters);
      results.push(...dbResults);

    } catch (error) {
      console.error("Error searching vehicles:", error);
      // Return empty array on error instead of throwing
    }

    // Remove duplicates based on VIN or external ID
    const uniqueResults = this.deduplicateVehicles(results);
    
    // Sort by relevance/match score
    return this.sortByRelevance(uniqueResults, filters);
  }

  private deduplicateVehicles(vehicles: Vehicle[]): Vehicle[] {
    const seen = new Set<string>();
    return vehicles.filter(vehicle => {
      const key = vehicle.vin || `${vehicle.source}-${vehicle.externalId}`;
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  }

  private sortByRelevance(vehicles: Vehicle[], filters: ParsedSearchFilters): Vehicle[] {
    return vehicles.sort((a, b) => {
      let scoreA = 0;
      let scoreB = 0;

      // Exact make match gets higher score
      if (filters.make) {
        if (a.make.toLowerCase() === filters.make.toLowerCase()) scoreA += 10;
        if (b.make.toLowerCase() === filters.make.toLowerCase()) scoreB += 10;
      }

      // Exact model match gets higher score
      if (filters.model) {
        if (a.model.toLowerCase().includes(filters.model.toLowerCase())) scoreA += 8;
        if (b.model.toLowerCase().includes(filters.model.toLowerCase())) scoreB += 8;
      }

      // Price within range gets higher score
      if (filters.maxPrice && a.currentBid && Number(a.currentBid) <= filters.maxPrice) scoreA += 5;
      if (filters.maxPrice && b.currentBid && Number(b.currentBid) <= filters.maxPrice) scoreB += 5;

      // Damage type match
      if (filters.damageType && a.damageType?.toLowerCase().includes(filters.damageType.toLowerCase())) scoreA += 3;
      if (filters.damageType && b.damageType?.toLowerCase().includes(filters.damageType.toLowerCase())) scoreB += 3;

      // More recent listings get slightly higher score
      const aTime = new Date(a.createdAt).getTime();
      const bTime = new Date(b.createdAt).getTime();
      if (aTime > bTime) scoreA += 1;
      else if (bTime > aTime) scoreB += 1;

      return scoreB - scoreA;
    });
  }

  // Method to update vehicle data from external sources
  async syncVehicleData(source: string): Promise<void> {
    try {
      switch (source) {
        case 'ebay':
          await this.ebayConnector.syncRecentListings();
          break;
        // Add other source sync methods here
        default:
          console.log(`Sync not implemented for source: ${source}`);
      }
    } catch (error) {
      console.error(`Error syncing data from ${source}:`, error);
    }
  }
}
