import { Router } from "express";

const publicProfileRoute = Router()

import suggestionProfilesRoute from "./SuggestionProfiles"
import searchProfilesRoute from "./SearchProfiles"

publicProfileRoute.use("/", suggestionProfilesRoute, searchProfilesRoute)

export default publicProfileRoute