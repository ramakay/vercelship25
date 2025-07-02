'use client';

import { useEffect } from 'react';
import { 
  CheckCircle, 
  AlertCircle, 
  XCircle,
  MessageCircle,
  Layers,
  TrendingUp,
  Monitor,
  Activity,
  FileText,
  AlertTriangle,
  MessageSquare,
  Shield,
  Zap,
  DollarSign
} from 'react-feather';
import { getAnime } from '../lib/anime-wrapper';

interface ConclusionsCardProps {
  visible?: boolean;
  totalCost?: number;
}

export default function ConclusionsCard({ visible = false, totalCost = 0.0368 }: ConclusionsCardProps) {
  useEffect(() => {
    if (visible) {
      getAnime().then((anime) => {
        if (!anime) return;
        
        // Animate card entrance
        anime({
          targets: '.conclusions-card',
          opacity: [0, 1],
          scale: [0.9, 1],
          duration: 600,
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
            update: function(anim) {
              const progress = anim.progress;
              const blurValue = 20 * (1 - progress / 100);
              elements.forEach((el) => {
                (el as HTMLElement).style.filter = `blur(${blurValue}px)`;
              });
            }
          });
        });
      });
    }
  }, [visible]);
  
  return (
    <div 
      className="conclusions-card fixed left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2"
      style={{ 
        opacity: 0,
        zIndex: 150,
        pointerEvents: visible ? 'auto' : 'none',
        display: visible ? 'block' : 'none',
        width: '90%',
        maxWidth: '800px'
      }}
    >
      <div className="bg-white rounded-lg border border-gray-200 shadow-xl p-8 relative" style={{ backgroundColor: '#fdfcfb' }}>
        {/* Header */}
        <div className="text-center mb-6 conclusions-header">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Layers size={12} strokeWidth={1.5} className="text-gray-400" />
            <span className="text-xs uppercase tracking-widest text-gray-500" style={{ fontFamily: 'system-ui, -apple-system, sans-serif', letterSpacing: '0.15em' }}>
              EXPERIMENT RESULTS • JUNE 2025
            </span>
            <Layers size={12} strokeWidth={1.5} className="text-gray-400" />
          </div>
          <h2 className="text-3xl mb-2 relative inline-block" style={{ fontFamily: 'Crimson Text, Georgia, serif', fontWeight: 400, color: '#2d2d2d' }}>
            <span className="absolute -inset-x-6 -inset-y-1 bg-gradient-to-r from-transparent via-purple-100 to-transparent opacity-60 blur-sm" />
            <span className="relative">What We Discovered</span>
          </h2>
          <p className="text-base text-gray-600 max-w-lg mx-auto" style={{ fontFamily: 'Crimson Text, Georgia, serif', fontStyle: 'italic' }}>
            After {totalCost < 1 ? `$${totalCost.toFixed(4)}` : `$${totalCost.toFixed(2)}`} spent across three AI models
          </p>
        </div>
        
        {/* Conclusions Grid */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {/* Positive findings */}
          <div className="space-y-3">
            <h3 className="text-xs uppercase tracking-widest text-gray-400 mb-3 conclusions-positive-header relative inline-block" style={{ 
              fontFamily: 'system-ui, -apple-system, sans-serif',
              letterSpacing: '0.15em',
              textShadow: '0 1px 2px rgba(255,255,255,0.8)'
            }}>
              <span className="absolute -inset-x-2 -inset-y-0.5 bg-green-100 opacity-30 blur-sm" />
              <span className="relative">WHAT WORKED</span>
            </h3>
            
            <div className="p-3 conclusions-positive-item space-y-2.5">
              <div className="flex items-start gap-2">
                <Monitor size={10} strokeWidth={1.5} className="text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="text-[11px] font-semibold uppercase tracking-wide mb-0.5" style={{ fontFamily: 'system-ui, -apple-system, sans-serif', color: '#2d2d2d' }}>
                    Easy AI Gateway Setup
                  </h4>
                  <p className="text-xs leading-relaxed" style={{ fontFamily: 'Crimson Text, Georgia, serif', color: '#5a5a5a' }}>
                    Dashboard shows usage and monitoring. Similar to Requesty, OpenRouter offerings.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-2">
                <Activity size={10} strokeWidth={1.5} className="text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="text-[11px] font-semibold uppercase tracking-wide mb-0.5" style={{ fontFamily: 'system-ui, -apple-system, sans-serif', color: '#2d2d2d' }}>
                    StreamText API
                  </h4>
                  <p className="text-xs leading-relaxed" style={{ fontFamily: 'Crimson Text, Georgia, serif', color: '#5a5a5a' }}>
                    Allows streaming easily, binds in realtime for responsive UX.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-2">
                <FileText size={10} strokeWidth={1.5} className="text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="text-[11px] font-semibold uppercase tracking-wide mb-0.5" style={{ fontFamily: 'system-ui, -apple-system, sans-serif', color: '#2d2d2d' }}>
                    Template Examples
                  </h4>
                  <p className="text-xs leading-relaxed" style={{ fontFamily: 'Crimson Text, Georgia, serif', color: '#5a5a5a' }}>
                    Lots of templates available for quick starts and learning.
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Issues & Missing features */}
          <div className="space-y-3">
            <h3 className="text-xs uppercase tracking-widest text-gray-400 mb-3 conclusions-negative-header relative inline-block" style={{ 
              fontFamily: 'system-ui, -apple-system, sans-serif',
              letterSpacing: '0.15em',
              textShadow: '0 1px 2px rgba(255,255,255,0.8)'
            }}>
              <span className="absolute -inset-x-2 -inset-y-0.5 bg-amber-100 opacity-30 blur-sm" />
              <span className="relative">NEEDS IMPROVEMENT</span>
            </h3>
            
            <div className="p-3 conclusions-negative-item space-y-2.5">
              <div className="flex items-start gap-2">
                <AlertTriangle size={10} strokeWidth={1.5} className="text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="text-[11px] font-semibold uppercase tracking-wide mb-0.5" style={{ fontFamily: 'system-ui, -apple-system, sans-serif', color: '#2d2d2d' }}>
                    Queue Beta Access
                  </h4>
                  <p className="text-xs leading-relaxed" style={{ fontFamily: 'Crimson Text, Georgia, serif', color: '#5a5a5a' }}>
                    Limited beta form was broken. Community link does not exist.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-2">
                <MessageSquare size={10} strokeWidth={1.5} className="text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="text-[11px] font-semibold uppercase tracking-wide mb-0.5" style={{ fontFamily: 'system-ui, -apple-system, sans-serif', color: '#2d2d2d' }}>
                    Most Awaited Features
                  </h4>
                  <p className="text-xs leading-relaxed" style={{ fontFamily: 'Crimson Text, Georgia, serif', color: '#5a5a5a' }}>
                    Sandbox and Queues still unavailable for testing in our Pro account.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-2">
                <Zap size={10} strokeWidth={1.5} className="text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="text-[11px] font-semibold uppercase tracking-wide mb-0.5" style={{ fontFamily: 'system-ui, -apple-system, sans-serif', color: '#2d2d2d' }}>
                    Gateway Intelligence
                  </h4>
                  <p className="text-xs leading-relaxed" style={{ fontFamily: 'Crimson Text, Georgia, serif', color: '#5a5a5a' }}>
                    No indication of intelligent routing or caching that competitors are starting to provide.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Bottom line */}
        <div className="border-t border-gray-200 pt-4 pb-3 conclusions-verdict">
          <h4 className="text-xs uppercase tracking-widest text-gray-400 mb-3 relative inline-block" style={{ 
            fontFamily: 'system-ui, -apple-system, sans-serif', 
            letterSpacing: '0.15em',
            textShadow: '0 1px 2px rgba(255,255,255,0.8)'
          }}>
            <span className="absolute -inset-x-2 -inset-y-0.5 bg-purple-100 opacity-30 blur-sm" />
            <span className="relative">FINAL VERDICT</span>
          </h4>
          
          <div className="bg-gray-50 rounded-md p-4" style={{ backgroundColor: '#f8f7f6' }}>
            <div className="flex items-start gap-3">
              <Shield size={16} strokeWidth={1.5} className="text-gray-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm leading-relaxed" style={{ fontFamily: 'Crimson Text, Georgia, serif', color: '#4a4a4a' }}>
                  <span className="font-semibold" style={{ color: '#2d2d2d' }}>Solid foundation with room to grow.</span> The AI Gateway delivers on its promise of simplified multi-model orchestration. 
                  Worth exploring for early adopters comfortable with beta features, but production teams should wait for intelligent routing and full feature availability.
                </p>
                <p className="text-xs mt-2" style={{ fontFamily: 'Crimson Text, Georgia, serif', fontStyle: 'italic', color: '#6a6a6a' }}>
                  Recommendation: Use for prototypes and experiments. Monitor the roadmap for GA releases.
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Cost reminder - styled like intro card elements */}
        <div className="mt-4 pt-3 border-t border-gray-100 conclusions-cost">
          <div className="flex items-center justify-between text-[10px]" style={{ color: '#7a7a7a' }}>
            <p style={{ fontFamily: 'Crimson Text, Georgia, serif' }}>
              <DollarSign size={10} strokeWidth={1.5} className="inline mr-1 text-gray-400" />
              <span className="font-semibold">Actual spend:</span> ${totalCost.toFixed(4)} of $10.00 budget
            </p>
            <p style={{ fontFamily: 'Crimson Text, Georgia, serif' }}>
              <span className="font-semibold">Models tested:</span> Grok, Claude, Gemini
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}