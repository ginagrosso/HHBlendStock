import cors from "cors";

const originesPermitidos = [
  "http://localhost:5173",
  "http://localhost:4173",
  "https://hhblend-479f8.web.app",
  "https://hhblend-479f8.firebaseapp.com",
];

export const corsMiddleware = cors({
  origin: originesPermitidos,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
});
