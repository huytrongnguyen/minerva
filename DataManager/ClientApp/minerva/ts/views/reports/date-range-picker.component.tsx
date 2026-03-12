import { useEffect, useRef, useState } from 'react';
import { ViewDraft } from 'minerva/core';

// ── Types ─────────────────────────────────────────────────────────────────────

type Preset    = { label: string, start: number, end: number };
type RangeMode = 'rolling' | 'exact';

type PickerDraft = {
  startMode:    RangeMode,
  endMode:      RangeMode,
  startRolling: number,
  endRolling:   number,
  startExact:   string,
  endExact:     string,
};

// ── Presets ───────────────────────────────────────────────────────────────────

const PRESET_ROWS: Preset[][] = [
  [{ label: 'Yesterday',  start: 1,  end: 1  }, { label: 'Today',       start: 0,  end: 0  }],
  [{ label: 'Last Week',  start: 14, end: 8  }, { label: 'This Week',   start: 7,  end: 1  }],
  [{ label: 'Last Month', start: 62, end: 32 }, { label: 'This Month',  start: 31, end: 1  }],
  [{ label: 'Last 7D',    start: 7,  end: 1  }, { label: 'Recent 7D',   start: 8,  end: 2  }],
  [{ label: 'Last 30D',   start: 30, end: 1  }, { label: 'Recent 30D',  start: 31, end: 2  }],
];

const SINGLE_PRESETS: Preset[] = [
  { label: 'Until Yesterday', start: 90, end: 1 },
  { label: 'Until Today',     start: 90, end: 0 },
];

const ALL_PRESETS = [...PRESET_ROWS.flat(), ...SINGLE_PRESETS];

// ── Helpers ───────────────────────────────────────────────────────────────────

function daysAgoFmt(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10).replace(/-/g, '/');
}

function matchPreset(start?: number, end?: number): Preset | undefined {
  if (start == null || end == null) return undefined;
  return ALL_PRESETS.find(p => p.start === start && p.end === end);
}

function isActive(draft: PickerDraft, p: Preset): boolean {
  return draft.startMode === 'rolling' && draft.startRolling === p.start && draft.endRolling === p.end;
}

// ── Component ─────────────────────────────────────────────────────────────────

export type DateRangePickerProps = {
  view:     ViewDraft,
  onChange: (patch: Partial<ViewDraft>) => void,
};

