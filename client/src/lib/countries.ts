export interface Country {
  code: string;
  name: string;
  flag: string;
  port: string;
}

export const countries: Country[] = [
  { code: "FR", name: "France", flag: "🇫🇷", port: "Le Havre (FR)" },
  { code: "IT", name: "Italy", flag: "🇮🇹", port: "Livorno (IT)" },
  { code: "PT", name: "Portugal", flag: "🇵🇹", port: "Leixões (PT)" },
  { code: "ES", name: "Spain", flag: "🇪🇸", port: "Barcelona (ES)" }
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