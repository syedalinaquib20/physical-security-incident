import { Router } from "express";
import manageSites from "../controllers/manageSites.js";
import registerSites from "../controllers/registerSites.js";
import updateSites from "../controllers/updateSites.js";
import deleteSites from "../controllers/deleteSites.js";
import uploadSites from "../controllers/uploadSites.js";
import regsterRegions from "../controllers/registerRegions.js";
import updateRegions from "../controllers/updateRegions.js";
import deleteRegions from "../controllers/deleteRegions.js";
import manageRegions from "../controllers/manageRegions.js";
import checkDuplicateSiteName from "../controllers/checkDuplicateSiteName.js";

const routes = Router();

routes.get("/manage-sites", manageSites);
routes.get("/manage-regions", manageRegions);

routes.post("/register-sites", registerSites);
routes.post("/register-regions", regsterRegions);

routes.put("/update-sites/:site_id", updateSites);
routes.put("/update-regions/:region_id", updateRegions);

routes.delete("/delete-sites/:site_id", deleteSites);
routes.delete("/delete-regions/:region_id", deleteRegions);

routes.post("/upload-sites", uploadSites);

routes.post("/check-duplicate-sites", checkDuplicateSiteName);

export default routes;