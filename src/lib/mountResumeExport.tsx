import { createRoot, type Root } from 'react-dom/client'
import { ResumeDocument } from '../components/ResumeDocument'
import type { ResolvedResume } from './resolveResume'

/** US Letter at 96 CSS px/in — single source of truth for PDF capture. */
export const LETTER_WIDTH_PX = 816 // 8.5in
export const LETTER_HEIGHT_PX = 1056 // 11in

export type ExportMount = {
  /** The .ats-resume article — full letter paper with skins + printPrefs */
  element: HTMLElement
  host: HTMLElement
  dispose: () => void
}

function waitFrames(n = 2): Promise<void> {
  return new Promise((resolve) => {
    const step = (left: number) => {
      if (left <= 0) resolve()
      else requestAnimationFrame(() => step(left - 1))
    }
    step(n)
  })
}

/**
 * Mount a clean letter-size resume for PDF capture.
 * Same ResumeDocument + design tokens as live preview; ats-pdf-sheet only
 * locks letter geometry (not a second visual system).
 */
export async function mountResumeExportNode(
  view: ResolvedResume,
): Promise<ExportMount> {
  const host = document.createElement('div')
  host.className = 'ats-export-capture'
  host.setAttribute('aria-hidden', 'true')
  host.setAttribute('data-rf-export', '1')

  /*
   * Keep in the layout viewport (not left:-9999). Opacity near 0 hides it
   * from the operator without zeroing paint for html2canvas.
   */
  host.style.cssText = [
    'position:fixed',
    'left:0',
    'top:0',
    `width:${LETTER_WIDTH_PX}px`,
    'margin:0',
    'padding:0',
    'background:#ffffff',
    'opacity:0.02',
    'pointer-events:none',
    'z-index:2147483000',
    'overflow:visible',
    'transform:none',
  ].join(';')

  document.body.appendChild(host)

  const root: Root = createRoot(host)
  root.render(
    <ResumeDocument
      view={view}
      id="ats-export-node"
      className="ats-export-paper ats-pdf-sheet"
      scanMode={false}
    />,
  )

  await waitFrames(3)

  if (document.fonts?.ready) {
    try {
      await Promise.race([
        document.fonts.ready,
        new Promise((r) => setTimeout(r, 500)),
      ])
    } catch {
      /* ignore */
    }
  }
  await new Promise((r) => setTimeout(r, 80))

  const element =
    (host.querySelector('#ats-export-node') as HTMLElement | null) ??
    (host.querySelector('.ats-resume') as HTMLElement | null)

  if (!element) {
    root.unmount()
    host.remove()
    throw new Error('Could not mount resume for PDF export')
  }

  element.classList.remove('ats-scan-mode', 'ats-mini')
  element.classList.add('ats-pdf-sheet')

  // Exact letter width; natural height grows with content (min one page via CSS)
  element.style.cssText = [
    `width:${LETTER_WIDTH_PX}px`,
    'max-width:none',
    'margin:0',
    'box-shadow:none',
    'border:none',
    'background:#ffffff',
    'transform:none',
    'opacity:1',
  ].join(';')

  void element.offsetHeight

  const w = element.offsetWidth
  const h = element.offsetHeight
  if (w < 400 || h < 200) {
    root.unmount()
    host.remove()
    throw new Error(`Resume export node invalid size (${w}×${h})`)
  }

  return {
    element,
    host,
    dispose: () => {
      try {
        root.unmount()
      } catch {
        /* ignore */
      }
      try {
        host.remove()
      } catch {
        /* ignore */
      }
    },
  }
}
