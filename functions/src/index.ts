import {setGlobalOptions} from "firebase-functions/v2";
import {onRequest} from "firebase-functions/v2/https";
import {defineSecret} from "firebase-functions/params";
import {app} from "./app";

setGlobalOptions({maxInstances: 10});

const arcaPrivKey = defineSecret("ARCA_PRIVATE_KEY_B64");
const arcaCert = defineSecret("ARCA_CERTIFICATE_B64");

export const api = onRequest(
  {region: "southamerica-east1", invoker: "public", secrets: [arcaPrivKey, arcaCert]},
  app
);
