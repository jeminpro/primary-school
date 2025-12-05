/**
 * Google Sheets sync utility
 * Sends data to Google Sheets via Apps Script API
 */

const GOOGLE_SHEETS_ENDPOINT = "https://script.google.com/macros/s/AKfycbyIXq3JFOnZqvGimA8l_2pARl3Piu4O59fjI3ammVTJJKLiS3HtxAyy0FxAwyXKJaXh/exec";

/**
 * Sends data to Google Sheets via Apps Script endpoint
 * @param jsonData - The JSON data to save
 * @returns Promise that resolves when data is sent (fire-and-forget, errors are logged but not thrown)
 */
export async function syncToGoogleSheets(jsonData: any): Promise<void> {
  try {
    const response = await fetch(GOOGLE_SHEETS_ENDPOINT, {
      method: "POST",
      mode: "no-cors", // Apps Script requires no-cors for anonymous access
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(jsonData),
    });

    // Note: With no-cors mode, we can't read the response
    // The request will succeed if the server receives it
    console.log(`Synced data to Google Sheets: ID ${jsonData.id}`);
  } catch (error) {
    // Log error but don't throw - we don't want to block the user experience
    console.error("Failed to sync to Google Sheets:", error);
  }
}
