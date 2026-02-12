---
name: claude-code-skills-guide
description: Reference guide for creating, managing, and sharing Claude Code skills and plugins. Use when creating new skills, converting skills to plugins, or setting up team-wide skill sharing.
disable-model-invocation: true
---

# Claude Code Skills & Plugins Guide

Reference for extending Claude Code with skills and plugins, based on the official documentation at https://code.claude.com/docs/en/skills and https://code.claude.com/docs/en/plugins.

## Skills vs Plugins — When to Use Which

| Approach | Skill names | Best for |
|---|---|---|
| **Standalone skills** (`.claude/` directory) | `/hello` | Personal workflows, project-specific, quick experiments |
| **Plugins** (`.claude-plugin/plugin.json`) | `/plugin-name:hello` | Sharing across repos, distributing to community, versioned releases |

**Start with skills, convert to plugins when ready to distribute across multiple repos.**

## Skills

### What is a Skill?

A `SKILL.md` file with instructions that Claude adds to its toolkit. Claude uses skills when relevant, or you invoke one directly with `/skill-name`.

### Where Skills Live

| Location | Path | Applies to |
|---|---|---|
| Enterprise | Managed settings | All users in org |
| Personal | `~/.claude/skills/<name>/SKILL.md` | All your projects |
| Project | `.claude/skills/<name>/SKILL.md` | This project only |
| Plugin | `<plugin>/skills/<name>/SKILL.md` | Where plugin is enabled |

Priority: enterprise > personal > project. Plugin skills use namespaced names so they never conflict.

### Creating a Skill

```
my-skill/
├── SKILL.md           # Main instructions (required)
├── reference.md       # Detailed docs (loaded when needed)
├── examples/
│   └── sample.md      # Example output
└── scripts/
    └── helper.sh      # Script Claude can execute
```

### SKILL.md Frontmatter Reference

```yaml
---
name: my-skill                    # Display name, becomes /my-skill
description: What it does         # Claude uses this to decide when to load it
argument-hint: [issue-number]     # Shown during autocomplete
disable-model-invocation: true    # Only user can invoke (not Claude)
user-invocable: false             # Only Claude can invoke (hidden from / menu)
allowed-tools: Read, Grep, Glob   # Tools allowed without per-use approval
model: sonnet                     # Model override when skill is active
context: fork                     # Run in isolated subagent context
agent: Explore                    # Which subagent type (when context: fork)
---

Your skill instructions here...
```

All fields are optional. Only `description` is recommended.

### Invocation Control

| Frontmatter | You invoke | Claude invokes | When loaded |
|---|---|---|---|
| (default) | Yes | Yes | Description always in context |
| `disable-model-invocation: true` | Yes | No | Not in context until you invoke |
| `user-invocable: false` | No | Yes | Description always in context |

### String Substitutions

| Variable | Description |
|---|---|
| `$ARGUMENTS` | All arguments passed when invoking |
| `$ARGUMENTS[N]` or `$N` | Specific argument by 0-based index |
| `${CLAUDE_SESSION_ID}` | Current session ID |

### Dynamic Context Injection

Use `` !`command` `` to run shell commands before skill content is sent to Claude:

```yaml
---
name: pr-summary
description: Summarize a pull request
context: fork
agent: Explore
---

## PR context
- PR diff: !`gh pr diff`
- Changed files: !`gh pr diff --name-only`

Summarize this pull request.
```

### Running in a Subagent

Add `context: fork` to run in isolation. The skill content becomes the subagent prompt:

```yaml
---
name: deep-research
description: Research a topic thoroughly
context: fork
agent: Explore
---

Research $ARGUMENTS thoroughly using Glob, Grep, and Read.
```

### Best Practices for Skills

- Keep `SKILL.md` under 500 lines; move detail to supporting files
- Write rich descriptions so Claude knows when to load the skill
- Use `disable-model-invocation: true` for skills with side effects
- Use `allowed-tools` to restrict what Claude can do when skill is active
- Reference supporting files from SKILL.md so Claude knows when to load them
- Commit `.claude/skills/` to version control for team sharing

## Plugins

### What is a Plugin?

A directory with a `.claude-plugin/plugin.json` manifest that can contain skills, agents, hooks, and MCP servers. Skills are namespaced: `/plugin-name:skill-name`.

### Plugin Structure

```
my-plugin/
├── .claude-plugin/
│   └── plugin.json      # Manifest (required)
├── commands/             # Slash commands (user-invocable skills)
├── skills/               # Agent skills (SKILL.md files)
├── agents/               # Custom agent definitions
├── hooks/
│   └── hooks.json        # Event handlers
├── .mcp.json             # MCP server configurations
└── .lsp.json             # LSP server configurations
```

**Important:** Don't put commands/, skills/, agents/ inside `.claude-plugin/`. Only `plugin.json` goes there.

### Plugin Manifest

```json
{
  "name": "my-plugin",
  "description": "What this plugin does",
  "version": "1.0.0",
  "author": {
    "name": "Your Name"
  }
}
```

The `name` field becomes the namespace prefix for all skills in the plugin.

### Testing Plugins Locally

```bash
claude --plugin-dir ./my-plugin
```

Load multiple plugins:

```bash
claude --plugin-dir ./plugin-one --plugin-dir ./plugin-two
```

### Converting Skills to a Plugin

1. Create plugin structure:
   ```bash
   mkdir -p my-plugin/.claude-plugin
   ```

2. Create manifest at `my-plugin/.claude-plugin/plugin.json`

3. Copy existing files:
   ```bash
   cp -r .claude/commands my-plugin/
   cp -r .claude/skills my-plugin/
   ```

4. Test:
   ```bash
   claude --plugin-dir ./my-plugin
   ```

| Before (standalone) | After (plugin) |
|---|---|
| `.claude/skills/review/SKILL.md` | `my-plugin/skills/review/SKILL.md` |
| Invoked as `/review` | Invoked as `/my-plugin:review` |
| Available in one project | Installable via marketplace |

### Plugin Distribution

- Share via Git repository
- Create a plugin marketplace (see https://code.claude.com/docs/en/plugin-marketplaces)
- Team members install with `/plugin install`

## Sharing Strategy

### For a Single Project (Current Approach)
Commit `.claude/skills/` to version control. All engineers who clone the repo get the skills.

### For Multiple Projects
Convert to a plugin. Host in a Git repo. Add as a team marketplace.

### For Organization-Wide
Use managed settings (enterprise) or create an internal plugin marketplace.

## Quick Reference

| Task | Command/Action |
|---|---|
| List available skills | Ask "What skills are available?" |
| Invoke a skill | `/skill-name` or `/skill-name arguments` |
| Check context budget | `/context` |
| Test a plugin locally | `claude --plugin-dir ./path` |
| Install a plugin | `/plugin install <source>` |
| Check Claude Code version | `claude --version` (plugins need 1.0.33+) |

## Official Documentation

- Skills: https://code.claude.com/docs/en/skills
- Plugins: https://code.claude.com/docs/en/plugins
- Plugins reference: https://code.claude.com/docs/en/plugins-reference
- Plugin marketplaces: https://code.claude.com/docs/en/plugin-marketplaces
- Subagents: https://code.claude.com/docs/en/sub-agents
- Hooks: https://code.claude.com/docs/en/hooks
