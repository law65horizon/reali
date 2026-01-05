export interface ImageProps {
  uri: string
  filename: string
  loading?: boolean
}

export interface ItineraryProps {
    title: string
    description: string
    image?: ImageProps
}

export interface Availabilty {
  repeating: boolean
  
  // working
}

export interface FAQ { question: string; answer: string; }

export interface Activity {
  title: string;
  description?: string;
  duration?: number;
  thumbnail_url?: string;
}

export interface EventDay {
  id: number;
  date: Date;
  startTime: Date;
  endTime: Date;
  activities: Activity[];
}