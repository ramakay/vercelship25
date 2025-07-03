'use client';

import { useEffect } from 'react';
import { 
  Layers,
  Monitor,
  Activity,
  FileText,
  AlertTriangle,
  MessageSquare,
  Shield,
  Zap,
  DollarSign,
  X,
  Linkedin,
  GitHub
} from 'react-feather';
import { getAnime } from '../lib/anime-wrapper';

interface ConclusionsCardProps {
  visible?: boolean;
  totalCost?: number;
  onClose?: () => void;
}

export default function ConclusionsCard({ visible = false, totalCost = 0.0368, onClose }: ConclusionsCardProps) {
  useEffect(() => {
    if (visible) {
      getAnime().then((anime) => {
        if (!anime) return;
        
        // Animate card entrance with dramatic effect
        anime({
          targets: '.conclusions-card',
          opacity: [0, 1],
          scale: [0.8, 1],
          translateY: [50, 0],
          duration: 800,
          easing: 'easeOutExpo'
        });
        
        // Stagger animate each section from blur to clear
        const sections = [
          '.conclusions-header',
          '.conclusions-positive-header',
          '.conclusions-positive-item',
          '.conclusions-negative-header', 
          '.conclusions-negative-item',
          '.conclusions-verdict',
          '.conclusions-cost'
        ];
        
        // Add highlight animations
        const highlightElements = document.querySelectorAll('.highlight-sweep');
        highlightElements.forEach((el) => {
          (el as HTMLElement).style.width = '0%';
        });
        
        sections.forEach((selector, index) => {
          const elements = document.querySelectorAll(selector);
          elements.forEach((el) => {
            // Set initial blur
            (el as HTMLElement).style.filter = 'blur(20px)';
            (el as HTMLElement).style.opacity = '0';
          });
          
          anime({
            targets: selector,
            opacity: [0, 1],
            duration: 800,
            delay: anime.stagger(100, { start: index * 150 }),
            easing: 'easeOutQuad',
            update: function(anim: any) {
              const progress = anim.progress;
              const blurValue = 20 * (1 - progress / 100);
              elements.forEach((el) => {
                (el as HTMLElement).style.filter = `blur(${blurValue}px)`;
              });
            }
          });
        });
        
        // Animate highlight sweeps slowly after sections are visible
        anime({
          targets: '.highlight-sweep',
          width: ['0%', '100%'],
          opacity: [0.6, 0],
          duration: 3000, // 3 seconds per highlight
          delay: anime.stagger(1500, { start: 1200 }), // 1.5 second delay between each
          easing: 'easeInOutQuad'
        });
        
        // Animate button glows after everything else
        setTimeout(() => {
          // Add glow class to buttons
          document.querySelectorAll('.cta-button').forEach((button) => {
            button.classList.add('glow-effect');
          });
          
          // Pulse animation for the glow
          anime({
            targets: '.cta-button',
            boxShadow: [
              '0 0 0 rgba(59, 130, 246, 0)',
              '0 0 20px rgba(59, 130, 246, 0.6)',
              '0 0 0 rgba(59, 130, 246, 0)'
            ],
            duration: 2000,
            easing: 'easeInOutQuad',
            delay: anime.stagger(500)
          });
        }, 9000); // Start after 9 seconds
      });
    }
  }, [visible]);
  
  if (!visible) return null;
  
  return (
    <>
      {/* CSS for glow effect */}
      <style jsx>{`
        .glow-effect {
          animation: glow-pulse 2s ease-in-out infinite;
        }
        
        @keyframes glow-pulse {
          0%, 100% {
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
          }
          50% {
            box-shadow: 0 0 25px rgba(59, 130, 246, 0.5), 0 0 35px rgba(59, 130, 246, 0.3);
          }
        }
      `}</style>
      
      {/* Blur overlay */}
      <div 
        className="fixed inset-0"
        style={{
          backgroundColor: 'rgba(0, 0, 0, 0.4)',
          backdropFilter: 'blur(8px)',
          zIndex: 900,
          opacity: 1,
          transition: 'opacity 0.6s ease-out'
        }}
      />
      
      {/* Conclusions card */}
      <div 
        className="conclusions-card fixed left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2"
        style={{ 
          opacity: 0,
          zIndex: 950,
          pointerEvents: 'auto',
          width: '98%',
          maxWidth: '1200px',
          maxHeight: '95vh',
          overflowY: 'auto'
        }}
      >
        <div className="bg-white rounded-lg border border-gray-200 shadow-xl p-6 pb-8 relative" style={{ backgroundColor: '#fdfcfb' }}>
          {/* Close button */}
          {onClose && (
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
              aria-label="Close"
              style={{ zIndex: 1000 }}
            >
              <X size={20} strokeWidth={1.5} className="text-gray-500" />
            </button>
          )}
          
          {/* Header */}
          <div className="text-center mb-6 conclusions-header">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Layers size={12} strokeWidth={1.5} className="text-gray-400" />
              <span className="text-xs uppercase tracking-widest text-gray-500" style={{ fontFamily: 'system-ui, -apple-system, sans-serif', letterSpacing: '0.15em' }}>
                EXPERIMENT RESULTS • JUNE 2025
              </span>
              <Layers size={12} strokeWidth={1.5} className="text-gray-400" />
            </div>
            <h2 className="text-4xl mb-2 relative inline-block" style={{ fontFamily: 'Crimson Text, Georgia, serif', fontWeight: 400, color: '#2d2d2d' }}>
              <span className="absolute -inset-x-6 -inset-y-1 bg-gradient-to-r from-transparent via-purple-100 to-transparent opacity-60 blur-sm" />
              <span className="relative">What We Discovered</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-lg mx-auto" style={{ fontFamily: 'Crimson Text, Georgia, serif', fontStyle: 'italic' }}>
              After {totalCost < 1 ? `$${totalCost.toFixed(4)}` : `$${totalCost.toFixed(2)}`} spent across three AI models
            </p>
          </div>
          
          {/* Conclusions - Two Column Grid */}
          <div className="grid grid-cols-2 gap-6 mb-6">
            {/* Positive findings */}
            <div className="space-y-3">
              <h3 className="text-sm uppercase tracking-widest text-gray-400 mb-3 conclusions-positive-header relative inline-block" style={{ 
                fontFamily: 'system-ui, -apple-system, sans-serif',
                letterSpacing: '0.15em',
                textShadow: '0 1px 2px rgba(255,255,255,0.8)'
              }}>
                <span className="absolute -inset-x-2 -inset-y-0.5 bg-green-100 opacity-30 blur-sm" />
                <span className="relative">WHAT WORKED</span>
              </h3>
              
              <div className="p-3 conclusions-positive-item space-y-2.5">
                <div className="flex items-start gap-2 relative">
                  <div className="highlight-sweep absolute inset-0 bg-gradient-to-r from-green-200 to-transparent rounded" style={{ pointerEvents: 'none' }} />
                  <Monitor size={14} strokeWidth={1.5} className="text-gray-400 mt-0.5 flex-shrink-0 relative z-10" />
                  <div className="relative z-10">
                    <h4 className="text-sm font-semibold uppercase tracking-wide mb-0.5" style={{ fontFamily: 'system-ui, -apple-system, sans-serif', color: '#2d2d2d' }}>
                      Easy AI Gateway Setup
                    </h4>
                    <p className="text-base leading-relaxed" style={{ fontFamily: 'Crimson Text, Georgia, serif', color: '#5a5a5a' }}>
                      Dashboard shows usage and monitoring. Similar to Requesty, OpenRouter offerings.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-2 relative">
                  <div className="highlight-sweep absolute inset-0 bg-gradient-to-r from-green-200 to-transparent rounded" style={{ pointerEvents: 'none' }} />
                  <Activity size={14} strokeWidth={1.5} className="text-gray-400 mt-0.5 flex-shrink-0 relative z-10" />
                  <div className="relative z-10">
                    <h4 className="text-sm font-semibold uppercase tracking-wide mb-0.5" style={{ fontFamily: 'system-ui, -apple-system, sans-serif', color: '#2d2d2d' }}>
                      StreamText API
                    </h4>
                    <p className="text-base leading-relaxed" style={{ fontFamily: 'Crimson Text, Georgia, serif', color: '#5a5a5a' }}>
                      Allows streaming easily, binds in realtime for responsive UX.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-2 relative">
                  <div className="highlight-sweep absolute inset-0 bg-gradient-to-r from-green-200 to-transparent rounded" style={{ pointerEvents: 'none' }} />
                  <FileText size={14} strokeWidth={1.5} className="text-gray-400 mt-0.5 flex-shrink-0 relative z-10" />
                  <div className="relative z-10">
                    <h4 className="text-sm font-semibold uppercase tracking-wide mb-0.5" style={{ fontFamily: 'system-ui, -apple-system, sans-serif', color: '#2d2d2d' }}>
                      Template Examples
                    </h4>
                    <p className="text-base leading-relaxed" style={{ fontFamily: 'Crimson Text, Georgia, serif', color: '#5a5a5a' }}>
                      Lots of templates available for quick starts and learning.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Issues & Missing features */}
            <div className="space-y-3">
              <h3 className="text-sm uppercase tracking-widest text-gray-400 mb-3 conclusions-negative-header relative inline-block" style={{ 
                fontFamily: 'system-ui, -apple-system, sans-serif',
                letterSpacing: '0.15em',
                textShadow: '0 1px 2px rgba(255,255,255,0.8)'
              }}>
                <span className="absolute -inset-x-2 -inset-y-0.5 bg-amber-100 opacity-30 blur-sm" />
                <span className="relative">NEEDS IMPROVEMENT</span>
              </h3>
              
              <div className="p-3 conclusions-negative-item space-y-2.5">
                <div className="flex items-start gap-2 relative">
                  <div className="highlight-sweep absolute inset-0 bg-gradient-to-r from-amber-200 to-transparent rounded" style={{ pointerEvents: 'none' }} />
                  <AlertTriangle size={14} strokeWidth={1.5} className="text-gray-400 mt-0.5 flex-shrink-0 relative z-10" />
                  <div className="relative z-10">
                    <h4 className="text-sm font-semibold uppercase tracking-wide mb-0.5" style={{ fontFamily: 'system-ui, -apple-system, sans-serif', color: '#2d2d2d' }}>
                      Queue Beta Access
                    </h4>
                    <p className="text-base leading-relaxed" style={{ fontFamily: 'Crimson Text, Georgia, serif', color: '#5a5a5a' }}>
                      Limited beta form was broken. Community link does not exist.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-2 relative">
                  <div className="highlight-sweep absolute inset-0 bg-gradient-to-r from-amber-200 to-transparent rounded" style={{ pointerEvents: 'none' }} />
                  <MessageSquare size={14} strokeWidth={1.5} className="text-gray-400 mt-0.5 flex-shrink-0 relative z-10" />
                  <div className="relative z-10">
                    <h4 className="text-sm font-semibold uppercase tracking-wide mb-0.5" style={{ fontFamily: 'system-ui, -apple-system, sans-serif', color: '#2d2d2d' }}>
                      Most Awaited Features
                    </h4>
                    <p className="text-base leading-relaxed" style={{ fontFamily: 'Crimson Text, Georgia, serif', color: '#5a5a5a' }}>
                      Sandbox and Queues still unavailable for testing in our Pro account.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-2 relative">
                  <div className="highlight-sweep absolute inset-0 bg-gradient-to-r from-amber-200 to-transparent rounded" style={{ pointerEvents: 'none' }} />
                  <Zap size={14} strokeWidth={1.5} className="text-gray-400 mt-0.5 flex-shrink-0 relative z-10" />
                  <div className="relative z-10">
                    <h4 className="text-sm font-semibold uppercase tracking-wide mb-0.5" style={{ fontFamily: 'system-ui, -apple-system, sans-serif', color: '#2d2d2d' }}>
                      Gateway Intelligence
                    </h4>
                    <p className="text-base leading-relaxed" style={{ fontFamily: 'Crimson Text, Georgia, serif', color: '#5a5a5a' }}>
                      No indication of intelligent routing or caching that competitors are starting to provide.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-2 relative">
                  <div className="highlight-sweep absolute inset-0 bg-gradient-to-r from-amber-200 to-transparent rounded" style={{ pointerEvents: 'none' }} />
                  <DollarSign size={14} strokeWidth={1.5} className="text-gray-400 mt-0.5 flex-shrink-0 relative z-10" />
                  <div className="relative z-10">
                    <h4 className="text-sm font-semibold uppercase tracking-wide mb-0.5" style={{ fontFamily: 'system-ui, -apple-system, sans-serif', color: '#2d2d2d' }}>
                      Cost & Usage API
                    </h4>
                    <p className="text-base leading-relaxed" style={{ fontFamily: 'Crimson Text, Georgia, serif', color: '#5a5a5a' }}>
                      Gateway costs and credits unavailable via API (confirmed by Vercel). Apps cannot adapt behavior based on usage.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Bottom line */}
          <div className="border-t border-gray-200 pt-4 pb-3 conclusions-verdict">
            <h4 className="text-sm uppercase tracking-widest text-gray-400 mb-3 relative inline-block" style={{ 
              fontFamily: 'system-ui, -apple-system, sans-serif', 
              letterSpacing: '0.15em',
              textShadow: '0 1px 2px rgba(255,255,255,0.8)'
            }}>
              <span className="absolute -inset-x-2 -inset-y-0.5 bg-purple-100 opacity-30 blur-sm" />
              <span className="relative">FINAL VERDICT</span>
            </h4>
            
            <div className="bg-white rounded-md p-4 relative border border-gray-200">
              <div className="highlight-sweep absolute inset-0 bg-gradient-to-r from-purple-200 to-transparent rounded-md" style={{ pointerEvents: 'none' }} />
              <div className="flex items-start gap-3 relative z-10">
                <Shield size={20} strokeWidth={1.5} className="text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-lg leading-relaxed" style={{ fontFamily: 'Crimson Text, Georgia, serif', color: '#4a4a4a' }}>
                    <span className="font-semibold" style={{ color: '#2d2d2d' }}>Solid foundation with room to grow.</span> The AI Gateway delivers on its promise of simplified multi-model orchestration. 
                    Worth exploring for early adopters comfortable with beta features, but production teams should wait for intelligent routing and full feature availability.
                  </p>
                  <p className="text-base mt-2" style={{ fontFamily: 'Crimson Text, Georgia, serif', fontStyle: 'italic', color: '#6a6a6a' }}>
                    Recommendation: Use for prototypes and experiments. Monitor the roadmap for GA releases.
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Cost and CTA Section */}
          <div className="mt-6 pt-4 border-t border-gray-200 conclusions-cost">
            {/* Cost display */}
            <div className="text-center mb-6">
              <p className="text-base" style={{ fontFamily: 'Crimson Text, Georgia, serif', color: '#5a5a5a' }}>
                <DollarSign size={14} strokeWidth={1.5} className="inline mr-1 text-gray-500" />
                <span className="font-semibold">Total experiment cost:</span> ${totalCost.toFixed(4)} of $10.00 budget
              </p>
            </div>
            
            {/* CTA Buttons */}
            <div className="flex gap-4 justify-center">
              <a 
                href="https://github.com/ramakay/vercelship25" 
                target="_blank" 
                rel="noopener noreferrer"
                className="cta-button inline-flex items-center gap-3 px-8 py-4 bg-gray-900 text-white rounded-md transition-all duration-300 hover:bg-black hover:shadow-xl transform hover:-translate-y-0.5"
                style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
              >
                <GitHub size={20} strokeWidth={1.5} />
                <span className="text-base font-medium tracking-wide">View Code on GitHub</span>
              </a>
              
              <a 
                href="https://www.linkedin.com/in/rama1" 
                target="_blank" 
                rel="noopener noreferrer"
                className="cta-button inline-flex items-center gap-3 px-8 py-4 text-white rounded-md transition-all duration-300 hover:shadow-xl transform hover:-translate-y-0.5 hover:brightness-110"
                style={{ fontFamily: 'system-ui, -apple-system, sans-serif', backgroundColor: '#1e293b' }}
              >
                <Linkedin size={20} strokeWidth={1.5} />
                <span className="text-base font-medium tracking-wide">Connect on LinkedIn</span>
              </a>
            </div>
            
            <p className="mt-4 text-xs text-center text-gray-500" style={{ fontFamily: 'Crimson Text, Georgia, serif', fontStyle: 'italic' }}>
              Questions about the experiment? Let&apos;s discuss your Vercel Ship 2025 experience.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}