import { user } from "../customs/index";

declare module "express-serve-static-core" {
  interface Request {
    user?: user;
    auth?: boolean;
  }
}
