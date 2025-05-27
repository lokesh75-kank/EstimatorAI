# 👣 User Journey – AI Estimator for Fire & Security Systems

This document outlines the end-to-end journey of a user interacting with the AI-powered Estimation Agent for fire alarm and security system proposals.

## 🎯 Persona: Estimation Engineer / Project Manager

**User Type:** Fire & Security Systems Integrator (Small to Mid-size)

**Goal:** Generate accurate, fast, and compliant cost proposals with minimal manual effort.

## 🧭 Stage 1: Discovery & Onboarding

### 1.1 Access
- User lands on the web app via invite link or homepage
- Agent shows product overview and a quick demo

### 1.2 Authentication
- User signs up or logs in
- Agent tailors dashboard based on role and past activity

### 1.3 Branding
- Option to upload logo and company name for white-labeled proposals
- Agent stores branding preferences

## 📥 Stage 2: Submit Project Requirements

### 2.1 Start New Estimation
- User clicks "New Estimation" on dashboard
- Agent opens guided intake wizard

### 2.2 Upload Input Files
- RFQs, blueprints, and SOWs are uploaded
- Agent parses documents and extracts key metadata using OpenAI

### 2.3 Fill Form Inputs
- User enters building type, total square footage, number of floors, zones, etc.
- Agent recommends missing or auto-filled fields

### 2.4 Chat Clarification (Optional)
- User asks questions like: "How many detectors are needed?"
- Agent responds based on NFPA/IBC code logic

## 🧮 Stage 3: Estimate Generation

### 3.1 Run Estimation
- User submits form and clicks "Estimate"
- Agent calculates device count, labor, permits, and regional costs

### 3.2 Review Bill of Materials
- Output is a structured BOM with cost breakdown
- Editable markup and profit margins

### 3.3 Compliance Flagging
- If code issues arise (e.g., missing strobe in stairwell), agent alerts user
- Agent provides links to applicable codes

## 📄 Stage 4: Proposal Generation

### 4.1 Generate Proposal
- User clicks "Generate Proposal"
- Agent compiles PDF with branding, scope, BOM, legal text, etc.

### 4.2 Delivery
- User can download or directly email the proposal to client
- Email automation uses SES or SMTP integration

### 4.3 Store & Track
- Proposal is saved in dashboard with status (Draft → Final)

## 📊 Stage 5: Project Management

### 5.1 View Estimation History
- List of past projects with cost, status, client info

### 5.2 Open Detailed View
- Proposal preview, BOM by zone/floor, compliance logs

### 5.3 Re-Estimate
- Triggered when vendor pricing changes or project is revised
- Agent re-calculates with updated cost inputs

## ✅ Optional QA: Human-in-the-Loop

### Trigger Points:
- Project exceeds $50k
- AI compliance engine encounters ambiguous requirements

### Agent Behavior:
- Escalates to human engineer for manual review
- Sends notification or internal flag

## 🎉 Outcome

- 80–90% reduction in estimation time
- Code-compliant, accurate proposals
- Higher RFP win rates
- Engineers focus on design, not spreadsheets

Designed for integrators and contractors who want to win faster, safer, and smarter. 