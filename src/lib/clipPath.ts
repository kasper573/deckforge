export function createFrameClipPath(target?: DOMRect) {
  if (!target) {
    return undefined;
  }
  const left = p(target.x);
  const top = p(target.y);
  const right = p(target.x + target.width);
  const bottom = p(target.y + target.height);

  const tl = `${left} ${top}`;
  const tr = `${right} ${top}`;
  const br = `${right} ${bottom}`;
  const bl = `${left} ${bottom}`;
  const join = `${left} 100%`;

  return `polygon(0% 0%, 0% 100%, ${join}, ${tl}, ${tr}, ${br}, ${bl}, ${join}, 100% 100%, 100% 0%)`;
}

const p = (v: number) => `${v}px`;
