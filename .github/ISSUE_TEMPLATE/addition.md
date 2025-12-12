---
name: Software Addition
about: Add new software to NexusAI ERP ecosystem
title: 'Add [SOFTWARE NAME]'
labels: addition
assignees: ''
---

## Software Addition Template

To add new software, create a `software/software-name.yml` file using this template:

```yaml
# Required fields
name: Software Name
website_url: https://example.com
source_code_url: https://github.com/username/repo
description: Brief description of what this software does.
licenses:
  - AGPL-3.0
platforms:
  - Nodejs
tags:
  - Enterprise Resource Planning

# Optional fields
demo_url: https://example.com/demo
```

### Checklist

- [ ] Used kebab-case for filename (e.g., `my-awesome-software.yml`)
- [ ] Removed comments and unused optional fields
- [ ] Software has a valid open-source license
- [ ] Source code is publicly accessible
- [ ] Tags reference existing categories in `tags/` directory
- [ ] Platforms reference existing platforms in `platforms/` directory

### Adding New Tags

If your software requires a new tag/category, add it to `tags/tag-name.yml`:

```yaml
name: Category Name
description: '[Category](https://wikipedia.org/wiki/Category) description with markdown.'
related_tags:
  - Related Tag 1
  - Related Tag 2
```

**Note:** Tags must have a minimum of 3 software projects referencing them.

### Adding New Platforms

Add platforms to `platforms/platform-name.yml`:

```yaml
name: Platform Name
description: "[Platform](https://platform.url/) description with markdown."
```

### Adding New Licenses

Add licenses to `licenses.yml`:

```yaml
- identifier: LICENSE-ID
  name: Full License Name
  url: https://license-url.com
```
