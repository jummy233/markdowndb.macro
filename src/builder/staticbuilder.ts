// module for generating static articles.

import {CallExpression, NewExpression, MemberExpression, ArrowFunctionExpression} from '@babel/types';
import {scopedAST, varAST, setMapAST, mdAST, getTagIdMap, getTimeIdMap} from './astbuilder';
import * as babelcore from '@babel/core';
import path from 'path';
import fs from 'fs';
import {Markdown} from 'src';

// top level AST Builder from static mode.
// it builds Map<number, string>, where url is the url of the folder.
// These provides enough information for mehtod `fetchStatic` in
// MarkdownMap to send the request.
export function buildMarkdownDBAST(markdowns: Array<Markdown>, url: string): CallExpression {
  const t = babelcore.types;
  const tagIndex = getTagIdMap(markdowns);
  const timeIndex = getTimeIdMap(markdowns);
}

function buildMarkdownMapAST(markdowns: Array<Markdown>, url: string): NewExpression {
  const t = babelcore.types;
  const mdarryExprs = t.arrayExpression()
  return t.newExpression(t.identifier('Map'), []);
}

namespace Files {
  // parse markdowns into html to pubDir
  export function toPublic(markdowns: Array<Markdown>, pubDir: string) {
    const makeFile = publicDirReader(pubDir);
    markdowns.forEach(m => {makeFile(m);});
  }

  type MakeFile = (markdown: Markdown) => void;

  const publicDirReader = (pubdir: string): MakeFile =>
    (markdown: Markdown) => {
      const p = path.join(path.resolve(pubdir), idToFileName(markdown.header.id));
      fs.writeFileSync(p, markdown.content);
    }

  function idToFileName(id: number): string {
    return id.toString() + '.html';
  }
}
