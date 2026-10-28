# Triage signals — WordPress

Add to the signals in `methods/triage.md`. A change that touches any of these
gets the role named.

| Role | Signals |
|---|---|
| **security** | a `wp_ajax_` or `wp_ajax_nopriv_` handler; an `admin_post_` handler; a REST route or its `permission_callback`; a capability, nonce or `is_user_logged_in` check; a `$wpdb` query; `$_GET`, `$_POST`, `$_REQUEST`, `$_COOKIE` or `$_FILES`; output in a template, shortcode or block render; an order, customer or download looked up by ID |
| **correctness** | a hook's priority or arguments changed; a scheduled event; an upgrade or migration routine; HPOS or order storage |
| **architect** | a new hook, filter, option, REST route or shortcode — public surface other plugins can rely on |
