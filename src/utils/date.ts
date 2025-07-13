import dayjs from "dayjs";
import jalaliday from "jalaliday";
import "dayjs/locale/fa";
import "dayjs/locale/en";

dayjs.extend(jalaliday);

/* YYYY-MM-DD را به متن تاریخ مناسب زبان تبدیل می‌کند */
export const formatDate = (iso: string, lang: "fa" | "en") => {
  const d =
    lang === "fa" ? dayjs(iso).calendar("jalali") : dayjs(iso);
  return d.locale(lang).format(
    lang === "fa" ? "dddd D MMMM YYYY" : "dddd, MMM D, YYYY"
  );
};

/* ساعت جاری HH:mm:ss مطابق زبان */
export const nowTime = (lang: "fa" | "en") =>
  dayjs().locale(lang).format("HH:mm:ss");
