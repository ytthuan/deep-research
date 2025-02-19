/**
 * fetch-data.ts
 * This module handles Google Search API integration and web content scraping using Jina AI.
 */

import { env } from '../config';
import { SearchResponse, FirecrawlDocument } from '@mendable/firecrawl-js';

// Google Search API configuration
const GOOGLE_SEARCH_ENDPOINT = 'https://www.googleapis.com/customsearch/v1';
const GOOGLE_SEARCH_API = env.GOOGLE_SEARCH_API!;
const GOOGLE_CX = env.GOOGLE_CX;

/**
 * Interface for Google Search results
 */
interface GoogleSearchResult {
  title: string;    // Title of the search result
  url: string;      // URL of the webpage
  markdown: string; // Content in markdown format
}

/**
 * Randomly selects between two Jina API keys for load balancing
 * @returns {string} Selected Jina API key
 */
function randomizeJinaApiKey(): string {
  const jina = env.JINA;
  return jina;
}

/**
 * Performs a Google search and scrapes content from the results
 * @param {string} query - Search query
 * @param {number} numResults - Number of results to return (default: 3)
 * @returns {Promise<SearchResponse>} Search results with scraped content
 */
export async function googleSearch(query: string, numResults: number = 3): Promise<SearchResponse> {
  try {
    // Perform Google search
    const response = await fetch(`${GOOGLE_SEARCH_ENDPOINT}?q=${query}&cx=${GOOGLE_CX}&key=${GOOGLE_SEARCH_API}&num=${numResults}`);
    const search_results = await response.json();

    // Handle no results case
    if (!search_results.items) {
      return {
        success: false,
        data: [],
        error: 'No results found'
      };
    }

    // Map Google results to our format
    const results = search_results.items.map((item: any) => ({
      title: item.title || 'No Title',
      url: item.link || '',
      markdown: item.snippet || 'No Snippet',
    }));

    // Scrape content for each result
    const resultsWithContent = await Promise.all(
      results.map(async (result: GoogleSearchResult) => {
        try {
          const scrapedContent = await scrapeWithJina(result.url);
          return {
            ...result,
            markdown: scrapedContent, // Replace snippet with full content
          } as FirecrawlDocument<undefined>;
        } catch (error) {
          console.error(`Error scraping ${result.url}:`, error);
          return result as FirecrawlDocument<undefined>;
        }
      })
    );

    return {
      success: true,
      data: resultsWithContent,
    };

  } catch (error) {
    console.error('Error performing Google search:', error);
    return {
      success: false,
      data: [],
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

/**
 * Scrapes webpage content using Jina AI's service
 * @param {string} url - URL to scrape
 * @returns {Promise<string>} Scraped content in markdown format
 */
async function scrapeWithJina(url: string): Promise<string> {
  try {
    const response = await fetch(
      `https://r.jina.ai/${encodeURIComponent(url)}`,
      {
        headers: {
          'Authorization': `Bearer ${randomizeJinaApiKey()}`
        }
      }
    );

    if (!response.ok) {
      console.warn(`Failed to fetch content for ${url} error status:`, response.status);
      return JSON.stringify({
        error: 'Failed to fetch content',
        status: response.status
      });
    }

    const content = await response.text();
    return content;
  } catch (error) {
    console.warn(`Error fetching content for ${url}:`, error);
    return JSON.stringify({
      error: 'Failed to fetch content',
      status: 500
    });
  }
}
 
