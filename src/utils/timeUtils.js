
import { formatInTimeZone } from "date-fns-tz";
import { es } from "date-fns/locale";

const TIMEZONE_MADRID = "Europe/Madrid";

function parseDateAsUTC(dateString) {
  if (
    typeof dateString === 'string' && 
    (dateString.includes("Z") ||
    dateString.includes("+") ||
    dateString.includes("-", 10))
  ) {
    return new Date(dateString);
  }

  const utcString = typeof dateString === 'string' && dateString.endsWith("Z") ? dateString : dateString + "Z";
  return new Date(utcString);
}

export function formatTimeMadrid(dateString) {
  if (!dateString) return "N/A";

  try {
    const date =
      typeof dateString === "string" ? parseDateAsUTC(dateString) : dateString;
    return formatInTimeZone(date, TIMEZONE_MADRID, "HH:mm", { locale: es });
  } catch (error) {
    console.error("Error formateando hora:", error);
    return "N/A";
  }
}

export function formatDateMadrid(dateString) {
  if (!dateString) return "N/A";

  try {
    const date =
      typeof dateString === "string" ? parseDateAsUTC(dateString) : dateString;
    return formatInTimeZone(date, TIMEZONE_MADRID, "d MMM", { locale: es });
  } catch (error) {
    console.error("Error formateando fecha:", error);
    return "N/A";
  }
}

export function formatDateTimeMadrid(dateString) {
  if (!dateString) return "N/A";

  try {
    const date =
      typeof dateString === "string" ? parseDateAsUTC(dateString) : dateString;
    return formatInTimeZone(date, TIMEZONE_MADRID, "d MMM yyyy, HH:mm", {
      locale: es,
    });
  } catch (error) {
    console.error("Error formateando fecha y hora:", error);
    return "N/A";
  }
}
