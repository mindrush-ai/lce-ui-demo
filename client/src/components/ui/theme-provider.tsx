import { ThemeProvider as ThemeProviderComponent } from "@/hooks/use-theme";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProviderComponent defaultTheme="dark" storageKey="tlc-ui-theme">
      {children}
    </ThemeProviderComponent>
  );
}
