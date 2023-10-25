import { Card } from './card';

export interface InternalData {
  mainFileName: string;
  cardsDirName: string;
  lists: { name: string, cards: { path: string, card: Card }[] }[];
}
