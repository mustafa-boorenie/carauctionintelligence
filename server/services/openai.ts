import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "default_key"
});

export interface ParsedSearchFilters {
  make?: string;
  model?: string;
  minYear?: number;
  maxYear?: number;
  maxPrice?: number;
  minPrice?: number;
  damageType?: string;
  location?: string;
  keywords?: string[];
}

export class OpenAIService {
  async parseSearchQuery(query: string): Promise<ParsedSearchFilters> {
    try {
      const prompt = `You are an expert at parsing natural language search queries for car auctions. 
      Extract structured search criteria from the following query and respond with JSON only.

      Query: "${query}"

      Extract the following information when present:
      - make: Car manufacturer (e.g., "Toyota", "BMW", "Honda")
      - model: Car model (e.g., "Camry", "Accord", "3 Series")
      - minYear: Minimum year (number)
      - maxYear: Maximum year (number)
      - maxPrice: Maximum price in dollars (number, no currency symbols)
      - minPrice: Minimum price in dollars (number, no currency symbols)
      - damageType: Type of damage mentioned (e.g., "hail", "flood", "front end", "minor", "clean title")
      - location: Geographic location (state, city, or region)
      - keywords: Array of other relevant search terms

      Rules:
      - Only include fields that are explicitly mentioned or clearly implied
      - For price ranges like "under $10,000", use maxPrice
      - For damage like "hail damage", extract "hail" as damageType
      - For year ranges like "2018-2020", use minYear and maxYear
      - Convert text numbers to actual numbers where appropriate
      - If no specific criteria found, return empty object

      Respond with valid JSON only:`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: prompt
          },
          {
            role: "user",
            content: query
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.1,
      });

      const content = response.choices[0].message.content;
      if (!content) {
        throw new Error("No response content from OpenAI");
      }

      const parsed = JSON.parse(content);
      return this.validateAndCleanFilters(parsed);
    } catch (error) {
      console.error("OpenAI parsing error:", error);
      // Fallback to basic keyword extraction
      return this.fallbackParse(query);
    }
  }

  private validateAndCleanFilters(filters: any): ParsedSearchFilters {
    const cleaned: ParsedSearchFilters = {};

    if (filters.make && typeof filters.make === 'string') {
      cleaned.make = filters.make.trim();
    }
    if (filters.model && typeof filters.model === 'string') {
      cleaned.model = filters.model.trim();
    }
    if (filters.minYear && typeof filters.minYear === 'number' && filters.minYear > 1900) {
      cleaned.minYear = filters.minYear;
    }
    if (filters.maxYear && typeof filters.maxYear === 'number' && filters.maxYear > 1900) {
      cleaned.maxYear = filters.maxYear;
    }
    if (filters.maxPrice && typeof filters.maxPrice === 'number' && filters.maxPrice > 0) {
      cleaned.maxPrice = filters.maxPrice;
    }
    if (filters.minPrice && typeof filters.minPrice === 'number' && filters.minPrice > 0) {
      cleaned.minPrice = filters.minPrice;
    }
    if (filters.damageType && typeof filters.damageType === 'string') {
      cleaned.damageType = filters.damageType.trim();
    }
    if (filters.location && typeof filters.location === 'string') {
      cleaned.location = filters.location.trim();
    }
    if (filters.keywords && Array.isArray(filters.keywords)) {
      cleaned.keywords = filters.keywords.filter(k => typeof k === 'string');
    }

    return cleaned;
  }

  private fallbackParse(query: string): ParsedSearchFilters {
    const filters: ParsedSearchFilters = {};
    const lowerQuery = query.toLowerCase();

    // Extract common car makes
    const makes = ['toyota', 'honda', 'bmw', 'mercedes', 'ford', 'chevrolet', 'nissan', 'audi', 'lexus', 'hyundai'];
    for (const make of makes) {
      if (lowerQuery.includes(make)) {
        filters.make = make.charAt(0).toUpperCase() + make.slice(1);
        break;
      }
    }

    // Extract models
    const models = ['camry', 'accord', 'civic', 'corolla', 'altima', 'f-150', 'mustang', '3 series'];
    for (const model of models) {
      if (lowerQuery.includes(model)) {
        filters.model = model;
        break;
      }
    }

    // Extract price ranges
    const priceMatch = lowerQuery.match(/under \$?(\d+(?:,\d{3})*)/);
    if (priceMatch) {
      filters.maxPrice = parseInt(priceMatch[1].replace(/,/g, ''));
    }

    // Extract damage types
    if (lowerQuery.includes('hail')) filters.damageType = 'hail';
    else if (lowerQuery.includes('flood')) filters.damageType = 'flood';
    else if (lowerQuery.includes('clean')) filters.damageType = 'clean';
    else if (lowerQuery.includes('minor')) filters.damageType = 'minor';

    // Extract states
    const states = ['texas', 'california', 'florida', 'new york', 'ohio', 'illinois'];
    for (const state of states) {
      if (lowerQuery.includes(state)) {
        filters.location = state;
        break;
      }
    }

    return filters;
  }
}
