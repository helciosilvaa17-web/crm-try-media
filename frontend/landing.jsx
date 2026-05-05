import { useState, useEffect } from "react";

const C = {
  bg: "#050C07",
  bgCard: "#0B1A0E",
  bgDeep: "#071009",
  bgItem: "#0F2012",
  greenDark: "#2E7D32",
  greenMid: "#4CAF50",
  greenLight: "#81C784",
  text: "#DDE8DF",
  textBright: "#EDF2EE",
  textMuted: "rgba(221,232,223,0.5)",
  textFaint: "rgba(221,232,223,0.28)",
  border: "rgba(76,175,80,0.12)",
  borderAccent: "rgba(76,175,80,0.35)",
};

const globalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=DM+Sans:wght@300;400;500&display=swap');

  * { margin: 0; padding: 0; box-sizing: border-box; }

  body {
    background: ${C.bg};
    color: ${C.text};
    font-family: 'DM Sans', sans-serif;
  }

  html { scroll-behavior: smooth; }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.3; }
  }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(24px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  @keyframes barGrow {
    from { transform: scaleY(0); }
    to   { transform: scaleY(1); }
  }

  .tm-fade-up { animation: fadeUp 0.7s ease both; }
  .tm-fade-up-1 { animation: fadeUp 0.7s 0.1s ease both; }
  .tm-fade-up-2 { animation: fadeUp 0.7s 0.2s ease both; }
  .tm-fade-up-3 { animation: fadeUp 0.7s 0.3s ease both; }

  .tm-feature-card:hover {
    border-color: ${C.borderAccent} !important;
    transform: translateY(-3px);
  }

  .tm-nav-link:hover { color: ${C.greenMid} !important; }

  .tm-btn-primary:hover { opacity: 0.85; transform: translateY(-1px); }
  .tm-btn-secondary:hover { border-color: ${C.borderAccent} !important; color: ${C.greenMid} !important; }

  .tm-deal-card:hover { border-color: rgba(76,175,80,0.25) !important; }

  .tm-footer-link:hover { color: ${C.greenMid} !important; }

  .tm-badge-dot {
    width: 6px; height: 6px;
    background: ${C.greenMid};
    border-radius: 50%;
    animation: pulse 2s infinite;
    display: inline-block;
    margin-right: 6px;
  }

  .tm-bar {
    transform-origin: bottom;
    animation: barGrow 0.8s ease both;
  }

  input::placeholder { color: rgba(221,232,223,0.25) !important; }
  input:focus { outline: none; border-color: rgba(76,175,80,0.5) !important; }
`;

function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navStyle = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "1.2rem 2.5rem",
    borderBottom: `0.5px solid rgba(80,160,90,${scrolled ? "0.2" : "0.1"})`,
    background: scrolled ? "rgba(5,12,7,0.98)" : "rgba(5,12,7,0.92)",
    position: "sticky",
    top: 0,
    zIndex: 100,
    backdropFilter: "blur(8px)",
    transition: "all 0.3s ease",
  };

  const links = ["Funcionalidades", "Pipeline", "Relatórios", "Integrações"];

  return (
    <nav style={navStyle}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div
          style={{
            width: 36, height: 36,
            background: `linear-gradient(135deg, ${C.greenDark}, ${C.greenMid})`,
            borderRadius: 8,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontWeight: 700, fontSize: 14, color: C.bg, letterSpacing: 0.5,
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          TM
        </div>
        <div>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 17, fontWeight: 700, color: C.textBright, letterSpacing: 1 }}>
            TENTE MEDEA
          </div>
          <div style={{ fontSize: 10, color: C.greenMid, letterSpacing: 3, textTransform: "uppercase", marginTop: -2 }}>
            Gestão Inteligente
          </div>
        </div>
      </div>

      <ul style={{ display: "flex", gap: "2rem", listStyle: "none", alignItems: "center" }}>
        {links.map((l) => (
          <li key={l}>
            <a
              href="#"
              className="tm-nav-link"
              style={{ color: "rgba(221,232,223,0.65)", textDecoration: "none", fontSize: 13, letterSpacing: 0.5, transition: "color 0.2s" }}
            >
              {l}
            </a>
          </li>
        ))}
        <li>
          <a
            href="#demo"
            style={{
              background: C.greenDark, color: C.textBright,
              padding: "8px 20px", borderRadius: 6,
              fontWeight: 500, fontSize: 13, letterSpacing: 0.5,
              textDecoration: "none", transition: "opacity 0.2s",
            }}
          >
            Solicitar Demo
          </a>
        </li>
      </ul>
    </nav>
  );
}

function DashboardMockup() {
  const bars = [35, 50, 45, 65, 55, 80, 95];
  const deals = [
    { name: "Sonangol EP", status: "Fechado", statusColor: C.greenMid, statusBg: "rgba(46,125,50,0.18)" },
    { name: "Banco BAI", status: "Em negociação", statusColor: C.greenLight, statusBg: "rgba(76,175,80,0.1)" },
    { name: "ENDE Distribuidora", status: "Em revisão", statusColor: "#A5D6A7", statusBg: "rgba(20,60,25,0.35)" },
  ];

  return (
    <div
      style={{
        background: "#0B1A0E",
        borderRadius: 14,
        border: "0.5px solid rgba(76,175,80,0.18)",
        overflow: "hidden",
      }}
    >
      <div style={{ background: "#071009", padding: "10px 16px", display: "flex", gap: 6, borderBottom: "0.5px solid rgba(76,175,80,0.08)" }}>
        {["#FF5F57", "#FEBC2E", "#28C840"].map((c) => (
          <div key={c} style={{ width: 8, height: 8, borderRadius: "50%", background: c }} />
        ))}
      </div>

      <div style={{ padding: 16 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8, marginBottom: 12 }}>
          {[
            { label: "Clientes activos", val: "1.284", up: "+12% este mês" },
            { label: "Receita (Kz)", val: "48M", up: "+8.3%" },
            { label: "Taxa de fecho", val: "67%", up: "+4pp" },
          ].map((m) => (
            <div key={m.label} style={{ background: C.bgItem, borderRadius: 8, padding: "10px 12px", border: "0.5px solid rgba(76,175,80,0.1)" }}>
              <div style={{ fontSize: 10, color: "rgba(221,232,223,0.4)", letterSpacing: 0.5, marginBottom: 4 }}>{m.label}</div>
              <div style={{ fontSize: 18, fontWeight: 500, color: C.textBright }}>{m.val}</div>
              <div style={{ fontSize: 10, color: C.greenMid }}>{m.up}</div>
            </div>
          ))}
        </div>

        <div style={{ background: C.bgItem, borderRadius: 8, padding: 12, marginBottom: 10, border: "0.5px solid rgba(76,175,80,0.1)" }}>
          <div style={{ fontSize: 10, color: "rgba(221,232,223,0.4)", marginBottom: 10 }}>Oportunidades por mês</div>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 5, height: 60 }}>
            {bars.map((h, i) => (
              <div
                key={i}
                className="tm-bar"
                style={{
                  flex: 1,
                  height: `${h}%`,
                  borderRadius: "3px 3px 0 0",
                  background: i === bars.length - 1 ? C.greenDark : "rgba(46,125,50,0.25)",
                  animationDelay: `${i * 0.08}s`,
                }}
              />
            ))}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {deals.map((d) => (
            <div
              key={d.name}
              style={{
                background: C.bgItem, borderRadius: 6, padding: "8px 12px",
                display: "flex", justifyContent: "space-between", alignItems: "center",
                border: "0.5px solid rgba(76,175,80,0.08)",
              }}
            >
              <span style={{ fontSize: 11, color: "rgba(221,232,223,0.8)" }}>{d.name}</span>
              <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 100, background: d.statusBg, color: d.statusColor }}>
                {d.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Hero() {
  return (
    <section
      style={{
        padding: "5rem 2.5rem 4rem",
        maxWidth: 1100,
        margin: "0 auto",
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "4rem",
        alignItems: "center",
      }}
    >
      <div className="tm-fade-up">
        <div
          style={{
            display: "inline-flex", alignItems: "center",
            background: "rgba(76,175,80,0.08)",
            border: "0.5px solid rgba(76,175,80,0.35)",
            color: C.greenMid, fontSize: 11, letterSpacing: 2,
            textTransform: "uppercase", padding: "5px 14px", borderRadius: 100,
            marginBottom: "1.5rem",
          }}
        >
          <span className="tm-badge-dot" />
          Plataforma CRM · Angola
        </div>

        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "3.2rem", fontWeight: 700, lineHeight: 1.15, color: C.textBright, marginBottom: "1.2rem" }}>
          Transforme cada<br />relação em{" "}
          <em style={{ color: C.greenMid, fontStyle: "italic" }}>resultado</em>
        </h1>

        <p style={{ fontSize: 15, lineHeight: 1.8, color: C.textMuted, marginBottom: "2rem", fontWeight: 300 }}>
          O sistema de CRM desenvolvido para a realidade angolana. Gira clientes, oportunidades de negócio e equipas comerciais numa única plataforma poderosa e intuitiva.
        </p>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: "1.5rem" }}>
          {["Pipeline de vendas", "Relatórios em tempo real", "Gestão de leads"].map((t) => (
            <span
              key={t}
              style={{
                fontSize: 11, background: "rgba(46,125,50,0.1)",
                border: "0.5px solid rgba(76,175,80,0.18)",
                color: "rgba(221,232,223,0.5)", padding: "4px 12px", borderRadius: 100,
              }}
            >
              {t}
            </span>
          ))}
        </div>

        <div style={{ display: "flex", gap: 12 }}>
          <button
            className="tm-btn-primary"
            style={{
              background: C.greenDark, color: C.textBright, border: "none",
              padding: "13px 28px", borderRadius: 8, fontSize: 14, fontWeight: 500,
              cursor: "pointer", letterSpacing: 0.3, transition: "opacity 0.2s, transform 0.15s",
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            Experimentar gratuitamente →
          </button>
          <button
            className="tm-btn-secondary"
            style={{
              background: "transparent", color: "rgba(221,232,223,0.75)",
              border: "0.5px solid rgba(221,232,223,0.2)",
              padding: "13px 28px", borderRadius: 8, fontSize: 14,
              cursor: "pointer", transition: "border-color 0.2s, color 0.2s",
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            Ver demonstração
          </button>
        </div>
      </div>

      <div className="tm-fade-up-2">
        <DashboardMockup />
      </div>
    </section>
  );
}

function StatsBar() {
  const stats = [
    { num: "+320", desc: "Empresas angolanas confiam" },
    { num: "98%", desc: "Satisfação dos clientes" },
    { num: "3x", desc: "Aumento médio de vendas" },
    { num: "24/7", desc: "Suporte técnico local" },
  ];

  return (
    <div
      style={{
        background: "rgba(46,125,50,0.05)",
        borderTop: "0.5px solid rgba(46,125,50,0.2)",
        borderBottom: "0.5px solid rgba(46,125,50,0.2)",
        padding: "2rem 2.5rem",
        display: "flex", justifyContent: "center",
        gap: "4rem", flexWrap: "wrap",
      }}
    >
      {stats.map((s) => (
        <div key={s.num} style={{ textAlign: "center" }}>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "2.2rem", fontWeight: 700, color: C.greenMid }}>
            {s.num}
          </div>
          <div style={{ fontSize: 12, color: "rgba(221,232,223,0.45)", letterSpacing: 0.5, marginTop: 2 }}>
            {s.desc}
          </div>
        </div>
      ))}
    </div>
  );
}

function Features() {
  const features = [
    { icon: "📊", title: "Dashboard analítico", desc: "Visão 360° do seu negócio com métricas em tempo real, gráficos interactivos e relatórios automáticos." },
    { icon: "🤝", title: "Gestão de clientes", desc: "Histórico completo de cada cliente desde o primeiro contacto, com notas, documentos e interacções." },
    { icon: "🎯", title: "Pipeline de vendas", desc: "Visualize e gira oportunidades em cada etapa do funil, com previsão automática de receita." },
    { icon: "📱", title: "Acesso móvel", desc: "A sua equipa comercial conectada em qualquer lugar. Disponível para iOS e Android, mesmo offline." },
    { icon: "✉️", title: "Marketing integrado", desc: "Campanhas de e-mail e SMS directamente integradas, com segmentação avançada e análise de resultados." },
    { icon: "🔗", title: "Integrações locais", desc: "Compatível com sistemas de facturação angolanos, Multicaixa Express e principais plataformas bancárias." },
  ];

  return (
    <section style={{ maxWidth: 1100, margin: "0 auto", padding: "5rem 2.5rem" }}>
      <div style={{ fontSize: 11, letterSpacing: 3, textTransform: "uppercase", color: C.greenMid, marginBottom: "0.75rem" }}>
        Funcionalidades
      </div>
      <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "2.2rem", fontWeight: 700, color: C.textBright, maxWidth: 500, lineHeight: 1.25, marginBottom: "0.75rem" }}>
        Tudo o que a sua equipa precisa
      </h2>
      <p style={{ fontSize: 14, color: C.textMuted, maxWidth: 460, lineHeight: 1.75, marginBottom: "3rem", fontWeight: 300 }}>
        Desenvolvido especificamente para o mercado angolano, com suporte a múltiplas moedas, idiomas e integrações locais.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }}>
        {features.map((f) => (
          <div
            key={f.title}
            className="tm-feature-card"
            style={{
              background: C.bgCard, border: `0.5px solid ${C.border}`,
              borderRadius: 12, padding: "1.5rem",
              transition: "border-color 0.25s, transform 0.2s", cursor: "default",
            }}
          >
            <div style={{ width: 40, height: 40, background: "rgba(46,125,50,0.15)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1rem", fontSize: 18 }}>
              {f.icon}
            </div>
            <div style={{ fontSize: 14, fontWeight: 500, color: C.textBright, marginBottom: "0.5rem" }}>{f.title}</div>
            <div style={{ fontSize: 12.5, color: C.textMuted, lineHeight: 1.7, fontWeight: 300 }}>{f.desc}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

function Pipeline() {
  const stages = [
    {
      name: "Lead", count: 8,
      deals: [{ name: "Grupo Carrinho", val: "Kz 2.4M" }, { name: "MinPet Angola", val: "Kz 1.1M" }, { name: "Castel Angola", val: "Kz 890K" }],
    },
    {
      name: "Qualificado", count: 5,
      deals: [{ name: "TAAG Airlines", val: "Kz 5.2M" }, { name: "BPC Angola", val: "Kz 3.7M" }],
    },
    {
      name: "Proposta", count: 4,
      deals: [{ name: "Unitel S.A.", val: "Kz 9.8M" }, { name: "ENSA Seguros", val: "Kz 4.1M" }],
    },
    {
      name: "Negociação", count: 3,
      deals: [{ name: "Sonangol EP", val: "Kz 18M" }, { name: "Banco BAI", val: "Kz 7.3M" }],
    },
    {
      name: "Fechado", count: 12,
      deals: [{ name: "ENDE EP", val: "Kz 22M" }, { name: "ANGOSAT", val: "Kz 11.5M" }],
    },
  ];

  return (
    <section style={{ background: C.bgDeep, padding: "5rem 2.5rem" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ fontSize: 11, letterSpacing: 3, textTransform: "uppercase", color: C.greenMid, marginBottom: "0.75rem" }}>Pipeline</div>
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "2.2rem", fontWeight: 700, color: C.textBright, maxWidth: 500, lineHeight: 1.25, marginBottom: "0.75rem" }}>
          O seu funil de vendas, sempre visível
        </h2>
        <p style={{ fontSize: 14, color: C.textMuted, maxWidth: 460, lineHeight: 1.75, marginBottom: "2.5rem", fontWeight: 300 }}>
          Arraste, solte e feche negócios mais rápido com o quadro Kanban intuitivo da TENTE MEDEA CRM.
        </p>

        <div style={{ display: "flex", gap: 12, overflowX: "auto", paddingBottom: 8 }}>
          {stages.map((s) => (
            <div
              key={s.name}
              style={{
                flex: "1 0 140px",
                background: C.bgCard, borderRadius: 10,
                border: `0.5px solid ${C.border}`, padding: "1rem",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <span style={{ fontSize: 11, fontWeight: 500, color: "rgba(221,232,223,0.55)", letterSpacing: 0.5, textTransform: "uppercase" }}>
                  {s.name}
                </span>
                <span style={{ fontSize: 10, background: "rgba(46,125,50,0.15)", color: C.greenMid, padding: "2px 7px", borderRadius: 100 }}>
                  {s.count}
                </span>
              </div>
              {s.deals.map((d) => (
                <div
                  key={d.name}
                  className="tm-deal-card"
                  style={{
                    background: C.bgItem, borderRadius: 7, padding: "8px 10px",
                    marginBottom: 7, border: "0.5px solid rgba(76,175,80,0.08)",
                    transition: "border-color 0.2s",
                  }}
                >
                  <div style={{ fontSize: 11, color: "rgba(221,232,223,0.8)", marginBottom: 3 }}>{d.name}</div>
                  <div style={{ fontSize: 10, color: C.greenMid }}>{d.val}</div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Testimonials() {
  const quotes = [
    {
      text: "A TENTE MEDEA transformou completamente a forma como gerimos os nossos clientes. Em apenas 3 meses, as nossas vendas cresceram 40% e a equipa trabalha com muito mais organização.",
      name: "Manuel Kambala",
      title: "Director Comercial · Grupo Industrial Luanda",
      initials: "MK",
    },
    {
      text: "Finalmente um CRM pensado para a realidade angolana. A integração com o Multicaixa e o suporte em Português de Angola fazem toda a diferença no dia-a-dia.",
      name: "Ana Sebastião",
      title: "CEO · Distribuidora Premier Angola",
      initials: "AS",
    },
  ];

  return (
    <section style={{ maxWidth: 1100, margin: "0 auto", padding: "5rem 2.5rem", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "3rem", alignItems: "center" }}>
      <div>
        <div style={{ fontSize: 11, letterSpacing: 3, textTransform: "uppercase", color: C.greenMid, marginBottom: "0.75rem" }}>Testemunhos</div>
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "2.2rem", fontWeight: 700, color: C.textBright, maxWidth: 400, lineHeight: 1.25, marginBottom: "0.75rem" }}>
          O que dizem os nossos clientes
        </h2>
        <p style={{ fontSize: 14, color: C.textMuted, maxWidth: 380, lineHeight: 1.75, marginBottom: "1.5rem", fontWeight: 300 }}>
          Empresas líderes em Angola já transformaram a sua gestão comercial com o CRM TENTE MEDEA.
        </p>
        <button
          className="tm-btn-primary"
          style={{
            background: C.greenDark, color: C.textBright, border: "none",
            padding: "13px 28px", borderRadius: 8, fontSize: 14, fontWeight: 500,
            cursor: "pointer", transition: "opacity 0.2s, transform 0.15s",
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          Ver mais casos de sucesso →
        </button>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {quotes.map((q) => (
          <div
            key={q.name}
            style={{
              background: C.bgCard, border: `0.5px solid ${C.border}`,
              borderRadius: 16, padding: "1.75rem",
            }}
          >
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "3.5rem", color: C.greenDark, lineHeight: 1, marginBottom: "0.5rem", opacity: 0.7 }}>
              "
            </div>
            <div style={{ fontSize: 14, color: "rgba(221,232,223,0.78)", lineHeight: 1.75, fontStyle: "italic", marginBottom: "1.25rem", fontFamily: "'Playfair Display', serif" }}>
              {q.text}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div
                style={{
                  width: 38, height: 38, borderRadius: "50%",
                  background: `linear-gradient(135deg, ${C.greenDark}, #1B5E20)`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 13, fontWeight: 500, color: C.text,
                }}
              >
                {q.initials}
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 500, color: C.textBright }}>{q.name}</div>
                <div style={{ fontSize: 11, color: "rgba(221,232,223,0.4)" }}>{q.title}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function CTASection() {
  const [email, setEmail] = useState("");

  return (
    <section
      id="demo"
      style={{
        background: "rgba(46,125,50,0.04)",
        borderTop: "0.5px solid rgba(46,125,50,0.2)",
        padding: "5rem 2.5rem",
        textAlign: "center",
      }}
    >
      <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "2.5rem", fontWeight: 700, color: C.textBright, maxWidth: 600, margin: "0 auto 1rem" }}>
        Pronto para crescer com inteligência?
      </h2>
      <p style={{ fontSize: 14, color: C.textMuted, maxWidth: 440, margin: "0 auto 2rem", lineHeight: 1.75 }}>
        Junte-se a mais de 320 empresas angolanas que já escolheram a TENTE MEDEA como parceira de crescimento.
      </p>

      <div style={{ display: "flex", maxWidth: 440, margin: "0 auto", gap: 10 }}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="O seu endereço de e-mail corporativo"
          style={{
            flex: 1, background: C.bgCard,
            border: "0.5px solid rgba(76,175,80,0.2)",
            color: C.textBright, padding: "12px 16px",
            borderRadius: 8, fontSize: 13,
            fontFamily: "'DM Sans', sans-serif",
            transition: "border-color 0.2s",
          }}
        />
        <button
          className="tm-btn-primary"
          style={{
            background: C.greenDark, color: C.textBright, border: "none",
            padding: "12px 24px", borderRadius: 8, fontSize: 14, fontWeight: 500,
            cursor: "pointer", whiteSpace: "nowrap", transition: "opacity 0.2s, transform 0.15s",
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          Agendar demo
        </button>
      </div>

      <p style={{ fontSize: 11, color: "rgba(221,232,223,0.2)", marginTop: "1rem" }}>
        Sem compromisso. Demonstração gratuita de 30 minutos com especialista local.
      </p>
    </section>
  );
}

