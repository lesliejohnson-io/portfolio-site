import styles from "./WhatIBring.module.css";

const channels = [
  {
    num: "01",
    tag: "Systems",
    statement: "I think in systems.",
    body: "I design the relationships between people, machines, information, and decisions, then look for where they'll break.",
  },
  {
    num: "02",
    tag: "Behavior",
    statement: "I design for behavior.",
    body: "Interfaces don't just deliver information. They shape attention, confidence, and action. I design for cognitive load, calibrated trust, and decisions made under pressure.",
  },
  {
    num: "03",
    tag: "Delivery",
    statement: "I build and ship.",
    body: "I frame the problem, form hypotheses, prototype, test, and iterate. I measure success by what changes, not by what launches.",
  },
  {
    num: "04",
    tag: "People",
    statement: "I move work through people.",
    body: "Good ideas only matter if they survive engineering tradeoffs, product priorities, and organizational complexity. I align engineering, product, research, and design around a shared understanding of the problem, and I grow the designers doing the work.",
  },
];


export default function WhatIBring() {
  return (
    <section className={styles.bring} aria-labelledby="what-i-bring-heading">
      <h2 id="what-i-bring-heading" className={styles.title}>
        What I bring
      </h2>

      <div className={styles.panel} role="list">
        {/* Corner registration marks */}
        <span className={`${styles.mark} ${styles.tl}`} aria-hidden="true" />
        <span className={`${styles.mark} ${styles.tr}`} aria-hidden="true" />
        <span className={`${styles.mark} ${styles.bl}`} aria-hidden="true" />
        <span className={`${styles.mark} ${styles.br}`} aria-hidden="true" />

        {/* Status rail */}
        <div className={styles.rail} aria-hidden="true">
          <span>HMI</span>
          <span className={styles.railStatus}>
            <span className={styles.dot} />
            4 channels · active
          </span>
        </div>

        {/* Channel grid */}
        <div className={styles.grid}>
          {channels.map((c) => (
            <div className={styles.cell} key={c.num} role="listitem">
              <div className={styles.meta} aria-hidden="true">
                <span className={styles.cellDot} />
                <span className={styles.num}>{c.num}</span>
                <span className={styles.tag}>{c.tag}</span>
              </div>
              <p className={styles.statement}>{c.statement}</p>
              <p className={styles.body}>{c.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
