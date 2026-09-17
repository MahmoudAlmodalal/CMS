import { test, expect, type Locator, type Page } from "@playwright/test";
import { watch, ADMIN_STATE, TAG } from "./check";

test.skip(!process.env.E2E_ADMIN_EMAIL, "E2E_ADMIN_EMAIL unset");
test.use({ storageState: ADMIN_STATE });

/**
 * Every manager is built from the same ManagerKit primitives, so they share one
 * contract: a `#<entity>-form` dialog, a `حفظ <noun>` button that becomes
 * `حفظ التعديلات` when editing, `تعديل` / `حذف` per row, and a Notice that
 * renders role="status" on success and role="alert" on failure.
 *
 * That regularity is why this is a table rather than eight near-identical
 * specs: only what actually differs per manager is listed here.
 */
interface ManagerCase {
  name: string;
  route: string;
  /** The dialog's id, e.g. "artist-form". */
  form: string;
  /** Label on the save button when creating. */
  saveNew: string;
  /** The field whose value identifies the row in the table. */
  titleField: string;
  /** Slug field + the public route it drives, where the entity has a public page. */
  slug?: { field: string; publicPath: (slug: string) => string };
}

const MANAGERS: ManagerCase[] = [
  {
    name: "artists",
    route: "/admin/artists",
    form: "artist-form",
    saveNew: "حفظ الفنان",
    titleField: "#artist-name",
    slug: { field: "#artist-slug", publicPath: (s) => `/artists/${s}` },
  },
  { name: "works",        route: "/admin/works",        form: "work-form",        saveNew: "حفظ العمل",    titleField: "#work-title" },
  { name: "tracks",       route: "/admin/tracks",       form: "track-form",       saveNew: "حفظ المقطع",   titleField: "#track-title" },
  { name: "releases",     route: "/admin/releases",     form: "release-form",     saveNew: "حفظ الإصدار",  titleField: "#release-title" },
  {
    name: "events",
    route: "/admin/events",
    form: "event-form",
    saveNew: "حفظ الفعالية",
    titleField: "#event-title",
  },
  {
    name: "academy",
    route: "/admin/academy",
    form: "course-form",
    saveNew: "حفظ المسار",
    titleField: "#course-title",
    slug: { field: "#course-slug", publicPath: (s) => `/academy/${s}` },
  },
  {
    name: "articles",
    route: "/admin/articles",
    form: "article-form",
    saveNew: "حفظ المقال",
    titleField: "#article-title",
    slug: { field: "#article-slug", publicPath: (s) => `/news/${s}` },
  },
  { name: "testimonials", route: "/admin/testimonials", form: "testimonial-form", saveNew: "حفظ الشهادة",  titleField: "#testimonial-quote" },
];

/** A YouTube link the schema accepts, for the managers that require one. */
const YOUTUBE_URL = "https://www.youtube.com/watch?v=dQw4w9WgXcQ";
const IMAGE_URL = "https://placehold.co/800x1000.png";

function futureDate(days = 30): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

/**
 * Fill every required control the dialog actually renders.
 *
 * Reading the form at runtime rather than hardcoding a payload per manager
 * means a spec does not silently stop covering a field that gets added later:
 * a new required input is filled, and a new required input the schema rejects
 * fails the save assertion loudly.
 */
async function fillRequired(form: Locator, values: Record<string, string> = {}) {
  const controls = form.locator("input:visible, select:visible, textarea:visible");
  for (let i = 0; i < (await controls.count()); i += 1) {
    const control = controls.nth(i);
    const [tag, type, id, required] = await control.evaluate((el) => [
      el.tagName.toLowerCase(),
      (el as HTMLInputElement).type ?? "",
      el.id,
      (el as HTMLInputElement).required,
    ]);

    if (id && id in values) {
      await control.fill(values[id]);
      continue;
    }
    if (!required || type === "checkbox" || type === "radio" || type === "hidden") continue;
    if (await control.inputValue()) continue;

    if (tag === "select") {
      const option = await control.locator("option").nth(1).getAttribute("value");
      if (option) await control.selectOption(option);
      continue;
    }
    if (type === "url") {
      await control.fill(id.includes("youtube") ? YOUTUBE_URL : IMAGE_URL);
    } else if (type === "number") {
      await control.fill("1");
    } else if (type === "date") {
      await control.fill(futureDate());
    } else if (type === "datetime-local") {
      await control.fill(`${futureDate(-1)}T12:00`);
    } else {
      await control.fill(`${TAG} value`);
    }
  }
}

