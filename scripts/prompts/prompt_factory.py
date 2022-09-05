import random

from .prompt import Prompt

class PromptFactory:
    keywords: set[str] = set()

    def __init__(self, base_prompt: str):
        self.base_prompt = base_prompt

    def add_keywords(self, *args: set[str]):
        for keywords in args:
            self.keywords |= keywords

    def generate_prompt(self, num_keywords=10, **kwargs) -> Prompt:
        base_prompt = self.base_prompt
        keywords = list(self.keywords)
        if num_keywords > len(keywords):
            num_keywords = len(keywords)
        keywords = random.sample(keywords, k=num_keywords)
        return Prompt(base_prompt, keywords, **kwargs)
