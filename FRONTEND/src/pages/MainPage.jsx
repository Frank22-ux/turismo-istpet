import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaMapMarkedAlt,
  FaCheckCircle,
  FaCalendarAlt,
  FaUsers,
  FaChartLine,
  FaGlobe,
  FaStar,
  FaArrowRight,
} from 'react-icons/fa';
import './MainPage.css';

const MainPage = () => {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const slides = [
    'https://images.unsplash.com/photo-1526392060635-9d6019884377?w=1600&auto=format',
    'https://images.unsplash.com/photo-1519669556878-63bdad8a1a49?w=1600&auto=format',
    'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=1600&auto=format',
  ];

  // Auto-rotate slides
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  // Scroll navbar effect
  useEffect(() => {
    const handleScroll = () => {
      const navbar = document.getElementById('navbar');
      if (navbar) {
        navbar.classList.toggle('scrolled', window.scrollY > 60);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setMobileMenuOpen(false);
  };

  return (
    <div className="mainpage-container">
      {/* NAVBAR */}
      <nav id="navbar" className="navbar-main">
        <div className="nav-wrapper">
          <a href="/" className="nav-logo">
            <div className="nav-logo-mark">
              <FaMapMarkedAlt size={20} color="white" />
            </div>
            <span className="nav-logo-text">
              ECURUT<span>Travel</span>
            </span>
          </a>

          <div className="nav-links">
            <button onClick={() => scrollToSection('about')}>Nosotros</button>
            <button onClick={() => scrollToSection('destinations')}>
              Destinos
            </button>
            <button onClick={() => scrollToSection('how')}>Cómo funciona</button>
            <button onClick={() => scrollToSection('experiences')}>
              Experiencias
            </button>
            <button onClick={() => scrollToSection('testimonials')}>
              Reseñas
            </button>
            <button
              onClick={() => navigate('/login')}
              className="btn-nav"
            >
              Iniciar Sesión
            </button>
          </div>

          <button
            className="hamburger"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Abrir menú"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </nav>

      {/* MOBILE DRAWER */}
      {mobileMenuOpen && (
        <div className="mobile-drawer">
          <button className="drawer-close" onClick={() => setMobileMenuOpen(false)}>✕</button>
          <button onClick={() => scrollToSection('about')}>Nosotros</button>
          <button onClick={() => scrollToSection('destinations')}>
            Destinos
          </button>
          <button onClick={() => scrollToSection('how')}>Cómo funciona</button>
          <button onClick={() => scrollToSection('experiences')}>
            Experiencias
          </button>
          <button onClick={() => scrollToSection('testimonials')}>Reseñas</button>
          <button onClick={() => navigate('/login')} className="btn-nav">
            Iniciar Sesión
          </button>
        </div>
      )}

      {/* HERO SECTION */}
      <section id="hero" className="hero">
        <div className="hero-slides">
          {slides.map((slide, index) => (
            <div
              key={index}
              className={`hero-slide ${index === currentSlide ? 'active' : ''}`}
              style={{ backgroundImage: `url(${slide})` }}
            >
              <div className="hero-slide-overlay"></div>
            </div>
          ))}
        </div>

        <div className="hero-content">
          <div className="hero-badge">
            <span>🌎 Sistema de Gestión Turística</span>
          </div>
          <h1 className="hero-title">
            Descubre el mundo,<br />
            <em>vive la aventura</em>
          </h1>
          <p className="hero-desc">
            ECURUT Travel es la plataforma integral para gestionar, descubrir y
            reservar experiencias turísticas únicas. Conectamos viajeros,
            operadores y destinos en un solo lugar inteligente.
          </p>
          <div className="hero-btns">
            <button
              onClick={() => scrollToSection('destinations')}
              className="btn-white"
            >
              Explorar destinos
              <FaArrowRight size={12} />
            </button>
            <button
              onClick={() => navigate('/register')}
              className="btn-outline-white"
            >
              Unirme ahora
              <FaArrowRight size={12} />
            </button>
          </div>
        </div>

        <div className="hero-dots">
          {slides.map((_, index) => (
            <button
              key={index}
              className={`dot ${index === currentSlide ? 'active' : ''}`}
              onClick={() => setCurrentSlide(index)}
              aria-label={`Slide ${index + 1}`}
            ></button>
          ))}
        </div>
      </section>

      {/* STATS BAR */}
      <div className="stats-bar">
        <div className="stat-item">
          <div className="stat-num">+2,400</div>
          <div className="stat-label">Tours disponibles</div>
        </div>
        <div className="stat-item">
          <div className="stat-num">98%</div>
          <div className="stat-label">Satisfacción</div>
        </div>
        <div className="stat-item">
          <div className="stat-num">+80</div>
          <div className="stat-label">Destinos activos</div>
        </div>
        <div className="stat-item">
          <div className="stat-num">+50k</div>
          <div className="stat-label">Viajeros registrados</div>
        </div>
      </div>

      {/* ABOUT SECTION */}
      <section id="about" className="about">
        <div className="about-content">
          <span className="section-tag">¿Qué es ECURUT Travel?</span>
          <h2 className="section-title">
            Tu plataforma de turismo <em>inteligente</em>
          </h2>
          <p className="section-sub">
            Gestionamos todo el ciclo del turismo: desde la planificación de
            rutas hasta la reserva de tours, conectando viajeros, operadores y
            destinos en un único ecosistema.
          </p>

          <div className="features-grid">
            <div className="feature-item">
              <div className="feature-icon">
                <FaMapMarkedAlt size={22} />
              </div>
              <div className="feature-text">
                <h4>Gestión de Tours</h4>
                <p>
                  Crea, administra y publica tours con itinerarios detallados,
                  capacidades y precios personalizados.
                </p>
              </div>
            </div>

            <div className="feature-item">
              <div className="feature-icon">
                <FaCalendarAlt size={22} />
              </div>
              <div className="feature-text">
                <h4>Reservas en tiempo real</h4>
                <p>
                  Confirmación inmediata, pagos seguros y gestión de
                  disponibilidad en un solo clic.
                </p>
              </div>
            </div>

            <div className="feature-item">
              <div className="feature-icon">
                <FaChartLine size={22} />
              </div>
              <div className="feature-text">
                <h4>Dashboard analítico</h4>
                <p>
                  Métricas de ocupación, ingresos, satisfacción de clientes y
                  rendimiento de tours en tiempo real.
                </p>
              </div>
            </div>

            <div className="feature-item">
              <div className="feature-icon">
                <FaGlobe size={22} />
              </div>
              <div className="feature-text">
                <h4>Multidestino y multioperador</h4>
                <p>
                  Plataforma escalable con soporte para múltiples operadores,
                  idiomas y monedas de forma simultánea.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* DESTINATIONS SECTION */}
      <section id="destinations" className="destinations">
        <div className="dest-header">
          <div>
            <span className="section-tag">Destinos destacados</span>
            <h2 className="section-title">
              Los lugares que <em>enamoran</em>
            </h2>
          </div>
          <button onClick={() => navigate('/login')} className="btn-secondary">
            Ver todos →
          </button>
        </div>

        <div className="dest-grid">
          <div className="dest-card dest-featured">
            <img
              src="https://images.unsplash.com/photo-1540202404-1b927e27fa8b?w=800&auto=format"
              alt="Selva amazónica"
            />
            <div className="dest-info">
              <span className="dest-cat">Naturaleza</span>
              <div className="dest-name">Selva Amazónica</div>
              <div className="dest-loc">📍 Oriente, Ecuador</div>
              <button onClick={() => navigate('/login')} className="dest-link">
                Ver tours <FaArrowRight size={12} />
              </button>
            </div>
          </div>

          <div className="dest-card">
            <img
              src="https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=700&auto=format"
              alt="Andes"
            />
            <div className="dest-info">
              <span className="dest-cat">Aventura</span>
              <div className="dest-name">Andes Nevados</div>
              <div className="dest-loc">📍 Sierra, Ecuador</div>
              <button onClick={() => navigate('/login')} className="dest-link">
                Ver tours <FaArrowRight size={12} />
              </button>
            </div>
          </div>

          <div className="dest-card">
            <img
              src="https://images.unsplash.com/photo-1484910292437-025e5d13ce87?w=700&auto=format"
              alt="Galápagos"
            />
            <div className="dest-info">
              <span className="dest-cat">Ecoturismo</span>
              <div className="dest-name">Islas Galápagos</div>
              <div className="dest-loc">📍 Pacífico, Ecuador</div>
              <button onClick={() => navigate('/login')} className="dest-link">
                Ver tours <FaArrowRight size={12} />
              </button>
            </div>
          </div>

          <div className="dest-card">
            <img
              src="https://images.unsplash.com/photo-1520208422220-d12a3c588574?w=700&auto=format"
              alt="Costa"
            />
            <div className="dest-info">
              <span className="dest-cat">Playa</span>
              <div className="dest-name">Costa del Pacífico</div>
              <div className="dest-loc">📍 Costa, Ecuador</div>
              <button onClick={() => navigate('/login')} className="dest-link">
                Ver tours <FaArrowRight size={12} />
              </button>
            </div>
          </div>

          <div className="dest-card">
            <img
              src="https://images.unsplash.com/photo-1531065208531-4036c0dba3ca?w=700&auto=format"
              alt="Quito"
            />
            <div className="dest-info">
              <span className="dest-cat">Cultura</span>
              <div className="dest-name">Quito Colonial</div>
              <div className="dest-loc">📍 Quito, Ecuador</div>
              <button onClick={() => navigate('/login')} className="dest-link">
                Ver tours <FaArrowRight size={12} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS SECTION */}
      <section id="how" className="how-section">
        <div className="how-header">
          <span className="section-tag">Proceso simple</span>
          <h2 className="section-title light">
            ¿Cómo funciona <em>ECURUT Travel</em>?
          </h2>
          <p className="section-sub light">
            En cuatro pasos sencillos, viajeros y operadores se conectan para
            crear experiencias inolvidables.
          </p>
        </div>

        <div className="steps-grid">
          <div className="step-card">
            <div className="step-num">01</div>
            <h3 className="step-title">Crea tu cuenta</h3>
            <p className="step-desc">
              Regístrate como viajero u operador en minutos. Personaliza tu
              perfil con preferencias de viaje.
            </p>
          </div>

          <div className="step-card">
            <div className="step-num">02</div>
            <h3 className="step-title">Explora destinos</h3>
            <p className="step-desc">
              Descubre tours filtrados por tipo, duración, precio e intereses
              con búsqueda inteligente.
            </p>
          </div>

          <div className="step-card">
            <div className="step-num">03</div>
            <h3 className="step-title">Reserva fácilmente</h3>
            <p className="step-desc">
              Selecciona fechas, número de personas y confirma al instante con
              pago seguro integrado.
            </p>
          </div>

          <div className="step-card">
            <div className="step-num">04</div>
            <h3 className="step-title">¡Vive la aventura!</h3>
            <p className="step-desc">
              Disfruta tu experiencia y comparte tu reseña para inspirar a otros
              viajeros en la comunidad.
            </p>
          </div>
        </div>
      </section>

      {/* EXPERIENCES SECTION */}
      <section id="experiences" className="experiences">
        <div className="exp-header">
          <span className="section-tag">Categorías</span>
          <h2 className="section-title">
            Un tour para cada <em>espíritu</em>
          </h2>
          <p className="section-sub">
            Desde aventuras extremas hasta retiros culturales, tenemos la
            experiencia perfecta para tu estilo de viaje.
          </p>
        </div>

        <div className="exp-grid">
          {[
            {
              title: 'Trekking & Montañismo',
              type: 'Aventura extrema',
              count: '142 tours disponibles',
              image:
                'https://images.unsplash.com/photo-1551632811-561732d1e306?w=600&auto=format',
            },
            {
              title: 'Naturaleza & Fauna',
              type: 'Ecoturismo',
              count: '289 tours disponibles',
              image:
                'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=600&auto=format',
            },
            {
              title: 'Historia & Patrimonio',
              type: 'Cultural',
              count: '98 tours disponibles',
              image:
                'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600&auto=format',
            },
            {
              title: 'Sabores del Mundo',
              type: 'Gastronomía',
              count: '67 tours disponibles',
              image:
                'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&auto=format',
            },
          ].map((exp, index) => (
            <div key={index} className="exp-card">
              <img src={exp.image} alt={exp.title} />
              <div className="exp-overlay"></div>
              <div className="exp-info">
                <div className="exp-type">{exp.type}</div>
                <div className="exp-name">{exp.title}</div>
                <div className="exp-count">{exp.count}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* TESTIMONIALS SECTION */}
      <section id="testimonials" className="testimonials">
        <div className="test-header">
          <span className="section-tag">Lo que dicen nuestros viajeros</span>
          <h2 className="section-title">
            Historias que <em>inspiran</em>
          </h2>
          <p className="section-sub">
            Miles de aventureros ya confían en ECURUT Travel para vivir sus mejores
            experiencias.
          </p>
        </div>

        <div className="test-grid">
          {[
            {
              name: 'María González',
              origin: 'Bogotá, Colombia',
              text: '"La plataforma es increíblemente fácil de usar. Encontré el tour perfecto para mi familia en minutos."',
              avatar: 'MG',
            },
            {
              name: 'Carlos Mendoza',
              origin: 'Operador, Quito',
              text: '"Como operador turístico, ECURUT Travel transformó mi negocio. Mis ingresos aumentaron un 40% en el primer mes."',
              avatar: 'CM',
            },
            {
              name: 'Andrea Rojas',
              origin: 'Lima, Perú',
              text: '"Viajé a las Galápagos con un tour reservado aquí. La experiencia superó todas mis expectativas."',
              avatar: 'AR',
            },
          ].map((test, index) => (
            <div key={index} className="test-card">
              <div className="test-stars">
                {[...Array(5)].map((_, i) => (
                  <FaStar key={i} size={16} color="#1F7A8C" />
                ))}
              </div>
              <p className="test-text">{test.text}</p>
              <div className="test-author">
                <div className="test-avatar">{test.avatar}</div>
                <div>
                  <div className="test-name">{test.name}</div>
                  <div className="test-origin">{test.origin}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA SECTION */}
      <section id="cta" className="cta-section">
        <div className="cta-content">
          <span className="section-tag">¿Listo para comenzar?</span>
          <h2 className="cta-title">
            Tu próxima <em>aventura</em>
            <br />
            comienza aquí
          </h2>
          <p className="cta-desc">
            Únete a más de 50,000 viajeros que ya confían en ECURUT Travel para
            vivir experiencias únicas e inolvidables alrededor del mundo.
          </p>
          <div className="cta-btns">
            <button
              onClick={() => navigate('/register')}
              className="btn-white-large"
            >
              Crear cuenta gratis
              <FaArrowRight size={14} />
            </button>
            <button onClick={() => navigate('/login')} className="btn-outline-white-large">
              Ya tengo cuenta
            </button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="footer">
        <div className="footer-top">
          <div>
            <a href="/" className="footer-logo">
              <div className="footer-logo-mark">
                <FaMapMarkedAlt size={20} color="white" />
              </div>
              <span className="footer-logo-text">
                ECURUT<span>Travel</span>
              </span>
            </a>
            <p className="footer-desc">
              La plataforma integral de gestión turística que conecta viajeros
              y operadores para crear experiencias únicas en todo el mundo.
            </p>
          </div>

          <div className="footer-col">
            <h5>Plataforma</h5>
            <ul>
              <li>
                <button onClick={() => scrollToSection('about')}>
                  Cómo funciona
                </button>
              </li>
              <li>
                <button onClick={() => scrollToSection('destinations')}>
                  Destinos
                </button>
              </li>
              <li>
                <button onClick={() => scrollToSection('experiences')}>
                  Experiencias
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/login')}>
                  Para operadores
                </button>
              </li>
            </ul>
          </div>

          <div className="footer-col">
            <h5>Empresa</h5>
            <ul>
              <li><a href="#">Acerca de nosotros</a></li>
              <li><a href="#">Blog de viajes</a></li>
              <li><a href="#">Trabaja con nosotros</a></li>
              <li><a href="#">Prensa</a></li>
            </ul>
          </div>

          <div className="footer-col">
            <h5>Soporte</h5>
            <ul>
              <li><a href="#">Centro de ayuda</a></li>
              <li><a href="#">Términos de uso</a></li>
              <li><a href="#">Privacidad</a></li>
              <li><a href="#">Contacto</a></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p className="footer-copy">
            © 2025 ECURUT Travel — Sistema de Gestión Turística. Todos los derechos
            reservados.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default MainPage;
