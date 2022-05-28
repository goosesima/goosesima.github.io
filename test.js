const a = `Title: AOM - new project by GooseSima
Author: GooseSima
Image author: https://goosesima.github.io/img/logo.png
Date: 30.09.2021
Thumbnail: https://xakep.ru/wp-content/uploads/2020/11/327854/GitHub.jpeg
Description: Create webpages now more simpler.

Check out source code:
https://github.com/GooseSima/blog

# Updates
## Version 0.1 [25.09.2021]
- First release.
## Version 0.2 [29.09.2021]
- Example document added.
- Recoded Markdown implementation.
- New functions.
## Version 0.3 [01.10.2021]
* Fix google translate
* Fix button display.
* Better search engine support.
* Better Google Translator design.
## Version 0.4 [01.10.2021]
* Optimized temp-link generator.
* Moved Google Translator down on main page.
* Keywords.
* Now any filetype possible to use.
* Async fs.
* Now compiled files located in "public" directory.
* Create date.
* "Temp-link" copy for headers.
## Version 0.5 [01.10.2021]
* Now compiled files located in "docs" directory.
## Version 0.6 [07.10.2021]
* Sitemap generator.
## Version 0.7 [09.10.2021]
* Commentary using Disqus.
## Version 0.8 [11.10.2021]
* Sitemap.txt -> Sitemap.xml for better compatibility with search engines.
* Move goosesima.github.io to AOM.
## Version 0.9 [15.10.2021]
* Move MCS to AOM.
* 1/2 GooseSima links moved to GooseSima blog.
* Faster time compile.
## Version 1.0 [15.10.2021]
* Fixed wrong index.html.
## Version 1.1 [21.10.2021]
* Ignore tag. Which hides unwanted articles. Technical articles.
## Version 1.2 [24.10.2021]
* Move links to AOM.
* Various minor fixes.
* CSS fixes.
* Better meta.

* Search via duckduckgo.
* YouTube url = embed.


# ToDo AAA:
* Fix code.
* Pure HTML CSS JS support.
* SimaBot integration.
* Language detection (Russian / Ukrainian or English) for Google Translator.
* Auto translate.

# ToDo AA:
* Add code visualization library.
* Reading time.
* Recommended articles.

# ToDo A:
* Wallpapers left and right.
* Add latest Markdown support.
* Different pages to keep list articles.

# Currently supported Markdown things
https://i.imgur.com/HVUc61N.png
[Markdown information](https://commonmark.org/help/)
`;

const htmlcode = aom.generate(a, aom.sample,  '???', '???2', (new Date()).toLocaleString(), true);

document.getElementById('page').innerHTML = htmlcode;
