import { Router } from "express";
import {
  createSubscription,
  deleteSubscription,
  getFollowers,
  getFollowing
} from "../controllers/userSubscriptionController";

const router = Router();

router.post("/", createSubscription);
router.get("/following", getFollowing);
router.get("/followers", getFollowers);
router.delete("/", deleteSubscription);

export default router;