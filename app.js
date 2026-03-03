document.addEventListener('DOMContentLoaded', () => {
    const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
        ? 'http://localhost:5000/api'
        : '/api';

    // Navigation Logic
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('.page-section');

    // Initial Data Fetch
    fetchActivities();
    fetchStats();

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetPage = link.getAttribute('data-page');

            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');

            sections.forEach(section => section.classList.remove('active'));

            let targetSection = document.getElementById(targetPage);
            if (!targetSection) {
                targetSection = createPlaceholderPage(targetPage);
            }
            targetSection.classList.add('active');

            if (targetPage === 'activities' || targetPage === 'dashboard') {
                fetchActivities();
            }
        });
    });

    // Fetch Activities from API
    async function fetchActivities() {
        try {
            const response = await fetch(`${API_URL}/activities`);
            const activities = await response.json();
            updateActivityLists(activities);
        } catch (err) {
            console.error('Erro ao buscar actividades:', err);
        }
    }

    // Fetch Stats from API
    async function fetchStats() {
        try {
            const response = await fetch(`${API_URL}/stats`);
            const stats = await response.json();
            const activeVal = document.querySelectorAll('.stat-value')[0];
            if (activeVal) activeVal.innerText = stats.activeActivities || 0;
        } catch (err) {
            console.error('Erro ao buscar estatísticas:', err);
        }
    }

    async function deleteActivity(id) {
        if (!confirm('Tem certeza que deseja remover esta actividade?')) return;
        try {
            const response = await fetch(`${API_URL}/activities/${id}`, { method: 'DELETE' });
            if (response.ok) {
                showNotification('Actividade removida.', 'success');
                fetchActivities();
                fetchStats();
            }
        } catch (err) {
            showNotification('Erro ao remover.', 'danger');
        }
    }

    async function updateStatus(id, currentStatus) {
        const newStatus = currentStatus === 'Pendente' ? 'Concluído' : 'Pendente';
        try {
            const response = await fetch(`${API_URL}/activities/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });
            if (response.ok) {
                showNotification('Estado actualizado.', 'success');
                fetchActivities();
            }
        } catch (err) {
            showNotification('Erro ao actualizar.', 'danger');
        }
    }

    function updateActivityLists(activities) {
        const dashboardList = document.querySelector('.activity-list');
        if (dashboardList) {
            if (activities.length === 0) {
                dashboardList.innerHTML = '<p style="color: var(--text-muted); padding: 20px;">Nenhuma actividade registada.</p>';
                return;
            }
            dashboardList.innerHTML = activities.slice(0, 5).map(activity => `
                <div class="activity-item">
                    <div class="activity-status ${activity.status === 'Concluído' ? 'done' : 'pending'}" 
                         onclick="window.updateStatus('${activity._id}', '${activity.status}')" 
                         style="cursor: pointer" title="Alternar Estado"></div>
                    <div class="activity-detail">
                        <h4>${activity.title}</h4>
                        <span style="font-size: 0.7rem; color: var(--accent); display: block; margin-bottom: 2px;">Responsável: ${activity.author || 'Administrador'}</span>
                        <span>${new Date(activity.date).toLocaleDateString()} • ${activity.category}</span>
                    </div>
                    <div class="activity-impact impact-${activity.risk.toLowerCase()}">${activity.risk}</div>
                    <button onclick="window.deleteActivity('${activity._id}')" class="btn-delete" style="background: transparent; border: none; color: var(--danger); cursor: pointer; font-size: 18px; display: flex;">
                        <ion-icon name="trash-outline"></ion-icon>
                    </button>
                </div>
            `).join('');
        }
    }

    // Expose functions to window for onclick handlers
    window.deleteActivity = deleteActivity;
    window.updateStatus = updateStatus;

    // Modal Logic
    const addBtn = document.getElementById('add-activity-btn');
    const modal = document.getElementById('modal-container');
    const closeBtns = document.querySelectorAll('.close-modal');

    addBtn.addEventListener('click', () => {
        modal.classList.add('active');
    });

    closeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            modal.classList.remove('active');
        });
    });

    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('active');
        }
    });

    // Form Submission to MongoDB
    const form = document.getElementById('activity-form');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const inputs = form.querySelectorAll('input[type="text"]');
        const activityData = {
            title: inputs[0].value,
            author: inputs[1].value,
            category: form.querySelectorAll('select')[0].value,
            risk: form.querySelectorAll('select')[1].value,
            description: form.querySelector('textarea').value
        };

        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerText;

        submitBtn.disabled = true;
        submitBtn.innerHTML = '<ion-icon name="sync-outline" class="spin"></ion-icon> Gravando...';

        try {
            const response = await fetch(`${API_URL}/activities`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(activityData)
            });

            if (response.ok) {
                showNotification('Actividade registada no MongoDB!', 'success');
                fetchActivities();
                fetchStats();
                modal.classList.remove('active');
                form.reset();
            } else {
                throw new Error('Falha ao gravar');
            }
        } catch (err) {
            showNotification('Erro de ligação ao servidor.', 'danger');
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerText = originalText;
        }
    });

    // Report Generation Logic
    const generateBtn = document.getElementById('generate-report');
    if (generateBtn) {
        generateBtn.addEventListener('click', () => {
            generateBtn.disabled = true;
            generateBtn.innerHTML = '<ion-icon name="sync-outline" class="spin"></ion-icon> Processando...';

            setTimeout(() => {
                showNotification('Relatório executivo gerado!', 'success');
                generateBtn.disabled = false;
                generateBtn.innerHTML = '<ion-icon name="document-text-outline"></ion-icon> Gerar PDF';
            }, 2000);
        });
    }

    // Helper functions
    function createPlaceholderPage(id) {
        const contentArea = document.getElementById('content-area');
        const section = document.createElement('section');
        section.id = id;
        section.className = 'page-section';

        const titles = {
            activities: 'Gestão de Actividades',
            map: 'Geolocalização de Impactos',
            impacts: 'Identificação de Impactos',
            policies: 'Políticas e Procedimentos',
            reports: 'Relatórios de Sustentabilidade'
        };

        section.innerHTML = `
            <div class="page-header">
                <h1>${titles[id] || id.charAt(0).toUpperCase() + id.slice(1)}</h1>
                <p>Gerencie informações relacionadas a ${id}.</p>
            </div>
            <div class="glass" style="height: 400px; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center;">
                <ion-icon name="construct-outline" style="font-size: 48px; color: var(--accent); margin-bottom: 20px;"></ion-icon>
                <h3>Módulo MongoDB Active</h3>
                <p style="color: var(--text-muted); max-width: 400px; margin-top: 10px;">Os dados de ${id} estão a ser sincronizados com o Cluster0.</p>
            </div>
        `;

        contentArea.appendChild(section);
        return section;
    }

    function showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <ion-icon name="${type === 'success' ? 'checkmark-circle' : 'alert-circle'}"></ion-icon>
            <span>${message}</span>
        `;

        Object.assign(notification.style, {
            position: 'fixed',
            bottom: '32px',
            right: '32px',
            background: type === 'success' ? '#238636' : '#f85149',
            color: 'white',
            padding: '16px 24px',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
            zIndex: '2000',
            animation: 'slideUp 0.3s ease-out'
        });

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateY(20px)';
            notification.style.transition = 'all 0.3s ease-in';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
});

// Animations setup
const styleSheet = document.createElement('style');
styleSheet.textContent = `
    @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
    .spin { animation: spin 1s linear infinite; display: inline-block; }
    @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
`;
document.head.appendChild(styleSheet);
