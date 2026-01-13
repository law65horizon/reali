import dayjs from "./dayjs";


export interface RateCalendarEntry {
  __typename: string;
  date: string;
  is_blocked: boolean;
  min_stay: number;
  nightly_rate: number;
}

export function getNightlyRatesInRange(
  checkInDate: string, 
  checkOutDate: string, 
  data: RateCalendarEntry[]
): RateCalendarEntry[] {
  // Parse the check-in and check-out dates as dayjs objects for comparison
  const checkIn = dayjs(checkInDate);
  const checkOut = dayjs(checkOutDate);

  // Return early if the check-in date is after the check-out date (invalid range)
  if (checkIn.isAfter(checkOut)) {
    return [];
  }

  // Filter data to only include the dates within the range
  return data.filter(entry => {
    const entryDate = dayjs(entry.date);

    // Check if the entry date is within the check-in and check-out range
    return entryDate.isBetween(checkIn, checkOut, null, '[]');
  });
}

export function sumNightlyRates(entries: RateCalendarEntry[]): number {
  return entries.reduce((total, entry) => {
    // Only add the nightly rate if the entry is not blocked (optional condition)
    if (!entry.is_blocked) {
      return total + entry.nightly_rate;
    }
    return total; // Return the total unchanged if the entry is blocked
  }, 0);
}

// // Example data
// const data: RateCalendarEntry[] = [
//   { "__typename": "RateCalendarEntry", "date": "2025-11-20", "is_blocked": true, "min_stay": 3, "nightly_rate": 250 },
//   { "__typename": "RateCalendarEntry", "date": "2025-11-21", "is_blocked": true, "min_stay": 3, "nightly_rate": 250 },
//   { "__typename": "RateCalendarEntry", "date": "2025-11-22", "is_blocked": true, "min_stay": 3, "nightly_rate": 250 },
//   { "__typename": "RateCalendarEntry", "date": "2025-11-23", "is_blocked": true, "min_stay": 3, "nightly_rate": 250 },
//   { "__typename": "RateCalendarEntry", "date": "2025-11-24", "is_blocked": true, "min_stay": 3, "nightly_rate": 250 },
//   { "__typename": "RateCalendarEntry", "date": "2025-11-25", "is_blocked": true, "min_stay": 3, "nightly_rate": 250 },
//   { "__typename": "RateCalendarEntry", "date": "2025-11-26", "is_blocked": true, "min_stay": 3, "nightly_rate": 250 },
// ];

// // Example usage:
// const checkIn = '2025-11-21';
// const checkOut = '2025-11-23';

// const ratesInRange = getNightlyRatesInRange(checkIn, checkOut, data);
// console.log(ratesInRange);
