
# My LA2050 Ideas Archive

This is a website for the My LA2050 ideas archive–a searchable database of organizations and projects from the grants and activation challenges from 2013-2018.

https://archive.la2050.org

* [How to make changes](#how-to-make-changes)
* [How to develop locally](#how-to-develop-locally)
* [Handy guides](#handy-guides)

## How to make changes

The website is published with [GitHub Pages](https://pages.github.com) and the files are generated with [Jekyll](http://jekyllrb.com).

As you make changes and commit/push them to GitHub, the [website](https://archive.la2050.org) will automatically update.

For example, if you [edit the about page](https://github.com/la2050/myla2050/edit/master/about.markdown) on GitHub, and then press the “Commit changes” button–you should see your changes on the [about page](https://archive.la2050.org/about/) of the website within a few minutes.

## How to develop locally

If you want to see a preview of your changes while you work, you can [run a Jekyll server](https://jekyllrb.com) on your local machine. [Installing Ruby and Jekyll](https://jekyllrb.com/docs/installation/) is a good place to start.

After you have Jekyll installed, you can clone this project with [Git](https://git-scm.com) or [GitHub Desktop](https://desktop.github.com).

If Jekyll is taking a long time to rebuild after changes, you may find it helpful to use *incremental* mode. Here’s an example that also rebuilds the site first to ensure everything is up to date, and includes a *host* option to make the site available on your local network for testing on mobile devices.

```
jekyll build && jekyll serve --host=0.0.0.0 --incremental --skip-initial-build
```

## Handy guides

* [Markdown](https://guides.github.com/features/mastering-markdown/)
* [Liquid](https://shopify.github.io/liquid/)
* [Liquid for Designers](https://github.com/Shopify/liquid/wiki/Liquid-for-Designers)
* [YAML](https://docs.ansible.com/ansible/latest/reference_appendices/YAMLSyntax.html)
* [YAML Checker](http://www.yamllint.com)
* [Jekyll](https://jekyllrb.com/docs/home/)
* [GitHub Pages](https://pages.github.com)

