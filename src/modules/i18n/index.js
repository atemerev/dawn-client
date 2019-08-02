export const LOCALE = 'en-GB';

const numberFormat = new Intl.NumberFormat(LOCALE, {
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
  style: 'decimal',
});

const moneyFormat = new Intl.NumberFormat(LOCALE, {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
  style: 'decimal',
});

const formatNumber = numberFormat.format;
const formatMoney = moneyFormat.format;

export { formatMoney, formatNumber };
