import { InsertVehicle, Vehicle } from "@shared/schema";
import { storage } from "../storage";
import { ParsedSearchFilters } from "./openai";

export class EbayConnector {
  private apiKey: string;
  private baseUrl = 'https://api.ebay.com/buy/browse/v1';

  constructor() {
    this.apiKey = process.env.EBAY_API_KEY || process.env.EBAY_API_KEY_ENV_VAR || "default_key";
  }

  async searchVehicles(filters: ParsedSearchFilters): Promise<Vehicle[]> {
    try {
      const query = this.buildSearchQuery(filters);
      const response = await this.makeApiRequest(`/item_summary/search?q=${encodeURIComponent(query)}&category_ids=6001&limit=50`);
      
      if (!response.itemSummaries) {
        return [];
      }

      const vehicles: Vehicle[] = [];
      for (const item of response.itemSummaries) {
        try {
          const vehicle = await this.convertEbayItemToVehicle(item);
          if (vehicle) {
            // Store in database if not already exists
            const existing = await storage.getVehiclesByFilters({ externalId: item.itemId, source: 'ebay' });
            if (existing.length === 0) {
              const savedVehicle = await storage.createVehicle(vehicle);
              vehicles.push(savedVehicle);
            } else {
              vehicles.push(existing[0]);
            }
          }
        } catch (error) {
          console.error("Error converting eBay item:", error);
          continue;
        }
      }

      return vehicles;
    } catch (error) {
      console.error("eBay API error:", error);
      return [];
    }
  }

  private buildSearchQuery(filters: ParsedSearchFilters): string {
    const parts: string[] = [];

    if (filters.make) parts.push(filters.make);
    if (filters.model) parts.push(filters.model);
    if (filters.minYear || filters.maxYear) {
      if (filters.minYear && filters.maxYear) {
        parts.push(`${filters.minYear}-${filters.maxYear}`);
      } else if (filters.minYear) {
        parts.push(`${filters.minYear}+`);
      } else if (filters.maxYear) {
        parts.push(`-${filters.maxYear}`);
      }
    }
    if (filters.damageType) {
      if (filters.damageType.toLowerCase().includes('clean')) {
        parts.push('clean title');
      } else {
        parts.push(`${filters.damageType} damage`);
      }
    }

    return parts.join(' ') || 'cars trucks';
  }

  private async makeApiRequest(endpoint: string): Promise<any> {
    const url = `${this.baseUrl}${endpoint}`;
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        'X-EBAY-C-MARKETPLACE-ID': 'EBAY_US'
      }
    });

    if (!response.ok) {
      throw new Error(`eBay API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  private async convertEbayItemToVehicle(item: any): Promise<InsertVehicle | null> {
    try {
      // Extract vehicle details from eBay item
      const title = item.title || '';
      const price = item.price?.value ? parseFloat(item.price.value) : null;
      
      // Parse title for make, model, year
      const { make, model, year } = this.parseVehicleTitle(title);
      
      if (!make || !model || !year) {
        return null; // Skip items that don't have basic vehicle info
      }

      const vehicle: InsertVehicle = {
        externalId: item.itemId,
        source: 'ebay',
        title: title,
        make: make,
        model: model,
        year: year,
        vin: null, // eBay doesn't always provide VIN in search results
        mileage: this.extractMileage(title),
        currentBid: price ? price.toString() : null,
        buyItNowPrice: item.buyItNowPrice?.value ? item.buyItNowPrice.value.toString() : null,
        damageType: this.extractDamageType(title),
        location: item.itemLocation?.city || item.itemLocation?.country || null,
        auctionDate: item.listingDate ? new Date(item.listingDate) : null,
        auctionEndDate: item.endDate ? new Date(item.endDate) : null,
        imageUrls: item.image ? [item.image.imageUrl] : [],
        auctionUrl: item.itemWebUrl || `https://www.ebay.com/itm/${item.itemId}`,
        isActive: true,
      };

      return vehicle;
    } catch (error) {
      console.error("Error converting eBay item to vehicle:", error);
      return null;
    }
  }

  private parseVehicleTitle(title: string): { make: string | null, model: string | null, year: number | null } {
    const yearMatch = title.match(/\b(19\d{2}|20\d{2})\b/);
    const year = yearMatch ? parseInt(yearMatch[1]) : null;

    // Common car makes - in production, you'd have a more comprehensive list
    const makes = [
      'Toyota', 'Honda', 'BMW', 'Mercedes', 'Ford', 'Chevrolet', 'Nissan', 
      'Audi', 'Lexus', 'Hyundai', 'Kia', 'Mazda', 'Subaru', 'Volkswagen',
      'Jeep', 'Ram', 'GMC', 'Cadillac', 'Buick', 'Lincoln', 'Acura', 'Infiniti'
    ];

    let make: string | null = null;
    let model: string | null = null;

    for (const m of makes) {
      const regex = new RegExp(`\\b${m}\\b`, 'i');
      if (regex.test(title)) {
        make = m;
        break;
      }
    }

    // Extract model (this is simplified - real implementation would be more sophisticated)
    if (make) {
      const makeIndex = title.toLowerCase().indexOf(make.toLowerCase());
      const afterMake = title.substring(makeIndex + make.length).trim();
      const modelMatch = afterMake.match(/^(\w+(?:\s+\w+)?)/);
      if (modelMatch) {
        model = modelMatch[1].trim();
      }
    }

    return { make, model, year };
  }

  private extractMileage(title: string): number | null {
    const mileageMatch = title.match(/(\d+(?:,\d{3})*)\s*(?:miles?|mi)/i);
    return mileageMatch ? parseInt(mileageMatch[1].replace(/,/g, '')) : null;
  }

  private extractDamageType(title: string): string | null {
    const lowerTitle = title.toLowerCase();
    
    if (lowerTitle.includes('salvage')) return 'salvage';
    if (lowerTitle.includes('flood')) return 'flood';
    if (lowerTitle.includes('hail')) return 'hail';
    if (lowerTitle.includes('collision')) return 'collision';
    if (lowerTitle.includes('fire')) return 'fire';
    if (lowerTitle.includes('theft')) return 'theft';
    if (lowerTitle.includes('clean title')) return 'clean';
    if (lowerTitle.includes('rebuilt')) return 'rebuilt';
    if (lowerTitle.includes('lemon')) return 'lemon';
    
    return null;
  }

  async syncRecentListings(): Promise<void> {
    try {
      // Sync recent car listings from eBay
      const response = await this.makeApiRequest('/item_summary/search?q=cars&category_ids=6001&limit=100&sort=newlyListed');
      
      if (response.itemSummaries) {
        for (const item of response.itemSummaries) {
          const vehicle = await this.convertEbayItemToVehicle(item);
          if (vehicle) {
            // Check if already exists
            const existing = await storage.getVehiclesByFilters({ 
              externalId: item.itemId, 
              source: 'ebay' 
            });
            
            if (existing.length === 0) {
              await storage.createVehicle(vehicle);
            }
          }
        }
      }
    } catch (error) {
      console.error("Error syncing eBay listings:", error);
    }
  }
}
