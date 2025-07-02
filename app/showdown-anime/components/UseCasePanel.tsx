'use client';

import { useEffect } from 'react';
import { 
  Zap, 
  Cloud,
  Cpu,
  Box,
  MessageSquare,
  Shield,
  Layers,
  GitBranch,
  User
} from 'react-feather';
import { getAnime } from '../lib/anime-wrapper';

interface UseCasePanelProps {
  visible?: boolean;
  onLaunchCards?: () => void;
  showLaunchButton?: boolean;
}

export default function UseCasePanel({ visible = true, onLaunchCards, showLaunchButton = false }: UseCasePanelProps) {
  useEffect(() => {
    if (visible) {
      getAnime().then((anime) => {
        if (!anime) return;
        
        // Stagger animate each section from blur to clear
        const sections = [
          '.usecase-header',
          '.usecase-story',
          '.usecase-why', 
          '.usecase-method',
          '.usecase-features',
          '.usecase-finePrint',
          '.usecase-launch'
        ];
        
        sections.forEach((selector, index) => {
          const elements = document.querySelectorAll(selector);
          elements.forEach((el) => {
            // Set initial state
            (el as HTMLElement).style.filter = 'blur(15px)';
            (el as HTMLElement).style.opacity = '0';
            
            // Add initial shadow state for containers
            if (selector.includes('story') || selector.includes('why') || selector.includes('method')) {
              (el as HTMLElement).style.boxShadow = '0 0 0 rgba(0,0,0,0)';
              (el as HTMLElement).style.transform = 'translateY(20px)';
            }
          });
          
          anime({
            targets: selector,
            opacity: [0, 1],
            translateY: selector.includes('story') || selector.includes('why') || selector.includes('method') ? [20, 0] : 0,
            duration: 800,
            delay: index * 150,
            easing: 'easeOutQuad',
            update: function(anim: any) {
              const progress = anim.progress;
              const blurValue = 15 * (1 - progress / 100);
              elements.forEach((el) => {
                (el as HTMLElement).style.filter = `blur(${blurValue}px)`;
                
                // Animate shadow for containers
                if (selector.includes('story') || selector.includes('why') || selector.includes('method')) {
                  const shadowOpacity = 0.08 * (progress / 100);
                  const shadowBlur = 20 * (progress / 100);
                  (el as HTMLElement).style.boxShadow = `0 4px ${shadowBlur}px rgba(0,0,0,${shadowOpacity})`;
                }
              });
            }
          });
        });
        
        // Animate the stamp last with elastic effect
        anime({
          targets: '.rubber-stamp',
          opacity: [0, 1],
          rotate: [0, 12],
          scale: [0, 1],
          delay: sections.length * 100 + 200,
          duration: 800,
          easing: 'easeOutElastic(1, .6)'
        });
      });
    }
  }, [visible]);
  // Vercel triangle SVG component
  const VercelTriangle = ({ size = 16 }: { size?: number }) => (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="currentColor"
      className="inline-block"
    >
      <path d="M12 2L2 19.5h20L12 2z" />
    </svg>
  );
  
  return (
    <div 
      className="use-case-panel fixed left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2"
      style={{ 
        opacity: visible ? 1 : 0,
        transition: 'opacity 0.5s ease-out, filter 0.5s ease-out',
        zIndex: 50,
        filter: 'blur(0px)',
        pointerEvents: visible ? 'auto' : 'none',
        display: visible ? 'block' : 'none',
        width: '90%',
        maxWidth: '1200px'
      }}
    >
      <div className="bg-white rounded-lg border border-gray-200 shadow-xl p-8 relative" style={{ backgroundColor: '#fdfcfb' }}>
        {/* Rubber stamp - oval shape */}
        <div 
          className="rubber-stamp absolute top-4 -right-4 transform"
          style={{
            width: '200px',
            height: '90px',
            backgroundColor: 'rgba(239, 68, 68, 0.08)',
            border: '3px double rgba(239, 68, 68, 0.3)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '15px',
            boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.06)',
            zIndex: 60,
            opacity: 0
          }}
        >
          <div className="text-center">
            <p className="text-xs font-bold tracking-wider leading-tight" style={{ 
              color: 'rgba(239, 68, 68, 0.7)',
              fontFamily: 'system-ui, -apple-system, sans-serif',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              textShadow: '0 1px 2px rgba(255,255,255,0.8)'
            }}>
              Too Early For<br />Production Use<br />
              <span className="text-[10px]">Early Adopters Only</span>
            </p>
          </div>
        </div>
        {/* Header */}
        <div className="text-center mb-6 usecase-header">
          <div className="flex items-center justify-center gap-2 mb-2">
            <VercelTriangle size={14} />
            <span className="text-xs uppercase tracking-widest text-gray-500" style={{ fontFamily: 'system-ui, -apple-system, sans-serif', letterSpacing: '0.15em' }}>
              VERCEL SHIP • JUNE 2025
            </span>
          </div>
          <h1 className="text-4xl mb-2 relative inline-block" style={{ fontFamily: 'Crimson Text, Georgia, serif', fontWeight: 400, color: '#2d2d2d' }}>
            <span className="absolute -inset-x-6 -inset-y-1 bg-gradient-to-r from-transparent via-yellow-100 to-transparent opacity-60 blur-sm" />
            <span className="relative">The $10 AI Gateway Experiment</span>
          </h1>
          <p className="text-lg text-gray-600 max-w-xl mx-auto" style={{ fontFamily: 'Crimson Text, Georgia, serif', fontStyle: 'italic' }}>
            Testing Vercel&apos;s latest features with a startup budget
          </p>
        </div>
        
        {/* Three column layout */}
        <div className="grid grid-cols-3 gap-6 mb-6">
          {/* Column 1 - The Story */}
          <div className="space-y-3 usecase-story rounded-lg p-4 bg-white" style={{ backgroundColor: 'rgba(255,255,255,0.5)' }}>
            <h2 className="text-xs uppercase tracking-widest text-gray-500 mb-2 relative inline-block" style={{ fontFamily: 'system-ui, -apple-system, sans-serif', letterSpacing: '0.15em' }}>
              <span className="absolute -inset-x-1 -inset-y-0.5 bg-blue-100 opacity-40 blur-sm" />
              <span className="relative">THE STORY</span>
            </h2>
            <p className="text-sm leading-relaxed" style={{ fontFamily: 'Crimson Text, Georgia, serif', color: '#4a4a4a' }}>
              In June 2025, Vercel announced Ship. A suite of features for AI applications. With budgets tight, we asked: 
            </p>
            <p className="text-base font-medium" style={{ fontFamily: 'Crimson Text, Georgia, serif', color: '#2d2d2d' }}>
              What can $10 actually buy you?
            </p>
            <p className="text-sm leading-relaxed" style={{ fontFamily: 'Crimson Text, Georgia, serif', color: '#4a4a4a' }}>
              Testing three AI models: Grok, Claude, and Gemini. Tracking every token and penny spent.
            </p>
          </div>
          
          {/* Column 2 - Why It Works */}
          <div className="space-y-3 usecase-why rounded-lg p-4 bg-white" style={{ backgroundColor: 'rgba(255,255,255,0.5)' }}>
            <h2 className="text-xs uppercase tracking-widest text-gray-500 mb-2 relative inline-block" style={{ fontFamily: 'system-ui, -apple-system, sans-serif', letterSpacing: '0.15em' }}>
              <span className="absolute -inset-x-1 -inset-y-0.5 bg-green-100 opacity-40 blur-sm" />
              <span className="relative">WHY IT WORKS</span>
            </h2>
            <div className="space-y-2">
              <div className="border-l-2 border-gray-300 pl-3">
                <h3 className="text-sm font-semibold" style={{ fontFamily: 'system-ui, -apple-system, sans-serif', color: '#2d2d2d' }}>
                  Real Constraints
                </h3>
                <p className="text-xs leading-relaxed" style={{ fontFamily: 'Crimson Text, Georgia, serif', color: '#5a5a5a' }}>
                  $10 forces meaningful choices. Just practical developer decisions.
                </p>
              </div>
              <div className="border-l-2 border-gray-300 pl-3">
                <h3 className="text-sm font-semibold" style={{ fontFamily: 'system-ui, -apple-system, sans-serif', color: '#2d2d2d' }}>
                  Active CPU Billing
                </h3>
                <p className="text-xs leading-relaxed" style={{ fontFamily: 'Crimson Text, Georgia, serif', color: '#5a5a5a' }}>
                  Pay only for execution time. Every millisecond counts.
                </p>
              </div>
              <div className="border-l-2 border-gray-300 pl-3">
                <h3 className="text-sm font-semibold" style={{ fontFamily: 'system-ui, -apple-system, sans-serif', color: '#2d2d2d' }}>
                  Multi-Model Reality
                </h3>
                <p className="text-xs leading-relaxed" style={{ fontFamily: 'Crimson Text, Georgia, serif', color: '#5a5a5a' }}>
                  Different models excel at different tasks. Which delivers value?
                </p>
              </div>
            </div>
          </div>
          
          {/* Column 3 - The Method */}
          <div className="space-y-3 usecase-method rounded-lg p-4 bg-white" style={{ backgroundColor: 'rgba(255,255,255,0.5)' }}>
            <h2 className="text-xs uppercase tracking-widest text-gray-500 mb-2 relative inline-block" style={{ fontFamily: 'system-ui, -apple-system, sans-serif', letterSpacing: '0.15em' }}>
              <span className="absolute -inset-x-1 -inset-y-0.5 bg-purple-100 opacity-40 blur-sm" />
              <span className="relative">THE METHOD</span>
            </h2>
            <div className="bg-gray-50 p-3 rounded-md space-y-1.5" style={{ backgroundColor: '#f8f7f6' }}>
              <div className="flex items-start gap-2">
                <span className="text-sm" style={{ fontFamily: 'Crimson Text, Georgia, serif', color: '#8a8a8a' }}>1.</span>
                <p className="text-xs leading-relaxed" style={{ fontFamily: 'Crimson Text, Georgia, serif', color: '#5a5a5a' }}>
                  <strong>Parallel:</strong> All three models simultaneously
                </p>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-sm" style={{ fontFamily: 'Crimson Text, Georgia, serif', color: '#8a8a8a' }}>2.</span>
                <p className="text-xs leading-relaxed" style={{ fontFamily: 'Crimson Text, Georgia, serif', color: '#5a5a5a' }}>
                  <strong>Track:</strong> Tokens, latency, and cost
                </p>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-sm" style={{ fontFamily: 'Crimson Text, Georgia, serif', color: '#8a8a8a' }}>3.</span>
                <p className="text-xs leading-relaxed" style={{ fontFamily: 'Crimson Text, Georgia, serif', color: '#5a5a5a' }}>
                  <strong>Judge:</strong> Automated scoring
                </p>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-sm" style={{ fontFamily: 'Crimson Text, Georgia, serif', color: '#8a8a8a' }}>4.</span>
                <p className="text-xs leading-relaxed" style={{ fontFamily: 'Crimson Text, Georgia, serif', color: '#5a5a5a' }}>
                  <strong>Analyze:</strong> Track against $10 budget
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Feature Availability Section */}
        <div className="border-t border-gray-200 pt-4 pb-3 mb-4 usecase-features">
          <h4 className="text-xs uppercase tracking-widest text-gray-400 mb-3 relative inline-block" style={{ 
            fontFamily: 'system-ui, -apple-system, sans-serif', 
            letterSpacing: '0.15em',
            textShadow: '0 1px 2px rgba(255,255,255,0.8)'
          }}>
            <span className="absolute -inset-x-2 -inset-y-0.5 bg-orange-100 opacity-40 blur-sm" />
            <span className="relative">SHIP 2025 FEATURE AVAILABILITY</span>
          </h4>
          
          <div className="grid grid-cols-3 gap-x-8 gap-y-3">
            {/* Available Features */}
            <div className="space-y-2">
              <h5 className="text-[11px] uppercase tracking-wide text-gray-400 mb-2" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                Generally Available
              </h5>
              <div className="flex items-center gap-2 text-xs">
                <Cpu size={10} strokeWidth={1.5} className="text-gray-500" />
                <span style={{ fontFamily: 'Crimson Text, Georgia, serif', color: '#5a5a5a' }}>
                  Active CPU Pricing
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <Zap size={10} strokeWidth={1.5} className="text-gray-500" />
                <span style={{ fontFamily: 'Crimson Text, Georgia, serif', color: '#5a5a5a' }}>
                  Fluid Compute
                </span>
              </div>
            </div>
            
            {/* Beta Features */}
            <div className="space-y-1.5">
              <h5 className="text-[11px] uppercase tracking-wide text-gray-400 mb-1.5" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                Beta / Limited
              </h5>
              <div className="flex items-center gap-2 text-xs">
                <Cloud size={10} strokeWidth={1.5} className="text-gray-500" />
                <span style={{ fontFamily: 'Crimson Text, Georgia, serif', color: '#5a5a5a' }}>AI Gateway</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <Box size={10} strokeWidth={1.5} className="text-gray-500" />
                <span style={{ fontFamily: 'Crimson Text, Georgia, serif', color: '#5a5a5a' }}>Sandbox</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <GitBranch size={10} strokeWidth={1.5} className="text-gray-500" />
                <span style={{ fontFamily: 'Crimson Text, Georgia, serif', color: '#5a5a5a' }}>Rolling Releases</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <MessageSquare size={10} strokeWidth={1.5} className="text-gray-500" />
                <span style={{ fontFamily: 'Crimson Text, Georgia, serif', color: '#5a5a5a' }}>Queues</span>
              </div>
            </div>
            
            {/* Unavailable Features */}
            <div className="space-y-1.5">
              <h5 className="text-[11px] uppercase tracking-wide text-gray-400 mb-1.5" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                Not Available
              </h5>
              <div className="flex items-center gap-2 text-xs opacity-60">
                <Shield size={10} strokeWidth={1.5} className="text-gray-400" />
                <span className="line-through" style={{ fontFamily: 'Crimson Text, Georgia, serif', color: '#7a7a7a' }}>BotID</span>
              </div>
              <div className="flex items-center gap-2 text-xs opacity-60">
                <User size={10} strokeWidth={1.5} className="text-gray-400" />
                <span className="line-through" style={{ fontFamily: 'Crimson Text, Georgia, serif', color: '#7a7a7a' }}>Vercel Agent</span>
              </div>
              <div className="flex items-center gap-2 text-xs opacity-60">
                <Layers size={10} strokeWidth={1.5} className="text-gray-400" />
                <span className="line-through" style={{ fontFamily: 'Crimson Text, Georgia, serif', color: '#7a7a7a' }}>Microfrontends</span>
              </div>
            </div>
          </div>
          
          <div className="mt-3 pt-2 border-t border-gray-100">
            <p className="text-[10px] text-gray-400 text-center" style={{ fontFamily: 'Crimson Text, Georgia, serif', fontStyle: 'italic' }}>
              Tested on Pro • June 2025 • Contact Vercel for access
            </p>
          </div>
        </div>
        
        {/* Fine Print */}
        <div className="flex gap-4 text-[10px] leading-relaxed mb-4 usecase-finePrint" style={{ color: '#7a7a7a' }}>
          <p style={{ fontFamily: 'Crimson Text, Georgia, serif' }}>
            <span className="font-semibold">Beta:</span> Subject to Vercel&apos;s Public Beta Agreement. Features may change.
          </p>
          <p style={{ fontFamily: 'Crimson Text, Georgia, serif' }}>
            <span className="font-semibold">SDK 5:</span> Pin versions. Breaking changes may occur in minor releases.
          </p>
          <p style={{ fontFamily: 'Crimson Text, Georgia, serif', marginLeft: 'auto' }}>
            Built with ❤️ for shipping fast
          </p>
        </div>
        
        {showLaunchButton && (
          <div className="text-center usecase-launch">
            <button
              onClick={onLaunchCards}
              className="inline-flex items-center gap-3 px-8 py-4 bg-gray-900 text-white rounded transition-all duration-300 hover:bg-black hover:shadow-xl transform hover:-translate-y-0.5"
              style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
            >
              <span className="text-base font-medium tracking-wide">Begin the Experiment</span>
              <svg 
                width="20" 
                height="20" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="1.5" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <polygon points="10 8 16 12 10 16 10 8" fill="currentColor" />
              </svg>
            </button>
            <p className="mt-3 text-xs text-gray-500" style={{ fontFamily: 'Crimson Text, Georgia, serif', fontStyle: 'italic' }}>
              Press to launch the AI models and start tracking costs in real-time
            </p>
          </div>
        )}
      </div>
    </div>
  );
}