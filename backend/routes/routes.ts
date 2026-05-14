import { Router } from "express"

import authenticationRoute from "./Authentication/AuthenticationRoute"
import passwordManagementRoute from "./PasswordManagement/PasswordManagementRoute"
import privateProfileRoute from "./PrivateProfile/PrivateProfileRoute"
import publicProfileRoute from "./PublicProfile/PublicProfileRoute"

const mainRouter = Router()

mainRouter.use(authenticationRoute)
mainRouter.use(passwordManagementRoute) 
mainRouter.use(privateProfileRoute)
mainRouter.use(publicProfileRoute)

export default mainRouter