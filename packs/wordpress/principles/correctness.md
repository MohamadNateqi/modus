# Correctness — WordPress

Adds to the core `principles/correctness.md`; read that first. Only what is
specific to WordPress and WooCommerce is here.

## Callers you cannot see

- Every `apply_filters()` is a caller. Third-party code can return anything
  through it: another type, an empty array, `null`.
- A `sanitize_callback` passed to `register_setting()` runs on every
  `update_option()` for that option once the setting is registered, not only
  when `options.php` saves the form. Any plugin, migration or WP-CLI command
  that writes the option reaches it.
- `options.php` calls `update_option( $option, null )` when the option is
  missing from the POST, so the sanitize callback can receive `null`.
- Hook callbacks get whatever the hook's caller passes. A type declaration on
  a callback's parameter is a promise about code the plugin does not own.
