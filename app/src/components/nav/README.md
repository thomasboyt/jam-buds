adding a custom jam buds nav

1) when you click on any of bottom tabs, they become the new "root" (registered in redux, i guess)
2) when you're on a page that isn't the root, back button appears in the top left corner
  * push previousRoute along with state
    * can use vue-router interceptor thingy to add this to all links i think?
      * otherwise can just give up and instead use some kinda redux state probably
    * if previousRoute exists, back button takes you back in history (i think this is safe?)
3) if you enter the app directly to one of the pages on the bottom nav, it's set as the root
  * when entering the app on any other page: home is set as root. clicking the back button *pushes* home in as a history entry (just treated as a normal link)
4) current root always shown as "active" on bottom nav