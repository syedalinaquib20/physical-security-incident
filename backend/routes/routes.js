import { Router } from "express";
import manageSites from "../controllers/manageSites.js";
import registerSites from "../controllers/registerSites.js";
import updateSites from "../controllers/updateSites.js";
import deleteSites from "../controllers/deleteSites.js";
import uploadSites from "../controllers/uploadSites.js";
import registerRegions from "../controllers/registerRegions.js";
import updateRegions from "../controllers/updateRegions.js";
import deleteRegions from "../controllers/deleteRegions.js";
import manageRegions from "../controllers/manageRegions.js";
import checkDuplicateSiteName from "../controllers/checkDuplicateSiteName.js";
import deleteIncidents from "../controllers/deleteIncidents.js";
import manageIncidents from "../controllers/manageIncidents.js";
import registerIncidents from "../controllers/registerIncidents.js";
import updateIncidents from "../controllers/updateIncidents.js";
import uploadIncidents from "../controllers/uploadIncidents.js";

const routes = Router();

routes.get("/manage-sites", manageSites);
routes.get("/manage-regions", manageRegions);
routes.get("/manage-incidents", manageIncidents);

routes.post("/register-sites", registerSites);
routes.post("/register-regions", registerRegions);
routes.post("/register-incidents", registerIncidents);

routes.put("/update-sites/:site_id", updateSites);
routes.put("/update-regions/:region_id", updateRegions);
routes.put("/update-incidents/:incident_id", updateIncidents);

routes.delete("/delete-sites/:site_id", deleteSites);
routes.delete("/delete-regions/:region_id", deleteRegions);
routes.delete("/delete-incidents/:incident_id", deleteIncidents);

routes.post("/upload-sites", uploadSites);
routes.post("/upload-incidents", uploadIncidents);

routes.post("/check-duplicate-sites", checkDuplicateSiteName);

export default routes;