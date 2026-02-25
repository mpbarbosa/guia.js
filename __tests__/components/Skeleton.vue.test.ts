/**
 * @jest-environment jsdom
 */
import { mount } from '@vue/test-utils';
import Skeleton from '../../src/components/Skeleton.vue';

describe('Skeleton.vue', () => {
  test('default type is text', () => {
    const wrapper = mount(Skeleton);
    expect(wrapper.classes()).toContain('skeleton-text');
  });

  test('has aria-busy=true and aria-label', () => {
    const wrapper = mount(Skeleton);
    expect(wrapper.attributes('aria-busy')).toBe('true');
    expect(wrapper.attributes('aria-label')).toBe('Carregando conteúdo');
  });

  test('applies correct class for heading type', () => {
    const wrapper = mount(Skeleton, { props: { type: 'heading' } });
    expect(wrapper.classes()).toContain('skeleton-heading');
  });

  test('applies inline width style when width prop provided', () => {
    const wrapper = mount(Skeleton, { props: { width: '200px' } });
    expect(wrapper.attributes('style')).toContain('200px');
  });

  test('applies inline height style when height prop provided', () => {
    const wrapper = mount(Skeleton, { props: { type: 'rect', height: '80px' } });
    expect(wrapper.attributes('style')).toContain('80px');
  });

  test('single text skeleton renders no child lines', () => {
    const wrapper = mount(Skeleton, { props: { type: 'text', lines: 1 } });
    expect(wrapper.findAll('.skeleton-line')).toHaveLength(0);
    expect(wrapper.classes()).not.toContain('skeleton-multiline');
  });

  test('multiline text skeleton renders correct number of lines', () => {
    const wrapper = mount(Skeleton, { props: { type: 'text', lines: 3 } });
    expect(wrapper.classes()).toContain('skeleton-multiline');
    expect(wrapper.findAll('.skeleton-line')).toHaveLength(3);
  });

  test('last line in multiline is 60% width', () => {
    const wrapper = mount(Skeleton, { props: { type: 'text', lines: 3 } });
    const lines = wrapper.findAll('.skeleton-line');
    expect(lines[2].attributes('style')).toContain('60%');
  });
});
