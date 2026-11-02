import { skillsApi } from "../../api/index.js";
import { useFetch } from "../../hooks/useFetch.js";
import ChipsInput from "./ChipsInput.jsx";

/** Competencias: un ChipsInput con sugerencias que vienen de GET /api/skills. */
export default function SkillsInput({ value, onChange, error, etiqueta = "Competencias", ayuda, max = 15 }) {
  const { data } = useFetch((signal) => skillsApi.list("", signal), []);
  return (
    <ChipsInput name="skills" etiqueta={etiqueta} value={value} onChange={onChange} error={error} ayuda={ayuda}
      max={max} maxLength={60} sugerencias={data?.data ?? []}
      placeholder="Ej: SQL, Bases de datos, Programación orientada a objetos" />
  );
}
