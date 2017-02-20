#!/bin/bash

npm install -g harp
npm install bulma@0.3.1
mv ./node_modules ./_node_modules
harp compile
cd www
git init
git checkout -b gh-pages
git add .
git -c user.name='Quang Lam' -c user.email='quang.lam2807@gmail.com' commit -m init
git push -f -q https://$GH_TOKEN@github.com/modern-translator/website gh-pages
