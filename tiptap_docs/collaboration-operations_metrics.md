---
title: Metrics | Tiptap Collaboration Docs
source_url: https://tiptap.dev/docs/collaboration/operations/metrics#page-title
viewport: width=device-width, initial-scale=1
og:image: https://tiptap.dev/docs/api/og?title=Server%20metrics%20and%20statistics&category=API
og:title: Metrics | Tiptap Collaboration Docs
twitter:description: Access server and document statistics of your Tiptap Collaboration application. Learn more in our docs!
ogTitle: Metrics | Tiptap Collaboration Docs
og:image:width: 1200
twitter:image: https://tiptap.dev/docs/api/og?title=Server%20metrics%20and%20statistics&category=API
docsearch:version: 2.x
ogLocale: en_US
og:type: website
og:url: https://tiptap.dev/docs/collaboration/operations/metrics
language: en
og:locale: en_US
og:image:height: 630
twitter:card: summary_large_image
twitter:title: Metrics | Tiptap Collaboration Docs
ogImage: https://tiptap.dev/docs/api/og?title=Server%20metrics%20and%20statistics&category=API
description: Access server and document statistics of your Tiptap Collaboration application. Learn more in our docs!
robots: index, follow
og:description: Access server and document statistics of your Tiptap Collaboration application. Learn more in our docs!
favicon: https://tiptap.dev/docs/favicon.png
ogDescription: Access server and document statistics of your Tiptap Collaboration application. Learn more in our docs!
ogUrl: https://tiptap.dev/docs/collaboration/operations/metrics
scrapeId: f58cddf4-c325-4fe3-8566-4851032e2cdf
sourceURL: https://tiptap.dev/docs/collaboration/operations/metrics#page-title
url: https://tiptap.dev/docs/collaboration/operations/metrics#page-title
statusCode: 200
---

The Tiptap Collaboration API offers several endpoints to access real-time statistics and health information for both the server and individual documents. A simplified version of the metrics is also available in the cloud dashboard.

These endpoints help to troubleshoot issues, monitor server performance, or build analytics dashboards for insights into user interactions and system status. Integrating statistics into your monitoring systems allows you to proactively manage your collaboration environment's health.

### Review the postman collection

Experiment with the REST API by visiting our [Postman Collection](https://www.postman.com/docking-module-explorer-14290287/workspace/tiptap-collaboration-public/collection/33042171-cc186a66-df41-4df8-9c6e-e91b20deffe5?action=share&creator=32651125)
.

[](https://tiptap.dev/docs/collaboration/operations/metrics#access-the-api)
Access the API
------------------------------------------------------------------------------------------

The REST API is exposed directly from your Collaboration app at your custom URL:

    https://YOUR_APP_ID.collab.tiptap.cloud/
    

### [](https://tiptap.dev/docs/collaboration/operations/metrics#authentication)
Authentication

Authenticate your API requests by including your API secret in the `Authorization` header. You can find your API secret in the [settings](https://cloud.tiptap.dev/apps/settings)
 of your Tiptap Cloud dashboard.

### [](https://tiptap.dev/docs/collaboration/operations/metrics#document-identifiers)
Document identifiers

If your document identifier contains a slash (`/`), encode it as `%2F`, e.g., using `encodeURIComponent`.

[](https://tiptap.dev/docs/collaboration/operations/metrics#server-statistics-endpoint)
Server statistics endpoint
------------------------------------------------------------------------------------------------------------------

This endpoint provides basic statistics about the Tiptap Collaboration server, offering insights into overall activity and usage metrics.

    GET /api/statistics
    

### Caution

The total number of connections in the last 30 days and the lifetime connection count are presented as strings due to their internal representation as BigInt values.

**Example:** Server statistics

    {
      "totalDocuments": 4,
      "totalConnections30d": "3",
      "maxConcurrentConnections30d": 3,
      "lifetimeConnections": "144",
      "currentConnectionsCount": 3,
      "currentLoadedDocumentsCount": 1,
      "openDocuments": ["testdocument"],
      "connectionsPerDocument": {
        "testdocument": 3
      },
      "version": "3.33.0"
    }
    

[](https://tiptap.dev/docs/collaboration/operations/metrics#document-statistics-endpoint)
Document statistics endpoint
----------------------------------------------------------------------------------------------------------------------

Retrieve statistics for a specific document by its identifier. Use this endpoint to monitor real-time user engagement with a document.

    GET /api/documents/:identifier/statistics
    

**Example:** Statistics of a document named :identifier

    {
      "currentConnections": 2,
      "connectedIps": ["127.0.0.1", "10.100.1.23"]
    }
    

[](https://tiptap.dev/docs/collaboration/operations/metrics#server-health-endpoint)
Server health endpoint
----------------------------------------------------------------------------------------------------------

Use this call to check liveness, readiness, and cconnectivity to essential components like the database and Redis.

    GET /health
    

**Example:** Issue with Redis

    HTTP 500:
    
    DB:ok
    REDIS:fail
    

**Example:** No Redis detected

    HTTP 200:
    
    DB:ok
    REDIS:inactive
    

On this page

[Introduction](https://tiptap.dev/docs/collaboration/operations/metrics#page-title)
[Access the API](https://tiptap.dev/docs/collaboration/operations/metrics#access-the-api)
 [Server statistics endpoint](https://tiptap.dev/docs/collaboration/operations/metrics#server-statistics-endpoint)
 [Document statistics endpoint](https://tiptap.dev/docs/collaboration/operations/metrics#document-statistics-endpoint)
 [Server health endpoint](https://tiptap.dev/docs/collaboration/operations/metrics#server-health-endpoint)