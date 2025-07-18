import random
import string
import secrets
from .models import Users


class IdentificationGenerator:

    def generator(self):
        numbers_picked = []
        for num_pick in range(4):
            x = random.randint(0, 9)
            numbers_picked.append(str(x))
        user_unique_id = ''.join(numbers_picked)
        return user_unique_id

    def generate(self):
        token = self.generator()
        return token


    def temp_token_generate(self):
        alphabet = string.ascii_letters + string.digits + string.ascii_uppercase
        token_nav = ''.join(secrets.choice(alphabet) for i in range(40))
        return token_nav

    def temp_password_generate(self):
        alphabet = string.digits + string.ascii_uppercase
        temp_password = ''.join(secrets.choice(alphabet) for i in range(6))
        return temp_password

    # amount = random.randint(5, 20)
    # alphabet = string.ascii_letters + string.digits + string.ascii_uppercase
    # user_unique_id = ''.join(secrets.choice(alphabet) for i in range(amount))