import asyncio
import concurrent.futures
import os
import sys
import time

from aiohttp import web
import torch
from torch import autocast
from diffusers import StableDiffusionPipeline

from .prompts import Prompt, PromptResult

model = "CompVis/stable-diffusion-v1-4"
device = "cuda"
images_path = "pub"

HUGGINGFACE_TOKEN = os.environ.get("HUGGINGFACE_TOKEN")
if not HUGGINGFACE_TOKEN:
    token_path = os.path.join(os.path.expanduser("~"), ".huggingface")
    with open(token_path, "r") as token_fh:
        HUGGINGFACE_TOKEN = token_fh.readline().strip()
    if not HUGGINGFACE_TOKEN:
        print("Missing Hugging Face token in HUGGINGFACE_TOKEN environment variable or ~/.huggingface file.")
        sys.exit(1)

print("Initializing Stable Diffusion pipeline...")
pipe = StableDiffusionPipeline.from_pretrained(
    model, use_auth_token=HUGGINGFACE_TOKEN)
pipe = pipe.to(device)
print("Done.")

generator = torch.Generator(device=device)


def infer_prompt(prompt: Prompt) -> PromptResult:
    print()
    print(prompt.text)
    latents = torch.randn(
        (1, pipe.unet.in_channels, prompt.height // 8, prompt.width // 8),
        generator=generator.manual_seed(prompt.seed),
        device=device
    )
    with autocast(device):
        image = pipe(prompt=prompt.text, width=prompt.width, height=prompt.height,
                     guidance_scale=prompt.guidance_scale,
                     latents=latents,
                     num_inference_steps=prompt.steps)["sample"][0]
    base_path = os.path.join(os.getcwd(), images_path)
    image_path = os.path.join(base_path, f"{prompt.hash}.png")
    json_path = os.path.join(base_path, f"{prompt.hash}.json")
    image.save(image_path)
    prompt.write_json(json_path)
    return PromptResult(image_path, json_path)


routes = web.RouteTableDef()
routes.static("/image", images_path)
routes.static("/static", "ui/static")


@routes.get("/")
async def get_index(request):
    return web.FileResponse("ui/index.html")

executor = concurrent.futures.ThreadPoolExecutor(max_workers=1)


@routes.post("/generate")
async def post_generate(request):
    data = await request.json()
    if "seed" not in data:
        data["seed"] = generator.seed()
    prompt = Prompt(**data)
    start_time = time.time()
    result = await asyncio.get_running_loop().run_in_executor(executor, infer_prompt, prompt)
    time_taken = time.time() - start_time
    image_filename = os.path.basename(result.image_path)
    return web.json_response({
        "hash": prompt.hash,
        "pipeline": {
            "device": device,
            "model": model,
        },
        "prompt": prompt.to_kwargs(),
        "image": f"/image/{image_filename}",
        "time_taken": time_taken,
    })


app = web.Application()
app.add_routes(routes)

if __name__ == "__main__":
    web.run_app(app, port=8081)
