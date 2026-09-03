/**
 * Design Law "i" marker. Frame 1 carries Law 01; later frames will each
 * mount their own with a different index/text (and possibly a 3D anchor).
 */
export default function DesignLaw({ index, lines }) {
  return (
    <div className="law">
      <button className="law__icon" aria-label={`Design law ${index}`} type="button">
        i
      </button>
      <div className="law__card" role="note">
        <div className="law__eyebrow">DESIGN LAW {index}</div>
        <p className="law__text">
          {lines.map((l, i) => (
            <span key={i}>
              {l}
              {i < lines.length - 1 && <br />}
            </span>
          ))}
        </p>
      </div>
    </div>
  )
}
