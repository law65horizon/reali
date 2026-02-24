import { GraphQLError } from "graphql";
import RoomTypeModel, { CreateRoomTypeInput, CreateRoomUnitInput, UpdateRoomUnitInput } from "../../models/RoomType.js";
import { User } from "../../models/User.js";
import { roomTypesLoader, roomUnitLoader } from "./property.js";


export default {
    Query: {
    },
    Mutation: {
        createRoomType: async (_, {input}: {input: Omit<CreateRoomTypeInput, 'property_id'> & {property_id: string}}, {user}: {user: User}) => {
            if (!user) {
                throw new GraphQLError('Access token expired', {
                    extensions: {
                      code: 'UNAUTHENTICATED',
                      http: {status: 401 }
                    }
                })
            }
            const result = await RoomTypeModel.createRoomType({...input, property_id: parseInt(input.property_id)}, user)
            roomTypesLoader.clearAll()
            return result
        },
        updateRoomType: async (_, {id, input}: {id: string, input: Omit<CreateRoomTypeInput, 'property_id'> & {property_id: string}}, {user}: {user: User}) => {
            if (!user) {
                throw new GraphQLError('Access token expired', {
                    extensions: {
                      code: 'UNAUTHENTICATED',
                      http: {status: 401 }
                    }
                })
            }
            const result = await RoomTypeModel.updateRoomType(parseInt(id), {...input, property_id: parseInt(input.property_id)}, user)
            roomTypesLoader.clear(parseInt(id))
            return result
        },
        deleteRoomType: async (_:any, {id}: {id: string}, {user}: {user: User}) => {
            if (!user) {
                throw new Error('Unauthorized')
            }

            const result = await RoomTypeModel.deleteRoomType(parseInt(id), user)
            roomTypesLoader.clearAll()
            return result
        },

        // units
        createRoomUnit: async (_: any, {input}: {input: Omit<CreateRoomUnitInput, 'room_type_id'> & {room_type_id: string}}, {user}: {user: User}) => {
            if (!user) {
                throw new GraphQLError('Access token expired', {
                    extensions: {
                      code: 'UNAUTHENTICATED',
                      http: {status: 401 }
                    }
                })
            }

            const result = await RoomTypeModel.createRoomUnit({...input, room_type_id: parseInt(input.room_type_id)}, user)
            roomUnitLoader.clearAll()
            return result
        },

        updateRoomUnit: async (_: any, {id, input}: {id: string, input: UpdateRoomUnitInput}, {user}: {user: User}) => {
            if (!user) {
                throw new GraphQLError('Access token expired', {
                    extensions: {
                      code: 'UNAUTHENTICATED',
                      http: {status: 401 }
                    }
                })
            }

            const result = await RoomTypeModel.updateRoomUnit(parseInt(id), input, user)
            roomUnitLoader.clear(parseInt(id))
            return result
        },

        deleteRoomUnit: async (_: any, {id}: {id: string}, {user}: {user: User}) => {
            if (!user) {
                throw new GraphQLError('Access token expired', {
                    extensions: {
                      code: 'UNAUTHENTICATED',
                      http: {status: 401 }
                    }
                })
            }

            const result = await RoomTypeModel.deleteRoomUnit(parseInt(id), user)
            roomUnitLoader.clearAll()
            return result
        }
    }
}