export interface Country {
  code: string;
  name: string;
  flag: string;
  port: string;
}

export const countries: Country[] = [
  { code: "CN", name: "China", flag: "🇨🇳", port: "Shanghai (CN)" }
];

export const getCountryByCode = (code: string): Country | undefined => {
  return countries.find(country => country.code === code);
};

export const searchCountries = (query: string): Country[] => {
  const lowercaseQuery = query.toLowerCase();
  return countries.filter(
    country =>
      country.name.toLowerCase().includes(lowercaseQuery) ||
      country.code.toLowerCase().includes(lowercaseQuery)
  );
};