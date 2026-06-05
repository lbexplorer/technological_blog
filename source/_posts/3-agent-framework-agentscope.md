---
title: Agent 开发框架学习：AgentScope 篇
date: 2026-05-20 16:20:00
categories:
  - Agent
tags:
  - AgentScope
  - Multi-Agent
  - LLM
  - Python
  - 软件工程
---

如果说 AutoGen 的设计哲学是“以对话驱动协作”，那么 AgentScope 则代表了另一种技术路径：工程化优先的多智能体平台。

AgentScope 由阿里巴巴达摩院开发，专门为构建大规模、高可靠性的多智能体应用而设计。它不仅提供了直观易用的编程接口，更重要的是内置了分布式部署、容错恢复、可观测性等企业级特性，使其特别适合构建需要长期稳定运行的生产环境应用。

与 AutoGen 相比，AgentScope 的核心差异在于其消息驱动的架构设计和工业级的工程实践。

原理说太多也不理解，直接实战。

## 项目：三国狼人杀游戏

### 1. 架构设计与核心组件

本案例的系统设计遵循了分层解耦的原则，将游戏逻辑划分为三个独立的层次，每个层次都映射了 AgentScope 的一个或多个核心组件：

- 游戏控制层（Game Control Layer）：由一个 `ThreeKingdomsWerewolfGame` 类作为游戏的主控制器，负责维护全局状态，如玩家存活列表、当前游戏阶段；推进游戏流程，如调用夜晚阶段、白天阶段；以及裁定胜负。
- 智能体交互层（Agent Interaction Layer）：完全由 `MsgHub` 驱动。所有智能体间的通信，无论是狼人间的秘密协商，还是白天的公开辩论，都通过消息中心进行路由和分发。
- 角色建模层（Role Modeling Layer）：每个玩家都是一个基于 `DialogAgent` 的实例。我们通过精心设计的系统提示词，为每个智能体注入“游戏角色”和“三国人格”的双重身份。

### 2. 消息驱动的游戏流程

本案例最核心的设计是以消息驱动代替状态机来管理游戏流程。在传统实现中，游戏阶段的转换通常由一个中心化的状态机（State Machine）控制。而在 AgentScope 的范式下，游戏流程被自然地建模为一系列定义好的消息交互模式。

例如，狼人阶段的实现，并非一个简单的函数调用，而是通过 `MsgHub` 动态创建一个临时的、仅包含狼人玩家的私密通信频道：

<img src="/technological_blog/images/agentscope-msg-hub.png" alt="AgentScope MsgHub 私密通信频道示例" style="max-width:720px;width:100%;height:auto;display:block;margin:18px auto;" />
