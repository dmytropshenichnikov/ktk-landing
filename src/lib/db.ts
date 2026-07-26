// SQL helper using Neon HTTP API (no native driver needed)
const DB_URL = process.env.NEON_DB_URL || "";
const API_KEY = process.env.NEON_API_KEY || "";

export async function sql(query: string, params?: any[]): Promise<any[]> {
  try {
    // Use the Neon SQL API via fetch
    const url = DB_URL.replace("/rest/v1", "") + "/sql";
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": API_KEY,
        "Authorization": `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({ query, params }),
    });
    
    if (!res.ok) {
      const text = await res.text();
      console.error("DB error:", text);
      return [];
    }
    
    return await res.json();
  } catch (e: any) {
    console.error("DB error:", e.message);
    return [];
  }
}

export default sql;
