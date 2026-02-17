import authRoutes from "@routes/auth.routes";
import manageRoutes from "@routes/manage.routes";
import menuRoutes from "@routes/menu.routes";
import orderRoutes from "@routes/order.routes";
import profileRoutes from "@routes/profile.routes";
import reservationRoutes from "@routes/reservation.routes";
import statsRoutes from "@routes/stats.routes";
import stockRoutes from "@routes/stock.routes";
import stripeRoutes from "@routes/stripe.routes";
import tableRoutes from "@routes/table.routes";
import bodyParser from "body-parser";
import cors from "cors";
import express from "express";
import { rateLimit } from "express-rate-limit";
import helmet from "helmet";
import config from "lib/config";
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

//Insert all routes here
app.use(`/`, authRoutes);
app.use(`/stock`, stockRoutes);
app.use(`/table`, tableRoutes);
app.use(`/reservation`, reservationRoutes);
app.use(`/order`, orderRoutes);
app.use(`/manage`, manageRoutes);
app.use(`/profile`, profileRoutes);
app.use(`/menu`, menuRoutes);
app.use(`/stats`, statsRoutes);

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

app.listen(config.PORT, () => {
  console.info(`Server is running on ${config.PORT}`);
});
