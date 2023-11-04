import { Auth, Card } from '.';

export interface InternalData {
  auth: Auth;
  mainFileName: string;
  cardsDirName: string;
  lists: { name: string, cards: { path: string, card: Card }[] }[];
}