function Footer() {
  const links = ["Privacidade", "Termos", "Suporte", "Contacto"];

  return (
    <footer
      style={{
        background: "#030804",
        borderTop: "0.5px solid rgba(76,175,80,0.08)",
        padding: "2rem 2.5rem",
        display: "flex", justifyContent: "space-between",
        alignItems: "center", flexWrap: "wrap", gap: "1rem",
      }}
    >
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 30, height: 30,
              background: `linear-gradient(135deg, ${C.greenDark}, ${C.greenMid})`,
              borderRadius: 7,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontWeight: 700, fontSize: 12, color: C.bg,
            }}
          >
            TM
          </div>
          <div>
            <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 15, fontWeight: 700, color: C.textBright }}>TENTE MEDEA</span>
            <span style={{ display: "block", fontSize: 9, color: C.greenMid, letterSpacing: 3, textTransform: "uppercase" }}>CRM · Angola</span>
          </div>
        </div>
        <p style={{ fontSize: 11, color: "rgba(221,232,223,0.22)", marginTop: 6 }}>
          Luanda, Angola · +244 900 000 000 · info@tentemedea.ao
        </p>
      </div>

      <div style={{ display: "flex", gap: "1.5rem" }}>
        {links.map((l) => (
          <a
            key={l}
            href="#"
            className="tm-footer-link"
            style={{ fontSize: 12, color: "rgba(221,232,223,0.28)", textDecoration: "none", transition: "color 0.2s" }}
          >
            {l}
          </a>
        ))}
      </div>

      <div style={{ fontSize: 12, color: "rgba(221,232,223,0.22)" }}>
        © 2025 TENTE MEDEA. Todos os direitos reservados.
      </div>
    </footer>
  );
}

export default function TenteMedeaCRM() {
  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = globalStyles;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  return (
    <div style={{ background: C.bg, minHeight: "100vh", color: C.text }}>
      <Navbar />
      <Hero />
      <StatsBar />
      <Features />
      <div style={{ height: "0.5px", background: "rgba(76,175,80,0.08)" }} />
      <Pipeline />
      <Testimonials />
      <CTASection />
      <Footer />
    </div>
  );
}
