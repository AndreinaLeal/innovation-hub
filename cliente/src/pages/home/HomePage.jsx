import { Link } from "react-router-dom";

const PASOS = [
  { n: "01", clase: "", etiqueta: "Explora", titulo: "Descubre oportunidades", texto: "Consulta ideas, necesidades y retos publicados por otros miembros de la comunidad." },
  { n: "02", clase: "paso-icono-verde", etiqueta: "Conecta", titulo: "Aporta tus competencias", texto: "Identifica iniciativas que requieren competencias que puedes aportar y solicita participar." },
  { n: "03", clase: "paso-icono-morado", etiqueta: "Colabora", titulo: "Construye en equipo", texto: "Forma equipos con personas de distintas áreas y transforma las iniciativas en proyectos." },
];
const TIPOS = [
  { clase: "tipo-idea", icono: "✦", titulo: "Idea", texto: "Una propuesta que puede desarrollarse con apoyo de otras personas." },
  { clase: "tipo-necesidad", icono: "+", titulo: "Necesidad", texto: "Una situación que requiere colaboración para encontrar una solución." },
  { clase: "tipo-reto", icono: "↗", titulo: "Reto", texto: "Un desafío que puede abordarse mediante un equipo interdisciplinario." },
];

export default function HomePage() {
  return (
    <>
      <section className="hero-inicio" aria-labelledby="titulo-principal">
        <div className="container">
          <div className="row align-items-center g-5">
            <div className="col-lg-6">
              <p className="hero-etiqueta">Comunidad universitaria</p>
              <h1 id="titulo-principal" className="hero-titulo">Convierte ideas en oportunidades de <span>colaboración</span></h1>
              <p className="hero-descripcion">Innovation Hub conecta ideas, necesidades y retos con personas que pueden aportar sus conocimientos y competencias para desarrollarlos.</p>
              <div className="d-flex flex-wrap gap-3 mt-4">
                <Link to="/iniciativas" className="btn btn-primary btn-lg px-4">Explorar iniciativas <span aria-hidden="true">→</span></Link>
                <Link to="/iniciativas/nueva" className="btn btn-outline-primary btn-lg px-4">Publicar iniciativa</Link>
              </div>
              <ul className="hero-beneficios">
                <li><span className="beneficio-icono" aria-hidden="true">01</span><span><strong>Colabora</strong><small>con personas de distintas áreas</small></span></li>
                <li><span className="beneficio-icono" aria-hidden="true">02</span><span><strong>Impulsa</strong><small>ideas que generan impacto</small></span></li>
                <li><span className="beneficio-icono" aria-hidden="true">03</span><span><strong>Desarrolla</strong><small>tu experiencia y competencias</small></span></li>
              </ul>
            </div>
            <div className="col-lg-6">
              <div className="hero-visual">
                <div className="hero-circulo hero-circulo-uno"></div>
                <div className="hero-circulo hero-circulo-dos"></div>
                <div className="panel-colaboracion">
                  <p className="panel-etiqueta">Innovation Hub</p>
                  <h2>Encuentra dónde aportar</h2>
                  <p>Descubre iniciativas que necesitan exactamente las competencias que tú puedes ofrecer.</p>
                  <div className="panel-personas" aria-hidden="true"><span>T</span><span>A</span><span>M</span><span>+</span></div>
                  <Link to="/iniciativas" className="btn btn-light">Ver catálogo</Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="seccion-funcionamiento" aria-labelledby="titulo-funcionamiento">
        <div className="container">
          <header className="encabezado-seccion">
            <p className="etiqueta-seccion">Un proceso simple</p>
            <h2 id="titulo-funcionamiento">¿Cómo funciona Innovation Hub?</h2>
            <p>Participa en iniciativas y construye equipos interdisciplinarios dentro de la comunidad universitaria.</p>
          </header>
          <div className="row g-4">
            {PASOS.map((p) => (
              <article className="col-md-4" key={p.n}>
                <div className="paso-card h-100">
                  <div className="paso-superior"><span className={`paso-icono ${p.clase}`} aria-hidden="true">{p.n}</span><span className="paso-numero">{p.etiqueta}</span></div>
                  <h3>{p.titulo}</h3>
                  <p>{p.texto}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="seccion-tipos" aria-labelledby="titulo-tipos">
        <div className="container">
          <div className="row align-items-center g-5">
            <div className="col-lg-4">
              <p className="etiqueta-seccion">Tipos de iniciativa</p>
              <h2 id="titulo-tipos">Comparte lo que quieres impulsar</h2>
              <p>Las iniciativas pueden comenzar como una idea, una necesidad o un reto.</p>
              <Link to="/iniciativas/nueva" className="enlace-flecha">Crear una iniciativa <span aria-hidden="true">→</span></Link>
            </div>
            <div className="col-lg-8">
              <div className="row g-3">
                {TIPOS.map((t) => (
                  <article className="col-md-4" key={t.titulo}>
                    <div className={`tipo-card ${t.clase} h-100`}>
                      <span className="tipo-icono" aria-hidden="true">{t.icono}</span>
                      <h3>{t.titulo}</h3>
                      <p>{t.texto}</p>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
