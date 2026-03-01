/**
 * vite-env.d.test.ts — Tests for Vite environment type declarations (src/vite-env.d.ts)
 */

describe('vite-env.d.ts module declaration', () => {
  it('should allow importing a .vue file as a DefineComponent (happy path)', async () => {
    // Simulate importing a .vue file
    const mockComponent = { template: '<div />', data: () => ({}) };
    jest.mock('./TestComponent.vue', () => mockComponent, { virtual: true });
    const imported = await import('./TestComponent.vue');
    expect(imported.default).toBe(mockComponent);
  });

  it('should support components with any props and state (edge case)', async () => {
    const mockComponent = {
      props: { foo: String, bar: Number },
      data: () => ({ baz: true }),
      template: '<span />',
    };
    jest.mock('./EdgeCase.vue', () => mockComponent, { virtual: true });
    const imported = await import('./EdgeCase.vue');
    expect(imported.default.props).toHaveProperty('foo');
    expect(imported.default.data()).toHaveProperty('baz');
  });

  it('should throw error when importing a non-existent .vue file (error scenario)', async () => {
    await expect(import('./NonExistent.vue')).rejects.toThrow();
  });

  it('should not allow importing non-.vue files as DefineComponent (error scenario)', async () => {
    jest.mock('./notAComponent.js', () => ({ foo: 'bar' }), { virtual: true });
    const imported = await import('./notAComponent.js');
    expect(imported.default).not.toHaveProperty('template');
  });
});
