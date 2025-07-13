import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { db } from '../db';
import ulid from 'ulid';

const schema = z.object({
  amount: z.number().positive(),
  percent: z.number().min(0).max(10).default(3),
});

type FormData = z.infer<typeof schema>;

export default function CashierForm({ userId }: { userId: string }) {
  const { register, handleSubmit, reset, formState } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { percent: 3 },
  });

  const onSubmit = async (d: FormData) => {
    await db.tx.add({
      id: ulid(),
      userId,
      amount: Math.round(d.amount * 100),
      percent: d.percent,
      ts: Date.now(),
      synced: false,
    });
    // TODO: optimistic API call
    reset();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
      <input type="number" step=".01" placeholder="مبلغ" {...register('amount', { valueAsNumber: true })} className="input" />
      <input type="number" {...register('percent', { valueAsNumber: true })} className="input" />
      <button disabled={formState.isSubmitting} className="btn-primary w-full">ثبت تراکنش</button>
    </form>
  );
}
