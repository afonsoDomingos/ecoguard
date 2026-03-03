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
                fetchStats();
            } else if (targetPage === 'reports') {
                fetchReportsData();
            } else if (targetPage === 'map') {
                updateMapMarkers();
            } else if (targetPage === 'impacts') {
                fetchStats(); // Stats contains risk/category distribution needed for impacts
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

    async function fetchStats() {
        try {
            const response = await fetch(`${API_URL}/stats`);
            const stats = await response.json();

            const statValues = document.querySelectorAll('.stat-value');
            if (statValues.length >= 3) {
                statValues[0].innerText = stats.totalActivities || 0;
                statValues[1].innerText = (stats.complianceLevel || 100) + '%';
                statValues[2].innerText = stats.criticalAlerts || 0;

                const socialIndex = stats.categoryDistribution?.find(c => c._id === 'Impacto Social')?.count || 0;
                statValues[3].innerText = socialIndex > 5 ? 'Elevado' : (socialIndex > 1 ? 'Médio' : 'Baixo');
            }

            updateDashboardChart(stats.riskDistribution);
            updateImpactsPage(stats);
        } catch (err) {
            console.error('Erro ao buscar estatísticas:', err);
        }
    }

    function updateImpactsPage(stats) {
        const impactsChart = document.getElementById('impacts-risk-chart');
        if (impactsChart) {
            updateChartElement(impactsChart, stats.riskDistribution);
        }

        const criticalList = document.getElementById('critical-categories-list');
        if (criticalList) {
            criticalList.innerHTML = stats.categoryDistribution?.map(cat => `
                <div class="activity-item" style="border-left: 4px solid var(--accent); margin-bottom: 12px; background: rgba(255,255,255,0.02)">
                    <div class="activity-detail">
                        <h4>${cat._id}</h4>
                        <span style="color: var(--text-muted)">${cat.count} registos activos</span>
                    </div>
                    <div class="activity-impact" style="background: var(--glass-bg)">${Math.round((cat.count / stats.totalActivities) * 100) || 0}%</div>
                </div>
            `).join('') || '<p>Sem dados.</p>';
        }
    }

    function updateChartElement(element, riskData) {
        const risks = ['Insignificante', 'Baixo', 'Moderado', 'Crítico'];
        const dataMap = {};
        riskData?.forEach(item => dataMap[item._id] = item.count);

        element.innerHTML = risks.map(risk => {
            const count = dataMap[risk] || 0;
            const height = Math.min(100, (count * 20) + 10);
            return `
                <div class="bar-container" style="display: flex; flex-direction: column; align-items: center; gap: 8px; flex: 1;">
                    <div class="bar" style="height: ${height}%; width: 100%; background: var(--accent); border-radius: 4px;" title="${risk}: ${count}"></div>
                    <span style="font-size: 0.6rem; color: var(--text-muted); cursor: default">${risk}</span>
                </div>
            `;
        }).join('');
    }

    function updateDashboardChart(riskData) {
        const chart = document.querySelector('.bar-chart');
        if (!chart) return;

        const risks = ['Insignificante', 'Baixo', 'Moderado', 'Crítico'];
        const dataMap = {};
        riskData?.forEach(item => dataMap[item._id] = item.count);

        chart.innerHTML = risks.map(risk => {
            const count = dataMap[risk] || 0;
            const height = Math.min(100, (count * 20) + 10); // Dynamic height
            return `
                <div class="bar-container" style="display: flex; flex-direction: column; align-items: center; gap: 8px;">
                    <div class="bar" style="height: ${height}%; width: 30px; background: var(--accent); border-radius: 4px;" title="${risk}: ${count}"></div>
                    <span style="font-size: 0.6rem; color: var(--text-muted); writing-mode: vertical-lr; transform: rotate(180deg);">${risk}</span>
                </div>
            `;
        }).join('');
    }

    async function fetchReportsData() {
        try {
            const response = await fetch(`${API_URL}/stats`);
            const stats = await response.json();

            const miniStats = document.querySelectorAll('.mini-stat strong');
            if (miniStats.length >= 3) {
                miniStats[0].innerText = stats.criticalAlerts || 0;
                miniStats[1].innerText = (stats.complianceLevel || 100) + '%';
                miniStats[2].innerText = stats.totalActivities > 0 ? 'Activo' : 'Sem Dados';
            }

            // Update horizontal bars in reports
            const bars = document.querySelectorAll('.report-chart .bar');
            if (bars.length >= 3) {
                const total = stats.totalActivities || 1;
                const cat1 = stats.categoryDistribution?.find(c => c._id === 'Gestão de Resíduos')?.count || 0;
                const cat2 = stats.categoryDistribution?.find(c => c._id === 'Emissões Atmosféricas')?.count || 0;
                const cat3 = stats.categoryDistribution?.find(c => c._id === 'Impacto Social')?.count || 0;

                bars[0].style.width = Math.min(100, (cat1 / total) * 100) + '%';
                bars[1].style.width = Math.min(100, (cat2 / total) * 100) + '%';
                bars[2].style.width = Math.min(100, (cat3 / total) * 100) + '%';
            }
        } catch (err) {
            console.error('Erro ao buscar dados do relatório:', err);
        }
    }

    async function updateMapMarkers() {
        const mapOverlay = document.querySelector('.map-overlay');
        if (!mapOverlay) return;

        try {
            const response = await fetch(`${API_URL}/activities`);
            const activities = await response.json();

            // Clear existing markers except controls
            const existingMarkers = mapOverlay.querySelectorAll('.map-marker');
            existingMarkers.forEach(m => m.remove());

            activities.forEach((activity, index) => {
                const marker = document.createElement('div');
                marker.className = 'map-marker';

                // Random position for visual effect since we don't have coords
                const top = 20 + (Math.random() * 60);
                const left = 20 + (Math.random() * 60);

                marker.style.top = `${top}%`;
                marker.style.left = `${left}%`;
                marker.setAttribute('data-tooltip', activity.title);

                const color = activity.risk === 'Crítico' ? 'var(--danger)' :
                    (activity.risk === 'Moderado' ? 'var(--warning)' : 'var(--success)');

                marker.innerHTML = `<ion-icon name="location" style="color: ${color}; font-size: 24px;"></ion-icon>`;
                mapOverlay.appendChild(marker);
            });
        } catch (err) {
            console.error('Erro ao actualizar mapa:', err);
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
        const fullList = document.querySelector('.full-activity-list');

        const renderItem = activity => `
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
            `;

        if (dashboardList) {
            dashboardList.innerHTML = activities.length === 0
                ? '<p style="color: var(--text-muted); padding: 20px;">Nenhum registo activo.</p>'
                : activities.slice(0, 5).map(renderItem).join('');
        }

        if (fullList) {
            fullList.innerHTML = activities.length === 0
                ? '<p style="color: var(--text-muted); padding: 20px;">Nenhuma actividade registada no MongoDB.</p>'
                : activities.map(renderItem).sort((a, b) => new Date(b.date) - new Date(a.date)).join('');
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
