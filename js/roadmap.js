/* ═══════════════════════════════════════════════════════
   ROADMAP JS — Trion Education
   Раскрывающиеся карточки этапов в разделе "Жол картасы"
   ═══════════════════════════════════════════════════════ */

'use strict';

document.addEventListener('DOMContentLoaded', initRoadmapAccordion);

function initRoadmapAccordion() {
  const toggles = document.querySelectorAll('.timeline-card__toggle');
  if (!toggles.length) return;

  toggles.forEach(btn => {
    const card = btn.closest('.timeline-card');
    if (!card) return;

    btn.addEventListener('click', () => {
      const isOpen = card.classList.toggle('is-open');
      btn.setAttribute('aria-expanded', String(isOpen));
    });
  });
}