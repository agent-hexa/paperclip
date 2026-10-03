# Third-party notices

This directory vendors a third-party plugin. It is not Paperclip-owned code.

## Vendored plugin: Agent Pixels

- **Upstream repository:** <https://github.com/gcampton/Agent-Pixels>
- **Paperclip plugin author:** [gcampton](https://github.com/gcampton) (Garratt Campton)
- **Vendored at commit:** `42de7c5` ("Update README with Twitter follow badge"), branch `main`
- **License status: none declared.** The upstream repository contains no
  `LICENSE` file and GitHub's API reports `license: null`. No license has been
  assigned to this vendored copy, and none is invented here.

## Original work: Pixel-Agents

Agent Pixels is itself a port/derivative of the **Pixel-Agents** VSCode
extension and standalone CLI by **Pablo De Lucca**:

- **Upstream repository:** <https://github.com/pixel-agents-hq/pixel-agents>
- **Author:** Pablo De Lucca
- **License:** MIT

The sprite sheets, furniture art, and office layouts under `public/assets/`
derive from that project. Its MIT license text is reproduced verbatim below as
required by the license's notice condition.

```
MIT License

Copyright (c) 2026 Pablo De Lucca

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

## Unresolved licensing question

The chain is: MIT (Pablo De Lucca) → unlicensed derivative (gcampton's Paperclip
port) → this vendored copy. The MIT grant covers the Pixel-Agents material, but
gcampton added Paperclip-specific work to it without publishing terms for that
addition. This is an open question, not a cleared one. Resolve it with the
plugin author before redistributing this directory outside this repository.