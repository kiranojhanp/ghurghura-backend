import mongoose, { Schema, Model, Document } from "mongoose"
import { HASH_ASYNC, HASH_COMPARE_ASYNC } from "../helpers/bcrypt_async"

interface IUserDocument extends Document {
    email: string
    password: string
}

interface IUser extends IUserDocument {
    isValidPassword: (password: string) => Promise<boolean>
}

interface IUserModel extends Model<IUserDocument, {}> {}

const UserSchema = new Schema<IUser, IUserModel>(
    {
        email: {
            type: String,
            required: true,
            lowercase: true,
            unique: true,
        },
        password: {
            type: String,
            required: true,
        },
    },
    {
        timestamps: true,
    }
)

UserSchema.pre("save", async function (next) {
    try {
        // hash the password only when the document is new or password changed
        if (this.isNew || this.isModified("password")) {
            // const salt = await bcrypt.genSalt(10)
            // const hashedPassword = await bcrypt.hash(this.password, 10)
            const hashedPassword = await HASH_ASYNC(this.password, 10)
            this.password = hashedPassword
        }
        next()
    } catch (error) {
        next(error)
    }
})

UserSchema.methods.isValidPassword = async function (password: string) {
    try {
        return await HASH_COMPARE_ASYNC(password, this.password)
    } catch (error) {
        throw error
    }
}

const User = mongoose.model<IUser>("user", UserSchema)
export default User
