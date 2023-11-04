import sanitize from "sanitize-filename";
import { Auth, Card, InternalData } from "../interface";

export function dataToMap(data: Card[]): Map<string, Card[]> {
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

export function getInternalData(data: Card[], auth: Auth): InternalData {
  const mainFileName = "Kanban";
  const cardsDirName = "Cards";
  const internalData: InternalData = { auth, mainFileName, cardsDirName, lists: [] }

  const dataMap = dataToMap(data);

  const mapIterator = dataMap.keys();
  for (const key of mapIterator) {
    const cards = dataMap.get(key)!;
    const cardsNameAndOccurances = new Map<string, number>();
    internalData.lists.push({ name: key, cards: [] });
    {
      const cardsArr = internalData.lists[internalData.lists.length - 1].cards
      for (const card of cards) {
        const sanitizedTitle = sanitize(card.title).trim().split(" ").join("_");
        let occurances = 1;
        if (cardsNameAndOccurances.has(sanitizedTitle)) {
          occurances += cardsNameAndOccurances.get(sanitizedTitle)!;
        } else {
          cardsNameAndOccurances.set(sanitizedTitle, 1);
        }
        if (occurances > 1) {
          cardsArr.push({ path: `${sanitizedTitle}_${occurances}`, card });
        } else {
          cardsArr.push({ path: `${sanitizedTitle}`, card });
        }
      }
    }
  }
  return internalData;
}
