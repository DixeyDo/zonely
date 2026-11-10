export type Preset = {
  label: string;
  description: string;
  city: string;
  timeZone: string;
};

/** One-tap zones that companies use when they announce release times. */
export const PRESETS: Preset[] = [
  { label: "ET", description: "US Eastern", city: "New York", timeZone: "America/New_York" },
  { label: "CT", description: "US Central", city: "Chicago", timeZone: "America/Chicago" },
  { label: "MT", description: "US Mountain", city: "Denver", timeZone: "America/Denver" },
  { label: "PT", description: "US Pacific", city: "Los Angeles", timeZone: "America/Los_Angeles" },
  { label: "UTC", description: "Universal time", city: "UTC", timeZone: "UTC" },
  { label: "UK", description: "London", city: "London", timeZone: "Europe/London" },
  { label: "CET", description: "Central Europe", city: "Paris", timeZone: "Europe/Paris" },
  { label: "IST", description: "India", city: "New Delhi", timeZone: "Asia/Kolkata" },
  { label: "JST", description: "Japan", city: "Tokyo", timeZone: "Asia/Tokyo" },
  { label: "KST", description: "Korea", city: "Seoul", timeZone: "Asia/Seoul" },
  { label: "AET", description: "Australia East", city: "Sydney", timeZone: "Australia/Sydney" },
  { label: "BRT", description: "Brazil", city: "São Paulo", timeZone: "America/Sao_Paulo" },
];

export type CityEntry = {
  city: string;
  country: string;
  timeZone: string;
  keywords?: string[];
};

