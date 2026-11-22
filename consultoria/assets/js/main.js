// Inicializa os ícones Lucide
document.addEventListener("DOMContentLoaded", function () {
  if (window.lucide) lucide.createIcons();

  // Navbar: sombra ao rolar
  const navbar = document.getElementById("navbar");
  if (navbar) {
    const onScroll = () => {
      if (window.scrollY > 12) {
        navbar.classList.add("shadow-[0_8px_30px_rgba(0,0,0,0.5)]");
        navbar.classList.remove("shadow-md");
      } else {
        navbar.classList.remove("shadow-[0_8px_30px_rgba(0,0,0,0.5)]");
        navbar.classList.add("shadow-md");
      }
    };
    window.addEventListener("scroll", onScroll);
    onScroll();
  }

  // Menu mobile
  const menuBtn = document.getElementById("mobile-menu-btn");
  const mobileMenu = document.getElementById("mobile-menu");
  const menuIconOpen = document.getElementById("icon-menu-open");
  const menuIconClose = document.getElementById("icon-menu-close");
  if (menuBtn && mobileMenu) {
    menuBtn.addEventListener("click", () => {
      const isHidden = mobileMenu.classList.contains("hidden");
      mobileMenu.classList.toggle("hidden");
      if (menuIconOpen && menuIconClose) {
        menuIconOpen.classList.toggle("hidden", isHidden);
        menuIconClose.classList.toggle("hidden", !isHidden);
      }
    });
  }

  // Fade-up ao rolar a tela (substitui o whileInView do framer-motion)
  const items = document.querySelectorAll(".fade-up");
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    items.forEach((el) => observer.observe(el));
  } else {
    items.forEach((el) => el.classList.add("in-view"));
  }
});

// Formulário de contato -> redireciona para o WhatsApp
function handleContactSubmit(e) {
  e.preventDefault();
  const nome = document.getElementById("f-nome").value;
  const email = document.getElementById("f-email").value;
  const telefone = document.getElementById("f-telefone").value;
  const empresa = document.getElementById("f-empresa").value;
  const mensagem = document.getElementById("f-mensagem").value;
  const text =
    "Olá! Meu nome é " + nome + ".\n" +
    "E-mail: " + email + "\n" +
    "Telefone: " + telefone + "\n" +
    "Empresa: " + empresa + "\n" +
    "Mensagem: " + mensagem;
  window.open("https://wa.me/5511996119090?text=" + encodeURIComponent(text), "_blank");
  return false;
}
