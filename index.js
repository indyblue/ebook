// requires
	var fs = require('fs');
	var path = require('path');
	var textile = require('textile.das');

var t = new textile();

console.log(t.toHtml('p[la]{display:inline-block;}(((<(a s#df). This *is* a _test_, %(r)wonder% if it will work.'));
