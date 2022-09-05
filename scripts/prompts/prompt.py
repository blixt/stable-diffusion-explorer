import hashlib
import inspect
import json
import pickle


def hash_values(**kwargs) -> str:
    hash = hashlib.sha256()
    hash.update(pickle.dumps(sorted(kwargs.items())))
    return hash.hexdigest()


class Prompt:
    def __init__(self, base_prompt: str, keywords: list[str], seed: int, width=512, height=512, steps=50, guidance_scale=7.5):
        if not isinstance(keywords, list):
            raise Exception("keywords should be a list")
        self.base_prompt = base_prompt
        self.keywords = keywords
        if keywords:
            base_prompt += ", " + ", ".join(keywords)
        self.text = base_prompt
        self.seed = seed
        self.width = width
        self.height = height
        self.steps = steps
        self.guidance_scale = guidance_scale
        # Create a unique hash for the prompt.
        self.hash = hash_values(**self.to_kwargs())

    @classmethod
    def read_json(cls, path: str):
        with open(path, "r", encoding="utf-8") as fh:
            data = json.load(fh)
            return cls(**data)

    def to_kwargs(self):
        keys = set(inspect.signature(self.__init__).parameters)
        data = {k: v for k, v in self.__dict__.items() if k in keys}
        actual_keys = set(data)
        assert actual_keys == keys, f"Expected {actual_keys} to match {keys}"
        return data

    def write_json(self, path: str):
        data = self.to_kwargs()
        with open(path, "w", encoding="utf-8") as fh:
            json.dump(data, fh, ensure_ascii=False, sort_keys=True, indent=4)
