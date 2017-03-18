// requires
	var fs = require('fs');
	var path = require('path');
	var textile = require('textile.das');

var t = new textile();

var fpath = __dirname;
if(process.argv.length>2) 
	fpath = process.argv[2];

var filter = /^\d.*\.(txt|vi)$/i;
if(process.argv.length>3) {
	var ext = process.argv[3];
	if(/^\.[a-z0-9]$/i.test(ext))
		filter = new RegExp('^.*\\'+ext+'$','i');
	else if(/^\/[^\/]*\/[^\/]*$/.test(ext)) {
		sp = ext.split('/');
		filter = new RegExp(sp[1], sp[2]);
	}
}

var pStat = fs.statSync(fpath);
var files = [];
if(pStat.isFile()) {
	var pp = path.parse(fpath);
	files.push(pp.base);
	fpath = pp.dir;
}
else if(pStat.isDirectory()) 
	files = fs.readdirSync(fpath);

//console.log(fpath);
if(filter instanceof RegExp) {
	//console.log(filter);
	files = files.filter(x=> filter.test(x));
}

//console.log(files);

var htm = '';
for(var i=0;i<files.length;i++){
	var ipath = path.join(fpath, files[i]);
	var txt = fs.readFileSync(ipath, 'utf8');
	var txtHtm = t.toHtml(txt);
	htm += txtHtm;
	console.log(ipath, txt.length, htm.length);
	if(/['"]/.test(txtHtm.replace(/<[^>]*>/g,'')))
		console.log('***** quote error');
}
var $doc = t.doc();
var $txt = $doc.find('#htmlout');
$txt.html(htm);
var $fn = $doc.find('#fnout');
t.fnMove($txt, $fn);

var outdir = __dirname; //path.dirname(fpath);
var outfile = path.join(outdir, 'output.html');
fs.writeFileSync(outfile, $doc.html());


//console.log(t.toHtml('p[la]{display:inline-block;}(((<(a s#df). This *is* a _test_, %(r)wonder% if it will work.'));

