import {Request, Response, NextFunction} from "express";
import {DecodedIdToken} from "firebase-admin/auth";
import {auth} from "../config/firebase";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      usuario?: DecodedIdToken;
    }
  }
}

export const autenticarAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({error: "Token de autenticación requerido"});
    return;
  }

  const token = authHeader.split("Bearer ")[1];

  try {
    const decoded = await auth.verifyIdToken(token);

    if (decoded.admin !== true) {
      res.status(403).json({error: "Acceso denegado: se requiere rol de administrador"});
      return;
    }

    req.usuario = decoded;
    next();
  } catch {
    res.status(401).json({error: "Token inválido o expirado"});
  }
};
