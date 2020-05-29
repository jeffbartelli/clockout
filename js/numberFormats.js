var dollarFormat = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 0,
});

var percentFormat = new Intl.NumberFormat('en-US', {
  style: 'percent',
  minimumFractionDigits: 1,
});

var randomGenerator = (lowerValue,upperValue) => {
  let choices = upperValue - lowerValue +1;
  return Math.floor(Math.random() * choices + lowerValue);
}
export {dollarFormat, percentFormat};