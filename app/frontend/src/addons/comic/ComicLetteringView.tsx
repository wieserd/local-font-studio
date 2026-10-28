import React, { useState, useMemo } from 'react';
import {
  Zap,
  MessageSquare,
  Wand2,
  Sparkles,
  Download,
  Copy,
  Plus,
  Check,
  RotateCcw,
  Sliders,
  Type,
  Maximize2
} from 'lucide-react';
import { useFont } from '../../context/FontContext';
import { parseSvgPathToContours, contoursToSvgPath, computeContoursBounds } from '../../utils/contourUtils';
import type { Glyph } from '../../types/font';

type ComicSubTab = 'dialogue' | 'sfx' | 'symbols';

export const ComicLetteringView: React.FC = () => {
  const { project, updateGlyph, updateGlyphsBatch } = useFont();
  const [activeSubTab, setActiveSubTab] = useState<ComicSubTab>('dialogue');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // 1. Dialogue & Crossbar-I State
  const [dialogueText, setDialogueText] = useState("I CAN'T BELIEVE IT! THIS IS REALLY WORKING. WHO AM I?");
  const [balloonShape, setBalloonShape] = useState<'oval' | 'shout' | 'whisper' | 'caption'>('oval');
  const [balloonTail, setBalloonTail] = useState<'bottom-left' | 'bottom-right' | 'top-left' | 'none'>('bottom-left');

  // 2. SFX Generator State
  const [sfxWord, setSfxWord] = useState('KAPOW!');
  const [sfxArc, setSfxArc] = useState(15); // -40 to +40 arc curve
  const [sfxSlant, setSfxSlant] = useState(12); // 0 to 25 deg italic slant
  const [sfxShadowDepth, setSfxShadowDepth] = useState(12); // 3D drop depth
  const [sfxShadowAngle, setSfxShadowAngle] = useState(45); // shadow direction in deg
  const [sfxBurstType, setSfxBurstType] = useState<'star' | 'explosion' | 'speed' | 'none'>('star');
  const [sfxColor, setSfxColor] = useState('#f59e0b');
  const [sfxShadowColor, setSfxShadowColor] = useState('#b45309');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Inspect existing glyph 'I'
  const glyphI = project.glyphs['I'];
  const hasGlyphI = Boolean(glyphI && glyphI.isAssigned && glyphI.svgPath);

  // Crossbar I Rule Transformer:
  // In comics, "I" as a standalone pronoun has crossbars (serifs), while "I" in words is a straight stick.
  const processedDialogue = useMemo(() => {
    // Regex matches isolated pronoun 'I' (e.g. "I ", " I ", "I'M", "I'LL", "I'D", "I'VE")
    return dialogueText.split(/(\bI\b|I'(?:M|LL|VE|D))/gi);
  }, [dialogueText]);

  // Action: Create Plain Stick I from Crossbar I
  const handleGenerateStickI = () => {
    if (!glyphI || !glyphI.svgPath) {
      showToast("Please assign glyph 'I' first.");
      return;
    }

    const contours = parseSvgPathToContours(glyphI.svgPath);
    if (contours.length === 0) return;

    // Calculate vertical bounds and central stem width
    const bounds = computeContoursBounds(contours);
    const stemWidth = Math.max(60, Math.round(bounds.width * 0.45));
    const centerX = bounds.centerX;
    const halfStem = Math.round(stemWidth / 2);

    // Form clean vertical rectangular stick stem without top/bottom crossbars
    const stickContour = [
      { x: centerX - halfStem, y: bounds.minY },
      { x: centerX + halfStem, y: bounds.minY },
      { x: centerX + halfStem, y: bounds.maxY },
      { x: centerX - halfStem, y: bounds.maxY }
    ];

    const newSvg = contoursToSvgPath([stickContour]);
    const advance = glyphI.advanceWidth ? Math.round(glyphI.advanceWidth * 0.75) : 320;

    // Save as pipe '|' (U+007C) or dedicated comic stick glyph
    updateGlyph('|', {
      char: '|',
      name: 'stick-i',
      unicode: 'U+007C',
      isAssigned: true,
      svgPath: newSvg,
      advanceWidth: advance,
      lsb: Math.round(advance * 0.2),
      rsb: Math.round(advance * 0.2),
      contours: [stickContour]
    });

    showToast("✓ Generated clean Stick-I (assigned to '|' U+007C)!");
  };

  // Action: 1-Click Inject Comic Grawlix & Symbols Pack
  const handleInjectComicSymbols = () => {
    const symbolList: Array<{ char: string; name: string; unicode: string; svg: string; advance: number }> = [
      {
        char: '‽',
        name: 'interrobang',
        unicode: 'U+203D',
        svg: 'M 220 700 L 380 700 L 340 450 L 300 450 L 260 450 Z M 270 200 L 330 200 L 330 100 L 270 100 Z',
        advance: 600
      },
      {
        char: '☠',
        name: 'skull-grawlix',
        unicode: 'U+2620',
        svg: 'M 180 550 C 180 650 420 650 420 550 C 420 450 380 400 380 320 L 220 320 C 220 400 180 450 180 550 Z M 220 520 L 260 520 L 260 480 L 220 480 Z M 340 520 L 380 520 L 380 480 L 340 480 Z',
        advance: 600
      },
      {
        char: '▼',
        name: 'speech-tail-down',
        unicode: 'U+25BC',
        svg: 'M 150 550 L 450 550 L 300 150 Z',
        advance: 600
      },
      {
        char: '⚡',
        name: 'radio-whisper-lightning',
        unicode: 'U+26A1',
        svg: 'M 350 700 L 180 350 L 300 350 L 220 100 L 420 420 L 300 420 Z',
        advance: 580
      }
    ];

    const updates = symbolList.map(s => ({
      char: s.char,
      partial: {
        char: s.char,
        name: s.name,
        unicode: s.unicode,
        isAssigned: true,
        svgPath: s.svg,
        advanceWidth: s.advance,
        lsb: 60,
        rsb: 60
      }
    }));

    updateGlyphsBatch(updates);
    showToast(`✓ Injected ${symbolList.length} Comic symbols (Interrobang, Grawlix Skull, Speech Tail, Lightning)!`);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: 'var(--bg-app)', overflow: 'hidden' }}>
      {/* Toast Notification */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          top: '90px',
          right: '20px',
          backgroundColor: '#10b981',
          color: '#ffffff',
          padding: '8px 16px',
          borderRadius: '6px',
          fontSize: '12px',
          fontWeight: 600,
          boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <Check size={14} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Comic Studio Sub-Header */}
      <div style={{
        height: '46px',
        backgroundColor: 'var(--bg-card)',
        borderBottom: '1px solid var(--border)',
        padding: '0 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexShrink: 0
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '28px', height: '28px', borderRadius: '6px', backgroundColor: 'rgba(245, 158, 11, 0.15)', border: '1px solid #f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Zap size={16} color="#f59e0b" />
          </div>
          <span style={{ fontWeight: 700, fontSize: '13px', color: '#f59e0b', letterSpacing: '0.04em' }}>
            COMIC LETTERING & SFX STUDIO
          </span>
          <span className="badge badge-gray" style={{ fontSize: '9px' }}>
            Addon Active
          </span>
        </div>

        {/* Sub-Tab Navigation */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', backgroundColor: 'var(--bg-main)', padding: '3px', borderRadius: '6px', border: '1px solid var(--border)' }}>
          <button
            className={activeSubTab === 'dialogue' ? 'btn-primary' : 'btn-secondary'}
            onClick={() => setActiveSubTab('dialogue')}
            style={{ fontSize: '11px', padding: '4px 10px', gap: '5px' }}
          >
            <MessageSquare size={13} />
            <span>Dialogue & Crossbar-I</span>
          </button>

          <button
            className={activeSubTab === 'sfx' ? 'btn-primary' : 'btn-secondary'}
            onClick={() => setActiveSubTab('sfx')}
            style={{ fontSize: '11px', padding: '4px 10px', gap: '5px' }}
          >
            <Zap size={13} />
            <span>SFX Word Art (BOOM!)</span>
          </button>

          <button
            className={activeSubTab === 'symbols' ? 'btn-primary' : 'btn-secondary'}
            onClick={() => setActiveSubTab('symbols')}
            style={{ fontSize: '11px', padding: '4px 10px', gap: '5px' }}
          >
            <Sparkles size={13} />
            <span>Grawlix & Symbols</span>
          </button>
        </div>
      </div>

      {/* Main Studio Content Area */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {/* ========================================================================= */}
        {/* TAB 1: COMIC DIALOGUE & CROSSBAR-I RULE                                    */}
        {/* ========================================================================= */}
        {activeSubTab === 'dialogue' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '20px' }}>
            {/* Left: Interactive Speech Balloon Preview */}
            <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '10px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <MessageSquare size={16} color="var(--accent)" />
                  <span>Interactive Comic Balloon Simulator</span>
                </div>

                {/* Balloon Shape Picker */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  {(['oval', 'shout', 'whisper', 'caption'] as const).map(shape => (
                    <button
                      key={shape}
                      className={balloonShape === shape ? 'btn-primary' : 'btn-secondary'}
                      onClick={() => setBalloonShape(shape)}
                      style={{ fontSize: '10px', padding: '3px 8px', textTransform: 'capitalize' }}
                    >
                      {shape}
                    </button>
                  ))}
                </div>
              </div>

              {/* Text Input */}
              <textarea
                value={dialogueText}
                onChange={(e) => setDialogueText(e.target.value)}
                placeholder="Type comic dialogue..."
                rows={3}
                style={{
                  width: '100%',
                  backgroundColor: 'var(--bg-main)',
                  border: '1px solid var(--border)',
                  borderRadius: '6px',
                  padding: '10px',
                  fontSize: '13px',
                  fontFamily: 'monospace',
                  color: 'var(--text-main)',
                  resize: 'none'
                }}
              />

              {/* Rendered Speech Bubble Canvas */}
              <div style={{
                minHeight: '260px',
                backgroundColor: '#ffffff',
                backgroundImage: 'radial-gradient(#e5e7eb 1.5px, transparent 1.5px)',
                backgroundSize: '16px 16px',
                borderRadius: '8px',
                border: '2px solid #000000',
                padding: '30px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                boxShadow: '0 10px 25px rgba(0,0,0,0.15)'
              }}>
                {/* The Comic Speech Bubble */}
                <div style={{
                  maxWidth: '85%',
                  backgroundColor: balloonShape === 'caption' ? '#fef08a' : '#ffffff',
                  border: balloonShape === 'whisper'
                    ? '2.5px dashed #000000'
                    : balloonShape === 'shout'
                    ? '3.5px solid #000000'
                    : '3px solid #000000',
                  borderRadius: balloonShape === 'caption'
                    ? '2px'
                    : balloonShape === 'oval'
                    ? '50px'
                    : '14px',
                  padding: '24px 32px',
                  textAlign: 'center',
                  color: '#000000',
                  fontSize: '20px',
                  fontWeight: 700,
                  lineHeight: '1.4',
                  letterSpacing: '0.04em',
                  boxShadow: '4px 4px 0px rgba(0,0,0,1)',
                  position: 'relative'
                }}>
                  {/* Highlighted text showing pronoun 'I' vs stick 'I' */}
                  {processedDialogue.map((chunk, idx) => {
                    const isPronoun = /^(\bI\b|I'(?:M|LL|VE|D))$/i.test(chunk);
                    return isPronoun ? (
                      <span
                        key={idx}
                        style={{
                          backgroundColor: 'rgba(245, 158, 11, 0.25)',
                          borderRadius: '3px',
                          padding: '0 2px',
                          border: '1px dashed #f59e0b'
                        }}
                        title="Pronoun 'I' (Uses Crossbar I)"
                      >
                        {chunk}
                      </span>
                    ) : (
                      <span key={idx}>{chunk}</span>
                    );
                  })}

                  {/* Speech Bubble Tail Arrow */}
                  {balloonShape !== 'caption' && (
                    <div style={{
                      position: 'absolute',
                      bottom: '-18px',
                      left: '35px',
                      width: 0,
                      height: 0,
                      borderLeft: '14px solid transparent',
                      borderRight: '6px solid transparent',
                      borderTop: '18px solid #000000'
                    }} />
                  )}
                </div>
              </div>
            </div>

            {/* Right: The Crossbar 'I' Rule Inspector & Generator */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '10px', padding: '18px' }}>
                <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-main)', marginBottom: '4px' }}>
                  The Comic Lettering "Crossbar-I" Rule
                </div>
                <p style={{ fontSize: '11px', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                  In comic typography, the capital <strong>I with crossbars</strong> (serifs) is reserved strictly for the personal pronoun (<em>"I AM", "I'LL"</em>). In normal words (<em>"THIS", "IS", "BIG"</em>), letterers always use the plain vertical <strong>Stick-I</strong> without crossbars.
                </p>

                {/* Glyph Comparison Box */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '14px' }}>
                  <div style={{ backgroundColor: 'var(--bg-main)', border: '1px solid var(--border)', borderRadius: '6px', padding: '12px', textAlign: 'center' }}>
                    <div style={{ fontSize: '10px', color: 'var(--text-faint)', textTransform: 'uppercase' }}>Pronoun 'I' (Crossbar)</div>
                    <div style={{ fontSize: '36px', fontWeight: 700, margin: '8px 0', fontFamily: 'serif' }}>I</div>
                    <span className="badge badge-green" style={{ fontSize: '9px' }}>Standard U+0041</span>
                  </div>

                  <div style={{ backgroundColor: 'var(--bg-main)', border: '1px solid var(--border)', borderRadius: '6px', padding: '12px', textAlign: 'center' }}>
                    <div style={{ fontSize: '10px', color: 'var(--text-faint)', textTransform: 'uppercase' }}>Word 'I' (Plain Stick)</div>
                    <div style={{ fontSize: '36px', fontWeight: 700, margin: '8px 0', fontFamily: 'sans-serif' }}>|</div>
                    <span className="badge badge-gray" style={{ fontSize: '9px' }}>U+007C / Pipe</span>
                  </div>
                </div>

                {/* 1-Click Action to Generate Stick I */}
                <button
                  className="btn-primary"
                  onClick={handleGenerateStickI}
                  style={{ width: '100%', marginTop: '16px', fontSize: '11px', padding: '8px 12px', gap: '6px', justifyContent: 'center' }}
                >
                  <Wand2 size={14} />
                  <span>Auto-Generate Plain Stick-I (from Glyph 'I')</span>
                </button>
              </div>

              {/* Lettering Tips Card */}
              <div style={{ backgroundColor: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.25)', borderRadius: '10px', padding: '14px' }}>
                <div style={{ fontSize: '11.5px', fontWeight: 700, color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Zap size={13} />
                  <span>Pro Letterer Quick Advice</span>
                </div>
                <ul style={{ fontSize: '10.5px', color: 'var(--text-muted)', margin: '8px 0 0 0', paddingLeft: '16px', lineHeight: '1.4' }}>
                  <li>Comic dialogue fonts are predominantly all-caps or small-caps for maximum legibility at print sizes (7pt - 9pt).</li>
                  <li>Keep line spacing (leading) tight, usually matching cap-height to fit text inside tight speech balloons.</li>
                  <li>Use bold weights for emphasized words rather than italics.</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: SOUND EFFECT (SFX) WORD ART GENERATOR                              */}
        {/* ========================================================================= */}
        {activeSubTab === 'sfx' && (
          <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '20px' }}>
            {/* Left Controls */}
            <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '10px', padding: '18px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Zap size={16} color="#f59e0b" />
                <span>SFX Word Art Controls</span>
              </div>

              {/* Word Input */}
              <div>
                <label style={{ fontSize: '11px', color: 'var(--text-faint)', display: 'block', marginBottom: '4px' }}>
                  Sound Effect Word
                </label>
                <input
                  type="text"
                  value={sfxWord}
                  onChange={(e) => setSfxWord(e.target.value.toUpperCase())}
                  style={{ width: '100%', fontSize: '14px', fontWeight: 800, padding: '6px 10px', letterSpacing: '0.05em' }}
                />
              </div>

              {/* Arc Curvature Slider */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '4px' }}>
                  <span style={{ color: 'var(--text-faint)' }}>Arc Curvature (Bending)</span>
                  <span style={{ fontWeight: 600 }}>{sfxArc}°</span>
                </div>
                <input
                  type="range"
                  min="-35"
                  max="35"
                  value={sfxArc}
                  onChange={(e) => setSfxArc(Number(e.target.value))}
                  style={{ width: '100%' }}
                />
              </div>

              {/* Speed Slant Angle */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '4px' }}>
                  <span style={{ color: 'var(--text-faint)' }}>Dynamic Speed Slant</span>
                  <span style={{ fontWeight: 600 }}>{sfxSlant}°</span>
                </div>
                <input
                  type="range"
                  min="-25"
                  max="30"
                  value={sfxSlant}
                  onChange={(e) => setSfxSlant(Number(e.target.value))}
                  style={{ width: '100%' }}
                />
              </div>

              {/* 3D Extrusion Shadow Depth */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '4px' }}>
                  <span style={{ color: 'var(--text-faint)' }}>3D Shadow Extrusion</span>
                  <span style={{ fontWeight: 600 }}>{sfxShadowDepth}px</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="30"
                  value={sfxShadowDepth}
                  onChange={(e) => setSfxShadowDepth(Number(e.target.value))}
                  style={{ width: '100%' }}
                />
              </div>

              {/* Background Burst FX */}
              <div>
                <label style={{ fontSize: '11px', color: 'var(--text-faint)', display: 'block', marginBottom: '4px' }}>
                  Background Splash FX
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '4px' }}>
                  {(['star', 'explosion', 'speed', 'none'] as const).map(burst => (
                    <button
                      key={burst}
                      className={sfxBurstType === burst ? 'btn-primary' : 'btn-secondary'}
                      onClick={() => setSfxBurstType(burst)}
                      style={{ fontSize: '10px', padding: '4px', textTransform: 'capitalize' }}
                    >
                      {burst}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quick Presets */}
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: '10px' }}>
                <span style={{ fontSize: '10px', color: 'var(--text-faint)', textTransform: 'uppercase' }}>Quick Words:</span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '6px' }}>
                  {['BOOM!', 'WHAM!', 'CRASH!', 'SKRRRT!', 'ZAAAP!', 'KAPOW!', 'THWIP!'].map(preset => (
                    <button
                      key={preset}
                      className="btn-secondary"
                      onClick={() => setSfxWord(preset)}
                      style={{ fontSize: '10px', padding: '2px 6px' }}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Live Graphic SFX Splash Canvas */}
            <div style={{
              backgroundColor: '#111827',
              borderRadius: '10px',
              border: '2px solid #000000',
              position: 'relative',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '380px',
              boxShadow: '0 15px 35px rgba(0,0,0,0.5)'
            }}>
              {/* Halftone / Comic Dot Grid Background */}
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundImage: 'radial-gradient(#374151 2px, transparent 2px)',
                backgroundSize: '20px 20px',
                opacity: 0.6
              }} />

              {/* Background Explosion Starburst Graphic */}
              {sfxBurstType === 'star' && (
                <svg
                  viewBox="0 0 400 400"
                  style={{ position: 'absolute', width: '380px', height: '380px', animation: 'spin 40s linear infinite' }}
                >
                  <polygon
                    points="200,10 230,130 350,70 280,180 390,200 280,240 360,330 240,300 200,390 160,300 40,330 120,240 10,200 120,180 50,70 170,130"
                    fill="#ef4444"
                    stroke="#ffffff"
                    strokeWidth="4"
                  />
                </svg>
              )}

              {/* Stylized Word Art Text with Arc, Slant and 3D Extrusion */}
              <div style={{
                position: 'relative',
                zIndex: 2,
                transform: `rotate(${-sfxArc * 0.3}deg) skewX(${-sfxSlant}deg)`,
                fontSize: '64px',
                fontWeight: 900,
                letterSpacing: '0.08em',
                color: sfxColor,
                textTransform: 'uppercase',
                textShadow: Array.from({ length: sfxShadowDepth }).map((_, i) => (
                  `${i + 1}px ${i + 1}px 0px ${sfxShadowColor}`
                )).concat(['0 0 10px rgba(0,0,0,0.8)']).join(', '),
                WebkitTextStroke: '3px #000000',
                userSelect: 'none',
                filter: 'drop-shadow(6px 6px 0px #000000)'
              }}>
                {sfxWord}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: GRAWLIX & COMIC DINGBATS PACK                                      */}
        {/* ========================================================================= */}
        {activeSubTab === 'symbols' && (
          <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '10px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Sparkles size={16} color="#f59e0b" />
                  <span>Comic Grawlix & Dialogue Symbols Pack</span>
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-faint)', marginTop: '2px' }}>
                  One-click injection of essential comic symbols (interrobangs, curse symbols, balloon tails, sound bursts).
                </div>
              </div>

              <button
                className="btn-primary"
                onClick={handleInjectComicSymbols}
                style={{ fontSize: '11px', padding: '6px 12px', gap: '6px' }}
              >
                <Plus size={14} />
                <span>Inject Symbols Pack to Font Project</span>
              </button>
            </div>

            {/* Symbols Cards Showcase */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px', marginTop: '10px' }}>
              <div style={{ backgroundColor: 'var(--bg-main)', border: '1px solid var(--border)', borderRadius: '8px', padding: '16px', textAlign: 'center' }}>
                <div style={{ fontSize: '32px', fontWeight: 800, margin: '6px 0' }}>‽</div>
                <div style={{ fontSize: '11px', fontWeight: 600 }}>Interrobang</div>
                <div style={{ fontSize: '9.5px', color: 'var(--text-faint)' }}>Surprise + Question (U+203D)</div>
              </div>

              <div style={{ backgroundColor: 'var(--bg-main)', border: '1px solid var(--border)', borderRadius: '8px', padding: '16px', textAlign: 'center' }}>
                <div style={{ fontSize: '32px', fontWeight: 800, margin: '6px 0' }}>☠</div>
                <div style={{ fontSize: '11px', fontWeight: 600 }}>Grawlix Skull</div>
                <div style={{ fontSize: '9.5px', color: 'var(--text-faint)' }}>Comic profanity filter (U+2620)</div>
              </div>

              <div style={{ backgroundColor: 'var(--bg-main)', border: '1px solid var(--border)', borderRadius: '8px', padding: '16px', textAlign: 'center' }}>
                <div style={{ fontSize: '32px', fontWeight: 800, margin: '6px 0' }}>▼</div>
                <div style={{ fontSize: '11px', fontWeight: 600 }}>Speech Balloon Tail</div>
                <div style={{ fontSize: '9.5px', color: 'var(--text-faint)' }}>Pointer to character (U+25BC)</div>
              </div>

              <div style={{ backgroundColor: 'var(--bg-main)', border: '1px solid var(--border)', borderRadius: '8px', padding: '16px', textAlign: 'center' }}>
                <div style={{ fontSize: '32px', fontWeight: 800, margin: '6px 0' }}>⚡</div>
                <div style={{ fontSize: '11px', fontWeight: 600 }}>Radio / Whisper Zap</div>
                <div style={{ fontSize: '9.5px', color: 'var(--text-faint)' }}>Electric broadcast balloon (U+26A1)</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
