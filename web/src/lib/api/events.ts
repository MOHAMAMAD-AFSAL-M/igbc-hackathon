import { VPPEventHistoryItem } from "@/lib/mock/events";
import { mockStore } from "@/lib/mock/mockStore";

export async function getEvents(): Promise<VPPEventHistoryItem[]> {
  return mockStore.getEvents();
}

export async function getEvent(id: string): Promise<VPPEventHistoryItem | undefined> {
  return mockStore.getEvent(id);
}
