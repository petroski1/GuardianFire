# GuardianFire AI - PRD (Product Requirements Document)

## Problema Original
Sistema de IA Prescritiva para prevenção de incêndios e segurança industrial. Atua como "Sensor de Colisão com Freio Automático" - antecipa problemas e prescreve soluções antes que aconteçam.

## User Personas
- **Gestores de Segurança Industrial**: Precisam de visão geral do risco da operação
- **Engenheiros de Manutenção**: Recebem ordens de serviço prescritivas
- **Supervisores de Fábrica**: Monitoram setores específicos e relatos da equipe

## Core Requirements
1. Dashboard de Saúde de Risco com indicadores em tempo real
2. Monitoramento de sensores (temperatura, vibração, energia, fumaça, umidade)
3. Alertas prescritivos com ações prontas (não apenas "risco alto", mas "o que fazer")
4. Ordens de serviço automáticas geradas pela IA
5. Relatos comportamentais de funcionários
6. Análise de contexto (clima, carga de máquinas, fadiga da equipe)
7. Integração com IA (Gemini 3 Flash) para análise preditiva

## O que foi implementado (13/02/2026)
### Backend (FastAPI + MongoDB)
- [x] Auth via Emergent Google OAuth
- [x] CRUD de Setores, Sensores, Alertas, Work Orders
- [x] Relatos Comportamentais
- [x] Variáveis de Contexto
- [x] Análise de Risco com IA (Gemini 3 Flash)
- [x] Dashboard Stats API
- [x] Seed Demo Data endpoint
- [x] Email notifications (Resend - placeholder key)

### Frontend (React + Tailwind)
- [x] Landing Page com conceito "Previsão Ativa"
- [x] Google Social Login
- [x] Dashboard Principal com:
  - Indicador de Risco Geral
  - Métricas (setores, sensores, alertas, ordens)
  - Variáveis de Contexto
  - Alertas Prescritivos
  - Lista de Setores
- [x] Página de Setor Detalhado
- [x] Página de Sensores com filtros
- [x] Página de Ordens de Serviço
- [x] Página de Relatos Comportamentais
- [x] Página de Configurações
- [x] Design Industrial Dark Mode

## Backlog Priorizado
### P0 (Crítico)
- [ ] Configurar Resend API key real para emails de alerta

### P1 (Alta)
- [ ] Integração WhatsApp Business API para alertas críticos
- [ ] Integração Microsoft Teams para notificações
- [ ] Simulação de dados de sensores em tempo real (WebSocket)
- [ ] Histórico de leituras de sensores com gráficos

### P2 (Média)
- [ ] Integração com sensores físicos reais (MQTT)
- [ ] Dashboard mobile-optimized
- [ ] Relatórios PDF exportáveis
- [ ] Multi-empresa (tenancy)

### P3 (Baixa)
- [ ] API de integração com ERPs
- [ ] Treinamento customizado do modelo de IA por empresa
- [ ] App mobile nativo

## Next Tasks
1. Obter API key do Resend para habilitar emails
2. Implementar WebSocket para dados de sensores em tempo real
3. Adicionar gráficos de histórico de sensores com Recharts
4. Implementar integração WhatsApp/Teams para alertas críticos
