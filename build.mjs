#!/usr/bin/env node
/**
 * build.mjs — 生成可发布产物
 *
 *   main.user.js                                   -> GreasyFork / GitHub 上架用（@require 词库，体积小）
 *   dist/github-chinese-selfcontained.user.js      -> 自包含版（词库内联，离线/被墙可用）
 *
 * 用法： node build.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const VERSION = '1.0.0';
const REPO = 'https://github.com/FVsonar/github-chinese';
const RAW = 'https://raw.githubusercontent.com/FVsonar/github-chinese/main';
const ICON = 'https://github.githubassets.com/pinned-octocat.svg';

const upstream = fs.readFileSync(path.join(ROOT, 'src', 'main.user.js'), 'utf8');
const locals = fs.readFileSync(path.join(ROOT, 'locals.js'), 'utf8');

const headerMatch = upstream.match(/^\/\/ ==UserScript==[\s\S]*?\/\/ ==\/UserScript==\n/);
if (!headerMatch) throw new Error('src/main.user.js: 未找到 userscript 头');
const body = upstream.slice(headerMatch[0].length);
const anchor = "'use strict';";
if (body.indexOf(anchor) < 0) throw new Error("src/main.user.js: 未找到 'use strict' 锚点");

function header({ requireLocals }) {
  return [
    '// ==UserScript==',
    '// @name         GitHub汉化脚本',
    '// @name:en      GitHub Chinese Localization',
    '// @namespace    ' + REPO,
    '// @version      ' + VERSION,
    '// @description  中文化 GitHub 界面：内置完整词库，覆盖新版 React 顶栏、仓库导航、议题/拉取请求/发布等页面',
    '// @description:en  Localize the GitHub web UI into Chinese (zh-CN)',
    '// @author       FVsonar',
    '// @license      GPL-3.0',
    '// @icon         ' + ICON,
    '// @homepageURL  ' + REPO,
    '// @supportURL   ' + REPO + '/issues',
    '// @downloadURL  ' + RAW + '/main.user.js',
    '// @updateURL    ' + RAW + '/main.user.js',
    ...(requireLocals ? ['// @require      ' + RAW + '/locals.js'] : []),
    '// @match        https://github.com/*',
    '// @match        https://gist.github.com/*',
    '// @run-at       document-start',
    '// @grant        GM_addStyle',
    '// @grant        GM_xmlhttpRequest',
    '// @grant        GM_getValue',
    '// @grant        GM_setValue',
    '// @grant        GM_registerMenuCommand',
    '// @grant        GM_unregisterMenuCommand',
    '// @grant        GM_notification',
    '// @connect      fanyi.iflyrec.com',
    '// ==/UserScript==',
    '',
  ].join('\n');
}

// 1) GreasyFork / GitHub 版本：@require 词库
const slim = header({ requireLocals: true }) + body;

// 2) 自包含版本：词库内联
const inline = '\n    /* ===== locals.js 词库（内联，来自 maboloshi/github-chinese, GPL-3.0）===== */\n'
  + locals
  + '\n    /* ===== locals.js 结束 ===== */\n';
const i = body.indexOf(anchor) + anchor.length;
const allInOne = header({ requireLocals: false }) + body.slice(0, i) + inline + body.slice(i);

const outputs = [
  [path.join(ROOT, 'main.user.js'), slim, 'slim'],
  [path.join(ROOT, 'dist', 'github-chinese-selfcontained.user.js'), allInOne, 'self-contained'],
];

for (const [file, content, label] of outputs) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content, 'utf8');
  execFileSync(process.execPath, ['--check', file], { stdio: 'inherit' });
  console.log('✓ ' + label + '  ' + path.relative(ROOT, file) + '  ' + Buffer.byteLength(content, 'utf8') + ' bytes');
}
console.log('build done (v' + VERSION + ')');
