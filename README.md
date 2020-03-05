
# My LA2050 Ideas Archive

This is a website for the My LA2050 ideas archive–a searchable database of organizations and projects from the maker, grants and activation challenges for 2013-2018.

https://archive.la2050.org

* [How to make changes](#how-to-make-changes)
* [How to edit an organization](#how-to-edit-an-organization)
* [How to hide an organization](#how-to-hide-an-organization)
* [How to add an image](#how-to-add-an-image)
* [How to see a preview of your changes](#how-to-see-a-preview-of-your-changes)
* [How to develop locally](#how-to-develop-locally)
* [Handy guides](#handy-guides)

## Deployment status

### staging-archive.la2050.org

[![Netlify Status](https://api.netlify.com/api/v1/badges/e393bfa4-90d6-4f90-bc03-b4a681571b48/deploy-status)](https://app.netlify.com/sites/staging-archive-la2050/deploys)

### archive.la2050.org

[github.com/la2050/archive/deployments](https://github.com/la2050/archive/deployments)

## How to make changes

The archive website is published with [GitHub Pages](https://pages.github.com) & [Netlify](https://www.netlify.com) and the files are generated with [Jekyll](http://jekyllrb.com).

As you make changes and commit/push them to GitHub, the [website](https://archive.la2050.org) will automatically update.

For example, if you [edit the about page](https://github.com/la2050/archive/edit/master/about.markdown) on GitHub, and then press the “Commit changes” button–you should see your changes on the [about page](https://archive.la2050.org/about/) of the website within a few minutes.

## How to edit an organization

1. Find the organization you wish to edit in the [organizations](https://github.com/la2050/archive/tree/master/_organizations) folder.

The files in these folders correspond to a web address on the archive website. For instance, the organization located at https://archive.la2050.org/homeboy-industries/ gets its content from a file named [homeboy-industries.md](https://github.com/la2050/archive/blob/master/_organizations/homeboy-industries.md)

2. Select the organization and then press the edit button–for example, [826LA](https://github.com/la2050/archive/edit/master/_organizations/826la.md).

The organization files are written in the [YAML](https://en.wikipedia.org/wiki/YAML) language. The files contain a list of names and values, each separated by a colon. The names serve a similar purpose to what columns do in a spreadsheet. For example:
```
name: value
another_name: another_value
```

_You can double-check that your changes are correct by copying and pasting them into the
[YAML Validator](https://yamlvalidator.com)._

3. Make your changes, and then press the “Commit changes” button.

You can also describe your changes in the fields just above the “Commit changes” button (this adds a note in the project history).

_You can follow these same steps to edit one of the [projects](https://github.com/la2050/archive/tree/master/_projects)._

## How to hide an organization

While editing an organization file, look for this line:
```
published: true
```

To hide the organization, set the value of published to `false`:
```
published: false
```

To show the organization again, set the value of published back to `true`.

_You can follow these same steps to hide or show one of the [projects](https://github.com/la2050/archive/tree/master/_projects)._

## How to add an image

If you want to add an image (or any file) to the website, you can upload it to one of the folders on GitHub.

The [uploads folder](https://github.com/la2050/archive/tree/master/uploads) might be a good choice, if you’re unsure where to put a file.

Once you’ve chosen a folder, follow these steps:

1. Press the `Upload files` button

2. Use the uploader to upload your files

3. Press the `Commit changes` button

It’s best to use lowercase letters and dashes instead of spaces for your filename. For example: `womens-march-la.jpg`.

Once your file has been uploaded it will be available at a web address that corresponds to the folder and filename that you chose. For example:

```
/uploads/womens-march-la.jpg
```

To use this on the website, you can create an image with [markdown](https://guides.github.com/features/mastering-markdown/):

```
![Women’s March LA](/uploads/womens-march-la.jpg)
```

## How to see a preview of your changes

If you’d like to see how your changes will look on the website before making them public, you can work in the [staging branch](https://github.com/la2050/archive/tree/staging)–a copy of the website files, that’s published at https://staging-archive.la2050.org

![staging](https://user-images.githubusercontent.com/926616/47131296-bcb61180-d252-11e8-90e0-56a2e7552163.png)

You can make edits in the staging branch and commit them just as you would normally. They’ll automatically appear on the staging website within a few minutes.

[![Netlify Status](https://api.netlify.com/api/v1/badges/e393bfa4-90d6-4f90-bc03-b4a681571b48/deploy-status)](https://app.netlify.com/sites/staging-archive-la2050/deploys)

Once you’re happy with how your changes look on the staging website, you can copy them over to the [public website](https://archive.la2050.org) (the `master` branch) using a pull request. Here are the steps:

1. Press the “new pull request” button.

https://github.com/la2050/archive/pull/new/staging

![1-new-pull-request-button](https://user-images.githubusercontent.com/926616/47131298-bde73e80-d252-11e8-8cd6-f64703af5c2b.png)

2. Write a title for your pull request (this is optional).

3. Press the “create pull request” button.

4. And then, press the “merge pull request” button.

5. And lastly, press the “confirm merge” button.

![3-merge-pull-request](https://user-images.githubusercontent.com/926616/47131302-c0499880-d252-11e8-9393-75dcfcd49650.png)


## How to develop locally

If you want to see a preview of your changes while you work, you can [run a Jekyll server](https://jekyllrb.com) on your computer. [Installing Ruby and Jekyll](https://jekyllrb.com/docs/installation/) is a good place to start.

After you have Jekyll installed, you can clone (download) this project with [Git](https://git-scm.com) or [GitHub Desktop](https://desktop.github.com). And then you can start Jekyll:

```
jekyll serve
```

If Jekyll is taking a long time to rebuild after changes, you may find it helpful to use *incremental* mode. Here’s an example that also rebuilds the site first to ensure everything is up to date, and includes a *host* option to make the site available on your local network for testing on mobile devices.

```
jekyll build && jekyll serve --host=0.0.0.0 --incremental --skip-initial-build
```

## Handy guides

* [Markdown](https://guides.github.com/features/mastering-markdown/)
* [YAML](https://docs.ansible.com/ansible/latest/reference_appendices/YAMLSyntax.html)
* [YAML Validator](https://yamlvalidator.com)
* [Liquid](https://shopify.github.io/liquid/)
* [Liquid for Designers](https://github.com/Shopify/liquid/wiki/Liquid-for-Designers)
* [Jekyll](https://jekyllrb.com/docs/home/)
* [GitHub Pages](https://pages.github.com)
