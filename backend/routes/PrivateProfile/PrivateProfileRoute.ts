import { Router } from "express"

import profileGetRoute from "./ProfileGet"
import profilePutRoute from "./ProfilePut"

const privateProfileRoute = Router()

privateProfileRoute.use("/", profileGetRoute, profilePutRoute)

export default privateProfileRoute