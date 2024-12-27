import type { WakaType } from "../schema/waka-schema";

export async function createWaka(data: WakaType) {
  const response = await fetch("/api/waka/create", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("Failed to create waka");
  }

  return response.json();
}
