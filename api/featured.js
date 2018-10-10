---
layout: none
---

var featuredOrganizations = [

  {% assign data_collection = site.collections | where: "label", "organizations" | first %}
  {% assign data_list = data_collection.docs %}

  {% assign delimiter = "" %}

  {%- for data in data_list -%}
    {%- for url in site.data.featured_organizations -%}
      {%- if data.url == url -%}
        {{ delimiter }}
        {
          title : "{{ data.title }}",
          url   : "{{ data.url }}",
          image : "{{ data.project_image }}"
        }
        {% assign delimiter = "," %}
      {%- endif -%}
    {%- endfor -%}
  {%- endfor -%}

]
