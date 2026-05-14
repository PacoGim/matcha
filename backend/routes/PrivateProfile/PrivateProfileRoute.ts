import { Router } from "express"

import profileGetRoute from "./ProfileGet"
import profilePutRoute from "./ProfilePut"

const privateProfileRoute = Router()

privateProfileRoute.use(profileGetRoute)
privateProfileRoute.use(profilePutRoute)

export default privateProfileRoute