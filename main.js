import productsData from './src/products.json';

document.addEventListener('DOMContentLoaded', () => {
  
  // 1. Navbar Scroll Effect
  const navbar = document.querySelector('.navbar');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      navbar.style.background = 'rgba(10, 10, 12, 0.95)';
      navbar.style.boxShadow = '0 4px 20px rgba(0,0,0,0.5)';
    } else {
      navbar.style.background = 'rgba(10, 10, 12, 0.8)';
      navbar.style.boxShadow = 'none';
    }
  });

  // 2. Render Products (Pisos)
  const productsContainer = document.getElementById('products-container');
  
  if (productsContainer) {
    productsContainer.innerHTML = ''; // clear loading text
    
    if (productsData && productsData.length > 0) {
      productsData.forEach(product => {
        const card = document.createElement('div');
        card.className = 'product-card';
        
        // Simple heuristic to determine if it's laminate or vinyl based on typical Eucafloor lines
        let type = "Laminado";
        if (product.name.toLowerCase().includes('lvt') || product.name.toLowerCase().includes('vinílico') || product.name.toLowerCase().includes('working')) {
          type = "Vinílico";
        }
        
        card.innerHTML = `
          <div class="product-img-wrapper">
            <span class="product-badge">${type}</span>
            <img src="${product.image}" alt="${product.name}" loading="lazy">
          </div>
          <div class="product-info">
            <h3 class="product-title">${product.name}</h3>
            <p class="product-desc" style="margin-bottom: 0.5rem; font-size: 0.85rem;">Este piso é ideal para renovar áreas residenciais. Pode ser aplicado sobre diversas superfícies existentes, tornando a instalação prática e eficiente.</p>
            <ul style="margin-bottom: 1.5rem; list-style-position: inside; font-size: 0.8rem; color: var(--color-text-muted);">
              <li style="margin-bottom: 4px;">Aplicável sobre concreto, cerâmica e porcelanato.</li>
              <li style="margin-bottom: 4px;">Limpeza com pano úmido e detergente neutro.</li>
              <li>Evite produtos abrasivos ou excesso de água.</li>
            </ul>
            <a href="${product.link || '#contato'}" class="product-link" ${product.link ? 'target="_blank"' : ''}>
              Solicitar Orçamento <i data-lucide="arrow-right" style="width: 16px; height: 16px; margin-left: 6px;"></i>
            </a>
          </div>
        `;
        productsContainer.appendChild(card);
      });
      // Inicializar ícones dinâmicos do Lucide
      if (window.lucide) {
        window.lucide.createIcons();
      }
    } else {
      productsContainer.innerHTML = '<p>Nenhum produto encontrado no momento.</p>';
    }
  }

  // 3. Scroll Reveal Animation
  const revealElements = document.querySelectorAll('.reveal');
  
  const revealOnScroll = () => {
    const windowHeight = window.innerHeight;
    const elementVisible = 100;
    
    revealElements.forEach(el => {
      const elementTop = el.getBoundingClientRect().top;
      if (elementTop < windowHeight - elementVisible) {
        el.classList.add('active');
      }
    });
  };
  
  window.addEventListener('scroll', revealOnScroll);
  // Trigger once on load
  revealOnScroll();

  // 4. Form Submit
  const leadForm = document.getElementById('leadForm');
  if (leadForm) {
    leadForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const btn = leadForm.querySelector('button[type="submit"]');
      const originalText = btn.innerHTML;
      
      btn.innerHTML = 'Enviando...';
      btn.style.opacity = '0.7';
      btn.disabled = true;
      
      // Simulate API call
      setTimeout(() => {
        btn.innerHTML = 'Solicitação Enviada! <i data-lucide="check" style="margin-left: 8px;"></i>';
        if (window.lucide) window.lucide.createIcons();
        btn.style.backgroundColor = '#2ecc71';
        btn.style.opacity = '1';
        
        setTimeout(() => {
          leadForm.reset();
          btn.innerHTML = originalText;
          if (window.lucide) window.lucide.createIcons();
          btn.style.backgroundColor = '';
          btn.disabled = false;
        }, 3000);
      }, 1500);
    });
  }
});
