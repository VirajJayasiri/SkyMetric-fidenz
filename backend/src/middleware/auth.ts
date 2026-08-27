import "dotenv/config";
import { auth } from "express-oauth2-jwt-bearer";

const audience = process.env.AUTH0_AUDIENCE;
const domain = process.env.AUTH0_DOMAIN;

if (!audience) {
  throw new Error("AUTH0_AUDIENCE is missing from .env");
}

if (!domain) {
  throw new Error("AUTH0_DOMAIN is missing from .env");
}

export const checkJwt = auth({
  audience,
  issuerBaseURL: `https://${domain}/`,
});