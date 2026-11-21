import { slugify } from './slugify';

describe('slugify', () => {
  it('bỏ dấu tiếng Việt và nối bằng dấu gạch ngang', () => {
    expect(slugify('Nhạc Trẻ')).toBe('nhac-tre');
    expect(slugify('Đồng quê')).toBe('dong-que');
  });

  it('gộp ký tự đặc biệt và bỏ gạch ngang ở hai đầu', () => {
    expect(slugify('  R&B / Soul!! ')).toBe('r-b-soul');
    expect(slugify('Lo-fi  Chill')).toBe('lo-fi-chill');
  });
});