/** Open the create dialog. Managers show a header button, or an empty-state one. */
async function openCreateForm(page: Page, form: string): Promise<Locator> {
  await page.getByRole("button", { name: /إضافة/ }).first().click();
  const dialog = page.locator(`#${form}`);
  await expect(dialog, "the create dialog opens").toBeVisible();
  return dialog;
}

for (const manager of MANAGERS) {
  test.describe.serial(`${manager.name} CRUD`, () => {
    const title = `${TAG} ${manager.name}`;
    const slug = `e2e-test-${manager.name}-${Date.now()}`;

    test("required fields block an empty save", async ({ page }) => {
      await page.goto(manager.route, { waitUntil: "networkidle" });
      const dialog = await openCreateForm(page, manager.form);

      await page.getByRole("button", { name: manager.saveNew }).click();

      // The browser refuses to submit, so the identifying field stays invalid
      // and no row is created.
      const valid = await dialog
        .locator(manager.titleField)
        .evaluate((el: HTMLInputElement | HTMLTextAreaElement) => el.checkValidity());
      expect(valid, `${manager.titleField} must be reported invalid when empty`).toBe(false);
      await expect(page.getByRole("row").filter({ hasText: TAG })).toHaveCount(0);
    });

    test("create → edit → publish → unpublish → delete", async ({ page }) => {
      const problems = watch(page);
      page.on("dialog", (d) => d.accept());
      await page.goto(manager.route, { waitUntil: "networkidle" });

      // ── create ────────────────────────────────────────────────────────────
      const dialog = await openCreateForm(page, manager.form);
      const seed: Record<string, string> = { [manager.titleField.slice(1)]: title };
      if (manager.slug) seed[manager.slug.field.slice(1)] = slug;
      await fillRequired(dialog, seed);
      await page.getByRole("button", { name: manager.saveNew }).click();

      await expect(page.getByRole("alert"), "save must not report an error").toHaveCount(0);
      const row = page.getByRole("row").filter({ hasText: title });
      await expect(row, "the created row appears").toBeVisible({ timeout: 20_000 });

      await page.reload();
      await expect(row, "the row survives a reload, so it reached the database").toBeVisible();

      // ── edit ──────────────────────────────────────────────────────────────
      await row.getByRole("button", { name: "تعديل" }).click();
      const editDialog = page.locator(`#${manager.form}`);
      await expect(editDialog).toBeVisible();
      const edited = `${title} edited`;
      await editDialog.locator(manager.titleField).fill(edited);
      await page.getByRole("button", { name: "حفظ التعديلات" }).click();
      await expect(page.getByRole("status")).toBeVisible({ timeout: 20_000 });

      await page.reload();
      const editedRow = page.getByRole("row").filter({ hasText: edited });
      await expect(editedRow, "the edit persists").toBeVisible();

      // ── publish / unpublish ───────────────────────────────────────────────
      const publishToggle = editedRow.getByRole("button", { name: /نشر|مسودة/ }).first();
      if (await publishToggle.count()) {
        const wasPublished = (await publishToggle.getAttribute("aria-pressed")) === "true";
        if (!wasPublished) {
          await publishToggle.click();
          await expect(publishToggle).toHaveAttribute("aria-pressed", "true", { timeout: 20_000 });
        }

        if (manager.slug) {
          const published = await page.request.get(manager.slug.publicPath(slug));
          expect.soft(published.status(), "a published entity has a public page").toBe(200);
          expect.soft(await published.text(), "the public page shows the title").toContain(edited);
        }

        await publishToggle.click();
        await expect(publishToggle).toHaveAttribute("aria-pressed", "false", { timeout: 20_000 });

        if (manager.slug) {
          expect.soft(
            (await page.request.get(manager.slug.publicPath(slug))).status(),
            "a draft entity is not reachable publicly",
          ).toBe(404);
        }
      }

      // ── delete ────────────────────────────────────────────────────────────
      await editedRow.getByRole("button", { name: "حذف" }).click();
      await expect(editedRow, "the row leaves the list").toHaveCount(0, { timeout: 20_000 });
      await page.reload();
      await expect(page.getByRole("row").filter({ hasText: TAG }), "the deletion persists").toHaveCount(0);

      expect.soft(problems, "console/network errors").toEqual([]);
    });
  });
}
