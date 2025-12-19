# ProofLayer
**ProofLayer is a Sui-native platform for verifiable security, research, and skill contributions.**  
It enables organizations to fund real work, contributors to submit protected artefacts, and rewards plus reputation to be distributed transparently on-chain.

## Problem Statement
Across cybersecurity, research, and technical fields, people produce valuable work such as:
- Security reports and audits  
- Research datasets and experiments  
- Technical write-ups and findings 
However, there is no trusted, privacy-preserving way to:
- **Prove ownership** of contributed work  
- **Secure sensitive data** during review  
- **Verify contributions** transparently  
- **Reward contributors** fairly  
- **Build portable proof of skill** beyond CVs  
As a result:
- Contributors lack recognition and incentives  
- Organizations struggle to trust external submissions  
- Sensitive data is often mishandled or siloed  
This is a **coordination and trust problem**, not just a tooling problem.

## Solution
**ProofLayer** provides a decentralized coordination layer where:
- Organizations, labs, or teams create **funded contribution pools**
- Contributors submit **real security or research work**
- Submissions are:
  - Stored immutably using **Walrus**
  - Encrypted and access-controlled using **Seal**
  - Linked on-chain to the contributor as a verifiable object
- Pool owners review and approve submissions
- **Rewards are distributed automatically on Sui**
- Each accepted contribution builds an **on-chain contributor profile**
This bridges:
- **Security & research infrastructure**
- **Skill & data coordination**
- **Security & research infrastructure**
- **Skill & data coordination**

## Architecture Overview
### Core Components
#### **1. Frontend**
- Built with **Next.js / React**
- Pool creation and browsing
- Contribution submission flow
- Approval interface
- Contributor profile page
- Wallet connection (Nautilus)

#### **2. Smart Contracts (Sui / Move)**
- Lightweight, object-centric design
- Handles:
  - Contribution pool creation
  - Contribution records
  - Approval logic
  - Reward distribution
  - Reputation tracking

#### **3. Storage & Security**
- **Walrus**: decentralized storage for large files (reports, datasets)
- **Seal**: encryption and role-based access control

##  Sui Stack Usage
ProofLayer intentionally leverages the Sui ecosystem:

| Tool | Purpose |
|-----|--------|
| **Sui Move** | Pool logic, ownership, rewards |
| **Walrus** | Storage of research artefacts |
| **Seal** | Encryption and secure access |
| **Nautilus Wallet** | User interaction & transactions |
| **zkLogin / Passkey** | Easy onboarding for non-crypto users |

## Target Users
- Security researchers  
- Students and early-career engineers  
- Academic and research labs  
- Web3 protocols and startups  
- Hackathons and technical programs  

##  Why ProofLayer Matters
- Expands Sui into **security and research infrastructure**
- Solves real-world **data integrity and trust problems**
- Demonstrates meaningful use of the **full Sui stack**
- Enables verifiable proof of skill through real work
