git subtree push --prefix api heroku-api master
git subtree push --prefix app heroku-app master

# if you need a force push it looks like this
# git push heroku-api `git subtree split --prefix api master`:master --force
# or
# git push heroku-app `git subtree split --prefix app master`:master --force