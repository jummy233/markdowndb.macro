import {createMacro, MacroParams} from 'babel-plugin-macros';
import {NodePath, Node} from '@babel/core';
import * as Builder from './builder/builder';
import {MarkdownDBMode} from './types';

export default createMacro(markdowndbMacros);

function markdowndbMacros({references, state, babel}: MacroParams) {
  references.default.forEach(referencePath => {
    if (referencePath.parentPath.type == "CallExpression") {
      requiremarkdowndb({referencePath, state, babel});
    } else {
      throw new Error(`This is not supported ` +
        `${referencePath.findParent(babel.types.isExpression).getSource()}`);
    }
  });
};

// db will represented as json string.
const requiremarkdowndb = ({referencePath, state, babel}:
  Omit<MacroParams, 'references'> & {referencePath: NodePath<Node>}) => {
  const filename = state.file.opts.filename;
  const t = babel.types;
  const callExpressionPath = referencePath.parentPath;
  if (typeof (filename) != "string") {
    throw new Error(`babel filename doesn't exist`);
  }

  const args = callExpressionPath.get("arguments") as Array<NodePath<Node>>
  const markdownDir: string | undefined = args[0]?.evaluate()?.value;
  const mode: MarkdownDBMode | undefined = args[1]?.evaluate()?.value;

  if (markdownDir === undefined) {
    throw new Error(`There is a problem evaluating the argument `
      + `${callExpressionPath.getSource()}.`
      + ` Please make sure the value is known at compile time`);
  }

  const content = (() => {
    switch (mode) {
      case "static":
        return Builder.build(markdownDir, "static");
      case "runtime":
        return Builder.build(markdownDir, "runtime");
      case undefined:
        return Builder.build(markdownDir, "runtime");
      // new mode might be added later.
      default:
        throw new Error(`unknown mode {mode}`);
    }
  })();

  referencePath.parentPath.replaceWith(t.expressionStatement(content));
};
