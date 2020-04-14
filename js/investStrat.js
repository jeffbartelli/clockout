export function investStrat() {
  switch (this) {
    case 'conservative': return 0.04; break;
    case 'average': return 0.08; break;
    case 'risky': return 0.10;
  }
}