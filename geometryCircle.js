/**
 * @file geometryCircle.js
 * @brief A Geometry: Circle REWRITE
 *
 * So, this game is _really_ old. It even predates my activity on StackOverflow,
 * GitHub, my first employment and everything I've learned about JavaScript.
 *
 * Heck, its first release even predates the candidate recommendation of HTML5.
 * The original code contained the following line:
 * @code{.js}
 * window.requestAnimation =
 *   window.requestAnimationFrame ||
 *   window.msRequestAnimationFrame ||
 *   window.mozRequestAnimationFrame ||
 *   function(e){setTimeout(e,10);};
 * @endcode
 *
 * That should give you an idea _how_ old the code is. Emscripten wasn't really
 * a thing at that time, and people were getting their feet wet with Canvas.
 *
 * Also, the old code (at the moment still in the master branch) isn't
 * documented at all. It's "self documented", which roughly translates to
 * "I knew what I was doing at that time, I still should in the future".
 *
 * Either way, it's time to use the (hopefully) improved JS skills to recreate
 * the original game, with (hopefully) less code and (hopefully) better
 * performance. Maybe I should call this game "Geometry: Circle - A new hope"
 * instead. Ah. Who am I kidding.
 *
 * Beside, probably no one will pay attention to this repository either way.
 * That being said, let's start anew. Again, no jQuery, no d3, no react or other
 * fancy library will be used. Handcrafted JavaScript it is.
*/

// Start the game after the canvas tag has been loaded.
//
// Starters remark: The event DOMContentLoaded is basically the same as
// $.ready(...). At that point, the DOM has been parsed and all HTML elements
// are known to the browser.
window.addEventListener("DOMContentLoaded",(function(){
// Convention: constants are capital with underscore.
//
// @remark If the current trend continues and I write about one line per week,
//         ES2015 will be fully supported by __all__ major browsers and I can
//         use `const`. Yay.
var GAME_WIDTH  = 800;
var GAME_HEIGHT = 450;

})(window));