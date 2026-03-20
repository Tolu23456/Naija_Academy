import { Platform, Text, View } from 'react-native';
import { Fonts } from '@/constants/theme';

interface MathTextProps {
  text: string;
  color?: string;
  fontSize?: number;
  style?: object;
}

const MATH_INLINE = /\\\((.+?)\\\)/gs;
const MATH_BLOCK = /\\\[(.+?)\\\]/gs;
const LATEX_SUB = /\\_\{(.+?)\}/g;
const LATEX_SUP = /\\\^\{(.+?)\}/g;
const LATEX_FRAC = /\\frac\{(.+?)\}\{(.+?)\}/g;
const LATEX_SQRT = /\\sqrt\{(.+?)\}/g;

function cleanLatexFallback(expr: string): string {
  return expr
    .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '($1)/($2)')
    .replace(/\\sqrt\{([^}]+)\}/g, '√($1)')
    .replace(/\\_\{([^}]+)\}/g, '_$1')
    .replace(/\\\^\{([^}]+)\}/g, '^$1')
    .replace(/\\times/g, '×')
    .replace(/\\div/g, '÷')
    .replace(/\\pm/g, '±')
    .replace(/\\geq/g, '≥')
    .replace(/\\leq/g, '≤')
    .replace(/\\neq/g, '≠')
    .replace(/\\approx/g, '≈')
    .replace(/\\alpha/g, 'α')
    .replace(/\\beta/g, 'β')
    .replace(/\\gamma/g, 'γ')
    .replace(/\\delta/g, 'δ')
    .replace(/\\theta/g, 'θ')
    .replace(/\\lambda/g, 'λ')
    .replace(/\\mu/g, 'μ')
    .replace(/\\pi/g, 'π')
    .replace(/\\sigma/g, 'σ')
    .replace(/\\omega/g, 'ω')
    .replace(/\\infty/g, '∞')
    .replace(/\\log/g, 'log')
    .replace(/\\ln/g, 'ln')
    .replace(/\\sin/g, 'sin')
    .replace(/\\cos/g, 'cos')
    .replace(/\\tan/g, 'tan')
    .replace(/\\[a-zA-Z]+/g, '')
    .replace(/[{}]/g, '')
    .trim();
}

type Segment = { type: 'text' | 'math'; content: string };

function parseSegments(text: string): Segment[] {
  const segments: Segment[] = [];
  let remaining = text;

  while (remaining.length > 0) {
    const inlineStart = remaining.indexOf('\\(');
    const blockStart = remaining.indexOf('\\[');

    let nextMath = -1;
    let mathType: 'inline' | 'block' = 'inline';

    if (inlineStart !== -1 && (blockStart === -1 || inlineStart < blockStart)) {
      nextMath = inlineStart;
      mathType = 'inline';
    } else if (blockStart !== -1) {
      nextMath = blockStart;
      mathType = 'block';
    }

    if (nextMath === -1) {
      if (remaining.length > 0) segments.push({ type: 'text', content: remaining });
      break;
    }

    if (nextMath > 0) {
      segments.push({ type: 'text', content: remaining.slice(0, nextMath) });
    }

    const closeTag = mathType === 'inline' ? '\\)' : '\\]';
    const openLen = mathType === 'inline' ? 2 : 2;
    const closeStart = remaining.indexOf(closeTag, nextMath + openLen);

    if (closeStart === -1) {
      segments.push({ type: 'text', content: remaining.slice(nextMath) });
      break;
    }

    const mathContent = remaining.slice(nextMath + openLen, closeStart);
    segments.push({ type: 'math', content: mathContent });
    remaining = remaining.slice(closeStart + closeTag.length);
  }

  return segments;
}

function WebMathRenderer({ text, color, fontSize }: { text: string; color: string; fontSize: number }) {
  const segments = parseSegments(text);

  if (typeof window === 'undefined') return null;

  const html = segments
    .map((seg) => {
      if (seg.type === 'text') {
        return `<span style="color:${color};font-family:'Inter',sans-serif;font-size:${fontSize}px;line-height:${fontSize * 1.6}px;">${seg.content.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</span>`;
      }
      try {
        const katex = require('katex');
        return katex.renderToString(seg.content, {
          throwOnError: false,
          errorColor: '#FF4757',
          displayMode: false,
          output: 'html',
        });
      } catch {
        return `<span style="color:${color};font-style:italic;">${cleanLatexFallback(seg.content)}</span>`;
      }
    })
    .join('');

  return (
    <span
      style={{ color, fontSize, lineHeight: `${fontSize * 1.6}px`, fontFamily: 'Inter, sans-serif' } as any}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

export default function MathText({ text, color = '#FFFFFF', fontSize = 16, style = {} }: MathTextProps) {
  if (!text) return null;

  if (Platform.OS === 'web') {
    return (
      <div style={{ display: 'inline', wordBreak: 'break-word', ...style as any }}>
        <WebMathRenderer text={text} color={color} fontSize={fontSize} />
      </div>
    );
  }

  const segments = parseSegments(text);
  return (
    <Text style={[{ color, fontSize, fontFamily: Fonts.regular, lineHeight: fontSize * 1.6 }, style as any]}>
      {segments.map((seg, i) =>
        seg.type === 'text'
          ? <Text key={i}>{seg.content}</Text>
          : <Text key={i} style={{ fontStyle: 'italic' }}>{cleanLatexFallback(seg.content)}</Text>
      )}
    </Text>
  );
}
