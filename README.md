RGB Of Life
===========

A concept for Conway's game of life using RBG color bits, in HTML/Javascript.
The public demo of this app is at: http://rgb.0-z-0.com

## Description
From the HTML of the page:

This page [app] demonstrates <a href="http://en.wikipedia.org/wiki/Conway's_Game_of_Life">Conway's Game of Life</a>
in what can be considered 24 dimensions. There are actually 24 simultaneous "games of life" being played on the
board, one for each bit in a <a href="http://en.wikipedia.org/wiki/RGB_color_model">24 bit RGB color value</a> that
is the background of the square. However, since we naturally think of white as the "dead" color and black as the "alive"
color, the bits have been flipped in this demonstration so that 0 represents alive and 1 represents dead. Thus #fff,
which is white, represents a cell that is completely dead, even though all of the bits are "on".
    
## Running locally
The app is basically just some HTML/Javascript/CSS, so it doesn't need anything specific to run. Any web server can serve this as static files. However, it has been configured to run as a static Rack application in order to easily run on Heroku. To run locally, first install the bundle with `$ bundle install` then simply do:

```
$ rackup config.ru
```

This will start a WEBrick server with a static Rack application serving the files. By default you can access the app at http://localhost:9292
