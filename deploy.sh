git subtree push --prefix api heroku-api master

# so, the app server loads the client manifest from the static site, so you need to either deploy
# the static site first, or restart the server after deploying
# not sure which is better??
(cd app && npm run deploy-static)
git subtree push --prefix app heroku-app master