import { Catalogue } from "@/components/catalogue";

import { apiClient } from "@/lib/apiClient";
import { Item } from "@/types/Inventory/Item";

export default async function Home() {
  const { data } = await apiClient.get<{ data: Item[] }>("items/public");
  const items = data.data ?? [];

  return (
    <main className="min-h-screen">
      <Catalogue items={items} />
    </main>
  );
}
