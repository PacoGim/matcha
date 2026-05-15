import { Router } from "express"
import changePasswordRoute from "./ChangePassword"
import forgotPasswordRoute from "./ForgotPassword"
import resetPasswordRoute from "./ResetPassword"

const passwordManagementRoute = Router()

passwordManagementRoute.use("/", forgotPasswordRoute, resetPasswordRoute, changePasswordRoute)

export default passwordManagementRoute