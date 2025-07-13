import Papa from "papaparse";
import { useProductStore } from "../stores/productStore";
import { useTranslation } from "react-i18next";

export default function ImportProducts() {
  const { t } = useTranslation();
  const add = useProductStore((s)=>s.addProduct);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>)=>{
    const file = e.target.files?.[0];
    if(!file) return;
    Papa.parse(file,{
      header:true,
      complete(res){
        res.data.forEach((row:any)=> add({
          productName: row.productName,
          productNumber: row.productNumber,
          qtyInStock: Number(row.qty)||0,
          minPrice: Number(row.min)||0,
          maxPrice: Number(row.max)||0,
          lastPurchasePrice: 0,
          tireDate:""
        }));
        alert(t("importDone"));
      }
    });
  };

  return (
    <div className="p-6 space-y-4">
      <h2 className="text-2xl font-semibold">{t("importCSV")}</h2>
      <input type="file" accept=".csv" onChange={handleFile}/>
      <p className="text-sm text-gray-600">productName,productNumber,qty,min,max</p>
    </div>
  );
}
