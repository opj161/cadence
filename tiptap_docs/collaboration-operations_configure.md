---
title: Configure runtime | Tiptap Collaboration Docs
source_url: https://tiptap.dev/docs/collaboration/operations/configure#page-title
twitter:card: summary_large_image
twitter:image: https://tiptap.dev/docs/api/og?title=Runtime%20configuration&category=Collaboration
og:description: Dynamically adjust collaboration settings in your app with straightforward API calls. Adjust secrets, webhook URLs, and more.
ogTitle: Configure runtime | Tiptap Collaboration Docs
og:image: https://tiptap.dev/docs/api/og?title=Runtime%20configuration&category=Collaboration
favicon: https://tiptap.dev/docs/favicon.png
ogImage: https://tiptap.dev/docs/api/og?title=Runtime%20configuration&category=Collaboration
docsearch:version: 2.x
language: en
ogDescription: Dynamically adjust collaboration settings in your app with straightforward API calls. Adjust secrets, webhook URLs, and more.
og:locale: en_US
og:url: https://tiptap.dev/docs/collaboration/operations/configure
og:type: website
twitter:title: Configure runtime | Tiptap Collaboration Docs
robots: index, follow
viewport: width=device-width, initial-scale=1
og:title: Configure runtime | Tiptap Collaboration Docs
og:image:height: 630
twitter:description: Dynamically adjust collaboration settings in your app with straightforward API calls. Adjust secrets, webhook URLs, and more.
ogUrl: https://tiptap.dev/docs/collaboration/operations/configure
ogLocale: en_US
og:image:width: 1200
description: Dynamically adjust collaboration settings in your app with straightforward API calls. Adjust secrets, webhook URLs, and more.
scrapeId: dbab5214-5542-4998-90ce-dffa645b9754
sourceURL: https://tiptap.dev/docs/collaboration/operations/configure#page-title
url: https://tiptap.dev/docs/collaboration/operations/configure#page-title
statusCode: 200
---

Configure runtime settings in Tiptap Collaboration to manage your collaboration environment directly via the REST API.

These settings let you modify secrets, webhook URLs, and more, particularly when adapting to changes in your project requirements or security protocols, without restarting your application.

[](https://tiptap.dev/docs/collaboration/operations/configure#settings-overview)
Settings overview
--------------------------------------------------------------------------------------------------

Several settings can be adjusted dynamically:

| Key | Description |
| --- | --- |
| `secret` | [JWT token secret](https://tiptap.dev/docs/collaboration/getting-started/authenticate)<br>, auto-generated on the first launch |
| `api_secret` | API secret to use in the Authorization header, auto-generated on the first launch |
| `allowed_origins` | Validates `Origin` headers against the provided values (comma separated), e.g., `https://test.tiptap.dev,https://prod.tiptap.dev`; If not set, validation is disabled |
| `authentication_disabled` | Set to `1` to disable authentication, `0` to enable (default: `0`) |
| `webhook_url` | URL for receiving webhook callbacks |
| `webhook_loader_url` | Optional webhook URL for initially loading documents. See [webhooks](https://tiptap.dev/docs/collaboration/core-concepts/webhooks#loader-webhook)<br> for more information. |
| `webhook_version` | Version of the webhook |
| `webhook_awareness` | Enable awareness webhooks for user activity, tracking `user.connected` and `user.disconnected` events (`1` for enabled, `0` for disabled) |
| `webhook_log_errors_only` | Log only webhook errors; successful webhook logs are disabled |
| `default_auto_versioning` | Set to `1` to enable auto versioning, `0` to disable (default: `0`) |
| `default_auto_versioning_interval` | Interval for auto versioning in seconds (default: `30` seconds) |
| `name` | Instance name for identification |

[](https://tiptap.dev/docs/collaboration/operations/configure#managing-settings-via-api)
Managing settings via API
------------------------------------------------------------------------------------------------------------------

The collaboration platform offers a straightforward API for managing these settings. Replace `:key` with the setting key you wish to update.

### [](https://tiptap.dev/docs/collaboration/operations/configure#create-or-overwrite-settings)
Create or overwrite settings

Use this call to add or update settings:

    curl --location --request PUT 'https://YOUR_APP_ID.collab.tiptap.cloud/api/admin/settings/:key' \
    --header 'Authorization: YOUR_SECRET_FROM_SETTINGS_AREA' --header 'Content-Type: text/plain' \
    -d 'your value'
    

### [](https://tiptap.dev/docs/collaboration/operations/configure#list-current-settings)
List current settings

Use this call to retrieve a list of all current settings:

    curl --location 'https://YOUR_APP_ID.collab.tiptap.cloud/api/admin/settings' \
    --header 'Authorization: YOUR_SECRET_FROM_SETTINGS_AREA'
    

### [](https://tiptap.dev/docs/collaboration/operations/configure#retrieve-a-specific-setting)
Retrieve a specific setting

Use this call to retrieve the value of a particular setting:

    curl --location 'https://YOUR_APP_ID.collab.tiptap.cloud/api/admin/settings/:key' \
    --header 'Authorization: YOUR_SECRET_FROM_SETTINGS_AREA'
    

### [](https://tiptap.dev/docs/collaboration/operations/configure#delete-a-setting)
Delete a setting

Use this call to delete a setting:

    curl --location --request DELETE 'https://YOUR_APP_ID.collab.tiptap.cloud/api/admin/settings/:key' \
    --header 'Authorization: YOUR_SECRET_FROM_SETTINGS_AREA'
    

[](https://tiptap.dev/docs/collaboration/operations/configure#server-performance-metrics)
Server performance metrics
--------------------------------------------------------------------------------------------------------------------

Use the `/api/statistics` endpoint to gather server performance data, including total document count, peak concurrent connections, total connections over the last 30 days, and lifetime connection counts. Review the [metrics](https://tiptap.dev/docs/collaboration/operations/metrics)
 page for additional information.

    curl --location 'https://YOUR_APP_ID.collab.tiptap.cloud/api/statistics' \
    --header 'Authorization: YOUR_SECRET_FROM_SETTINGS_AREA'
    

On this page

[Introduction](https://tiptap.dev/docs/collaboration/operations/configure#page-title)
[Settings overview](https://tiptap.dev/docs/collaboration/operations/configure#settings-overview)
 [Managing settings via API](https://tiptap.dev/docs/collaboration/operations/configure#managing-settings-via-api)
 [Server performance metrics](https://tiptap.dev/docs/collaboration/operations/configure#server-performance-metrics)