# ExcuseGenius - AI Excuse Generator 🤖

An AI-powered web app that generates hyper-local, believable excuses for getting out of work, deadlines, or social plans. Includes AI-generated "photo evidence" that matches your excuse.

![ExcuseGenius Demo](https://images.unsplash.com/photo-1599507949390-d4642738435d?auto=format&fit=crop&w=1200&h=400)

---

## 🚀 Features

- **AI Text Generation**: Uses GPT-4o via AnyRouter for human-like excuses
- **Hyper-Local Logic**: Automatically includes your city/region for ultra-realistic excuses
- **Dynamic Photo Evidence**: Fetches matching images from Unsplash based on the excuse
- **6 Scenario Types**: Late for Work, Sick Day, Tech Failure, Family Emergency, Missed Deadline, Bail on Plans
- **Believability Score**: AI-calculated credibility rating (88-98%)
- **Viral Sharing**: Share to unlock +3 free uses
- **Gumroad Integration**: Secure payment processing for Pro tier ($4.99)
- **SEO Optimized**: Rich metadata for social media sharing
- **Responsive Design**: Built with Tailwind CSS for mobile & desktop

---

## 💰 Pricing

| Tier | Price | Features |
|:---|:---|:---|
| **Free** | $0 | 3 excuse generations |
| **Pro** | $4.99 | Unlimited excuses + Premium photos + Priority support |

Purchase Pro: [https://samzhu168.gumroad.com/l/pjdbk](https://samzhu168.gumroad.com/l/pjdbk)

---

## 🛠️ Tech Stack

- **Frontend**: HTML5, Tailwind CSS
- **Backend**: Vercel Serverless Functions (Node.js)
- **AI Provider**: AnyRouter (wrapping GPT-4o)
- **Image Provider**: Unsplash API (via source.unsplash.com)
- **Deployment**: Vercel

---

## 📦 How to Deploy

1. **Fork this repository** to your GitHub account.
2. **Import the project** into your Vercel dashboard.
3. **Set Environment Variable**: In Vercel, go to `Settings` -> `Environment Variables` and add a new variable:
   - **Name**: `ANY_ROUTER_KEY`
   - **Value**: Your actual API key from AnyRouter.
4. **Deploy**. Your ExcuseGenius app is now live!

