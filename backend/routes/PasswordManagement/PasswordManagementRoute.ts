import { Router } from "express"
import changePasswordRoute from "./ChangePassword"
import resetPasswordRoute from "./ResetPassword"
import forgotPasswordRoute from "./ForgotPassword"

const passwordManagementRoute = Router()

passwordManagementRoute.use("/", forgotPasswordRoute, resetPasswordRoute, changePasswordRoute)

export default passwordManagementRoute