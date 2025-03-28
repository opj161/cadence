---
title: Custom LLM | Tiptap AI Suggestion
source_url: https://tiptap.dev/docs/content-ai/capabilities/suggestion/custom-llms#page-title
docsearch:version: 2.x
og:image:height: 630
twitter:card: summary_large_image
twitter:title: Custom LLM | Tiptap AI Suggestion
favicon: https://tiptap.dev/docs/favicon.png
twitter:description: Integrate your own backend and LLMs with the AI Suggestion extension for custom suggestions.
og:url: https://tiptap.dev/docs/content-ai/capabilities/suggestion/custom-llms
og:locale: en_US
language: en
ogUrl: https://tiptap.dev/docs/content-ai/capabilities/suggestion/custom-llms
ogDescription: Integrate your own backend and LLMs with the AI Suggestion extension for custom suggestions.
ogLocale: en_US
viewport: width=device-width, initial-scale=1
og:title: Custom LLM | Tiptap AI Suggestion
og:image: https://tiptap.dev/docs/api/og?title=Integrate%20your%20custom%20backend%20and%20LLMs&category=Content%20AI
description: Integrate your own backend and LLMs with the AI Suggestion extension for custom suggestions.
og:image:width: 1200
ogTitle: Custom LLM | Tiptap AI Suggestion
robots: index, follow
ogImage: https://tiptap.dev/docs/api/og?title=Integrate%20your%20custom%20backend%20and%20LLMs&category=Content%20AI
og:description: Integrate your own backend and LLMs with the AI Suggestion extension for custom suggestions.
og:type: website
twitter:image: https://tiptap.dev/docs/api/og?title=Integrate%20your%20custom%20backend%20and%20LLMs&category=Content%20AI
scrapeId: 32b21300-70e8-4434-8401-639e0d64a920
sourceURL: https://tiptap.dev/docs/content-ai/capabilities/suggestion/custom-llms#page-title
url: https://tiptap.dev/docs/content-ai/capabilities/suggestion/custom-llms#page-title
statusCode: 200
---

By default, the AI Suggestion extension uses the Tiptap Content AI Cloud to generate suggestions for your content. This lets you use its capabilities with minimal setup. However, you can integrate your own backend and LLMs to generate suggestions.

The AI Suggestion extension supports different degrees of customization. You can:

1.  Use the Tiptap Content AI Cloud, but customize the OpenAI model.
2.  Replace the API endpoint to get the suggestions data with your own LLM and backend, but let the extension handle how suggestions are displayed and applied. **This is the recommended approach** for most use cases, as we handle most of the complexity for you: comparing the old and new editor content, displaying the diff in a pleasant way, and handling conflicts.
3.  Implement your own resolver function entirely. This gives you total flexibility to decide how suggestions are displayed in the editor. It is only recommended in advanced scenarios.

