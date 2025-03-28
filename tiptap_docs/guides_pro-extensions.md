---
title: Pro Extensions | Tiptap Editor Docs
source_url: https://tiptap.dev/docs/guides/pro-extensions#page-title
twitter:title: Pro Extensions | Tiptap Editor Docs
twitter:image: https://tiptap.dev/docs/api/og?title=How%20to%20use%20Tiptap%20Pro%20extensions%3F&category=Editor
ogTitle: Pro Extensions | Tiptap Editor Docs
ogLocale: en_US
docsearch:version: 2.x
description: Tiptap Pro extensions add advanced capabilities to the Tiptap Editor and are installed from the private Tiptap NPM registry.
og:url: https://tiptap.dev/docs/guides/pro-extensions
og:type: website
viewport: width=device-width, initial-scale=1
ogDescription: Tiptap Pro extensions add advanced capabilities to the Tiptap Editor and are installed from the private Tiptap NPM registry.
og:description: Tiptap Pro extensions add advanced capabilities to the Tiptap Editor and are installed from the private Tiptap NPM registry.
favicon: https://tiptap.dev/docs/favicon.png
og:title: Pro Extensions | Tiptap Editor Docs
language: en
og:image: https://tiptap.dev/docs/api/og?title=How%20to%20use%20Tiptap%20Pro%20extensions%3F&category=Editor
twitter:description: Tiptap Pro extensions add advanced capabilities to the Tiptap Editor and are installed from the private Tiptap NPM registry.
ogUrl: https://tiptap.dev/docs/guides/pro-extensions
og:image:height: 630
og:locale: en_US
robots: index, follow
og:image:width: 1200
twitter:card: summary_large_image
ogImage: https://tiptap.dev/docs/api/og?title=How%20to%20use%20Tiptap%20Pro%20extensions%3F&category=Editor
scrapeId: 435d7d84-f6bb-4bc1-95db-505ad447e378
sourceURL: https://tiptap.dev/docs/guides/pro-extensions#page-title
url: https://tiptap.dev/docs/guides/pro-extensions#page-title
statusCode: 200
---

Tiptap Pro extensions add advanced capabilities to the Tiptap Editor such as versioning and AI-assisted content generation. A Tiptap account is required to access Pro extensions. Select extensions such as Collaboration History, Comments, and the Content AI extensions also require an active subscription.

To install Pro Extensions you authenticate to the private Tiptap NPM registry with a Tiptap Pro authentication token. You can configure credentials for your package manager on a per-project basis, or set them globally for CI/CD environments.

### Security warning

Treat your authentication tokens like passwords to prevent unauthorized use. Each Tiptap user has a unique authentication token that does not expire. We recommend creating a dedicated user for CI/CD applications.

[](https://tiptap.dev/docs/guides/pro-extensions#configure-per-project-authentication)
Configure per-project authentication
---------------------------------------------------------------------------------------------------------------------------

1.  Get your Tiptap Pro authentication token from [https://cloud.tiptap.dev/pro-extensions](https://cloud.tiptap.dev/pro-extensions)
    .
2.  Add the Tiptap private registry to the package manager configuration file in the root directory of your project.

For **npm**, **pnpm**, or **Yarn Classic** (Yarn 1), add the registry to `.npmrc`.

    @tiptap-pro:registry=https://registry.tiptap.dev/
    //registry.tiptap.dev/:_authToken=${TIPTAP_PRO_TOKEN}
    

If you are using **Yarn Modern** (Yarn 2+), add the registry to `.yarnrc.yml`.

    npmScopes:
     tiptap-pro:
       npmAlwaysAuth: true
       npmRegistryServer: "https://registry.tiptap.dev/"
       npmAuthToken: ${TIPTAP_PRO_TOKEN}
    

### Note

You can specify the authentication token directly or using an environment variable as shown (recommended).

4.  Add the configuration file to the project's `.gitignore` file to prevent it from being checked into your source code repository.

### Warning

This is essential to avoid leaking your credentials if you specify the authentication token directly in the configuration file.

Once you've configured authentication for a project, you can install Pro Extensions like any other Editor extension.

If you use environment variables, pass the authentication token during installation:

    TIPTAP_PRO_TOKEN=actual-auth-token npm install --save @tiptap-pro/extension-unique-id
    

[](https://tiptap.dev/docs/guides/pro-extensions#configure-global-authentication)
Configure global authentication
-----------------------------------------------------------------------------------------------------------------

You can set up authentication once for **all** of your projects by updating the package manager configuration file at the user level. This is useful for CI/CD environments.

1.  Get your Tiptap Pro authentication token from [https://cloud.tiptap.dev/pro-extensions](https://cloud.tiptap.dev/pro-extensions)
    .
2.  Add the Tiptap private registry to the package manager configuration.

**Yarn Classic, npm**

    npm config set "@tiptap-pro:registry" https://registry.tiptap.dev/
    

**Yarn Modern**

    yarn config set --home npmScopes.@tiptap-pro.npmRegistryServer "https://registry.tiptap.dev/"
    yarn config set --home npmScopes.@tiptap-pro.npmAlwaysAuth "true"
    

**pnpm**

    pnpm config set --global "@tiptap-pro:registry" https://registry.tiptap.dev/
    

3.  Add your authentication token to the package manager configuration.

**Yarn Classic, npm**

    npm config set "//registry.tiptap.dev/:_authToken" actual-auth-token
    

**Yarn Modern**

    yarn config set --home npmScopes.@tiptap-pro.npmAuthToken "actual-auth-token"
    

**pnpm**

    pnpm config set "//registry.tiptap.dev/:_authToken" actual-auth-token
    

Once you've configured authentication, you can install Tiptap Pro extensions like any other extension:

    npm install --save @tiptap-pro/extension-unique-id
    

On this page

[Introduction](https://tiptap.dev/docs/guides/pro-extensions#page-title)
[Configure per-project authentication](https://tiptap.dev/docs/guides/pro-extensions#configure-per-project-authentication)
 [Configure global authentication](https://tiptap.dev/docs/guides/pro-extensions#configure-global-authentication)