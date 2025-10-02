import userResolvers from './user.js'
import propertyResolvers from './property.js'
import experienceResolvers from './experience.js'
import bookingResolvers from './booking.js'
import messageResolvers from './message.js'
import reviewResolvers from './review.js'

export default {
    Query: {
        ...userResolvers.Query,
        ...propertyResolvers.Query,
        ...experienceResolvers.Query,
        ...bookingResolvers.Query,
        ...messageResolvers.Query,
        ...reviewResolvers.Query
    },
    Mutation: {
        ...userResolvers.Mutation,
        ...propertyResolvers.Mutation,
        ...experienceResolvers.Mutation,
        ...bookingResolvers.Mutation,
        ...messageResolvers.Mutation,
        ...reviewResolvers.Mutation
    },
    Subscription: {
        ...messageResolvers.Subscription
    },
    Property: propertyResolvers.Property,
    Booking:  bookingResolvers.Booking,
    Message: messageResolvers.Message,
    Review: reviewResolvers.Review,
    Experience: experienceResolvers.Experience
}