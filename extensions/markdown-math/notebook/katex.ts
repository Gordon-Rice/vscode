/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import type * as markdownIt from 'markdown-it';

const styleHref = import.meta.url.replace(/katex.js$/, 'katex.min.css');

export async function activate(ctx: {
	getRenderer: (id: string) => Promise<any | undefined>
}) {
	const markdownItRenderer = await ctx.getRenderer('markdownItRenderer');
	if (!markdownItRenderer) {
		throw new Error('Could not load markdownItRenderer');
	}

	// Add katex styles to be copied to shadow dom
	const link = document.createElement('link');
	link.rel = 'stylesheet';
	link.classList.add('markdown-style');
	link.href = styleHref;

	// Add same katex style to root document.
	// This is needed for the font to be loaded correctly inside the shadow dom.
	//
	// Seems like https://bugs.chromium.org/p/chromium/issues/detail?id=336876
	const linkHead = document.createElement('link');
	linkHead.rel = 'stylesheet';
	linkHead.href = styleHref;
	document.head.appendChild(linkHead);

	const style = document.createElement('style');
	style.textContent = `
		.katex-error {
			color: var(--vscode-editorError-foreground);
		}
	`;

	// Put Everything into a template
	const styleTemplate = document.createElement('template');
	styleTemplate.classList.add('markdown-style');
	styleTemplate.content.appendChild(style);
	styleTemplate.content.appendChild(link);
	document.head.appendChild(styleTemplate);

	const katex = require('@iktakahiro/markdown-it-katex');
	markdownItRenderer.extendMarkdownIt((md: markdownIt.MarkdownIt) => {
		return md.use(katex);
	});
}
