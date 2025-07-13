interface Props {
  title: string;
  value: string | number;
}
export default function ReportCard({ title, value }: Props) {
  return (
    <div className="bg-white rounded-xl shadow p-4 w-44">
      <p className="text-sm text-gray-500">{title}</p>
      <p className="text-xl font-bold">{value}</p>
    </div>
  );
}
