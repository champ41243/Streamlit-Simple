export const ZONE_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  SCT: { bg: "bg-red-100", text: "text-red-800", border: "border-red-300" },
  CWT: { bg: "bg-blue-100", text: "text-blue-800", border: "border-blue-300" },
  TWA: { bg: "bg-green-100", text: "text-green-800", border: "border-green-300" },
  ONT: { bg: "bg-orange-100", text: "text-orange-800", border: "border-orange-300" },
  CW: { bg: "bg-purple-100", text: "text-purple-800", border: "border-purple-300" },
  CN: { bg: "bg-yellow-100", text: "text-yellow-800", border: "border-yellow-300" },
  ER: { bg: "bg-pink-100", text: "text-pink-800", border: "border-pink-300" },
  NR: { bg: "bg-cyan-100", text: "text-cyan-800", border: "border-cyan-300" },
  NER: { bg: "bg-teal-100", text: "text-teal-800", border: "border-teal-300" },
  SR: { bg: "bg-gray-100", text: "text-gray-800", border: "border-gray-300" },
};

export const getZoneColor = (zone: string) => {
  return ZONE_COLORS[zone] || { bg: "bg-gray-100", text: "text-gray-800", border: "border-gray-300" };
};
