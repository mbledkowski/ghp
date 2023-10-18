import { Card } from "../interface/card";

export function data2map(data: Card[]): Map<string, Card[]> {
  const mapOfData: Map<string, Card[]> = new Map();
  for (const card of data) {
    if (mapOfData.has(card.status)) {
      mapOfData.get(card.status)?.push(card)
    } else {
      mapOfData.set(card.status, [card])
    }
  }
  return mapOfData;
}
