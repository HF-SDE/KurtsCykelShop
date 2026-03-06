"use client";

import { useTheme } from "next-themes";
import dynamic from "next/dynamic";
import { useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

import { Item } from "@/types/Inventory/Item";

import { Bike, Moon, Search, SlidersHorizontal, Sparkles, Sun } from "lucide-react";

interface CatalogueProps {
  items: Item[];
}

interface CatelogueCardProps {
  item: Item;
  index: number;
}

type SortOption = "featured" | "price-asc" | "price-desc" | "name-asc" | "stock-desc";

const ShaderGradientCanvas = dynamic(
  () => import("@shadergradient/react").then((module) => module.ShaderGradientCanvas),
  { ssr: false },
);
const ShaderGradient = dynamic(() => import("@shadergradient/react").then((module) => module.ShaderGradient), {
  ssr: false,
});

function formatPrice(value: number) {
  return new Intl.NumberFormat("da-DK", {
    style: "currency",
    currency: "DKK",
    maximumFractionDigits: 0,
  }).format(value);
}

function getStockLabel(quantity: number) {
  if (quantity <= 0) return "Udsolgt";
  if (quantity < 5) return "Få tilbage";
  return "På lager";
}

function getStockBadgeVariant(quantity: number): "destructive" | "secondary" | "default" {
  if (quantity <= 0) return "destructive";
  if (quantity < 5) return "secondary";
  return "default";
}

function hashString(value: string) {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function seededValue(seed: number, offset: number) {
  const prime = 997;
  return ((seed + offset * 131) % prime) / prime;
}

function pickFromPalette(seed: number, palette: readonly string[], offset: number) {
  const index = Math.floor(seededValue(seed, offset) * palette.length) % palette.length;
  return palette[index];
}

function ThemeToggleClient() {
  const { resolvedTheme, setTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className="size-9 hover:bg-white dark:text-slate-100"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? "Skift til light mode" : "Skift til dark mode"}
      title={isDark ? "Skift til light mode" : "Skift til dark mode"}
    >
      {isDark ? <Sun className="size-4" /> : <Moon className="size-4" />}
    </Button>
  );
}

const ThemeToggle = dynamic(() => Promise.resolve(ThemeToggleClient), {
  ssr: false,
});

function AnimatedOrangeHeader({ sku, seed }: { sku: string; seed: string }) {
  const variant = useMemo(() => {
    const hashedSeed = hashString(seed);
    const a = seededValue(hashedSeed, 1);
    const b = seededValue(hashedSeed, 2);
    const c = seededValue(hashedSeed, 3);
    const d = seededValue(hashedSeed, 4);
    const orangePalette = ["#fd7131", "#f96320", "#f57c3a", "#ff6a1a", "#ef5a1f", "#de4b12", "#c73c00"] as const;

    return {
      speed: 0.08 + a * 0.16,
      strength: 1.9 + b * 1.1,
      density: 0.95 + c * 0.7,
      frequency: 3 + d * 2.3,
      positionY: -1.5 - b * 0.8,
      rotationZ: 180 + c * 65,
      azimuth: 160 + d * 30,
      polar: 90 + a * 10,
      distance: 2.2 + b * 0.4,
      brightness: 1 + d * 0.2,
      color2: pickFromPalette(hashedSeed, orangePalette, 7),
      color3: pickFromPalette(hashedSeed, orangePalette, 11),
    };
  }, [seed]);

  return (
    <div className="h-26 relative overflow-hidden border-b border-slate-100 bg-[#FD7131] dark:border-slate-700">
      <div className="absolute inset-0 bg-[linear-gradient(135deg,#FD7131,#f96320,#de4b12)]" />
      <div className="absolute inset-0 opacity-85 mix-blend-soft-light">
        <ShaderGradientCanvas
          style={{ width: "100%", height: "100%", backgroundColor: "transparent" }}
          fov={45}
          pixelDensity={1}
        >
          <ShaderGradient
            animate="on"
            type="waterPlane"
            shader="defaults"
            color1="#FD7131"
            color2={variant.color2}
            color3={variant.color3}
            uSpeed={variant.speed}
            uStrength={variant.strength}
            uDensity={variant.density}
            uFrequency={variant.frequency}
            uAmplitude={0}
            positionY={variant.positionY}
            rotationZ={variant.rotationZ}
            cAzimuthAngle={variant.azimuth}
            cPolarAngle={variant.polar}
            cDistance={variant.distance}
            lightType="3d"
            brightness={variant.brightness}
            grain="off"
            enableTransition={false}
          />
        </ShaderGradientCanvas>
      </div>
      <div className="absolute inset-0 bg-[linear-gradient(170deg,hsl(20_100%_60%/.08),transparent_55%),linear-gradient(330deg,hsl(15_85%_30%/.25),transparent_60%)]" />
      <div className="relative z-10 flex items-center justify-between px-6 py-4 text-white">
        <Badge className="bg-black/55 text-white backdrop-blur">{sku}</Badge>
        <Bike className="size-4 opacity-90" />
      </div>
    </div>
  );
}

export function Catalogue({ items }: CatalogueProps) {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortOption>("featured");
  const [inStockOnly, setInStockOnly] = useState(false);

  const filteredItems = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const list = items.filter((item) => {
      const matchesSearch =
        normalizedQuery.length === 0 ||
        item.name.toLowerCase().includes(normalizedQuery) ||
        item.sku.toLowerCase().includes(normalizedQuery) ||
        item.description?.toLowerCase().includes(normalizedQuery);

      const matchesStock = !inStockOnly || item.quantity > 0;
      return matchesSearch && matchesStock;
    });

    return [...list].sort((a, b) => {
      switch (sort) {
        case "price-asc":
          return a.price - b.price;
        case "price-desc":
          return b.price - a.price;
        case "name-asc":
          return a.name.localeCompare(b.name, "da-DK");
        case "stock-desc":
          return b.quantity - a.quantity;
        default:
          return a.name.localeCompare(b.name, "da-DK");
      }
    });
  }, [inStockOnly, items, query, sort]);

  return (
    <section className="relative min-h-screen overflow-x-clip bg-[radial-gradient(circle_at_top,hsl(19_98%_60%/.25),transparent_45%),linear-gradient(135deg,hsl(24_100%_98%),hsl(16_90%_96%))] px-4 py-8 sm:px-6 lg:px-10 dark:bg-[radial-gradient(circle_at_top,hsl(19_98%_58%/.2),transparent_42%),linear-gradient(135deg,hsl(222_34%_10%),hsl(223_30%_8%))]">
      <div className="absolute right-3 top-3">
        <ThemeToggle />
      </div>

      <div className="bg-size-[34px_34px] pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(to_right,hsl(0_0%_100%/.45)_1px,transparent_1px),linear-gradient(to_bottom,hsl(0_0%_100%/.45)_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,hsl(220_13%_22%/.6)_1px,transparent_1px),linear-gradient(to_bottom,hsl(220_13%_22%/.6)_1px,transparent_1px)]" />

      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8">
        <header className="rounded-3xl border border-white/60 bg-white/70 p-6 shadow-2xl shadow-black/5 backdrop-blur sm:p-8 dark:border-slate-700/60 dark:bg-slate-900/65 dark:shadow-black/30">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div className="max-w-2xl space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full bg-[#FD7131] px-3 py-1 text-xs font-semibold tracking-wide text-white">
                <Sparkles className="size-3.5" />
                Kurts Cykel Shop
              </div>
              <h1 className="text-balance text-3xl font-semibold tracking-tight text-slate-900 sm:text-5xl dark:text-slate-100">
                Katalog med alt til den næste cykeltur
              </h1>
              <p className="max-w-xl text-sm text-slate-700 sm:text-base dark:text-slate-300">
                Udforsk reservedele, tilbehør og essentielle komponenter i et hurtigt og overskueligt katalog.
              </p>
            </div>
          </div>
        </header>

        <div className="rounded-3xl border border-slate-200/70 bg-white/85 p-4 shadow-xl shadow-black/5 backdrop-blur sm:p-5 dark:border-slate-700/70 dark:bg-slate-900/70 dark:shadow-black/30">
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Søg efter navn, SKU eller beskrivelse..."
                className="h-10 border-slate-300 bg-white pl-9 dark:border-slate-700 dark:bg-slate-900"
              />
            </div>

            <div className="grid grid-cols-[1fr_auto] gap-2 sm:flex sm:items-center">
              <label className="inline-flex items-center gap-2 rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
                <SlidersHorizontal className="size-4 text-slate-500 dark:text-slate-400" />
                <span>Sortering</span>
                <select
                  value={sort}
                  onChange={(event) => setSort(event.target.value as SortOption)}
                  className="h-9 bg-transparent text-sm text-slate-900 outline-none dark:text-slate-100"
                >
                  <option value="featured">Navn (A-Å)</option>
                  <option value="price-asc">Pris lav-høj</option>
                  <option value="price-desc">Pris høj-lav</option>
                  <option value="stock-desc">Mest lager</option>
                </select>
              </label>

              <Button
                type="button"
                variant={inStockOnly ? "default" : "outline"}
                className="h-9"
                onClick={() => setInStockOnly((current) => !current)}
              >
                {inStockOnly ? "Kun på lager" : "Vis alle"}
              </Button>
            </div>
          </div>
        </div>

        {filteredItems.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white/70 p-10 text-center text-slate-600 dark:border-slate-700 dark:bg-slate-900/65 dark:text-slate-300">
            Ingen varer matcher din søgning.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filteredItems.map((item, index) => (
              <CatelogueCard key={item.id} item={item} index={index} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export function CatelogueCard({ item, index }: CatelogueCardProps) {
  const animationDelay = `${Math.min(index * 90, 900)}ms`;

  return (
    <Card
      className="catalogue-card-enter group relative overflow-hidden border-slate-200/80 bg-white/90 py-0 shadow-lg shadow-black/5 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-orange-200/60 dark:border-slate-700/90 dark:bg-slate-900/80 dark:hover:shadow-orange-500/20"
      style={{ animationDelay }}
    >
      <AnimatedOrangeHeader sku={item.sku} seed={item.id} />

      <CardHeader className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <CardTitle className="text-lg text-slate-900 dark:text-slate-100">{item.name}</CardTitle>
          <Badge variant={getStockBadgeVariant(item.quantity)}>{getStockLabel(item.quantity)}</Badge>
        </div>
        <CardDescription className="line-clamp-2 min-h-10 text-slate-600 dark:text-slate-300">
          {item.description || "Kvalitetsvare til cykler og daglig brug."}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4 pb-6">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Pris</p>
            <p className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
              {formatPrice(item.price)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Lager</p>
            <p className="text-lg font-semibold text-slate-800 dark:text-slate-200">{item.quantity} stk.</p>
          </div>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700">
          <div
            className="h-full rounded-full bg-[#FD7131] transition-all duration-500"
            style={{ width: `${Math.min(100, Math.max(0, item.quantity * 10))}%` }}
          />
        </div>
      </CardContent>
    </Card>
  );
}
