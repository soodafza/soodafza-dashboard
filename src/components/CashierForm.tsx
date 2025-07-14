import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { db } from '../db';
import { ulid } from 'ulid';

const schema = z.object({
  amount: z.number().positive(),
  percent: z.number().min(0).max(10).default(3).optional(),
});

type FormData = z.infer<typeof schema>;

export default function CashierForm({ userId }: { userId: string }) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting, errors }
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { percent: 3 },
  });

  const onSubmit = async (d: FormData) => {
    await db.tx.add({
      id: ulid(),
      userId,
      amount: Math.round(d.amount * 100),
      percent: d.percent ?? 3,
      ts: Date.now(),
      synced: false,
    });
    reset();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
      <div>
        <input
          type="number"
          step=".01"
          placeholder="مبلغ"
          {...register('amount', { valueAsNumber: true })}
          className="input"
        />
        {errors.amount && <p className="text-red-500 text-sm">{errors.amount.message}</p>}
      </div>

      <div>
        <input
          type="number"
          placeholder="درصد"
          {...register('percent', { valueAsNumber: true })}
          className="input"
        />
        {errors.percent && <p className="text-red-500 text-sm">{errors.percent.message}</p>}
      </div>

      <button disabled={isSubmitting} className="btn-primary w-full">
        ثبت تراکنش
      </button>
    </form>
  );
}
