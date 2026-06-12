// ==========================================
// AVANIKA.CO — SUPABASE DEVELOPER CONSOLE
// supabase-console.js
// ==========================================

'use strict';

(function() {
  document.addEventListener('DOMContentLoaded', () => {
    // Parse query params to toggle developer mode
    const params = new URLSearchParams(window.location.search);
    if (params.get('dev') === 'true') {
      localStorage.setItem('avanika_dev_mode', 'true');
    } else if (params.get('dev') === 'false') {
      localStorage.removeItem('avanika_dev_mode');
    }

    const isDevMode = localStorage.getItem('avanika_dev_mode') === 'true' || 
                      window.isAdminAuthorized || 
                      window.location.pathname.includes('owner.html') || 
                      sessionStorage.getItem('avanika_admin_token') === 'avanika_admin_2026';

    if (!isDevMode) return;

    // Create floating console trigger button
    const devBtn = document.createElement('button');
    devBtn.id = 'supabase-dev-console-btn';
    devBtn.setAttribute('aria-label', 'Database Settings');
    devBtn.style.cssText = `
      position: fixed;
      bottom: 1.5rem;
      left: 1.5rem;
      z-index: 9999;
      width: 38px;
      height: 38px;
      background: #0A1611;
      border: 1px solid #DFB76C;
      color: #DFB76C;
      font-size: 1.15rem;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      box-shadow: 0 4px 15px rgba(0,0,0,0.2);
      transition: transform 0.3s ease, background 0.3s ease;
      font-family: inherit;
    `;
    
    // Check credentials configuration status
    const isConn = window.isSupabaseConfigured;
    devBtn.innerHTML = isConn ? '⚡' : '🔌';
    if (isConn) {
      devBtn.style.background = '#12241C';
      devBtn.style.borderColor = '#2a9d8f';
      devBtn.style.color = '#2a9d8f';
      devBtn.title = 'Supabase Connected (Live Mode)';
    } else {
      devBtn.title = 'Supabase Disconnected (Offline Simulation Mode)';
    }

    document.body.appendChild(devBtn);

    // Create Modal Overlay
    const modal = document.createElement('div');
    modal.id = 'supabase-dev-modal';
    modal.style.cssText = `
      position: fixed;
      inset: 0;
      background: rgba(10, 22, 17, 0.96);
      z-index: 10000;
      display: none;
      align-items: center;
      justify-content: center;
      padding: 1.5rem;
      font-family: 'Inter', sans-serif;
    `;

    modal.innerHTML = `
      <div style="background: #12241C; border: 1px solid #DFB76C; max-width: 500px; width: 100%; padding: 2.5rem 2rem; box-shadow: 0 15px 40px rgba(0,0,0,0.3); position: relative;">
        <button id="supabase-modal-close" style="position: absolute; top: 1.2rem; right: 1.2rem; background: none; border: none; color: #B3C0B8; font-size: 1.5rem; cursor: pointer; line-height: 1;">&times;</button>
        <h3 style="font-family: 'Cinzel', serif; font-size: 1.4rem; color: #F2EFE8; margin-bottom: 0.5rem; text-transform: uppercase; letter-spacing: 0.05em;">Database Console</h3>
        <p style="font-size: 0.82rem; color: #B3C0B8; line-height: 1.5; margin-bottom: 1.8rem;">
          Connect your **Avanika.co** store to your own Supabase project. Enter your credentials to save to local storage. 
        </p>

        <form id="supabase-console-form" style="display: flex; flex-direction: column; gap: 1.2rem;">
          <div style="display: flex; flex-direction: column; gap: 0.4rem;">
            <label style="font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.05em; color: #B3C0B8; font-weight: 600;">Supabase Project URL</label>
            <input type="url" id="console-url" placeholder="https://your-project.supabase.co" required style="padding: 0.8rem 1rem; background: #0A1611; border: 1px solid #1D362B; color: #F2EFE8; font-size: 0.85rem;" />
          </div>
          
          <div style="display: flex; flex-direction: column; gap: 0.4rem;">
            <label style="font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.05em; color: #B3C0B8; font-weight: 600;">Supabase Anon API Key</label>
            <input type="text" id="console-key" placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." required style="padding: 0.8rem 1rem; background: #0A1611; border: 1px solid #1D362B; color: #F2EFE8; font-size: 0.85rem; font-family: monospace;" />
          </div>

          <div style="display: flex; gap: 1rem; margin-top: 1rem;">
            <button type="submit" style="flex: 1; padding: 0.9rem; background: #DFB76C; color: #0A1611; font-weight: bold; font-size: 0.82rem; text-transform: uppercase; letter-spacing: 0.05em; border: none; cursor: pointer;">Connect Database</button>
            ${isConn ? `<button type="button" id="console-disconnect" style="padding: 0.9rem; background: #c94c4c; color: #fff; font-weight: bold; font-size: 0.82rem; text-transform: uppercase; letter-spacing: 0.05em; border: none; cursor: pointer;">Disconnect</button>` : ''}
          </div>
        </form>
        
        <div style="margin-top: 1.5rem; padding-top: 1.2rem; border-top: 1px dashed #1D362B; font-size: 0.78rem; color: #B3C0B8; line-height: 1.4;">
          <strong>Status:</strong> ${isConn ? '<span style="color: #2a9d8f; font-weight: 600;">⚡ Connected (Live Database Mode)</span>' : '<span style="color: #DFB76C; font-weight: 600;">🔌 Offline (Simulation Fallback Mode)</span>'}
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    // Fill in stored credentials
    if (isConn) {
      document.getElementById('console-url').value = window.supabaseUrl;
      document.getElementById('console-key').value = window.supabaseAnonKey;
    }

    // Modal click overlays
    devBtn.addEventListener('click', () => {
      modal.style.display = 'flex';
      if (typeof gsap !== 'undefined') {
        gsap.fromTo(modal.querySelector('div'), 
          { scale: 0.8, opacity: 0 },
          { scale: 1, opacity: 1, duration: 0.4, ease: 'back.out(1.5)' }
        );
      }
    });

    const closeBtn = document.getElementById('supabase-modal-close');
    const closeModal = () => {
      if (typeof gsap !== 'undefined') {
        gsap.to(modal.querySelector('div'), {
          scale: 0.8,
          opacity: 0,
          duration: 0.3,
          ease: 'power2.in',
          onComplete: () => {
            modal.style.display = 'none';
          }
        });
      } else {
        modal.style.display = 'none';
      }
    };

    closeBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });

    const consoleForm = document.getElementById('supabase-console-form');
    consoleForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const url = document.getElementById('console-url').value.trim();
      const key = document.getElementById('console-key').value.trim();
      
      if (window.configureSupabase(url, key)) {
        alert('⚡ Connection credentials saved successfully! Reloading page to connect...');
        window.location.reload();
      }
    });

    const disconnectBtn = document.getElementById('console-disconnect');
    if (disconnectBtn) {
      disconnectBtn.addEventListener('click', () => {
        if (confirm('Disconnect from live Supabase database and return to offline simulation mode?')) {
          window.disconnectSupabase();
        }
      });
    }
    
    // Magnetic styling for devBtn
    devBtn.addEventListener('mousemove', (e) => {
      const rect = devBtn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      if (typeof gsap !== 'undefined') {
        gsap.to(devBtn, {
          x: x * 0.3,
          y: y * 0.3,
          scale: 1.05,
          duration: 0.3,
          overwrite: 'auto'
        });
      }
    });

    devBtn.addEventListener('mouseleave', () => {
      if (typeof gsap !== 'undefined') {
        gsap.to(devBtn, {
          x: 0,
          y: 0,
          scale: 1,
          duration: 0.5,
          ease: 'elastic.out(1, 0.4)'
        });
      }
    });
  });
})();
