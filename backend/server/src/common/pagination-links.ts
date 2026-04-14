import { Request, Response } from 'express';

export function setPaginationLinkHeader(
  req: Request,
  res: Response,
  page: number,
  limit: number,
  total: number,
) {
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const pathname = req.originalUrl.split('?')[0];
  const base = `${req.protocol}://${req.get('host')}${pathname}`;
  const parts: string[] = [];
  if (page > 1) {
    parts.push(`<${base}?page=${page - 1}&limit=${limit}>; rel="prev"`);
  }
  if (page < totalPages) {
    parts.push(`<${base}?page=${page + 1}&limit=${limit}>; rel="next"`);
  }
  if (parts.length > 0) {
    res.setHeader('Link', parts.join(', '));
  }
}
