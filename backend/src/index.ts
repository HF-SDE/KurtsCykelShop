import config from "@config";
import authRoutes from "@routes/auth.routes";
import customerRoutes from "@routes/customer.routes";
import { itemRoutes } from "@routes/item.routes";
import { itemStatusRoutes } from "@routes/itemStatuses.routes";
import { locationRoutes } from "@routes/locations.routes";
import manageRoutes from "@routes/manage.routes";
import profileRoutes from "@routes/profile.routes";
import serviceOrderRoutes from "@routes/serviceOrder.routes";
// import serviceOrderRoutes from "@routes/serviceOrder.routes";
import unitRoutes from "@routes/unit.routes";
import userRoutes from "@routes/user.routes";
import { vendorRoutes } from "@routes/vendor.routes";
import bodyParser from "body-parser";
import cors from "cors";
import express from "express";
import { rateLimit } from "express-rate-limit";
import helmet from "helmet";
import passport from "passport";

import "./lib/passport";

const app = express();

const limiter = rateLimit({
  windowMs: config.RATE_LIMIT_RESET_MINUTES * 60 * 1000, // 60 minutes
  limit: config.RATE_LIMIT_COUNT, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
  standardHeaders: "draft-7", // draft-6: `RateLimit-*` headers; draft-7: combined `RateLimit` header
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
});

app.set("trust proxy", 1);
app.set("json spaces", 4);

app.use(cors());

app.use(helmet());
app.use(bodyParser.json({}));
app.use(passport.initialize());
app.use(limiter);

app.use((req, res, next) => {
  console.info(`${req.method} ${req.path}`);
  next();
});

//Insert all routes here
app.use(`/`, authRoutes);
app.use(`/profile`, profileRoutes);
app.use(`/manage`, manageRoutes);
app.use(`/service-orders`, serviceOrderRoutes);
app.use(`/customers`, customerRoutes);
app.use("/units", unitRoutes);
app.use("/items", itemRoutes);
app.use("/user", userRoutes);
app.use("/vendors", vendorRoutes);
app.use("/locations", locationRoutes);
app.use("/item-statuses", itemStatusRoutes);

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

app.listen(config.PORT, () => {
  console.info(`Server is running on ${config.PORT}`);
});
