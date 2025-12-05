/**
 * Google Sheets sync utility
 * Sends data to Google Sheets via Apps Script API
 */

const GOOGLE_SHEETS_ENDPOINT = "https://script.google.com/macros/s/AKfycbyIXq3JFOnZqvGimA8l_2pARl3Piu4O59fjI3ammVTJJKLiS3HtxAyy0FxAwyXKJaXh/exec";

export interface GoogleSheetsTestRecord {
  id: number;
  value: any;
}

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

/**
 * Fetches spelling tests from Google Sheets using JSONP callback
 * @returns Promise that resolves with array of test records (id and value)
 */
export async function fetchSpellingTestsFromGoogleSheets(): Promise<GoogleSheetsTestRecord[]> {
  return new Promise((resolve) => {
    try {
      const callbackName = `jsonpCallback_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const script = document.createElement("script");
      const cleanup = () => {
        if (script.parentNode) {
          script.parentNode.removeChild(script);
        }
        delete (window as any)[callbackName];
      };

      // Set up the callback
      (window as any)[callbackName] = (data: any) => {
        cleanup();
        console.log("Fetched spelling tests from Google Sheets:", Array.isArray(data) ? data.length : 0);
        resolve(Array.isArray(data) ? data : []);
      };

      // Handle errors
      script.onerror = () => {
        console.error("Failed to fetch from Google Sheets: Script load error");
        cleanup();
        resolve([]);
      };

      // Set a timeout
      setTimeout(() => {
        console.error("Failed to fetch from Google Sheets: Timeout");
        cleanup();
        resolve([]);
      }, 10000);

      // Load the script
      script.src = `${GOOGLE_SHEETS_ENDPOINT}?action=getSpellingTest&callback=${callbackName}`;
      document.head.appendChild(script);
    } catch (error) {
      console.error("Failed to fetch from Google Sheets:", error);
      resolve([]);
    }
  });
}