export function DateRangePicker({ view, onChange }: DateRangePickerProps) {
  const [open,  setOpen]  = useState(false);
  const [draft, setDraft] = useState<PickerDraft>(viewToDraft(view));
  const ref = useRef<HTMLDivElement>(null);

  function viewToDraft(v: ViewDraft): PickerDraft {
    return {
      startMode:    v.startExactDate ? 'exact'   : 'rolling',
      endMode:      v.endExactDate   ? 'exact'   : 'rolling',
      startRolling: v.startRollingDate ?? 7,
      endRolling:   v.endRollingDate   ?? 1,
      startExact:   v.startExactDate ?? '',
      endExact:     v.endExactDate   ?? '',
    };
  }

  function openPicker() {
    setDraft(viewToDraft(view));
    setOpen(true);
  }

  // Close on click outside
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  function apply() {
    onChange({
      startRollingDate: draft.startMode === 'rolling' ? draft.startRolling : undefined,
      endRollingDate:   draft.endMode   === 'rolling' ? draft.endRolling   : undefined,
      startExactDate:   draft.startMode === 'exact'   ? draft.startExact   : undefined,
      endExactDate:     draft.endMode   === 'exact'   ? draft.endExact     : undefined,
    });
    setOpen(false);
  }

  function selectPreset(p: Preset) {
    setDraft(d => ({ ...d, startMode: 'rolling', endMode: 'rolling', startRolling: p.start, endRolling: p.end }));
  }

  // Trigger label
  const matched      = matchPreset(view.startRollingDate, view.endRollingDate);
  const triggerStart = view.startExactDate?.replace(/-/g, '/') ?? daysAgoFmt(view.startRollingDate ?? 7);
  const triggerEnd   = view.endExactDate?.replace(/-/g, '/')   ?? daysAgoFmt(view.endRollingDate   ?? 1);
  const triggerLabel = matched?.label ?? `${triggerStart} → ${triggerEnd}`;

  // Picker header preview
  const draftMatched = isActive(draft, ALL_PRESETS.find(p => isActive(draft, p))!) ? matchPreset(draft.startRolling, draft.endRolling) : undefined;
  const previewStart = draft.startMode === 'exact' ? draft.startExact?.replace(/-/g, '/') : daysAgoFmt(draft.startRolling);
  const previewEnd   = draft.endMode   === 'exact' ? draft.endExact?.replace(/-/g, '/')   : daysAgoFmt(draft.endRolling);

  return <div ref={ref} className="date-range-picker position-relative d-inline-block">
    {/* Trigger button */}
    <button className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1" onClick={openPicker}>
      <span className="fa fa-calendar" />
      <span>{triggerLabel}</span>
    </button>

    {/* Picker panel */}
    {open && <div className="date-range-panel shadow border bg-body rounded position-absolute top-100 start-0 mt-1"
        style={{ zIndex: 1050, minWidth: 680 }}>

      {/* Header — live preview of selected range */}
      <div className="border-bottom px-3 py-2">
        <div className="small text-muted">Date Range</div>
        <div className="fw-semibold">
          {draftMatched
            ? <>{draftMatched.label} <span className="fw-normal text-muted">({previewStart} → {previewEnd})</span></>
            : <>{previewStart} → {previewEnd}</>
          }
        </div>
      </div>

      <div className="d-flex">
        {/* Preset shortcuts */}
        <div className="presets border-end p-2 d-flex flex-column gap-1" style={{ minWidth: 220 }}>
          {PRESET_ROWS.map((row, i) => (
            <div key={i} className="d-flex gap-1">
              {row.map(p => (
                <button key={p.label}
                    className={`btn btn-sm flex-fill ${isActive(draft, p) ? 'btn-primary' : 'btn-light'}`}
                    onClick={() => selectPreset(p)}>
                  {p.label}
                </button>
              ))}
            </div>
          ))}
          <hr className="my-1" />
          {SINGLE_PRESETS.map(p => (
            <button key={p.label}
                className={`btn btn-sm w-100 text-start ${isActive(draft, p) ? 'btn-primary' : 'btn-light'}`}
                onClick={() => selectPreset(p)}>
              {p.label}
            </button>
          ))}
        </div>

        {/* Start / End panels */}
        <div className="d-flex flex-fill p-3 gap-3">
          <RangeSidePanel
            label="start"
            mode={draft.startMode}
            rolling={draft.startRolling}
            exact={draft.startExact}
            suffix="days ago →"
            onModeChange={m => setDraft(d => ({ ...d, startMode: m }))}
            onRollingChange={n => setDraft(d => ({ ...d, startRolling: n }))}
            onExactChange={s => setDraft(d => ({ ...d, startExact: s }))}
          />
          <RangeSidePanel
            label="end"
            mode={draft.endMode}
            rolling={draft.endRolling}
            exact={draft.endExact}
            suffix="days ago"
            onModeChange={m => setDraft(d => ({ ...d, endMode: m }))}
            onRollingChange={n => setDraft(d => ({ ...d, endRolling: n }))}
            onExactChange={s => setDraft(d => ({ ...d, endExact: s }))}
          />
        </div>
      </div>

      {/* Footer */}
      <div className="border-top px-3 py-2 d-flex justify-content-end gap-2">
        <button className="btn btn-sm btn-outline-secondary" onClick={() => setOpen(false)}>Cancel</button>
        <button className="btn btn-sm btn-primary" onClick={apply}>Apply</button>
      </div>
    </div>}
  </div>;
}

// ── Side panel (start or end) ─────────────────────────────────────────────────

type RangeSidePanelProps = {
  label:           string,
  mode:            RangeMode,
  rolling:         number,
  exact:           string,
  suffix:          string,
  onModeChange:    (m: RangeMode) => void,
  onRollingChange: (n: number)    => void,
  onExactChange:   (s: string)    => void,
};

function RangeSidePanel({ mode, rolling, exact, suffix, onModeChange, onRollingChange, onExactChange }: RangeSidePanelProps) {
  return <div className="flex-fill">
    <div className="btn-group btn-group-sm w-100 mb-3">
      <button className={`btn ${mode === 'rolling' ? 'btn-secondary active' : 'btn-outline-secondary'}`}
          onClick={() => onModeChange('rolling')}>
        Rolling Date
      </button>
      <button className={`btn ${mode === 'exact' ? 'btn-secondary active' : 'btn-outline-secondary'}`}
          onClick={() => onModeChange('exact')}>
        Exact Date
      </button>
    </div>
    {mode === 'rolling'
      ? <div className="input-group input-group-sm">
          <input type="number" min={0} className="form-control text-center"
              value={rolling} onChange={e => onRollingChange(+e.target.value)} />
          <span className="input-group-text">{suffix}</span>
        </div>
      : <input type="date" className="form-control form-control-sm"
            value={exact} onChange={e => onExactChange(e.target.value)} />
    }
  </div>;
}
