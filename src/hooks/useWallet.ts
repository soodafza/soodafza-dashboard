import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';

export function useWallet(userId: string) {
  const balance = useLiveQuery(async () => {
    const txs = await db.tx.where({ userId }).toArray();
    return txs.reduce((sum, t) => sum + (t.amount * t.percent) / 100, 0);
  }, [userId], 0);

  return balance ?? 0;
}
