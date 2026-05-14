import { Router } from "express";
import loginRoute from "./Login";
import registerRoute from "./Register";
import logoutRoute from "./Logout";
import checkMailTokenRoute from "./CheckMailToken";


const authenticationRoute = Router()

authenticationRoute.use("/", loginRoute, registerRoute, logoutRoute, checkMailTokenRoute)

export default authenticationRoute