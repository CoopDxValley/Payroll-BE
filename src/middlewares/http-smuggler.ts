import { Request, Response, NextFunction } from "express";

type Opts = {
  /** If true, allow `Transfer-Encoding: chunked` (rarely needed behind a proxy). */
  allowChunked?: boolean;
};

function getAllHeaders(req: Request, name: string): string[] {
  // Use rawHeaders to catch duplicates exactly as received
  const raw = (req as any).rawHeaders as string[] | undefined;
  if (!raw || raw.length === 0) {
    const v = req.headers[name.toLowerCase()];
    return v === undefined ? [] : Array.isArray(v) ? v : [String(v)];
  }
  const out: string[] = [];
  for (let i = 0; i < raw.length; i += 2) {
    const k = raw[i];
    const v = raw[i + 1];
    if (k && v && k.toLowerCase() === name.toLowerCase()) out.push(v);
  }
  return out;
}

export default function httpSmugglingMiddleware(opts: Opts = {}) {
  const { allowChunked = false } = opts;

  return (req: Request, res: Response, next: NextFunction): void => {
    // 1) Disallow both CL and TE together
    const hasCL = "content-length" in req.headers;
    const hasTE = "transfer-encoding" in req.headers;
    if (hasCL && hasTE) {
      res.setHeader("Connection", "close");
      res.status(400).send("Bad Request");
      return;
    }

    // 2) Multiple Content-Length headers: must be identical & numeric
    const cls = getAllHeaders(req, "content-length");
    if (cls.length > 1) {
      const unique = new Set(cls.map((s) => s.trim()));
      if (unique.size !== 1) {
        res.setHeader("Connection", "close");
        res.status(400).send("Bad Request");
        return;
      }
      const only = cls[0].trim();
      if (!/^\d+$/.test(only)) {
        res.setHeader("Connection", "close");
        res.status(400).send("Bad Request");
        return;
      }
    }

    // 3) Transfer-Encoding must be exactly "chunked" if present (no obfuscations)
    if (hasTE) {
      const allTE = getAllHeaders(req, "transfer-encoding");
      // Reject multiple TE or comma-chains like "gzip, chunked"
      if (allTE.length !== 1) {
        res.setHeader("Connection", "close");
        res.status(400).send("Bad Request");
        return;
      }
      const te = allTE[0].toLowerCase().replace(/\s+/g, "");
      if (te !== "chunked" || !allowChunked) {
        res.setHeader("Connection", "close");
        res.status(400).send("Bad Request");
        return;
      }
    }

    // 4) Reject duplicated critical headers beyond CL/TE
    const critical = ["host", "connection"];
    for (const h of critical) {
      const vals = getAllHeaders(req, h);
      if (vals.length > 1) {
        res.setHeader("Connection", "close");
        res.status(400).send("Bad Request");
        return;
      }
    }

    // 5) Very defensive: block obs-folding or CR/LF in header values
    const raw = (req as any).rawHeaders as string[] | undefined;
    if (raw) {
      for (let i = 1; i < raw.length; i += 2) {
        const v = raw[i];
        if (/\r|\n/.test(v)) {
          res.setHeader("Connection", "close");
          res.status(400).send("Bad Request");
          return;
        }
      }
    }

    next();
  };
}
