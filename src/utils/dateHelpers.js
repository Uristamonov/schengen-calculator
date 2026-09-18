export const parseLocalDate = (str) => {
  return !str ? new Date() : new Date(str + "T00:00:00");
};

export const formatDisplayDate = (str) => {
  if (!str) return "Ongoing";
  const dateObj = new Date(str + "T00:00:00");
  if (isNaN(dateObj.getTime())) return str;
  
  return `${String(dateObj.getDate()).padStart(2, '0')}/${String(dateObj.getMonth() + 1).padStart(2, '0')}/${dateObj.getFullYear()}`;
};
