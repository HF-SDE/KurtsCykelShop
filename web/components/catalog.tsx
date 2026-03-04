"use client";

import { useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

import { Item } from "@/types/Inventory/Item";

import { Search } from "lucide-react";

interface CatalogProps {
  items: Item[];
}

export function Catalog({ items }: CatalogProps) {
  const [searchQuery, setSearchQuery] = useState("");

  // Filter items based on search query
  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) {
      return items;
    }

    const queryLower = searchQuery.toLowerCase();
    return items.filter(
      (item) =>
        item.name.toLowerCase().includes(queryLower) ||
        item.sku.toLowerCase().includes(queryLower) ||
        item.description?.toLowerCase().includes(queryLower),
    );
  }, [items, searchQuery]);

  // Format price (øre to DKK)
  const formatPrice = (priceInOre: number) => {
    return (priceInOre / 100).toLocaleString("da-DK", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  // Get stock status badge
  const getStockStatus = (quantity: number) => {
    if (quantity === 0) {
      return <Badge variant="destructive">Udsolgt</Badge>;
    }
    if (quantity < 5) {
      return (
        <Badge variant="outline" className="border-yellow-500 text-yellow-700">
          Lav lagerbeholdning
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="border-green-500 text-green-700">
        På lager
      </Badge>
    );
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold tracking-tight">Cykelbutikkens Katalog</h1>
        <p className="text-gray-600">Se vores udvalg af varer på lager</p>
      </div>

      {/* Search Bar */}
      <div className="mb-8">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 transform text-gray-400" />
          <Input
            placeholder="Søg efter varer... (navn, SKU eller beskrivelse)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Results Info */}
      <div className="mb-6">
        <p className="text-sm text-gray-600">
          Viser <span className="font-semibold">{filteredItems.length}</span> af{" "}
          <span className="font-semibold">{items.length}</span> varer
        </p>
      </div>

      {/* Products Grid */}
      {filteredItems.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredItems.map((item) => (
            <Card key={item.id} className="flex h-full flex-col transition-shadow hover:shadow-lg">
              {/* Badges */}
              <CardHeader className="pb-3">
                <div className="mb-2 flex items-start justify-between gap-2">
                  <Badge variant="secondary">{item.sku}</Badge>
                  {getStockStatus(item.quantity)}
                </div>
                <CardTitle className="line-clamp-2">{item.name}</CardTitle>
              </CardHeader>

              {/* Content */}
              <CardContent className="flex flex-1 flex-col">
                {/* Description */}
                {item.description && (
                  <CardDescription className="mb-4 line-clamp-3 flex-1">{item.description}</CardDescription>
                )}

                {/* Stock Info */}
                <div className="mb-4 rounded-md border border-gray-200 bg-gray-50 p-3">
                  <div className="mb-1 text-sm font-semibold text-gray-700">Lagerbeholdning</div>
                  <div className="text-2xl font-bold text-gray-900">{item.quantity}</div>
                </div>

                {/* Price */}
                <div className="mt-auto border-t border-gray-200 pt-4">
                  <div className="mb-1 text-sm text-gray-600">Pris</div>
                  <div className="text-xl font-bold text-gray-900">{formatPrice(item.price)} DKK</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        /* No Results */
        <div className="py-12 text-center">
          <p className="mb-2 text-gray-600">Ingen varer fundet</p>
          <p className="text-sm text-gray-500">Prøv at søge efter noget andet eller se hele kataloget</p>
          <button
            onClick={() => setSearchQuery("")}
            className="mt-4 text-sm font-medium text-blue-600 underline hover:text-blue-700"
          >
            Nulstil søgning
          </button>
        </div>
      )}
    </div>
  );
}
