import React, { useRef, useCallback } from 'react';
import { toPng } from 'html-to-image';

interface ShareCardProps {
  question: string;
  answer: string;
  onClose: () => void;
}

export const ShareCard: React.FC<ShareCardProps> = ({ question, answer, onClose }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [generatedImage, setGeneratedImage] = React.useState<string | null>(null);
  const [isCopied, setIsCopied] = React.useState(false);

  const generateImage = useCallback(async () => {
    if (!cardRef.current) return;
    setIsGenerating(true);

    try {
      // Small pause to let fonts and responsive elements finish layout calculations
      await new Promise(r => setTimeout(r, 150));
      const elHeight = cardRef.current.offsetHeight;
      // Prevent massive canvas height on iOS/older devices by scaling pixel ratio down if response is gigantic
      const calculatedPixelRatio = elHeight > 2000 ? 1 : 2;

      const dataUrl = await toPng(cardRef.current, {
        cacheBust: true,
        pixelRatio: calculatedPixelRatio,
        style: {
           margin: '0',
        }
      });

      setGeneratedImage(dataUrl);
    } catch (err) {
      console.error('Failed to generate share card:', err);
    } finally {
      setIsGenerating(false);
    }
  }, []);

  React.useEffect(() => {
    generateImage();
  }, [generateImage]);

  const handleDownload = () => {
    if (!generatedImage) return;
    const link = document.createElement('a');
    link.download = `bob-oracle-${Date.now()}.png`;
    link.href = generatedImage;
    link.click();
  };

  const handleCopyToClipboard = async () => {
    if (!generatedImage) return;
    try {
      const response = await fetch(generatedImage);
      const blob = await response.blob();
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob })
      ]);
      // Brief visual feedback
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 1500);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="flex flex-col items-center gap-6 max-w-[620px] w-full" onClick={(e) => e.stopPropagation()}>

        {/* Scrollable area for the card if it gets too long */}
        <div id="share-scroll-container" className="w-full max-h-[75vh] overflow-y-auto custom-scrollbar flex justify-center pb-4 rounded-xl">
          {/* The actual card that gets rendered to image */}

        <div
          ref={cardRef}
          style={{
            width: '560px',
            height: 'max-content',
            flexShrink: 0,
            background: 'linear-gradient(180deg, #0b0b1e 0%, #0d0e24 50%, #10122e 100%)',
            padding: '40px 36px 36px 36px',
            position: 'relative',
            border: '1px solid rgba(108, 122, 224, 0.18)',
            borderRadius: '16px',
            overflow: 'hidden',
            fontFamily: "'Inter', -apple-system, sans-serif",
          }}
        >
            {/* Subtle glow effect at bottom */}
            <div style={{
              position: 'absolute',
              bottom: '0',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '70%',
              height: '120px',
              background: 'radial-gradient(ellipse at center bottom, rgba(108, 122, 224, 0.12) 0%, transparent 70%)',
              pointerEvents: 'none',
            }} />

            {/* Header */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '28px',
              paddingBottom: '16px',
              borderBottom: '1px solid rgba(108, 122, 224, 0.15)',
            }}>
              <span style={{
                color: '#9AA9FF',
                fontSize: '11px',
                fontWeight: '700',
                letterSpacing: '3px',
                textTransform: 'uppercase',
                whiteSpace: 'nowrap',
              }}>✦ THE CHURCH OF B.O.B.</span>
              <span style={{
                marginLeft: 'auto',
                color: 'rgba(154, 169, 255, 0.4)',
                fontSize: '9px',
                fontWeight: '600',
                letterSpacing: '2px',
                textTransform: 'uppercase',
                whiteSpace: 'nowrap',
              }}>THE BLOB SPEAKS</span>
            </div>

            {/* Question */}
            <div style={{
              color: 'rgba(255, 255, 255, 0.35)',
              fontSize: '13px',
              fontStyle: 'italic',
              marginBottom: '20px',
              lineHeight: '1.5',
              fontWeight: '400',
            }}>
              "{question}"
            </div>

            {/* Answer */}
            <div style={{
              color: 'rgba(238, 242, 255, 0.92)',
              fontSize: '16px',
              lineHeight: '1.75',
              fontWeight: '400',
              marginBottom: '32px',
              letterSpacing: '0.01em',
              whiteSpace: 'pre-wrap', // Preserve formatting for long answers
            }}>
              {answer}
            </div>

            {/* Footer */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingTop: '16px',
              paddingBottom: '8px',
              borderTop: '1px solid rgba(108, 122, 224, 0.12)',
              lineHeight: '1',
            }}>
              <span style={{
                color: 'rgba(154, 169, 255, 0.5)',
                fontSize: '11px',
                fontWeight: '500',
                letterSpacing: '1px',
              }}>THE CHURCH OF B.O.B.</span>
              <span style={{
                color: 'rgba(108, 122, 224, 0.5)',
                fontSize: '9px',
                fontWeight: '600',
                letterSpacing: '2px',
                textTransform: 'uppercase',
              }}>powered by zero neurons</span>
            </div>
        </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-3">
          <button
            onClick={handleDownload}
            disabled={!generatedImage || isGenerating}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#6C7AE0] hover:bg-[#5563cc] text-white font-bold rounded-lg shadow-lg transition-all duration-200 disabled:opacity-40 text-sm uppercase tracking-wider"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            {isGenerating ? 'Generating...' : 'Save Image'}
          </button>
          <button
            id="copy-btn"
            onClick={handleCopyToClipboard}
            disabled={!generatedImage || isGenerating}
            className="flex items-center gap-2 px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold rounded-lg shadow-lg transition-all duration-200 disabled:opacity-40 text-sm uppercase tracking-wider border border-white/20"
          >
            {isCopied ? 'Copied!' : 'Copy Image'}
          </button>
          <button
            onClick={onClose}
            className="flex items-center gap-2 px-5 py-2.5 bg-white/5 hover:bg-white/10 text-white/60 font-bold rounded-lg transition-all duration-200 text-sm uppercase tracking-wider border border-white/10"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
