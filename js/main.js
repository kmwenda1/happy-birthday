onload = () => {
  const c = setTimeout(() => {
    document.body.classList.remove("not-loaded");

    const titles = ('HAPPY BIRTHDAY UMEIMA').split('');
    const titleElement = document.getElementById('title');
    let index = 0;

    function appendTitle() {
      if (index < titles.length) {
        titleElement.innerHTML += titles[index];
        index++;
        setTimeout(appendTitle, 250);
      } else {
        // Show message card button shortly after text completes
        setTimeout(() => {
          const cardBtn = document.getElementById('open-card-btn');
          if (cardBtn) cardBtn.classList.add('visible');
        }, 1200);
      }
    }

    appendTitle();

    clearTimeout(c);
  }, 1000);

  // Modal interactions
  const openBtn = document.getElementById('open-card-btn');
  const closeBtn = document.getElementById('close-card-btn');
  const modal = document.getElementById('card-modal');

  function openModal() {
    if (modal) {
      modal.classList.add('active');
      modal.setAttribute('aria-hidden', 'false');
    }
  }

  function closeModal() {
    if (modal) {
      modal.classList.remove('active');
      modal.setAttribute('aria-hidden', 'true');
    }
  }

  if (openBtn) openBtn.addEventListener('click', openModal);
  if (closeBtn) closeBtn.addEventListener('click', closeModal);

  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeModal();
      }
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal && modal.classList.contains('active')) {
      closeModal();
    }
  });
};
