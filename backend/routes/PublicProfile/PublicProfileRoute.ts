import { Router } from "express";

const publicProfileRoute = Router()

import suggestionProfilesRoute from "./SuggestionProfiles"
import searchProfilesRoute from "./SearchProfiles"

publicProfileRoute.use(suggestionProfilesRoute)
publicProfileRoute.use(searchProfilesRoute)

export default publicProfileRoute