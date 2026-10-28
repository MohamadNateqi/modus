# Security — WordPress

Adds to the core `principles/security.md`; read that first. Only what is
specific to WordPress and WooCommerce is here.

## Entry points

Untrusted input enters a WordPress plugin at:

REST routes · `wp_ajax_` and `wp_ajax_nopriv_` handlers · `admin_post_`
handlers · form handlers · shortcodes · block render callbacks · webhook and
IPN endpoints · WP-CLI commands · cron callbacks acting on request data ·
anything reading `$_GET`, `$_POST`, `$_REQUEST`, `$_COOKIE`, headers or
uploaded files.

`wp_ajax_nopriv_` and REST routes with a permissive `permission_callback` are
reachable by anyone, logged in or not.

## Authorisation

- `is_user_logged_in()` where `current_user_can()` is meant: being logged in is
  not being allowed.
- The capability on an admin menu page protects the page, not the
  `admin_post_` or AJAX handler behind its form. The handler checks again.
- A nonce (`wp_verify_nonce`, `check_admin_referer`, `check_ajax_referer`) is
  CSRF protection, never an access check.

## Ownership

Order, subscription, download and customer IDs from a request are checked
against the current user before use, e.g. `current_user_can( 'view_order',
$order_id )` or comparing the order's customer ID. Reading by ID with
`wc_get_order()` checks nothing.

## Stored data

Post meta, options, transients and user meta are only as trusted as whoever
could write them. A setting a shop manager can edit is not a constant.

## Escaping and SQL

- Escape for where the value lands: `esc_html`, `esc_attr`, `esc_url`,
  `wp_json_encode` for JavaScript. `esc_url()` on something later
  concatenated into SQL is not escaped.
- `$wpdb->prepare` protects values, not table or column names. A `LIKE`
  pattern needs `$wpdb->esc_like()` before it is prepared.

## Uploads

`$_FILES['type']` is set by the client. Check the real type with
`wp_check_filetype_and_ext()`.
