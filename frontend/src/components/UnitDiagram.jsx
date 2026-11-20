import { DEVICE_TYPE_LABELS } from '../validation.js';

// Схема стійки: U1 знизу, верхній юніт — зверху (як у реальній шафі).
// CSS Grid: кожен юніт = 1 рядок; пристрій займає unitHeight рядків.
export default function UnitDiagram({ capacity, devices, onSlotClick }) {
  const occupied = new Set();
  devices.forEach((d) => {
    for (let u = d.unitPosition; u < d.unitPosition + d.unitHeight; u++) occupied.add(u);
  });

  const rowOf = (unit) => capacity - unit + 1; // номер рядка grid для юніта

  const freeSlots = [];
  for (let u = capacity; u >= 1; u--) {
    if (!occupied.has(u)) freeSlots.push(u);
  }

  return (
    <div className="rack-diagram" style={{ gridTemplateRows: `repeat(${capacity}, 24px)` }}>
      {freeSlots.map((u) => (
        <button
          key={`free-${u}`}
          type="button"
          className="slot slot-free"
          style={{ gridRow: rowOf(u) }}
          onClick={() => onSlotClick?.(u)}
          title={`Вільний юніт ${u} — натисніть, щоб змонтувати пристрій`}
        >
          <span className="slot-num">{u}</span>
          <span className="slot-label">вільно</span>
        </button>
      ))}
      {devices.map((d) => {
        const top = d.unitPosition + d.unitHeight - 1;
        return (
          <div
            key={d.id}
            className={`slot slot-device type-${d.deviceType}`}
            style={{ gridRow: `${rowOf(top)} / span ${d.unitHeight}` }}
            title={`${d.vendorModel} (${d.unitPosition}–${top}U)`}
          >
            <span className="slot-num">{d.unitHeight > 1 ? `${top}–${d.unitPosition}` : d.unitPosition}</span>
            <span className="slot-label">
              {d.vendorModel} · {DEVICE_TYPE_LABELS[d.deviceType]}
            </span>
          </div>
        );
      })}
    </div>
  );
}
