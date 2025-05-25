import * as OpenApiValidator from "express-openapi-validator";
import { CONFIG } from "@config";



export const openApiValidator =  OpenApiValidator.middleware({
    apiSpec: CONFIG.SWAGGER_V1_FILE_PATH, 
    validateRequests: true,              // Valida richieste
    validateResponses: true,            // Opzionale: valida risposte
    validateApiSpec : true ,
  });  
