// formats a number as Sri Lankan Rupees, e.g. 1234.5 becomes "Rs. 1,234.50"
export function format_currency(amount) {
  const number = Number(amount) || 0;
  return `Rs. ${number.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
