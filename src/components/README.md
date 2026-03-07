# NexusAI ERP — Component Conventions

This document defines the UI component patterns for the NexusAI ERP frontend. Follow these guidelines for all new development and when refactoring existing screens.

---

## Sheet vs Dialog

Use the right overlay primitive based on the complexity of the content:

| Criterion | Use `<Dialog>` | Use `<Sheet>` |
|-----------|----------------|---------------|
| **Form size** | ≤5 fields | >5 fields |
| **Action type** | Confirmation / destructive review | Create / edit a full record |
| **Content** | Alert, warning, short prompt | Line-item detail panel, sub-data, multi-step wizard |
| **UX metaphor** | Interrupts flow (modal) | Extends the page (side panel) |

### Examples

```tsx
// ✅ Dialog — short confirmation (2 fields)
<Dialog>
  <DialogContent>
    <DialogHeader><DialogTitle>Delete Record</DialogTitle></DialogHeader>
    <p>Are you sure you want to delete this record?</p>
    <DialogFooter>
      <Button variant="destructive">Delete</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>

// ✅ Sheet — full edit form (>5 fields)
<Sheet>
  <SheetContent side="right" className="w-[600px] sm:max-w-[600px] overflow-y-auto">
    <SheetHeader>
      <SheetTitle>Edit Invoice</SheetTitle>
    </SheetHeader>
    <Form>
      {/* 10+ FormField rows */}
    </Form>
    <SheetFooter>
      <Button type="submit">Save</Button>
    </SheetFooter>
  </SheetContent>
</Sheet>
```

### Anti-patterns to avoid

```tsx
// ❌ Large edit form crammed into a Dialog
<Dialog>
  <DialogContent className="max-w-4xl">  {/* Hint: huge max-w = should be Sheet */}
    <Form>
      {/* 15 FormField rows — this MUST be a Sheet */}
    </Form>
  </DialogContent>
</Dialog>
```

---

## Other Overlay Rules

- **`<AlertDialog>`** — all destructive confirmations (delete, void, cancel). Never use a plain `<Dialog>` for destructive actions.
- **`<Tooltip>`** — all icon button labels. Never use native `title=` attribute.
- **`<PromptDialog>`** — single text-input modals (rename, comment, reason). Never use `window.prompt()`.

---

## Form Standards

- All forms use **react-hook-form** + **Zod** resolver
- All submit buttons must have `disabled={form.formState.isSubmitting}` + `<Loader2 animate-spin>` while submitting
- All form fields use `<FormField>`, `<FormItem>`, `<FormLabel>`, `<FormControl>`, `<FormMessage>` — no bare `<Input>` outside of Form context

---

## Table Standards

- **`<InteractiveSpreadsheet>`** — bulk data entry grids with editable cells
- **`<DataTable>`** — paginated read / select tables
- **`Table`, `TableHeader`, `TableBody`, `TableRow`, `TableHead`, `TableCell`** — static read-only embedded tables (e.g., line-item panels in side sheets)
- ❌ Never use raw `<table>`, `<thead>`, `<tbody>`, `<tr>`, `<th>`, `<td>` HTML elements

---

## Button Standards

- Icon-only buttons **must** have `aria-label`
- Submit buttons **must** have `disabled={form.formState.isSubmitting}` or `disabled={mutation.isPending}`
- Use `<IconButton icon={X} label="Close" />` helper for icon-only actions

---

## Progress Indicators

- Always use `<Progress value={pct} />` from `@/components/ui/progress`
- ❌ Never use `<div style={{ width: `${pct}%` }}>` as a progress fill

---

## Status Display

- Always use `<StatusBadge status={...} />` from `@/components/shared/StatusBadge`
- ❌ Never write local `getStatusColor()` / `getStatusVariant()` helpers inline
