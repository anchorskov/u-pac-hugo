# 🤝 Contributing to U-PAC

Welcome to the U-PAC Project (yoUr Political Action Committee)!

We are building a transparent, accessible platform to inform and empower voters and hold public officials accountable. This is a grassroots civic tech project that thrives on community collaboration.

---

## 🧠 Who Can Contribute?

We welcome:

- 🔧 Developers (JS, HTML, Hugo, Go, Tailwind, APIs)
- 🎨 Designers (UI/UX, accessibility, mobile-first)
- 📄 Writers & editors (content, docs, newsletters)
- 🧪 Testers & QA engineers
- 🗳️ Civically engaged individuals who want to help

---

## 🛠️ Project Structure

- Static site built with **Hugo**
- Modular CSS/JS (per-page)
- Strict **Content Security Policy** using dynamic nonce injection
- Cloudflare Pages deployment
- ZIP & location-based candidate finder tools
- Upcoming: user accounts, newsletter alerts, civic surveys

---

## 🧩 How to Contribute

1. **Fork this repo**: https://github.com/anchorskov/u-pac-hugo
2. **Clone your fork**:
   ```bash
   git clone https://github.com/YOUR-USERNAME/u-pac-hugo.git
   cd u-pac-hugo
Create a new branch:

bash
Copy
Edit
git checkout -b feature/your-feature-name
Make your changes (code, style, logic, etc.)

Commit:

bash
Copy
Edit
git commit -m "Add: your-feature-name"
Push your branch:

bash
Copy
Edit
git push origin feature/your-feature-name
Open a Pull Request into the main branch on GitHub.

📦 What We Need Help With
We're seeking contributors in these key areas:

🔐 Authentication
User account system with spam protection

Secure form entry (CAPTCHA, email verification)

Simple login/authentication (Cloudflare Turnstile or Netlify Identity)

📋 Surveys
Survey creation interface (admin UI or YAML)

Form builder logic with validation

Save & associate responses to users anonymously or via accounts

📥 Data Collection
Store survey results (locally or via API)

Sanitize inputs and protect privacy

Visualize responses (charts, graphs)

🏛️ Civic Data + Policy Matching
Connect legislation to zip codes

Match representatives to bills and issues

Summarize upcoming legislation dynamically

📨 Notifications / Newsletter
Auto-generate weekly civic alerts

Alert users to relevant legislation

Manage subscriptions and unsubscribe flows

📤 Communicate With Reps
Compose & send letters to representatives

Auto-fill letter based on survey result

Track who responds and how

📊 U-Meter (Rep Feedback & Scoring)
Interface to rate representative responses

Score integrity, transparency, compassion

Display results in card format or charts

🧪 Good First Issues
Check our open issues for:

good first issue

help wanted

accessibility

UI improvement

📜 Style Guide
Follow existing CSS component conventions in /static/css

JS: modular, per-page logic only when needed

Use secure-script.html for CSP-compliant <script> loading

Format using Prettier / Black (optional but welcome)

🛡️ Code of Conduct
This is a welcoming, inclusive, and respectful community.

Please see our Code of Conduct before contributing.

💬 Questions? Suggestions?
📫 Email: anchor@u-pac.org

💬 Open a Discussion

🚀 Suggest a feature via Issue

🧭 Mission
U-PAC empowers voters with verified, accessible, nonpartisan information about:

Candidates running for office

Their stated positions and integrity record

Opportunities to influence, volunteer, and speak up

Help us build tools that serve democracy, truth, and transparency.

Thanks for being part of the movement! 🕊️📢