import { formatDuration } from './format-duration';

describe('formatDuration', () => {
  it('formats seconds as m:ss', () => {
    expect(formatDuration(0)).toBe('0:00');
    expect(formatDuration(84)).toBe('1:24');
    expect(formatDuration(225)).toBe('3:45');
  });

  it('never returns a negative time', () => {
    expect(formatDuration(-5)).toBe('0:00');
  });
});
