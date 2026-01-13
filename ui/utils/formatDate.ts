
type DateSubset = {
  day?: boolean;    // Optional property for the day
  month?: boolean;  // Optional property for the month
  year?: boolean;   // Optional property for the year
}

interface formatDateProps {
    timeStamp: string;
    extract: DateSubset
}

export const formatDate = ({timeStamp, extract}: formatDateProps): string => {
    const date = new Date(parseInt(timeStamp))
    let result: number[] = []
    if (extract.day) result.push(date.getDay())
    if (extract.month) result.push(date.getMonth())
    if (extract.year) result.push(date.getFullYear())
    return result.join()
}

// formatDate({})

export function timeDifference(timestamp: string) {
  const currentDate = new Date(); // Current date and time
  const pastDate = new Date(parseInt(timestamp)); // Convert timestamp to Date object

  // Calculate the difference in years
  const yearsDifference = currentDate.getFullYear() - pastDate.getFullYear();
  const monthsDifference = currentDate.getMonth() - pastDate.getMonth();

  // If the current month is earlier than the past month, subtract one year
  if (monthsDifference < 0) {
    return `${yearsDifference - 1} years`;
  }

  // If the difference is less than 1 year but more than 0 months, return months
  if (yearsDifference === 0 && monthsDifference > 0) {
    return `${monthsDifference} months`;
  }

  return `${yearsDifference} years`;
}