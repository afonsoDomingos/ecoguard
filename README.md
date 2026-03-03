# 🌿 EcoGuard | Sistema de Controlo de Actividades

EcoGuard é um sistema avançado de **ESMS (Environmental and Social Management System)** desenvolvido para ajudar organizações e municípios a identificar, gerir e monitorizar os impactos ambientais e sociais das suas operações e projectos.

![Dashboard Preview](eco_dashboard_hero.png)

## 🚀 Funcionalidades Principais

- **📊 Dashboard Executivo**: Visualização em tempo real de actividades activas, conformidade legal e níveis de risco.
- **📝 Gestão de Actividades**: Registo detalhado de operações com categorização inteligente (Resíduos, Emissões, Social, Recursos).
- **🗺️ Mapa de Impactos**: Visualização geográfica (Geolocalização) dos pontos de controlo e incidentes no município.
- **📄 Relatórios de Sustentabilidade**: Geração de relatórios com indicadores de desempenho (KPIs) e metas de sustentabilidade.
- **🗄️ Integração com MongoDB**: Persistência de dados segura em nuvem utilizando MongoDB Atlas.
- **📱 Design Premium**: Interface moderna, responsive, com Dark Mode e estética baseada em Glassmorphism.

## 🛠️ Tecnologias Utilizadas

- **Frontend**: HTML5, Vanilla CSS, JavaScript (ES6+).
- **Backend**: Node.js, Express.js.
- **Base de Dados**: MongoDB Atlas (Mongoose).
- **Iconografia**: Ionicons.
- **Deployment**: Preparado para Vercel e GitHub.

## 📦 Como Instalar e Correr Localmente

1. **Clonar o repositório**:
   ```bash
   git clone https://github.com/afonsoDomingos/ecoguard.git
   cd ecoguard
   ```

2. **Instalar dependências**:
   ```bash
   npm install
   ```

3. **Configurar Variáveis de Ambiente**:
   Crie um ficheiro `.env` na raiz do projecto e adicione a sua string de conexão:
   ```env
   MONGODB_URI=seu_link_do_mongodb_atlas
   PORT=5000
   ```

4. **Executar o servidor**:
   ```bash
   npm run dev
   ```

5. **Abrir o Frontend**:
   Basta abrir o ficheiro `index.html` no seu navegador.

## 🌐 Deployment na Vercel

O projecto está pré-configurado para a Vercel. Ao importar o repositório na plataforma, certifique-se de configurar a variável de ambiente `MONGODB_URI` nas definições do projecto.

---
Desenvolvido com foco em **Sustentabilidade e Governação Social**.
