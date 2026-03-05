import { Catalog } from "@/components/catalog";

import { apiClient } from "@/lib/apiClient";
import { Item } from "@/types/Inventory/Item";

export default async function Home() {
  const { data } = await apiClient.get<{ data: Item[] }>("items/public");
  const items = data.data ?? [];

  return (
    <main className="min-h-screen bg-gradient-to-b">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <Catalog items={items} />
      </div>
    </main>
  );
}
