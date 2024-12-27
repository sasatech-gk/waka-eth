import { WakaType } from "../schema/waka-schema";

export async function getWaka(id: string): Promise<WakaType> {
  const response = await fetch(`/api/waka/${id}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch waka");
  }

  const data = await response.json();
  return data.payload;
}
