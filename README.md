# Vercel Ship 2025 - AI Showdown 🎭

An interactive showcase demonstrating Vercel's Ship 2025 features through animated AI model comparisons. Watch as paper planes deliver wisdom from competing AI models in real-time!

🎬 **[Live Demo](https://vercelship25.vercel.app/showdown-anime)** | 📝 **[Article](https://linkedin.com/in/your-profile)**

## 🚀 What's This About?

In June 2025, Vercel announced Ship - a suite of cutting-edge features for AI applications. This project answers: **"What can $10 actually buy you?"**

We built an interactive visualization that:
- Compares 3 AI models (Grok, Claude, Gemini) in real-time
- Tracks every token and penny spent
- Showcases Vercel's new AI Gateway with beautiful animations
- Stays under a $10 budget constraint

## ✨ Features Demonstrated

### Vercel Ship 2025 Features
- **AI Gateway** (Beta) - Multi-model orchestration with unified API
- **Active CPU Pricing** (GA) - Pay only for execution time
- **Fluid Compute** (GA) - Automatic scaling
- **Sandbox** (Simulated) - Execute AI-generated code safely
- **Real-time Streaming** - Live token-by-token responses

### Interactive Showcases

#### 🎯 [Anime Showdown](/showdown-anime)
Our flagship demo featuring:
- Paper planes delivering AI responses
- Staggered blur-to-clear animations
- Judge panel with live commentary
- Confetti celebration for the winner
- Editorial-style experiment summary

#### 🎨 [Glass Morphism](/showdown-glass)
Modern glass UI with particle effects

#### ⚡ [Minimal Arena](/showdown-minimal)
Clean, performance-focused comparison

## 🛠️ Tech Stack

- **Next.js 15** - Latest stable with React 19 RC
- **TypeScript** - Type-safe development
- **Anime.js** - Smooth animations
- **Tailwind CSS** - Utility-first styling
- **AI SDK 5 Beta** - Vercel's AI integration
- **React Feather** - Beautiful icons

## 🚦 Getting Started

### Prerequisites
- Node.js 20+
- Vercel account (Pro plan for all features)

### Installation

```bash
# Clone the repository
git clone https://github.com/ramakay/vercelship25.git
cd vercelship25/ai-triage

# Install dependencies
npm install

# Copy environment variables (optional - uses OIDC by default)
cp .env.example .env.local

# Start development server
npm run dev
```

Visit http://localhost:3000/showdown-anime

### Environment Setup

This project requires a Vercel AI Gateway API key:

1. Get your key from [Vercel AI Gateway Dashboard](https://vercel.com/dashboard/ai-gateway)
2. Copy the environment file:
   ```bash
   cp .env.example .env.local
   ```
3. Add your API key to `.env.local`:
   ```
   AI_GATEWAY_API_KEY=your_key_here
   ```

> **Note**: For enhanced security, see [SECURE-DEPLOYMENT.md](docs/SECURE-DEPLOYMENT.md) for using Vercel's OIDC federation to avoid storing API keys

## 📊 Cost Breakdown

With our $10 budget:
- **AI Gateway calls**: ~$8.50
- **Active CPU time**: ~$1.20
- **Bandwidth**: ~$0.30
- **Total**: Under $10! ✅

## 🎮 Available Commands

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run lint         # Run ESLint
npm run probe        # Test feature availability
npm run screenshots  # Capture UI states
```

## 🏗️ Project Structure

```
app/
├── showdown-anime/     # Main animated showcase
│   ├── components/     # React components
│   └── lib/           # Animation utilities
├── showdown-glass/     # Glass morphism demo
├── showdown-minimal/   # Minimal comparison
├── api/               # API routes
│   └── triage/        # AI orchestration endpoint
└── services/          # Core services
    └── ai-gateway.ts  # Multi-model management
```

## 🔒 Security Options

### Basic Setup (Quick Start)
Use environment variables as shown in the setup instructions above.

### Enterprise Setup (Recommended for Production)
Vercel offers OIDC federation on all plans for secure backend access:

- **No stored credentials**: Exchange OIDC tokens for temporary API keys
- **Automatic rotation**: Tokens expire after 60 minutes
- **Environment isolation**: Different permissions per environment
- **Audit trail**: Track all credential exchanges

See [SECURE-DEPLOYMENT.md](docs/SECURE-DEPLOYMENT.md) for implementation details.

## 🚀 Deployment

### Deploy to Vercel

The easiest way to deploy this app is through the [Vercel Platform](https://vercel.com):

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Framakay%2Fvercelship25&env=AI_GATEWAY_API_KEY&envDescription=Required%20API%20key%20for%20Vercel%20AI%20Gateway&envLink=https%3A%2F%2Fvercel.com%2Fdashboard%2Fai-gateway)

Or deploy manually:

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

**Important**: You'll need to add your `AI_GATEWAY_API_KEY` in the Vercel dashboard under Environment Variables.

## 🤝 Contributing

We welcome contributions! Please:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📈 Performance Notes

- Animations are optimized for 60fps
- Lazy loading for heavy components
- Client-side only animations (no SSR overhead)
- Efficient state management

## 🐛 Known Issues

- Queue features require limited beta access
- Sandbox execution is simulated (actual API pending)
- Some animations may stutter on older devices

## 📜 License

MIT License - see [LICENSE](LICENSE) file for details

## 🙏 Acknowledgments

- Vercel team for Ship 2025 features
- Anime.js for smooth animations
- The AI models that made this possible
- Early adopters testing these features

---

Built with ❤️ for the Vercel Ship 2025 launch. 

*Remember: These features are bleeding edge - perfect for early adopters, but maybe wait for GA in production!*