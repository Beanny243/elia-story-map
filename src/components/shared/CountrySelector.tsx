import { useState, useMemo } from "react";
import { Check, ChevronsUpDown, Search } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import COUNTRIES from "@/lib/countries";

interface CountrySelectorProps {
  value: string;
  onValueChange: (value: string) => void;
}

const CountrySelector = ({ value, onValueChange }: CountrySelectorProps) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filtered = useMemo(
    () =>
      search.length === 0
        ? COUNTRIES
        : COUNTRIES.filter((c) => c.toLowerCase().includes(search.toLowerCase())),
    [search]
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            "flex h-10 w-full items-center justify-between rounded-xl bg-card border border-input px-3 py-2 text-sm ring-offset-background",
            "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
            !value && "text-muted-foreground"
          )}
        >
          {value || "Select a country"}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
        <div className="flex items-center border-b border-border px-3 py-2 gap-2">
          <Search className="h-4 w-4 text-muted-foreground shrink-0" />
          <input
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            placeholder="Search countries..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="max-h-60 overflow-y-auto overscroll-contain p-1 -webkit-overflow-scrolling-touch" style={{ WebkitOverflowScrolling: 'touch' }}>
          {filtered.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No country found.</p>
          ) : (
            filtered.map((country) => (
              <button
                key={country}
                type="button"
                onClick={() => {
                  onValueChange(country === value ? "" : country);
                  setOpen(false);
                  setSearch("");
                }}
                className={cn(
                  "flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-sm transition-colors hover:bg-secondary",
                  country === value && "bg-secondary/70 font-medium"
                )}
              >
                <Check className={cn("h-3.5 w-3.5 shrink-0", country === value ? "opacity-100 text-accent" : "opacity-0")} />
                {country}
              </button>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default CountrySelector;
