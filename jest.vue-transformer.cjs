'use strict';
/**
 * Custom Jest transformer for Vue Single File Components.
 *
 * Pipeline:
 *   1. @vue/compiler-sfc parses the .vue file and compiles <script setup>
 *   2. TypeScript transpileModule() strips TS types → plain JS ESM
 *   3. @vue/compiler-sfc compiles the <template> to a render function
 *   4. The pieces are assembled into a single ESM module
 *
 * This file MUST be .cjs because Jest loads transformers via require().
 *
 * @since 0.12.0-alpha
 */

const { parse, compileScript } = require('@vue/compiler-sfc');
const ts = require('typescript');
const path = require('path');

/** @param {string} filename */
function getId(filename) {
  return path.basename(filename, '.vue');
}

module.exports = {
  /** Signal that this transformer outputs ESM. */
  supportsStaticESM: true,

  /**
   * @param {string} source - Raw .vue file content
   * @param {string} filename - Absolute file path
   */
  process(source, filename) {
    const id = getId(filename);

    // 1. Parse the SFC
    const { descriptor, errors } = parse(source, { filename, sourceMap: false });
    if (errors.length > 0) {
      throw new Error(
        `[vue-transformer] Parse errors in ${filename}: ${errors.map(e => e.message).join(', ')}`
      );
    }

    // 2. Compile <script setup lang="ts"> with inline template → single component JS
    const script = compileScript(descriptor, {
      id,
      isProd: false,
      inlineTemplate: true,  // Compiles template into the script so they're always connected
      sourceMap: false,
      templateOptions: {
        id,
        filename,
        isProd: false,
        sourceMap: false,
        compilerOptions: { mode: 'module' },
      },
    });

    // 3. Transpile TS → plain JS (strips type annotations, preserves ESM imports)
    const tsResult = ts.transpileModule(script.content, {
      compilerOptions: {
        module: ts.ModuleKind.ESNext,
        target: ts.ScriptTarget.ES2022,
        strict: false,
        sourceMap: false,
      },
      fileName: filename.replace('.vue', '.ts'),
    });

    return { code: tsResult.outputText };
  },
};

