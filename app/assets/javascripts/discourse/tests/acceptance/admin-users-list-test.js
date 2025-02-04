import { click, fillIn, visit } from "@ember/test-helpers";
import { test } from "qunit";
import {
  acceptance,
  exists,
  query,
} from "discourse/tests/helpers/qunit-helpers";
import I18n from "discourse-i18n";

acceptance("Admin - Users List", function (needs) {
  needs.user();

  test("lists users", async function (assert) {
    await visit("/admin/users/list/active");

    assert.dom(".users-list .user").exists();
    assert.ok(!exists(".user:nth-of-type(1) .email small"), "escapes email");
  });

  test("searching users with no matches", async function (assert) {
    await visit("/admin/users/list/active");

    await fillIn(".controls.username input", "doesntexist");

    assert.dom(".users-list-container").hasText(I18n.t("search.no_results"));
  });

  test("sorts users", async function (assert) {
    await visit("/admin/users/list/active");

    assert.dom(".users-list .user").exists();

    await click(".users-list .sortable:nth-child(1)");

    assert.ok(
      query(".users-list .user:nth-child(1) .username").innerText.includes(
        "eviltrout"
      ),
      "list should be sorted by username"
    );

    await click(".users-list .sortable:nth-child(1)");

    assert.ok(
      query(".users-list .user:nth-child(1) .username").innerText.includes(
        "discobot"
      ),
      "list should be sorted ascending by username"
    );
  });

  test("toggles email visibility", async function (assert) {
    await visit("/admin/users/list/active");

    assert.dom(".users-list .user").exists();

    await click(".show-emails");

    assert
      .dom(".users-list .user:nth-child(1) .email")
      .hasText("<small>eviltrout@example.com</small>", "shows the emails");

    await click(".hide-emails");

    assert.strictEqual(
      query(".users-list .user:nth-child(1) .email .directory-table__value")
        .innerText,
      "",
      "hides the emails"
    );
  });

  test("switching tabs", async function (assert) {
    const activeUser = "eviltrout";
    const suspectUser = "sam";
    const activeTitle = I18n.t("admin.users.titles.active");
    const suspectTitle = I18n.t("admin.users.titles.new");

    await visit("/admin/users/list/active");

    assert.dom(".admin-title h2").hasText(activeTitle);
    assert.ok(
      query(".users-list .user:nth-child(1) .username").innerText.includes(
        activeUser
      )
    );

    await click('a[href="/admin/users/list/new"]');

    assert.dom(".admin-title h2").hasText(suspectTitle);
    assert.ok(
      query(".users-list .user:nth-child(1) .username").innerText.includes(
        suspectUser
      )
    );

    await click(".users-list .sortable:nth-child(4)");

    assert.dom(".admin-title h2").hasText(suspectTitle);
    assert.ok(
      query(".users-list .user:nth-child(1) .username").innerText.includes(
        suspectUser
      )
    );

    await click('a[href="/admin/users/list/active"]');

    assert.dom(".admin-title h2").hasText(activeTitle);
    assert.ok(
      query(".users-list .user:nth-child(1) .username").innerText.includes(
        activeUser
      )
    );
  });
});
