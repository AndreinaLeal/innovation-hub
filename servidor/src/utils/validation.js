import mongoose from "mongoose";
import { badRequest } from "./httpError.js";

/** Acumula errores por campo y lanza un 400 uniforme si hay alguno. */
export class Validator {
  constructor() { this.errors = []; }
  add(field, message) { this.errors.push({ field, message }); }
  done() {
    if (this.errors.length) throw badRequest("Los datos enviados no son válidos.", this.errors);
  }

  string(obj, field, { label = field, min = 1, max = 500, required = true } = {}) {
    const raw = obj?.[field];
    if (raw === undefined || raw === null || raw === "") {
      if (required) this.add(field, `${label} es obligatorio.`);
      return undefined;
    }
    if (typeof raw !== "string") { this.add(field, `${label} debe ser texto.`); return undefined; }
    const v = raw.trim();
    if (required && v.length < min) this.add(field, min > 1 ? `${label} debe tener al menos ${min} caracteres.` : `${label} es obligatorio.`);
    else if (v.length > max) this.add(field, `${label} no puede superar los ${max} caracteres.`);
    return v;
  }

  oneOf(obj, field, values, { label = field, required = true } = {}) {
    const v = obj?.[field];
    if (v === undefined || v === null || v === "") {
      if (required) this.add(field, `${label} es obligatorio.`);
      return undefined;
    }
    if (!values.includes(v)) this.add(field, `${label} debe ser uno de: ${values.join(", ")}.`);
    return v;
  }

  int(obj, field, { label = field, min, max, required = true } = {}) {
    const v = obj?.[field];
    if (v === undefined || v === null || v === "") {
      if (required) this.add(field, `${label} es obligatorio.`);
      return undefined;
    }
    const n = Number(v);
    if (!Number.isInteger(n) || n < min || n > max) this.add(field, `${label} debe ser un entero entre ${min} y ${max}.`);
    return n;
  }

  stringArray(obj, field, { label = field, minItems = 0, maxItems = 20, maxLen = 60 } = {}) {
    const raw = obj?.[field];
    if (raw === undefined || raw === null) {
      if (minItems > 0) this.add(field, `${label} debe incluir al menos ${minItems}.`);
      return [];
    }
    if (!Array.isArray(raw) || raw.some((x) => typeof x !== "string")) {
      this.add(field, `${label} debe ser una lista de textos.`);
      return [];
    }
    const clean = [...new Set(raw.map((x) => x.trim()).filter(Boolean))];
    if (clean.length < minItems) this.add(field, `${label} debe incluir al menos ${minItems}.`);
    if (clean.length > maxItems) this.add(field, `${label} admite como máximo ${maxItems}.`);
    if (clean.some((x) => x.length > maxLen)) this.add(field, `Cada elemento de ${label} admite hasta ${maxLen} caracteres.`);
    return clean;
  }
}

export const isObjectId = (v) => typeof v === "string" && /^[a-f0-9]{24}$/i.test(v);

/** Convierte page/size de la query en valores seguros. */
export function parsePaging(query, { defaultSize = 9, maxSize = 50 } = {}) {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const size = Math.min(maxSize, Math.max(1, parseInt(query.size, 10) || defaultSize));
  return { page, size, skip: (page - 1) * size };
}

export const escapeRegex = (s) => String(s).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export function pageResult(data, total, { page, size }) {
  return { data, page, size, total, totalPages: Math.max(1, Math.ceil(total / size)) };
}