/** Friendly names for popular cities. Search also covers every other zone automatically. */
export const CITIES: CityEntry[] = [
  { city: "New York", country: "United States", timeZone: "America/New_York", keywords: ["ET", "EST", "EDT", "Eastern"] },
  { city: "Washington, D.C.", country: "United States", timeZone: "America/New_York", keywords: ["ET", "Eastern"] },
  { city: "Miami", country: "United States", timeZone: "America/New_York", keywords: ["ET", "Eastern"] },
  { city: "Toronto", country: "Canada", timeZone: "America/Toronto", keywords: ["ET", "Eastern"] },
  { city: "Chicago", country: "United States", timeZone: "America/Chicago", keywords: ["CT", "CST", "CDT", "Central"] },
  { city: "Dallas", country: "United States", timeZone: "America/Chicago", keywords: ["CT", "Central"] },
  { city: "Mexico City", country: "Mexico", timeZone: "America/Mexico_City" },
  { city: "Denver", country: "United States", timeZone: "America/Denver", keywords: ["MT", "MST", "MDT", "Mountain"] },
  { city: "Phoenix", country: "United States", timeZone: "America/Phoenix", keywords: ["MST", "Arizona"] },
  { city: "Los Angeles", country: "United States", timeZone: "America/Los_Angeles", keywords: ["PT", "PST", "PDT", "Pacific"] },
  { city: "San Francisco", country: "United States", timeZone: "America/Los_Angeles", keywords: ["PT", "Pacific"] },
  { city: "Seattle", country: "United States", timeZone: "America/Los_Angeles", keywords: ["PT", "Pacific"] },
  { city: "Vancouver", country: "Canada", timeZone: "America/Vancouver", keywords: ["PT", "Pacific"] },
  { city: "Anchorage", country: "United States", timeZone: "America/Anchorage", keywords: ["AKST", "Alaska"] },
  { city: "Honolulu", country: "United States", timeZone: "Pacific/Honolulu", keywords: ["HST", "Hawaii"] },
  { city: "São Paulo", country: "Brazil", timeZone: "America/Sao_Paulo", keywords: ["BRT"] },
  { city: "Buenos Aires", country: "Argentina", timeZone: "America/Argentina/Buenos_Aires" },
  { city: "Bogotá", country: "Colombia", timeZone: "America/Bogota" },
  { city: "Lima", country: "Peru", timeZone: "America/Lima" },
  { city: "Santiago", country: "Chile", timeZone: "America/Santiago" },
  { city: "UTC", country: "Coordinated Universal Time", timeZone: "UTC", keywords: ["GMT", "Zulu", "Universal"] },
  { city: "London", country: "United Kingdom", timeZone: "Europe/London", keywords: ["UK", "GMT", "BST"] },
  { city: "Dublin", country: "Ireland", timeZone: "Europe/Dublin" },
  { city: "Lisbon", country: "Portugal", timeZone: "Europe/Lisbon", keywords: ["WET"] },
  { city: "Paris", country: "France", timeZone: "Europe/Paris", keywords: ["CET", "CEST"] },
  { city: "Berlin", country: "Germany", timeZone: "Europe/Berlin", keywords: ["CET", "CEST"] },
  { city: "Madrid", country: "Spain", timeZone: "Europe/Madrid", keywords: ["CET"] },
  { city: "Rome", country: "Italy", timeZone: "Europe/Rome", keywords: ["CET"] },
  { city: "Amsterdam", country: "Netherlands", timeZone: "Europe/Amsterdam", keywords: ["CET"] },
  { city: "Stockholm", country: "Sweden", timeZone: "Europe/Stockholm", keywords: ["CET"] },
  { city: "Warsaw", country: "Poland", timeZone: "Europe/Warsaw", keywords: ["CET"] },
  { city: "Athens", country: "Greece", timeZone: "Europe/Athens", keywords: ["EET"] },
  { city: "Helsinki", country: "Finland", timeZone: "Europe/Helsinki", keywords: ["EET"] },
  { city: "Istanbul", country: "Türkiye", timeZone: "Europe/Istanbul", keywords: ["TRT", "Turkey"] },
  { city: "Moscow", country: "Russia", timeZone: "Europe/Moscow", keywords: ["MSK"] },
  { city: "Cairo", country: "Egypt", timeZone: "Africa/Cairo", keywords: ["EET"] },
  { city: "Johannesburg", country: "South Africa", timeZone: "Africa/Johannesburg", keywords: ["SAST"] },
  { city: "Lagos", country: "Nigeria", timeZone: "Africa/Lagos", keywords: ["WAT"] },
  { city: "Nairobi", country: "Kenya", timeZone: "Africa/Nairobi", keywords: ["EAT"] },
  { city: "Casablanca", country: "Morocco", timeZone: "Africa/Casablanca" },
  { city: "Dubai", country: "United Arab Emirates", timeZone: "Asia/Dubai", keywords: ["GST", "UAE", "Gulf"] },
  { city: "Abu Dhabi", country: "United Arab Emirates", timeZone: "Asia/Dubai", keywords: ["GST", "UAE"] },
  { city: "Riyadh", country: "Saudi Arabia", timeZone: "Asia/Riyadh", keywords: ["AST", "KSA"] },
  { city: "Doha", country: "Qatar", timeZone: "Asia/Qatar" },
  { city: "Kuwait City", country: "Kuwait", timeZone: "Asia/Kuwait" },
  { city: "Muscat", country: "Oman", timeZone: "Asia/Muscat" },
  { city: "Tehran", country: "Iran", timeZone: "Asia/Tehran" },
  { city: "Karachi", country: "Pakistan", timeZone: "Asia/Karachi", keywords: ["PKT"] },
  { city: "New Delhi", country: "India", timeZone: "Asia/Kolkata", keywords: ["IST", "India"] },
  { city: "Mumbai", country: "India", timeZone: "Asia/Kolkata", keywords: ["IST", "India"] },
  { city: "Dhaka", country: "Bangladesh", timeZone: "Asia/Dhaka" },
  { city: "Bangkok", country: "Thailand", timeZone: "Asia/Bangkok", keywords: ["ICT"] },
  { city: "Jakarta", country: "Indonesia", timeZone: "Asia/Jakarta", keywords: ["WIB"] },
  { city: "Singapore", country: "Singapore", timeZone: "Asia/Singapore", keywords: ["SGT"] },
  { city: "Kuala Lumpur", country: "Malaysia", timeZone: "Asia/Kuala_Lumpur", keywords: ["MYT"] },
  { city: "Manila", country: "Philippines", timeZone: "Asia/Manila", keywords: ["PHT"] },
  { city: "Hong Kong", country: "China", timeZone: "Asia/Hong_Kong", keywords: ["HKT"] },
  { city: "Shanghai", country: "China", timeZone: "Asia/Shanghai", keywords: ["CST", "China", "Beijing"] },
  { city: "Taipei", country: "Taiwan", timeZone: "Asia/Taipei" },
  { city: "Seoul", country: "South Korea", timeZone: "Asia/Seoul", keywords: ["KST", "Korea"] },
  { city: "Tokyo", country: "Japan", timeZone: "Asia/Tokyo", keywords: ["JST", "Japan"] },
  { city: "Perth", country: "Australia", timeZone: "Australia/Perth", keywords: ["AWST"] },
  { city: "Adelaide", country: "Australia", timeZone: "Australia/Adelaide", keywords: ["ACST"] },
  { city: "Brisbane", country: "Australia", timeZone: "Australia/Brisbane", keywords: ["AEST"] },
  { city: "Sydney", country: "Australia", timeZone: "Australia/Sydney", keywords: ["AET", "AEST", "AEDT"] },
  { city: "Melbourne", country: "Australia", timeZone: "Australia/Melbourne", keywords: ["AET", "AEST"] },
  { city: "Auckland", country: "New Zealand", timeZone: "Pacific/Auckland", keywords: ["NZST", "NZDT"] },
];