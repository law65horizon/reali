
export function calculatePeriod(nights: number) {
      if (nights >= 30) {
        return  'monthly';
      } else if (nights >= 7) {
        return  'weekly';
      } else {
        return  'daily';
      }
}