[](https://tiptap.dev/docs/content-ai/capabilities/suggestion/custom-llms#customize-the-openai-model-in-tiptap-cloud)
Customize the OpenAI Model in Tiptap Cloud
----------------------------------------------------------------------------------------------------------------------------------------------------------------

You can configure the OpenAI model to use for generating suggestions with the `model` option. The default model is `gpt-4o-mini`. We recommend it for most use cases, as it provides a good balance between speed, cost and accuracy.

If you want to improve the suggestions' quality, you can use a larger model like `gpt-4o`. Bear in mind that larger models tend to be more expensive, slower, and have a higher latency.

    AiSuggestion.configure({
      // The model to use for generating suggestions. Defaults to "gpt-4o-mini"
      model: 'gpt-4o',
    })
    

[](https://tiptap.dev/docs/content-ai/capabilities/suggestion/custom-llms#replace-the-api-endpoint-recommended)
Replace the API Endpoint (Recommended)
------------------------------------------------------------------------------------------------------------------------------------------------------

If you want to use your own backend and LLMs to generate suggestions, you can provide a custom `apiResolver` function. This function should call your backend and return an array of suggestions based on the editor's content and rules.

    AiSuggestion.configure({
      async resolver({ defaultResolver, ...options }) {
        const suggestions = defaultResolver({
          ...options,
          apiResolver: async ({ html, rules }) => {
            // Generate the response by calling your custom backend and LLMs
            const response = await claudeSonnetApi({ html, rules })
    
            // Return the response in the correct format (see details below)
            return { format: 'fullHtml', content: response }
          },
        })
    
        return suggestions
      },
    })
    

To provide maximum flexibility, the `apiResolver` accepts the response in two formats:

*   `replacements`: The response is an array of replacements that will be applied to the editor's content. This is useful when you want to replace specific parts of the content with the suggestions. This is the format that we use with the Tiptap Content AI Cloud, which has given us the best results so far.
    
    Here is an example response in the `replacements` format.
    
        {
          "format": "replacements",
          "content": {
            "items": [\
              {\
                "paragraph": 1,\
                "ruleId": "2",\
                "deleteHtml": "aplication",\
                "insertHtml": "application"\
              },\
              {\
                "paragraph": 2,\
                "ruleId": "1",\
                "deleteHtml": "Hola, estamos <bold>emocionados</bold> de tenerte aquí.",\
                "insertHtml": "Hello, we are <bold>excited</bold> to have you here."\
              },\
              {\
                "paragraph": 3,\
                "ruleId": "2",\
                "deleteHtml": "fetures",\
                "insertHtml": "features"\
              },\
              {\
                "paragraph": 3,\
                "ruleId": "1",\
                "deleteHtml": "Si tienes dudas, no dudes en preguntar.",\
                "insertHtml": "If you have questions, do not hesitate to ask."\
              }\
            ]
          }
        }
        
    
*   `fullHtml`: The response is a full HTML string that will replace the editor's content. This is useful when you want to replace the entire content with the suggestions. We've found this format to perform very well when there is only one rule to apply, but less so when there are multiple rules.
    
        {
          "format": "fullHtml",
          "content": {
            "items": [\
              {\
                "ruleId": "1",\
                "fullHtml": "<p>Hello, welcome to our awesome app! We hope you guys will love it. Our aplication offers unique features that enhance your cooking experience. You can explore various cuisines and share your food momentts.</p><p>Hello, we are excited to have you here. Our app is not just about recipes but also about building a community. We believe this will transform how you cook.</p><p>Please check out our cool fetures and enjoy cooking with us. If you have doubts, do not hesitate to ask.</p>"\
              },\
              {\
                "ruleId": "2",\
                "fullHtml": "<p>Hello, welcome to our awesome app! We hope you guys will love it. Our application offers unique features that enhance your cooking experience. You can explore various cuisines and share your food moments.</p><p>Hola, estamos emocionados de tenerte aquí. Our app is not just about recipes but also about building a community. We believe this will transform how you cook.</p><p>Please check out our cool features and enjoy cooking with us. Si tienes dudas, no dudes en preguntar.</p>"\
              }\
            ]
          }
        }
        
    

LLMs can make mistakes, so it can be difficult to ensure that the LLM response is in the desired format. To improve the accuracy and performance of your custom models, we recommend following these best practices and prompt engineering techniques.

*   If you use the `replacements` format, you can use [OpenAI structured outputs](https://platform.openai.com/docs/guides/structured-outputs)
     (or the equivalent feature in other LLM providers) to ensure that the response is a JSON object that complies to a specific schema.
    
*   If you use the `fullHml` format, you can use [OpenAI predicted outputs](https://platform.openai.com/docs/guides/predicted-outputs)
     (or the equivalent feature in other LLM providers) to improve the latency and speed of the model.
    
*   Structure your prompt so that you can benefit from [partial caching](https://platform.openai.com/docs/guides/prompt-caching)
    . Alternatively, you can implement your own caching mechanism so that you can reuse the LLM response for the same or similar prompts.
    
*   LLM providers have official guides on [best practices](https://platform.openai.com/docs/guides/prompt-engineering)
    , improving [latency](https://platform.openai.com/docs/guides/latency-optimization)
    , and [accuracy](https://platform.openai.com/docs/guides/optimizing-llm-accuracy)
    .
    
*   Evaluate your custom endpoint's responses and measure their performance and accuracy. Use an evaluation framework like [Evalite](https://www.evalite.dev/)
    . This will help you iterate on your prompt to improve it over time, and compare alternative prompts to see which one performs better.
    
*   Different proofreading rules work best with different prompting approaches and response formats. You do not need to choose between the `replacements` or the `fullHtml` format. You can use both! Define an API endpoint that returns the suggestions in the `replacements` format, and another that generates them in the `fullHtml` format. Here is an example:
    
        AiSuggestion.configure({
          async resolver({ defaultResolver, rules, ...options }) {
           // Split the rules into two groups
           const {
           rulesForFirstApi,
           rulesForSecondApi,
          } = splitRules(rules)
        
          // Send the first group of rules to the first api endpoint
            const suggestions1 = await defaultResolver({
              ...options,
              rules: rulesForFirstApiEndpoint
              apiResolver: async ({ html, rules }) => {
                const response = await firstApi({ html, rules });
                return { format: "replacements", content: response };
              },
            });
        
            // Send the second group of rules to the second api endpoint
            const suggestions2 = await defaultResolver({
              ...options,
              rules: rulesForSecondApiEndpoint
              apiResolver: async ({ html, rules }) => {
                const response = await secondApi({ html, rules });
                return { format: "fullHtml", content: response };
              },
            });
        
          // Merge both lists of suggestions
            return [...suggestions1, ...suggestions2]
          },
        
    

[](https://tiptap.dev/docs/content-ai/capabilities/suggestion/custom-llms#replace-the-resolver-function-entirely-advanced)
Replace the Resolver Function Entirely (Advanced)
----------------------------------------------------------------------------------------------------------------------------------------------------------------------------

If you want to have total control over how the editor suggestions are generated, including their exact position in the document, you can do so by providing a custom `resolver` function. This function should return an array of suggestions based on the editor's content and rules.

To generate valid suggestion objects, your code needs to compute [their positions in the editor](https://prosemirror.net/docs/guide/#doc.indexing)
. This will most likely involve comparing the editor's current content with the content that has been generated by the LLM. To see an example on how to do this, you can check the default resolver function in the extension's source code.

To learn more about the data that each suggestion object should contain, check the [API reference](https://tiptap.dev/docs/content-ai/capabilities/suggestion/api-reference#proofreading-suggestions)
.

    AiSuggestion.configure({
      async resolver({ defaultResolver, ...options }) {
        const suggestions = await customResolver(options)
        return suggestions
      },
    })
    

Overall, the approach of implementing your custom resolver will take more work to implement, but it will give you more flexibility. We only recommend it for advanced use cases.

[](https://tiptap.dev/docs/content-ai/capabilities/suggestion/custom-llms#combine-the-tiptap-content-ai-cloud-with-your-own-backend)
Combine the Tiptap Content AI Cloud With Your Own Backend
----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

You do not have to choose between using the Tiptap Content AI Cloud or your own backend. You can combine the two, and get the best of both worlds.

    AiSuggestion.configure({
      async resolver({ defaultResolver, rules, ...options }) {
        // Split the rules into two groups
        const { rulesForDefaultSuggestions, rulesForCustomSuggestions } = splitRules(rules)
    
        // Get suggestions from Tiptap Cloud API
        const defaultSuggestions = await defaultResolver({
          ...options,
          rules: rulesForDefaultSuggestions,
        })
        // Get suggestions from your own backend
        const customSuggestions = await customResolver({
          ...options,
          rules: rulesForCustomSuggestions,
        })
    
        // merge both lists of suggestions
        return [...defaultSuggestions, ...customSuggestions]
      },
    })
    

[](https://tiptap.dev/docs/content-ai/capabilities/suggestion/custom-llms#generate-proofreading-suggestions-without-ai)
Generate Proofreading Suggestions Without AI
--------------------------------------------------------------------------------------------------------------------------------------------------------------------

You don’t need to use AI to generate proofreading suggestions. You can combine AI models with classic proofreading techniques. For example, you can check for certain words and replace them. Here is an example of a resolver that generates suggestions that replace the word “hello” with “goodbye”.

    AiSuggestion.configure({
      rules: [\
        {\
          id: '1',\
          title: 'Replace hello with goodbye',\
          // The prompt will not be used because we do not use an LLM to generate suggestions for this rule\
          prompt: 'Replace hello with goodbye',\
          color: '#DC143C',\
          backgroundColor: 'FFE6E6',\
        },\
      ],
      async resolver({ defaultResolver, ...options }) {
        const suggestions = await defaultResolver({
          ...options,
          apiResolver: async ({ html, rules }) => {
            // Generate the response without needing to call an LLM
            return {
              format: 'fullHtml',
              content: {
                items: [\
                  {\
                    ruleId: '1',\
                    // return the new document html after replacing "hello" with "goodbye"\
                    fullHtml: html.replaceAll('hello', 'goodbye'),\
                  },\
                ],
              },
            }
          },
        })
    
        return suggestions
      },
    })
    

On this page

[Introduction](https://tiptap.dev/docs/content-ai/capabilities/suggestion/custom-llms#page-title)
[Customize the OpenAI Model in Tiptap Cloud](https://tiptap.dev/docs/content-ai/capabilities/suggestion/custom-llms#customize-the-openai-model-in-tiptap-cloud)
 [Replace the API Endpoint (Recommended)](https://tiptap.dev/docs/content-ai/capabilities/suggestion/custom-llms#replace-the-api-endpoint-recommended)
 [Replace the Resolver Function Entirely (Advanced)](https://tiptap.dev/docs/content-ai/capabilities/suggestion/custom-llms#replace-the-resolver-function-entirely-advanced)
 [Combine the Tiptap Content AI Cloud With Your Own Backend](https://tiptap.dev/docs/content-ai/capabilities/suggestion/custom-llms#combine-the-tiptap-content-ai-cloud-with-your-own-backend)
 [Generate Proofreading Suggestions Without AI](https://tiptap.dev/docs/content-ai/capabilities/suggestion/custom-llms#generate-proofreading-suggestions-without-ai)