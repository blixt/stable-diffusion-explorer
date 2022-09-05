# Stable Diffusion Explorer

A simple tool to explore generation within Stable Diffusion.

## Setup

Set up [the diffusers library from Hugging Face](https://github.com/huggingface/diffusers) (you'll need Python 3) and make sure you have a Hugging Face API token (read only is fine). Put that token in `~/.huggingface`. Clone this repo anywhere you want.

## Running

Start up the server by running `python -m scripts.server` in the top of this repo directory. It will download the model and once it's ready, print a link to the local server. Open this link to access the UI. 

## Developing the frontend

In order to keep development fun and productive, this JavaScript application uses minimal dependency management tools and zero bundling / compilation steps. Everything runs directly in the browser using ES Modules, Import Maps, and template strings for JSX support and CSS-in-JS. Obviously this is not great for performance in general but for a project like this it has worked very well.

If you need to add or update a dependency, use https://generator.jspm.io/ with the import map in `index.html`.
