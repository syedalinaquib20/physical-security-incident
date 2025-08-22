import { Router } from "express";
import manageSites from "../controllers/manageSites";
import registerSites from "../controllers/registerSites";
import updateSites from "../controllers/updateSites";
import deleteSites from "../controllers/deleteSites";
import uploadSites from "../controllers/uploadSites";

const routes = Router();

routes.get("manage-sites", manageSites);

routes.post("register-sites", registerSites);

routes.put("update-sites/:site_id", updateSites);

routes.delete("delete-sites/:site_id", deleteSites);

routes.post("/upload-sites", uploadSites);

export default routes;