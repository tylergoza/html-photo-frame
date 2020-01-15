#! /usr/bin/python3

import os
import json

images = []
for image in os.listdir('./images'):
    images.append(f'./images/{image}')

config = {'timer': 20000, 'images': images}

with open('./config.json', 'w+') as file:
    json.dump(config, file)

