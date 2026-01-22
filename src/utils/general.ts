export const isoUtcZeroMs = (d = new Date()) => {
  const copy = new Date(d.getTime());
  copy.setUTCMilliseconds(0); // ensures ".000Z"
  return copy.toISOString();
};

export const genOrderId = () =>
  `${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
