# ControlPlane.ai - Quick Start & Working Features

## ✅ Status: Fully Functional!

Your ControlPlane.ai prototype is now a **real working website** with:
- ✅ Full frontend with all 6 pages
- ✅ Real backend API server 
- ✅ Data persistence (SQLite + localStorage fallback)
- ✅ Working buttons for review actions (Approve, Reject, Edit)
- ✅ 3 new Priority 1 features (context split, policy templates, keyboard shortcuts)

---

## 🚀 How to Run

**Two terminals needed:**

### Terminal 1: Start Frontend Dev Server
```bash
cd "d:\Sem 5\Unmonitored-Enterprise-AI-Blindspot-main\Unmonitored-Enterprise-AI-Blindspot-main"
npm install   # First time only
npm run dev
```
Runs on: **http://localhost:5173/**

### Terminal 2: Start Backend API Server
```bash
cd "d:\Sem 5\Unmonitored-Enterprise-AI-Blindspot-main\Unmonitored-Enterprise-AI-Blindspot-main"
npm run server
```
Runs on: **http://localhost:3001/** (auto-proxied by frontend)

**Both are already running!** 🟢

---

## 📱 What Works

### Review Queue Actions
Click any review item → Open drawer → Choose action:
- **✅ Approve Original** - Accept the output as-is
- **✅ Reject Request** - Block permanently
- **✅ Save Edit & Release** - Fix and release edited version

All actions persist on the backend!

### Navigation (Left Sidebar)
- **Live Proxy Sandbox** - Test scenarios through 10-stage pipeline
- **Observability & Metrics** - Real-time KPIs (block rate, cost saved, hallucination %)
- **Governance & Policies** - View/edit policies + **apply templates** (NEW!)
- **Human Review Queue** - Manage flagged requests
- **Audit Logs & Compliance** - Searchable event log
- **System Architecture** - Topology diagram

### Keyboard Shortcuts (NEW!)
Press `?` to see all available shortcuts:
- `Ctrl+K` - Open search
- `Ctrl+S` - Sandbox page
- `Ctrl+G` - Governance page
- `Ctrl+N` - New policy
- `Ctrl+Shift+A` - Approve all low-risk

### Policy Templates (NEW!)
1. Go to **Governance & Policies** page
2. Scroll down to "Policy Templates" section
3. Pick one: Security-First | Cost-Optimized | Compliance-Strict | Quality-First
4. Click "Apply Template" → 4 instant policies added!

---

## 🎨 UI Features

### Status Badges
- **PENDING** (amber, pulsing) - Awaiting review
- **APPROVED** (green) - Accepted by operator
- **REJECTED** (red) - Permanently blocked
- **EDITED** (cyan) - Fixed and released

### Risk Scores
- **Red** (>75): Critical - immediate review needed
- **Purple** (50-75): High - schedule review
- **Green** (<50): Low - can auto-approve

### Review Count Badge
Shows pending items in sidebar (top-right of "Human Review Queue")

---

## 💾 Data Persistence

### Frontend (Local)
- localStorage saves all data with key prefix `controlplane_*`
- Survives browser refresh ✅

### Backend (Real)
- SQLite repository with Express.js
- Policies, events, and reviews persist across server restarts ✅
- Set `SQLITE_DB_PATH` to choose the database file

### Optional downstream provider
Set `OPENAI_BASE_URL`, `OPENAI_API_KEY`, and `OPENAI_MODEL` to enable the OpenAI-compatible downstream call. If they are absent, no call is made and the response explicitly reports that no provider is configured.

### Offline Fallback
- If backend is down, app uses localStorage
- Actions still work locally
- Syncs to backend when it comes back online

---

## 🧪 Test Scenarios

### Quick Demo (2 minutes)
1. Open **Human Review Queue**
2. Click first item → Approve
3. Click second item → Reject
4. Click third item → Edit & Release
5. Watch counts update in real-time

### Policy Templates Demo (30 seconds)
1. Go to **Governance & Policies**
2. Select "Security-First" template
3. Click "Apply Template"
4. See 4 new policies instantly added

### Keyboard Shortcuts Demo
1. Press `?` → See all shortcuts
2. Press `Ctrl+S` → Jump to Sandbox
3. Press `Ctrl+K` → Search modal opens

### Full Walkthrough

---

## 🔧 Technical Stack

- **Frontend**: React 18 + TypeScript + Tailwind CSS + Vite
- **Backend**: Express.js + TypeScript
- **State Management**: React Context (split into 4 contexts)
- **Storage**: localStorage + SQLite API server
- **Icons**: Lucide React
- **Dev Server**: Vite with HMR (hot reload)

---

## 📊 Current State

| Item | Status | Score | Policy | Action |
|------|--------|-------|--------|--------|
| req_7723b_9912 | ✅ APPROVED | 78/100 | Hallucination Threshold | Approved by operator |
| req_4412e_8819 | ❌ REJECTED | 82/100 | High-Impact Actions | Rejected by operator |
| req_3319f_1002 | ✏️ EDITED | 68/100 | PII Protection | Fixed & released |

---

## 🚦 Health Check

### Is Frontend Running?
✅ Yes! http://localhost:5173/ (open in browser)

### Is Backend Running?
✅ Yes! Port 3001 active (seen in terminal)

### Are They Connected?
✅ Yes! Actions sync between frontend and backend

### Can I Modify Data?
✅ Yes! Every action persists immediately

---

## 💡 Next Steps

### To Explore More
- Click different scenarios in **Sandbox** 
- Check **Observability** for real metrics
- Browse **Audit Logs** for full history
- Review **Architecture** page for system design

### To Test Edge Cases
- Use keyboard shortcuts to navigate
- Apply different policy templates
- Approve/reject/edit multiple items

### To Customize
- Edit policies in **Governance** page
- Modify remediation text before releasing
- Add notes to decisions
- Search audit logs by request ID

---

## 🎯 Hackathon Checklist

- [x] Frontend running and interactive
- [x] Backend API server running
- [x] All buttons working (Approve/Reject/Edit)
- [x] Data persists after page reload
- [x] Policy templates working
- [x] Keyboard shortcuts functional
- [x] Demo tour available
- [x] 6 pages fully functional
- [x] Status badges show correctly
- [x] Review queue updates in real-time

**You're ready to demo!** 🚀

---

## 📞 Quick Reference

| Need | Action |
|------|--------|
| **Test approval** | Human Review Queue → Click item → Approve Original |
| **Test rejection** | Human Review Queue → Click item → Reject Request |
| **Test editing** | Human Review Queue → Click item → Save Edit & Release |
| **Add policies** | Governance → Choose template → Apply |
| **Jump around** | Press Ctrl+K (search), Ctrl+S (sandbox), Ctrl+G (governance) |
| **See all shortcuts** | Press `?` key |
| **Check metrics** | Go to Observability & Metrics page |
| **View history** | Go to Audit Logs & Compliance page |

---

**Happy hacking!** 🎉
