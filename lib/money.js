// pure functions for money formatting and calculations

// format amount in indian rupees
export const formatRupees = (amount) => {
  const num = Number(amount);
  if (isNaN(num)) return '₹0.00';
  // indian number system: 1,00,000 format
  const parts = num.toFixed(2).split('.');
  let intPart = parts[0];
  const decPart = parts[1];

  // handle negative
  const isNeg = intPart.startsWith('-');
  if (isNeg) intPart = intPart.slice(1);

  // indian grouping: last 3 digits, then groups of 2
  if (intPart.length > 3) {
    const last3 = intPart.slice(-3);
    const rest = intPart.slice(0, -3);
    const grouped = rest.replace(/\B(?=(\d{2})+(?!\d))/g, ',');
    intPart = grouped + ',' + last3;
  }

  return `${isNeg ? '-' : ''}₹${intPart}.${decPart}`;
};

// calculate day amount = litres x price, rounded to 2 decimals
export const calcDayAmount = (litres, pricePerLitre) => {
  return Math.round(litres * pricePerLitre * 100) / 100;
};

// estimate monthly cost from weekly plan
// roughly 4.33 weeks per month
export const calcMonthlyEstimate = (planDays, pricePerLitre) => {
  const weeklyTotal = planDays.reduce((sum, day) => {
    return sum + calcDayAmount(day.litres, pricePerLitre);
  }, 0);
  return Math.round(weeklyTotal * 4.33 * 100) / 100;
};

// estimate how many days of milk the balance can cover
export const estimateDaysLeft = (balance, planDays, pricePerLitre) => {
  if (!planDays || planDays.length === 0) return 0;
  const activeDays = planDays.filter((d) => d.litres > 0);
  if (activeDays.length === 0) return 0;
  const avgDayCost =
    activeDays.reduce((sum, d) => sum + calcDayAmount(d.litres, pricePerLitre), 0) /
    activeDays.length;
  if (avgDayCost === 0) return Infinity;
  return Math.floor(balance / avgDayCost);
};

// min/max topup amounts
export const MIN_TOPUP = 100;
export const MAX_TOPUP = 10000;

// litre step
export const LITRE_STEP = 0.5;
export const MAX_LITRES = 5;
