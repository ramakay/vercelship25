'use client';

import { useEffect } from 'react';
import { 
  CheckCircle, 
  AlertCircle, 
  XCircle,
  MessageCircle,
  Layers,
  TrendingUp
} from 'react-feather';
import { getAnime } from '../lib/anime-wrapper';

interface ConclusionsCardProps {
  visible?: boolean;
}

export default function ConclusionsCard({ visible = false }: ConclusionsCardProps) {
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
          '.conclusions-verdict'
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
        
        // Animate the cost badge last
        anime({
          targets: '.cost-badge',
          opacity: [0, 1],
          rotate: [0, 3],
          scale: [0, 1],
          delay: 1200,
          duration: 800,
          easing: 'easeOutElastic(1, .6)'
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
          <h2 className="text-3xl mb-2 relative inline-block" style={{ fontFamily: 'Crimson Text, Georgia, serif', fontWeight: 400, color: '#2d2d2d' }}>
            <span className="absolute -inset-x-6 -inset-y-1 bg-gradient-to-r from-transparent via-purple-100 to-transparent opacity-60 blur-sm" />
            <span className="relative">Experiment Conclusions</span>
          </h2>
          <p className="text-base text-gray-600" style={{ fontFamily: 'Crimson Text, Georgia, serif', fontStyle: 'italic' }}>
            What we learned from spending $10 on Vercel Ship 2025
          </p>
        </div>
        
        {/* Conclusions Grid */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {/* Positive findings */}
          <div className="space-y-3">
            <h3 className="text-xs uppercase tracking-widest text-gray-500 mb-3 flex items-center gap-2 conclusions-positive-header" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
              <CheckCircle size={14} className="text-green-500" />
              WHAT WORKED
            </h3>
            
            <div className="bg-green-50 border border-green-100 rounded-md p-3 conclusions-positive-item">
              <h4 className="text-sm font-semibold mb-1" style={{ fontFamily: 'system-ui, -apple-system, sans-serif', color: '#2d2d2d' }}>
                Easy AI Gateway Setup
              </h4>
              <p className="text-xs leading-relaxed" style={{ fontFamily: 'Crimson Text, Georgia, serif', color: '#5a5a5a' }}>
                Dashboard shows usage and monitoring. Similar to Requesty, OpenRouter offerings.
              </p>
            </div>
            
            <div className="bg-green-50 border border-green-100 rounded-md p-3 conclusions-positive-item">
              <h4 className="text-sm font-semibold mb-1" style={{ fontFamily: 'system-ui, -apple-system, sans-serif', color: '#2d2d2d' }}>
                StreamText API
              </h4>
              <p className="text-xs leading-relaxed" style={{ fontFamily: 'Crimson Text, Georgia, serif', color: '#5a5a5a' }}>
                Allows streaming easily, binds in realtime for responsive UX.
              </p>
            </div>
            
            <div className="bg-green-50 border border-green-100 rounded-md p-3 conclusions-positive-item">
              <h4 className="text-sm font-semibold mb-1" style={{ fontFamily: 'system-ui, -apple-system, sans-serif', color: '#2d2d2d' }}>
                Template Examples
              </h4>
              <p className="text-xs leading-relaxed" style={{ fontFamily: 'Crimson Text, Georgia, serif', color: '#5a5a5a' }}>
                Lots of templates available for quick starts and learning.
              </p>
            </div>
          </div>
          
          {/* Issues & Missing features */}
          <div className="space-y-3">
            <h3 className="text-xs uppercase tracking-widest text-gray-500 mb-3 flex items-center gap-2 conclusions-negative-header" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
              <AlertCircle size={14} className="text-amber-500" />
              NEEDS IMPROVEMENT
            </h3>
            
            <div className="bg-amber-50 border border-amber-100 rounded-md p-3 conclusions-negative-item">
              <h4 className="text-sm font-semibold mb-1" style={{ fontFamily: 'system-ui, -apple-system, sans-serif', color: '#2d2d2d' }}>
                Queue Beta Access
              </h4>
              <p className="text-xs leading-relaxed" style={{ fontFamily: 'Crimson Text, Georgia, serif', color: '#5a5a5a' }}>
                Limited beta form was broken. Community link does not exist.
              </p>
            </div>
            
            <div className="bg-gray-50 border border-gray-200 rounded-md p-3 conclusions-negative-item">
              <h4 className="text-sm font-semibold mb-1" style={{ fontFamily: 'system-ui, -apple-system, sans-serif', color: '#2d2d2d' }}>
                Most Awaited Features
              </h4>
              <p className="text-xs leading-relaxed" style={{ fontFamily: 'Crimson Text, Georgia, serif', color: '#5a5a5a' }}>
                Sandbox and Queues still unavailable for testing in our Pro account.
              </p>
            </div>
            
            <div className="bg-gray-50 border border-gray-200 rounded-md p-3 conclusions-negative-item">
              <h4 className="text-sm font-semibold mb-1" style={{ fontFamily: 'system-ui, -apple-system, sans-serif', color: '#2d2d2d' }}>
                Gateway Intelligence
              </h4>
              <p className="text-xs leading-relaxed" style={{ fontFamily: 'Crimson Text, Georgia, serif', color: '#5a5a5a' }}>
                No indication of intelligent routing or caching that competitors are starting to provide.
              </p>
            </div>
          </div>
        </div>
        
        {/* Bottom line */}
        <div className="border-t border-gray-200 pt-4 conclusions-verdict">
          <div className="bg-gray-50 rounded-md p-4 text-center" style={{ backgroundColor: '#f8f7f6' }}>
            <p className="text-sm font-medium mb-1" style={{ fontFamily: 'system-ui, -apple-system, sans-serif', color: '#2d2d2d' }}>
              Final Verdict
            </p>
            <p className="text-base" style={{ fontFamily: 'Crimson Text, Georgia, serif', color: '#4a4a4a' }}>
              Solid foundation with room to grow. Worth the $10 for early adopters, but waiting for intelligent routing and full feature availability.
            </p>
          </div>
        </div>
        
        {/* Cost reminder */}
        <div className="absolute -bottom-4 -right-4 bg-black text-white px-4 py-2 rounded-md transform rotate-3 cost-badge">
          <p className="text-xs font-mono">Total spent: $10.00</p>
        </div>
      </div>
    </div>
  );
}