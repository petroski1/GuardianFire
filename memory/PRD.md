# GUARDIANFIRE - PRD (Product Requirements Document)

## Visão do Produto
Sistema de IA Prescritiva para prevenção de incêndios e segurança industrial. Atua como "Sensor de Colisão com Freio Automático" - antecipa problemas e prescreve soluções antes que aconteçam.

## User Personas
- **Gestores de Segurança Industrial**: Precisam de visão geral do risco da operação
- **Engenheiros de Manutenção**: Recebem ordens de serviço prescritivas
- **Supervisores de Fábrica**: Monitoram setores específicos e relatos da equipe

---

## ARQUITETURA ENTERPRISE (Compatível com P&G e grandes empresas)

### 1. CAMADA DE INGESTÃO (O "Ouvido" do Sistema)
O sistema precisa de drivers de comunicação para falar com o hardware da fábrica.

| Componente | Descrição | Status |
|------------|-----------|--------|
| **MQTT Broker** | Servidor de mensagens (Mosquitto/HiveMQ). Sensores enviam dados para esse endereço e o GUARDIANFIRE captura | 🔶 PLANEJADO |
| **Driver OPC UA** | Traduz o que o CLP (máquina) diz em JSON para o código | 🔶 PLANEJADO |
| **Webhooks** | Recebe dados de ERPs e sistemas de gestão existentes | 🔶 PLANEJADO |
| **API REST** | Endpoints para integração direta | ✅ IMPLEMENTADO |

### 2. CAMADA DE PROCESSAMENTO (O "Cérebro" de IA)
Onde a mágica do GUARDIANFIRE acontece. Não apenas lê o dado atual, mas olha para trás.

| Componente | Descrição | Status |
|------------|-----------|--------|
| **Séries Temporais** | Banco otimizado para tempo (InfluxDB/TimescaleDB) para cálculos como "média de temperatura nos últimos 10 min vs mesmo horário ontem" | 🔶 PLANEJADO (atual: MongoDB) |
| **Análise de Desvio (Anomaly Detection)** | Algoritmo que identifica quando comportamento da máquina sai do normal (mesmo que não seja perigoso ainda) | 🔶 PLANEJADO |
| **Gemini 3 Flash API** | IA recebe resumo dos dados e responde: "Com base nesses 5 sensores, qual a probabilidade de curto-circuito nos próximos 30 minutos?" | ✅ IMPLEMENTADO |
| **Context Analysis** | Cruza variáveis: clima, carga, fadiga da equipe | ✅ IMPLEMENTADO |

### 3. CAMADA DE NOTIFICAÇÃO E AÇÃO (A "Voz")
O software precisa "furar a bolha" e chegar no humano.

| Componente | Descrição | Status |
|------------|-----------|--------|
| **WhatsApp Business API** | Alertas críticos na palma da mão do gestor | 🔶 PLANEJADO |
| **Microsoft Teams** | Integração com ambiente corporativo | 🔶 PLANEJADO |
| **Email (Resend)** | Notificações por email | ✅ IMPLEMENTADO (key placeholder) |
| **Dashboard Web** | Interface de monitoramento em tempo real | ✅ IMPLEMENTADO |
| **Motor de Regras (Rules Engine)** | Lógica prescritiva automática | 🔶 PLANEJADO |

#### Exemplo de Regra:
```
IF probabilidade_risco > 70% AND horario == "turno_noite" 
THEN enviar_alerta_urgente_whatsapp
```

---

## O que foi implementado (MVP - 13/02/2026)

### Backend (FastAPI + MongoDB)
- [x] Auth via Emergent Google OAuth
- [x] CRUD de Setores, Sensores, Alertas, Work Orders
- [x] Relatos Comportamentais
- [x] Variáveis de Contexto (clima, carga, fadiga)
- [x] Análise de Risco com IA (Gemini 3 Flash)
- [x] Dashboard Stats API
- [x] Seed Demo Data endpoint
- [x] Email notifications via Resend (placeholder key)

### Frontend (React + Tailwind)
- [x] Landing Page com conceito "Previsão Ativa"
- [x] Google Social Login
- [x] Dashboard Principal (Painel de Saúde de Risco)
- [x] Página de Setor Detalhado
- [x] Página de Sensores com filtros
- [x] Página de Ordens de Serviço
- [x] Página de Relatos Comportamentais
- [x] Página de Configurações
- [x] Design Industrial Dark Mode

---

## Backlog Priorizado

### P0 (Crítico para Enterprise)
- [ ] **MQTT Broker** - Mosquitto para ingestão de sensores reais
- [ ] **Time-Series DB** - Migrar leituras de sensores para InfluxDB/TimescaleDB
- [ ] **WhatsApp Business API** - Alertas críticos
- [ ] **Microsoft Teams Webhook** - Integração corporativa
- [ ] **Rules Engine** - Motor de regras prescritivas

### P1 (Alta Prioridade)
- [ ] **OPC UA Driver** - Comunicação com CLPs industriais
- [ ] **Anomaly Detection** - Algoritmo de detecção de desvios
- [ ] **WebSocket** - Dados de sensores em tempo real
- [ ] **Gráficos de Histórico** - Séries temporais com Recharts
- [ ] Configurar RESEND_API_KEY real

### P2 (Média)
- [ ] **Webhooks para ERP** - Integração SAP/Oracle
- [ ] Dashboard mobile-optimized
- [ ] Relatórios PDF exportáveis
- [ ] Multi-empresa (tenancy)

### P3 (Longo Prazo)
- [ ] Treinamento customizado do modelo de IA por empresa
- [ ] App mobile nativo
- [ ] Integração com seguradoras (negociar apólices)

---

## Próximos Passos Imediatos
1. Implementar MQTT Broker (Mosquitto) para receber dados de sensores
2. Configurar InfluxDB para séries temporais
3. Criar Rules Engine para lógica prescritiva
4. Integrar WhatsApp Business API e Microsoft Teams
5. Implementar Anomaly Detection com algoritmos estatísticos

---

## Métricas de Sucesso
- **Tempo de detecção**: < 5 segundos para anomalias críticas
- **Precisão de previsão**: > 85% para riscos 30 min antes
- **Tempo de ação**: Ordem de serviço gerada em < 10 segundos após detecção
- **Uptime**: 99.9% para camada de ingestão
