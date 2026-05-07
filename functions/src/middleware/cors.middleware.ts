import cors from "cors";

const originesPermitidos = [
  "http://localhost:5173",
  "http://localhost:4173",
];

export const corsMiddleware = cors({
  origin: originesPermitidos,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
});
