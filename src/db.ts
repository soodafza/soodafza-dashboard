import Dexie, { Table } from 'dexie';
import { encrypt, decrypt } from './crypto';

export interface Tx {
  id: string;        // ulid
  userId: string;
  amount: number;    // cents
  percent: number;   // 0–100
  ts: number;
  synced: boolean;
}

class StoreDB extends Dexie {
  tx!: Table<Tx>;

  constructor() {
    super('storeCashback');
    this.version(1).stores({ tx: '&id, userId, ts, synced' });
    this.tx.mapToClass(class implements Tx {
      id = '';
      userId = '';
      amount = 0;
      percent = 0;
      ts = Date.now();
      synced = false;
    });
    // crypto hook
    this.on('creating', (_p, obj: Tx) => (obj as any).amount = encrypt(obj.amount));
    this.on('reading', (obj: Tx) => ({ ...obj, amount: decrypt(obj.amount as any) }));
  }
}
export const db = new StoreDB();
