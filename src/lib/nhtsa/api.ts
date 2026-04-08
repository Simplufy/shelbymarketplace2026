export interface NHTSAResponse {
  Results: Array<{
    Variable: string;
    Value: string;
  }>;
}

export interface ConvertedVINData {
  year?: string;
  make?: string;
  model?: string;
  trim?: string;
  engine?: string;
  plant?: string;
}

/**
 * Decodes a VIN using the NHTSA free API and catches errors to allow manual fallback
 */
export async function decodeVin(vin: string): Promise<ConvertedVINData> {
  try {
    const res = await fetch(`https://vpic.nhtsa.dot.gov/api/vehicles/decodevin/${vin}?format=json`);
    
    // If we are rate limited or another error occurs, we throw
    if (!res.ok) throw new Error("Rate limited or failed API response");
    
    const data: NHTSAResponse = await res.json();
    const result: ConvertedVINData = {};
    
    data.Results.forEach((item) => {
      const val = item.Value;
      if (!val || val === "Not Applicable" || val === "") return;
      
      switch (item.Variable) {
        case "Model Year": result.year = val; break;
        case "Make": result.make = val; break;
        case "Model": result.model = val; break;
        case "Trim": result.trim = val; break;
        case "Engine Configuration": result.engine = val; break;
        case "Plant City": result.plant = val; break;
      }
    });
    
    return result;
  } catch (err) {
    // Fail semi-silently returning empty details, which triggers manual fallback for the user
    console.warn("NHTSA API decoding failed, returning empty for manual fallback:", err);
    return {};
  }
}
