# Second Brain Context: PIPE-20261111-login-version-badge-and-whats-new-modal

## Relevant Flows & Assets
- Flow ID: `FLOW_AUTH_01` (Authentication & Login Layout Flow)
- Flow ID: `FLOW_LAYOUT_01` (Soft UI & Modal Architecture Flow)
- Related Rule: `rule_remote_version_hard_cache_purge_autostamp`

## Architecture Requirements
1. **Login Version Badge**:
   - Location: Top-right corner of the centered login floating split-card header (`login-card-header-gradient`).
   - Style: Glassmorphism pill badge (`bg-white/15 hover:bg-white/25 border border-white/30 text-white font-mono`).
   - Interactivity: Clicking opens the update details modal on demand.
2. **What's New / System Update Modal**:
   - Header with civic crest, top-right close icon (`X`), center-bottom acknowledge button ("รับทราบและเข้าสู่ระบบ").
   - Storage Key: `bma_last_seen_update_build` stored in `localStorage`.
   - Condition: Triggered automatically only once per `buildId` update (`lastSeen !== CURRENT_APP_BUILD`).
